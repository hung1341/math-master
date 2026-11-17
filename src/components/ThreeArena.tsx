import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createGuardianCharacter,
  createHeroCharacter,
  createRefereeCharacter,
  type GuardianRig,
  type HeroRig,
  type RefereeRig,
} from '../three/characters';
import {
  createArenaEnvironment,
  type ArenaEnvironment,
} from '../three/environment';
import { createContactShadowTexture } from '../three/textures';
import type {
  CameraPreset,
  CharacterActionEvent,
  CharacterActionType,
  Difficulty,
  GamePhase,
  GraphicsQuality,
} from '../types/game';

interface ThreeArenaProps {
  difficulty: Difficulty;
  gamePhase: GamePhase;
  theme: 'light' | 'dark';
  graphicsQuality: GraphicsQuality;
  cameraPreset: CameraPreset;
  actionEvent: CharacterActionEvent | null;
  isHeroFlying?: boolean;
}

// Module-scoped scratch vectors for zero-GC render loop
const _camGoalPos = new THREE.Vector3();
const _camGoalLook = new THREE.Vector3();
const _projStart = new THREE.Vector3(-2.7, 1.85, 0.2);
const _projEnd = new THREE.Vector3(3.1, 1.55, 0);
const _projPos = new THREE.Vector3();
const HERO_HOME_POS = new THREE.Vector3(-3.1, 0, 0.35);
const HERO_BLINK_POS = new THREE.Vector3(1.1, 0, -0.05);

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

function disposeGroupResources(group: THREE.Object3D): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export function ThreeArena({
  difficulty,
  gamePhase,
  theme,
  graphicsQuality,
  cameraPreset,
  actionEvent,
  isHeroFlying = false,
}: ThreeArenaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Mutable refs read inside the WebGL tick loop without recreating the scene
  const stateRef = useRef({
    difficulty,
    gamePhase,
    theme,
    graphicsQuality,
    cameraPreset,
    isHeroFlying,
  });
  stateRef.current = {
    difficulty,
    gamePhase,
    theme,
    graphicsQuality,
    cameraPreset,
    isHeroFlying,
  };

  const sceneRefs = useRef<{
    scene?: THREE.Scene;
    renderer?: THREE.WebGLRenderer;
    sunLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    rimLight?: THREE.DirectionalLight;
    env?: ArenaEnvironment;
    guardianAnchor?: THREE.Group;
    guardianRig?: GuardianRig;
    shadowTex?: THREE.Texture;
    isSoftwareGl?: boolean;
    controls?: OrbitControls;
    userDragging?: boolean;
    animState?: {
      mode: CharacterActionType;
      timer: number;
      missed: boolean;
      projectileActive: boolean;
      projectileProgress: number;
      projectileFromHero: boolean;
      projectileStyle:
        | 'standard'
        | 'bomb'
        | 'fly'
        | 'enemy_miss'
        | 'boss_meteor'
        | 'boss_slash';
      laserTimer: number;
      blinkSlashed: boolean;
      blinkReturned: boolean;
    };
    spawnBurst?: (origin: THREE.Vector3, colorHex: number, count?: number) => void;
    projectileMesh?: THREE.Mesh;
    laserBeamMesh?: THREE.Mesh;
  }>({});

  // Mount WebGL scene once
  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl && stateRef.current.graphicsQuality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountEl.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const handleContextRestored = () => {
      setWebglFailed(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const initialDark = stateRef.current.theme === 'dark';
    const skyColor = initialDark ? 0x0b1326 : 0x93c5fd;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.017);

    // Procedural Studio IBL environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 160);
    camera.position.set(0, 4.4, 11.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 6.5;
    controls.maxDistance = 17.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.minPolarAngle = 0.25;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.35, 0);

    let userInteracting = false;
    controls.addEventListener('start', () => {
      userInteracting = true;
      sceneRefs.current.userDragging = true;
    });
    controls.addEventListener('end', () => {
      userInteracting = false;
      sceneRefs.current.userDragging = false;
    });

    // Warm/Cool 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      initialDark ? 0x60a5fa : 0xbae6fd,
      initialDark ? 0x0f172a : 0x1e3a2f,
      initialDark ? 0.55 : 0.85
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      initialDark ? 0xffe4b5 : 0xfff5e0,
      initialDark ? 1.55 : 1.9
    );
    sunLight.position.set(9, 15, 8);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 42;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, initialDark ? 0.85 : 0.45);
    rimLight.position.set(-8, 6, -10);
    scene.add(rimLight);

    // Environment
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const env = createArenaEnvironment(maxAnisotropy);
    env.setDaytime(!initialDark);
    scene.add(env.group);

    // Characters
    const shadowTex = createContactShadowTexture();
    const heroRig: HeroRig = createHeroCharacter(shadowTex);
    heroRig.root.position.copy(HERO_HOME_POS);
    heroRig.root.rotation.y = Math.PI / 2.2;
    scene.add(heroRig.root);

    const guardianAnchor = new THREE.Group();
    guardianAnchor.position.set(3.2, 0, -0.2);
    guardianAnchor.rotation.y = -Math.PI / 2.2;
    scene.add(guardianAnchor);

    const initialGuardian = createGuardianCharacter(
      stateRef.current.difficulty,
      shadowTex
    );
    guardianAnchor.add(initialGuardian.root);

    const refereeRig: RefereeRig = createRefereeCharacter(shadowTex);
    refereeRig.root.position.set(0, 0, -2.4);
    scene.add(refereeRig.root);

    // Magic projectile sphere
    const projGeo = new THREE.SphereGeometry(0.26, 14, 14);
    const projMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const projectileMesh = new THREE.Mesh(projGeo, projMat);
    projectileMesh.visible = false;
    scene.add(projectileMesh);

    // Laser beam cylinder spanning between Hero staff and Guardian chest
    const beamDist = _projStart.distanceTo(_projEnd);
    const laserGeo = new THREE.CylinderGeometry(0.11, 0.11, beamDist, 12);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.92,
    });
    const laserBeamMesh = new THREE.Mesh(laserGeo, laserMat);
    const beamMid = new THREE.Vector3().addVectors(_projStart, _projEnd).multiplyScalar(0.5);
    laserBeamMesh.position.copy(beamMid);
    laserBeamMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(_projEnd, _projStart).normalize()
    );
    laserBeamMesh.visible = false;
    scene.add(laserBeamMesh);

    // Particle burst pool (reused meshes, no per-frame allocation)
    const particlePoolGeo = new THREE.OctahedronGeometry(0.11, 0);
    const particles: Particle[] = [];
    for (let i = 0; i < 48; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(particlePoolGeo, pMat);
      mesh.visible = false;
      scene.add(mesh);
      particles.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.7,
      });
    }

    const spawnBurst = (origin: THREE.Vector3, colorHex: number, count = 16) => {
      let spawned = 0;
      for (const p of particles) {
        if (p.life <= 0) {
          p.mesh.position.copy(origin);
          (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
          p.mesh.scale.setScalar(1);
          p.mesh.visible = true;
          p.vel.set(
            (Math.random() - 0.5) * 6.5,
            1.8 + Math.random() * 4.5,
            (Math.random() - 0.5) * 6.5
          );
          p.maxLife = 0.55 + Math.random() * 0.35;
          p.life = p.maxLife;
          spawned++;
          if (spawned >= count) break;
        }
      }
    };

    const animState = {
      mode: 'idle' as CharacterActionType,
      timer: 0,
      missed: false,
      projectileActive: false,
      projectileProgress: 0,
      projectileFromHero: true,
      projectileStyle: 'standard' as
        | 'standard'
        | 'bomb'
        | 'fly'
        | 'enemy_miss'
        | 'boss_meteor'
        | 'boss_slash',
      laserTimer: 0,
      blinkSlashed: false,
      blinkReturned: false,
    };

    sceneRefs.current = {
      scene,
      renderer,
      sunLight,
      hemiLight,
      rimLight,
      env,
      guardianAnchor,
      guardianRig: initialGuardian,
      shadowTex,
      isSoftwareGl,
      controls,
      animState,
      spawnBurst,
      projectileMesh,
      laserBeamMesh,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ResizeObserver for crisp responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(mountEl);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let prevPhase: GamePhase = stateRef.current.gamePhase;
    let whistleTimer = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const { gamePhase: phase, cameraPreset: preset, isHeroFlying: flying } = stateRef.current;

      // 1. Environment subtle motion
      env.runeCircle.rotation.z = elapsed * 0.14;
      for (const crystal of env.floatingCrystals) {
        const offset = (crystal.userData.phaseOffset as number) || 0;
        crystal.position.y = 3.55 + Math.sin(elapsed * 2 + offset) * 0.16;
        crystal.rotation.y = elapsed * 0.8 + offset;
      }
      const skyPulse = 1 + Math.sin(elapsed * 1.4) * 0.045;
      if (stateRef.current.theme === 'dark') {
        env.moonHalo.scale.set(12.5 * skyPulse, 12.5 * skyPulse, 1);
        env.moonHalo.material.opacity = 0.74 + Math.sin(elapsed * 1.4) * 0.06;
      } else {
        env.sunHalo.scale.set(16.5 * skyPulse, 16.5 * skyPulse, 1);
        env.sunHalo.material.opacity = 0.88 + Math.sin(elapsed * 1.6) * 0.08;
      }

      const crowdExcitement =
        animState.mode === 'victory'
          ? 1.45
          : animState.mode !== 'idle'
            ? 1.0
            : phase === 'PLAYING'
              ? 0.4
              : 0.18;
      env.updateSpectators(elapsed, crowdExcitement);
      env.updateDrummers(
        elapsed,
        phase === 'PLAYING' || animState.mode === 'victory' ? 1.2 : 1.0
      );
      env.updateAtmosphere(dt, elapsed);

      // 2. Hero & Guardian Animations
      const gRig = sceneRefs.current.guardianRig;
      const aState = animState;

      // Base idle breathing (or hovering mid-air when Chiêu Bay is active)
      let heroTargetY = flying
        ? 1.45 + Math.sin(elapsed * 3.4) * 0.15
        : Math.sin(elapsed * 2.2) * 0.04;
      let heroRightArmX = flying
        ? -0.65 + Math.sin(elapsed * 3.4) * 0.12
        : -0.25 + Math.sin(elapsed * 2.2) * 0.08;
      let heroLeftArmX = flying
        ? -0.55 + Math.cos(elapsed * 3.4) * 0.12
        : Math.sin(elapsed * 2.2 + Math.PI) * 0.08;
      let heroBodyRotY = 0;

      let guardTargetY = Math.sin(elapsed * 1.8 + 1) * 0.06;
      let guardBodyRotZ = 0;

      const isBossSkill =
        aState.mode === 'boss_meteor' ||
        aState.mode === 'boss_laser' ||
        aState.mode === 'boss_thunder' ||
        aState.mode === 'boss_slash';

      if (aState.mode !== 'idle') {
        aState.timer += dt;
        if (aState.mode === 'attack' || aState.mode === 'bomb' || aState.mode === 'laser') {
          const swing = Math.sin(Math.min(1, aState.timer * 3.5) * Math.PI);
          heroRightArmX = -1.75 * swing;
          heroTargetY = (flying ? 1.55 : 0.35) + 0.3 * swing;
          if (aState.timer > 0.75) aState.mode = 'idle';
        } else if (aState.mode === 'fly') {
          const swoop = Math.sin(Math.min(1, aState.timer * 2.8) * Math.PI);
          heroTargetY = 1.65 + swoop * 0.45;
          heroRightArmX = -1.6 * swoop;
          heroLeftArmX = -1.4 * swoop;
          heroBodyRotY = swoop * 0.35;
          if (aState.timer > 0.85) aState.mode = 'idle';
        } else if (aState.mode === 'blink') {
          if (aState.timer < 0.12) {
            const p = Math.min(1, aState.timer / 0.12);
            const ease = p * p * (3 - 2 * p);
            heroRig.root.position.lerpVectors(HERO_HOME_POS, HERO_BLINK_POS, ease);
            heroRig.root.scale.set(0.84, 1.14, 0.84);
            heroRightArmX = -0.9;
            heroLeftArmX = -0.7;
          } else if (aState.timer < 0.48) {
            heroRig.root.position.copy(HERO_BLINK_POS);
            heroRig.root.scale.set(1, 1, 1);
            const swing = Math.sin(Math.min(1, (aState.timer - 0.12) / 0.36) * Math.PI);
            heroRightArmX = -2.35 * swing;
            heroLeftArmX = -1.2 * swing;
            heroBodyRotY = 0.52 * swing;
            heroTargetY = (flying ? 1.45 : 0.08) + 0.32 * swing;
            if (aState.timer >= 0.22 && !aState.blinkSlashed) {
              aState.blinkSlashed = true;
              spawnBurst(_projEnd, 0xc084fc, 20);
              spawnBurst(new THREE.Vector3(2.55, 1.5, -0.1), 0xfacc15, 10);
            }
          } else {
            if (!aState.blinkReturned) {
              aState.blinkReturned = true;
              spawnBurst(
                new THREE.Vector3(HERO_BLINK_POS.x, 1.35, HERO_BLINK_POS.z),
                0xc084fc,
                14
              );
            }
            const backP = Math.min(1, (aState.timer - 0.48) / 0.18);
            const easeBack = backP * backP * (3 - 2 * backP);
            heroRig.root.position.lerpVectors(HERO_BLINK_POS, HERO_HOME_POS, easeBack);
            heroRig.root.scale.set(
              backP < 1 ? 0.86 : 1,
              backP < 1 ? 1.12 : 1,
              backP < 1 ? 0.86 : 1
            );
            if (aState.timer > 0.82) {
              aState.mode = 'idle';
              heroRig.root.position.copy(HERO_HOME_POS);
              heroRig.root.scale.set(1, 1, 1);
            }
          }
        } else if (aState.mode === 'dodge') {
          const evade = Math.sin(Math.min(1, aState.timer * 3.0) * Math.PI);
          heroTargetY = 1.85 + evade * 0.4;
          heroBodyRotY = evade * 0.5;
          if (aState.timer > 0.8) aState.mode = 'idle';
        } else if (isBossSkill) {
          if (aState.missed) {
            if (flying) {
              const evade = Math.sin(Math.min(1, aState.timer * 3.0) * Math.PI);
              heroTargetY = 1.85 + evade * 0.4;
              heroBodyRotY = evade * 0.5;
            } else {
              // Hero parries the Boss's Enrage skill using Thanh Đao!
              const parry = Math.sin(Math.min(1, aState.timer * 3.4) * Math.PI);
              heroRightArmX = -1.6 * parry;
              heroBodyRotY = -0.22 * parry;
            }
          } else {
            const shake = Math.sin(aState.timer * 26) * Math.max(0, 1 - aState.timer * 1.3);
            heroBodyRotY = shake * 0.32;
            heroTargetY = -0.05;
          }
          if (aState.timer > 0.8) aState.mode = 'idle';
        } else if (aState.mode === 'hit') {
          const shake = Math.sin(aState.timer * 24) * Math.max(0, 1 - aState.timer * 1.4);
          heroBodyRotY = shake * 0.28;
          heroTargetY = -0.04;
          if (aState.timer > 0.7) aState.mode = 'idle';
        } else if (aState.mode === 'hint') {
          const lift = Math.sin(Math.min(1, aState.timer * 2.2) * Math.PI);
          heroRightArmX = -1.4 * lift;
          heroLeftArmX = -1.1 * lift;
          if (aState.timer > 0.85) aState.mode = 'idle';
        } else if (aState.mode === 'victory') {
          heroTargetY = Math.abs(Math.sin(elapsed * 4.5)) * 0.55;
          heroRightArmX = -2.2 + Math.sin(elapsed * 6) * 0.25;
          heroLeftArmX = -2.0 + Math.cos(elapsed * 6) * 0.25;
          heroBodyRotY = Math.sin(elapsed * 2.5) * 0.45;
        }
      }

      if (aState.mode !== 'blink') {
        heroRig.root.position.copy(HERO_HOME_POS);
        heroRig.root.scale.set(1, 1, 1);
      }

      heroRig.body.position.y = THREE.MathUtils.damp(
        heroRig.body.position.y,
        heroTargetY,
        10,
        dt
      );
      heroRig.rightArm.rotation.x = THREE.MathUtils.damp(
        heroRig.rightArm.rotation.x,
        heroRightArmX,
        12,
        dt
      );
      heroRig.leftArm.rotation.x = THREE.MathUtils.damp(
        heroRig.leftArm.rotation.x,
        heroLeftArmX,
        12,
        dt
      );
      heroRig.body.rotation.y = THREE.MathUtils.damp(
        heroRig.body.rotation.y,
        heroBodyRotY,
        10,
        dt
      );
      heroRig.cape.rotation.x = (flying ? 0.36 : 0.14) + Math.sin(elapsed * (flying ? 6.5 : 3.1)) * 0.08;
      heroRig.staffOrb.rotation.y = elapsed * (flying ? 4.2 : 2.1);

      // Animate Hero's glowing aura, silver sword halo & royal knight halo crest
      const auraBoost = flying ? 1.35 : aState.mode === 'victory' ? 1.45 : aState.mode !== 'idle' ? 1.25 : 1;
      const auraPulse = Math.sin(elapsed * (flying ? 5.2 : 2.8));

      const swordAuraMat = heroRig.swordAura.material as THREE.MeshBasicMaterial;
      swordAuraMat.opacity = Math.min(0.85, (0.4 + 0.14 * Math.sin(elapsed * 4.5)) * auraBoost);
      const swordAuraScale = 1 + 0.05 * Math.sin(elapsed * 4.5);
      heroRig.swordAura.scale.set(1.18 * swordAuraScale, 1.04, 1.45 * swordAuraScale);
      if (heroRig.swordRings[0]) {
        heroRig.swordRings[0].rotation.z = elapsed * 2.8;
        heroRig.swordRings[0].rotation.y = Math.sin(elapsed * 2.1) * 0.35;
      }
      if (heroRig.swordRings[1]) {
        heroRig.swordRings[1].rotation.z = -elapsed * 3.4;
        heroRig.swordRings[1].rotation.y = Math.cos(elapsed * 2.4) * 0.35;
      }
      heroRig.orbLight.intensity = (2.1 + 0.45 * Math.sin(elapsed * 4.2)) * auraBoost;
      heroRig.haloCrest.rotation.z = elapsed * 0.9;
      heroRig.haloCrest.position.y = 1.82 + Math.sin(elapsed * 2.6) * 0.04;

      const shellMat = heroRig.auraShell.material as THREE.MeshBasicMaterial;
      shellMat.opacity = (0.12 + 0.045 * auraPulse) * auraBoost;
      const shellScaleMod = 1 + 0.04 * auraPulse;
      heroRig.auraShell.scale.set(0.76 * shellScaleMod, 1.32 * shellScaleMod, 0.76 * shellScaleMod);

      heroRig.auraRings[0].rotation.z = elapsed * (flying ? 2.4 : 1.1);
      heroRig.auraRings[1].rotation.z = -elapsed * (flying ? 3.0 : 1.5);
      heroRig.auraRings[1].rotation.y = 0.32 + Math.sin(elapsed * 1.4) * 0.28;

      const rainbowScale = (1 + 0.035 * Math.sin(elapsed * 2.4)) * (flying ? 1.06 : 1);
      heroRig.rainbowArc.scale.setScalar(rainbowScale);
      heroRig.rainbowArc.position.y = 1.15 + Math.sin(elapsed * 2.1) * 0.04;
      heroRig.rainbowArc.rotation.y = 0.12 + Math.sin(elapsed * 1.1) * 0.16;
      heroRig.rainbowArc.rotation.z = Math.sin(elapsed * 1.6) * 0.06;

      heroRig.auraOrbs.forEach((orb, idx) => {
        const phaseOffset = (orb.userData.phase as number) || 0;
        const orbAngle = elapsed * (flying ? 2.8 : 1.6) + phaseOffset;
        const radius = 0.82 + Math.sin(elapsed * 2.5 + idx) * 0.08;
        orb.position.set(
          Math.cos(orbAngle) * radius,
          1.12 + Math.sin(elapsed * 3.1 + phaseOffset * 1.5) * 0.42,
          Math.sin(orbAngle) * radius
        );
        orb.rotation.y = elapsed * 3.5;
        orb.rotation.x = elapsed * 2.2;
      });
      heroRig.auraLight.intensity = (2.2 + 0.45 * auraPulse) * auraBoost;

      if (gRig) {
        let guardWeaponArmX = Math.sin(elapsed * 1.8) * 0.12 - 0.15;
        let guardShieldArmX = Math.cos(elapsed * 1.8) * 0.12;

        const hitStart =
          aState.mode === 'laser' ? 0.08 : aState.mode === 'blink' ? 0.22 : 0.3;
        if (
          (aState.mode === 'attack' ||
            aState.mode === 'bomb' ||
            aState.mode === 'laser' ||
            aState.mode === 'fly' ||
            aState.mode === 'blink') &&
          aState.timer > hitStart &&
          aState.timer < 0.78
        ) {
          const intensity =
            aState.mode === 'blink'
              ? 0.24
              : aState.mode === 'bomb'
                ? 0.22
                : aState.mode === 'laser'
                  ? 0.17
                  : 0.12;
          guardBodyRotZ = Math.sin(aState.timer * 34) * intensity;
          guardTargetY = aState.mode === 'bomb' || aState.mode === 'blink' ? -0.14 : -0.08;
          // Boss raises shield when hit
          guardShieldArmX = -0.85;
        } else if (isBossSkill || aState.mode === 'hit' || aState.mode === 'dodge') {
          const swing = Math.sin(Math.min(1, aState.timer * 3.2) * Math.PI);
          guardWeaponArmX = -1.75 * swing;
          guardShieldArmX = -0.45 * swing;
          guardTargetY = 0.22 * swing;
        }

        gRig.body.position.y = THREE.MathUtils.damp(
          gRig.body.position.y,
          guardTargetY,
          8,
          dt
        );
        gRig.body.rotation.z = THREE.MathUtils.damp(
          gRig.body.rotation.z,
          guardBodyRotZ,
          12,
          dt
        );
        gRig.core.rotation.y = elapsed * 1.8;
        gRig.core.rotation.x = elapsed * 0.9;
        gRig.runeRing.rotation.z = -elapsed * 1.1;
        gRig.leftArm.rotation.x = THREE.MathUtils.damp(
          gRig.leftArm.rotation.x,
          guardWeaponArmX,
          11,
          dt
        );
        gRig.rightArm.rotation.x = THREE.MathUtils.damp(
          gRig.rightArm.rotation.x,
          guardShieldArmX,
          10,
          dt
        );
      }

      // Referee Animations: blows whistle on match start, then steps out to sideline (z = -7.2) so fighters have room
      if (phase === 'PLAYING' && prevPhase !== 'PLAYING') {
        whistleTimer = 1.15;
        spawnBurst(
          new THREE.Vector3(0, 1.9, refereeRig.root.position.z + 0.35),
          0xfacc15,
          16
        );
      }
      prevPhase = phase;

      if (whistleTimer > 0) {
        whistleTimer = Math.max(0, whistleTimer - dt);
      }

      const refTargetZ =
        phase === 'PLAYING' ? (whistleTimer > 0.65 ? -2.4 : -7.2) : -2.4;
      const prevRefZ = refereeRig.root.position.z;
      refereeRig.root.position.z = THREE.MathUtils.damp(
        prevRefZ,
        refTargetZ,
        4.2,
        dt
      );
      const isRefWalking = Math.abs(refTargetZ - refereeRig.root.position.z) > 0.08;

      let refHeadYaw = Math.sin(elapsed * 1.35) * 0.28;
      let refHeadPitch = 0;
      let refHeroArmX = -0.35 + Math.sin(elapsed * 2.1) * 0.08;
      let refBossArmX = -0.35 + Math.cos(elapsed * 2.1) * 0.08;
      let refBodyY = Math.sin(elapsed * 2.6) * 0.025;

      const heroAct =
        aState.mode === 'attack' ||
        aState.mode === 'bomb' ||
        aState.mode === 'laser' ||
        aState.mode === 'fly' ||
        aState.mode === 'blink' ||
        aState.mode === 'dodge';
      const bossAct = isBossSkill || aState.mode === 'hit';

      if (whistleTimer > 0) {
        // Blowing starting whistle & signaling match start!
        refHeadYaw = 0;
        refHeadPitch = -0.14;
        refHeroArmX = -2.45 + Math.sin(elapsed * 18) * 0.14;
        refBossArmX = -2.45 + Math.cos(elapsed * 18) * 0.14;
        refBodyY = Math.abs(Math.sin(elapsed * 12)) * 0.08;
      } else if (aState.mode === 'victory') {
        refHeadYaw = -0.38;
        refHeroArmX = -2.35 + Math.sin(elapsed * 8) * 0.25;
        refBossArmX = -0.25;
        refBodyY = Math.abs(Math.sin(elapsed * 5)) * 0.16;
      } else if (heroAct) {
        refHeadYaw = -0.4;
        refHeroArmX = -2.1 + Math.sin(elapsed * 12) * 0.22;
        refBodyY = 0.08;
      } else if (bossAct) {
        refHeadYaw = aState.missed ? -0.35 : 0.4;
        if (aState.missed) {
          refHeroArmX = -1.95 + Math.sin(elapsed * 10) * 0.2;
        } else {
          refBossArmX = -2.1 + Math.sin(elapsed * 12) * 0.22;
        }
        refBodyY = 0.06;
      }

      const legSwing = isRefWalking ? Math.sin(elapsed * 14) * 0.48 : 0;
      refereeRig.leftLeg.rotation.x = THREE.MathUtils.damp(
        refereeRig.leftLeg.rotation.x,
        legSwing,
        14,
        dt
      );
      refereeRig.rightLeg.rotation.x = THREE.MathUtils.damp(
        refereeRig.rightLeg.rotation.x,
        -legSwing,
        14,
        dt
      );
      if (isRefWalking) {
        refBodyY += Math.abs(Math.sin(elapsed * 14)) * 0.06;
      }

      refereeRig.head.rotation.y = THREE.MathUtils.damp(
        refereeRig.head.rotation.y,
        refHeadYaw,
        9,
        dt
      );
      refereeRig.head.rotation.x = THREE.MathUtils.damp(
        refereeRig.head.rotation.x,
        refHeadPitch,
        10,
        dt
      );
      refereeRig.rightArm.rotation.x = THREE.MathUtils.damp(
        refereeRig.rightArm.rotation.x,
        refHeroArmX,
        12,
        dt
      );
      refereeRig.leftArm.rotation.x = THREE.MathUtils.damp(
        refereeRig.leftArm.rotation.x,
        refBossArmX,
        12,
        dt
      );
      refereeRig.body.position.y = THREE.MathUtils.damp(
        refereeRig.body.position.y,
        refBodyY,
        10,
        dt
      );
      refereeRig.heroFlag.rotation.y = Math.sin(elapsed * 6.5) * 0.22;
      refereeRig.bossFlag.rotation.y = Math.cos(elapsed * 6.5) * 0.22;

      // 3. Laser / Lightning beam pulse
      if (aState.laserTimer > 0) {
        aState.laserTimer -= dt;
        const beamScale = 0.75 + Math.sin(elapsed * 55) * 0.35;
        laserBeamMesh.scale.set(beamScale, 1, beamScale);
        (laserBeamMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          Math.min(1, aState.laserTimer / 0.35)
        );
        laserBeamMesh.visible = true;
        if (aState.laserTimer <= 0) {
          laserBeamMesh.visible = false;
        }
      }

      // 3b. Projectile travel
      if (aState.projectileActive) {
        const speed =
          aState.projectileStyle === 'bomb'
            ? 2.4
            : aState.projectileStyle === 'boss_meteor'
              ? 2.3
              : aState.projectileStyle === 'boss_slash'
                ? 3.8
                : 3.2;
        aState.projectileProgress += dt * speed;
        const t = Math.min(1, aState.projectileProgress);
        if (aState.projectileFromHero) {
          _projPos.lerpVectors(_projStart, _projEnd, t);
          if (flying) {
            _projPos.y += (1 - t) * 1.25;
          }
          const arc = aState.projectileStyle === 'bomb' ? 2.15 : 0.9;
          _projPos.y += Math.sin(t * Math.PI) * arc;
          const scale = aState.projectileStyle === 'bomb' ? 1.85 : 1.05;
          projectileMesh.scale.setScalar(scale);
        } else {
          // Enemy shot: if Hero is dodging mid-air, shot passes low past Hero!
          _projPos.lerpVectors(_projEnd, _projStart, t);
          if (aState.projectileStyle === 'enemy_miss') {
            _projPos.y = 0.85 + Math.sin(t * Math.PI) * 0.25;
            _projPos.x -= t * 1.1;
            projectileMesh.scale.setScalar(1);
          } else if (aState.projectileStyle === 'boss_meteor') {
            _projPos.y += Math.sin(t * Math.PI) * 2.8;
            projectileMesh.scale.setScalar(2.1);
          } else if (aState.projectileStyle === 'boss_slash') {
            _projPos.y += Math.sin(t * Math.PI) * 0.45;
            projectileMesh.scale.set(0.45, 2.3, 1.5);
            projectileMesh.rotation.z = elapsed * 14;
          } else {
            _projPos.y += Math.sin(t * Math.PI) * 0.9;
            projectileMesh.scale.setScalar(1);
          }
        }
        projectileMesh.position.copy(_projPos);
        projectileMesh.visible = true;

        if (t >= 1) {
          aState.projectileActive = false;
          projectileMesh.visible = false;
          projectileMesh.rotation.set(0, 0, 0);
          if (aState.projectileFromHero) {
            const burstColor =
              aState.projectileStyle === 'bomb'
                ? 0xf97316
                : aState.projectileStyle === 'fly'
                  ? 0x34d399
                  : 0x10b981;
            const burstCount = aState.projectileStyle === 'bomb' ? 28 : 18;
            spawnBurst(_projEnd, burstColor, burstCount);
          } else if (aState.projectileStyle === 'enemy_miss') {
            spawnBurst(new THREE.Vector3(-4.2, 0.85, 0.2), 0x94a3b8, 12);
          } else if (aState.projectileStyle === 'boss_meteor') {
            spawnBurst(_projStart, aState.missed ? 0xfbbf24 : 0xef4444, 28);
          } else if (aState.projectileStyle === 'boss_slash') {
            spawnBurst(_projStart, aState.missed ? 0xfbbf24 : 0xf43f5e, 22);
          } else {
            spawnBurst(_projStart, 0xf43f5e, 18);
          }
        }
      }

      // 4. Particles update
      for (const p of particles) {
        if (p.life > 0) {
          p.life -= dt;
          p.vel.y -= 9.5 * dt;
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mesh.rotation.x += dt * 5;
          p.mesh.rotation.y += dt * 4;
          const alpha = Math.max(0, p.life / p.maxLife);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
          p.mesh.scale.setScalar(0.5 + alpha * 0.7);
          if (p.life <= 0) {
            p.mesh.visible = false;
          }
        }
      }

      // 5. Smooth Camera Choreography (paused while user orbits manually)
      const effectiveMode =
        preset !== 'auto'
          ? preset
          : phase === 'PLAYING'
            ? 'duel'
            : phase === 'RESULT'
              ? 'hero'
              : 'overview';

      if (!userInteracting) {
        if (effectiveMode === 'duel') {
          _camGoalPos.set(-0.4, 3.6, 9.8);
          _camGoalLook.set(0.1, 1.45, 0);
        } else if (effectiveMode === 'hero') {
          _camGoalPos.set(-1.6, 2.7, 6.4);
          _camGoalLook.set(-2.9, 1.35, 0.25);
        } else {
          _camGoalPos.set(
            Math.sin(elapsed * 0.14) * 1.4,
            4.8,
            11.8
          );
          _camGoalLook.set(0, 1.35, 0);
        }

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoalPos.x, 3.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoalPos.y, 3.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoalPos.z, 3.5, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camGoalLook.x, 4, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camGoalLook.y, 4, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camGoalLook.z, 4, dt);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      envTex.dispose();
      shadowTex.dispose();
      env.disposables.textures.forEach((t) => t.dispose());
      env.disposables.geometries.forEach((g) => g.dispose());
      env.disposables.materials.forEach((m) => m.dispose());
      disposeGroupResources(heroRig.root);
      disposeGroupResources(refereeRig.root);
      if (sceneRefs.current.guardianRig) {
        disposeGroupResources(sceneRefs.current.guardianRig.root);
      }
      projGeo.dispose();
      projMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      particlePoolGeo.dispose();
      particles.forEach((p) => (p.mesh.material as THREE.Material).dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  // React to Difficulty changes -> swap 3D Guardian Boss model seamlessly
  useEffect(() => {
    const { guardianAnchor, guardianRig, shadowTex } = sceneRefs.current;
    if (!guardianAnchor || !shadowTex) return;

    if (guardianRig) {
      guardianAnchor.remove(guardianRig.root);
      disposeGroupResources(guardianRig.root);
    }

    const nextGuardian = createGuardianCharacter(difficulty, shadowTex);
    guardianAnchor.add(nextGuardian.root);
    sceneRefs.current.guardianRig = nextGuardian;
  }, [difficulty]);

  // React to Theme & Graphics Quality changes
  useEffect(() => {
    const { scene, renderer, sunLight, hemiLight, rimLight, env, isSoftwareGl } =
      sceneRefs.current;
    if (!scene || !renderer || !sunLight || !hemiLight || !rimLight) return;

    const isDark = theme === 'dark';
    env?.setDaytime(!isDark);

    const skyHex = isDark ? 0x0b1326 : 0x93c5fd;
    (scene.background as THREE.Color).setHex(skyHex);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.setHex(skyHex);
    }

    hemiLight.color.setHex(isDark ? 0x60a5fa : 0xbae6fd);
    hemiLight.groundColor.setHex(isDark ? 0x0f172a : 0x1e3a2f);
    hemiLight.intensity = isDark ? 0.55 : 0.85;

    sunLight.color.setHex(isDark ? 0xffe4b5 : 0xfff5e0);
    sunLight.intensity = isDark ? 1.55 : 1.9;
    rimLight.intensity = isDark ? 0.85 : 0.45;

    const enableShadows = !isSoftwareGl && graphicsQuality === 'high';
    renderer.shadowMap.enabled = enableShadows;
    sunLight.castShadow = enableShadows;
    renderer.setPixelRatio(
      isSoftwareGl
        ? 1
        : graphicsQuality === 'high'
          ? Math.min(window.devicePixelRatio, 2)
          : 1
    );
  }, [theme, graphicsQuality]);

  // React to Character Action Events (hero & boss skills)
  useEffect(() => {
    if (!actionEvent) return;
    const { animState, projectileMesh, laserBeamMesh, spawnBurst } = sceneRefs.current;
    if (!animState || !projectileMesh || !laserBeamMesh || !spawnBurst) return;

    animState.mode = actionEvent.type;
    animState.timer = 0;
    animState.missed = Boolean(actionEvent.missed);
    animState.blinkSlashed = false;
    animState.blinkReturned = false;

    if (actionEvent.type === 'attack') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = true;
      animState.projectileStyle = 'standard';
    } else if (actionEvent.type === 'bomb') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = true;
      animState.projectileStyle = 'bomb';
    } else if (actionEvent.type === 'laser') {
      const startPos = _projStart.clone();
      if (stateRef.current.isHeroFlying) {
        startPos.y += 1.35;
      }
      const mid = new THREE.Vector3().addVectors(startPos, _projEnd).multiplyScalar(0.5);
      laserBeamMesh.position.copy(mid);
      laserBeamMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(_projEnd, startPos).normalize()
      );
      (laserBeamMesh.material as THREE.MeshBasicMaterial).color.setHex(0x22d3ee);
      animState.laserTimer = 0.48;
      spawnBurst(_projEnd, 0x22d3ee, 22);
    } else if (actionEvent.type === 'fly') {
      spawnBurst(new THREE.Vector3(-3.1, 0.4, 0.35), 0x34d399, 20);
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0x34d399);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = true;
      animState.projectileStyle = 'fly';
    } else if (actionEvent.type === 'blink') {
      spawnBurst(
        new THREE.Vector3(HERO_HOME_POS.x, 1.35, HERO_HOME_POS.z),
        0xc084fc,
        16
      );
      spawnBurst(
        new THREE.Vector3(HERO_BLINK_POS.x, 1.35, HERO_BLINK_POS.z),
        0xe2e8f0,
        12
      );
    } else if (actionEvent.type === 'dodge') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = false;
      animState.projectileStyle = 'enemy_miss';
      spawnBurst(new THREE.Vector3(-3.1, 2.8, 0.35), 0x38bdf8, 12);
    } else if (actionEvent.type === 'boss_meteor') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = false;
      animState.projectileStyle =
        actionEvent.missed && stateRef.current.isHeroFlying ? 'enemy_miss' : 'boss_meteor';
      spawnBurst(_projEnd, 0xf97316, 14);
    } else if (actionEvent.type === 'boss_laser') {
      const targetPos = _projStart.clone();
      if (actionEvent.missed) {
        targetPos.y = stateRef.current.isHeroFlying ? 0.65 : 1.1;
      }
      const mid = new THREE.Vector3().addVectors(_projEnd, targetPos).multiplyScalar(0.5);
      laserBeamMesh.position.copy(mid);
      laserBeamMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(targetPos, _projEnd).normalize()
      );
      (laserBeamMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
      animState.laserTimer = 0.5;
      spawnBurst(targetPos, actionEvent.missed ? 0xfbbf24 : 0xf43f5e, 22);
    } else if (actionEvent.type === 'boss_thunder') {
      const strikePos = actionEvent.missed
        ? new THREE.Vector3(-4.2, 0.4, 0.35)
        : new THREE.Vector3(-3.1, 0.4, 0.35);
      const skyPos = new THREE.Vector3(strikePos.x, 7.2, strikePos.z);
      const mid = new THREE.Vector3().addVectors(skyPos, strikePos).multiplyScalar(0.5);
      laserBeamMesh.position.copy(mid);
      laserBeamMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0)
      );
      (laserBeamMesh.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15);
      animState.laserTimer = 0.46;
      spawnBurst(
        new THREE.Vector3(strikePos.x, 1.5, strikePos.z),
        actionEvent.missed ? 0x38bdf8 : 0xfacc15,
        24
      );
    } else if (actionEvent.type === 'boss_slash') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = false;
      animState.projectileStyle =
        actionEvent.missed && stateRef.current.isHeroFlying ? 'enemy_miss' : 'boss_slash';
    } else if (actionEvent.type === 'hit') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = false;
      animState.projectileStyle = 'standard';
    } else if (actionEvent.type === 'hint') {
      spawnBurst(_projStart, 0xfbbf24, 16);
    } else if (actionEvent.type === 'victory') {
      spawnBurst(new THREE.Vector3(-3.1, 2.2, 0.35), 0xfbbf24, 24);
      spawnBurst(new THREE.Vector3(-5.5, 2.6, -9.2), 0xfacc15, 10);
      spawnBurst(new THREE.Vector3(5.5, 2.6, -9.2), 0x38bdf8, 10);
    }

    if (
      actionEvent.type === 'attack' ||
      actionEvent.type === 'bomb' ||
      actionEvent.type === 'laser' ||
      actionEvent.type === 'fly' ||
      actionEvent.type === 'blink'
    ) {
      spawnBurst(new THREE.Vector3(0, 2.8, -10.8), 0xfacc15, 10);
    }
  }, [actionEvent]);

  if (webglFailed) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
            : 'bg-gradient-to-b from-sky-100 via-slate-100 to-emerald-50'
        }`}
      >
        <div className="text-center px-6">
          <p className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">
            Đấu trường Tri thức Math Master 6
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Trình duyệt đang ở chế độ dự phòng 2D (WebGL tạm ngưng).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label="Không gian đấu trường toán học 3D"
      className="fixed inset-0 z-0 h-full w-full select-none"
    />
  );
}
