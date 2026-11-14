import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createGuardianCharacter,
  createHeroCharacter,
  type GuardianRig,
  type HeroRig,
} from '../three/characters';
import { createArenaEnvironment } from '../three/environment';
import { createContactShadowTexture } from '../three/textures';
import type {
  CameraPreset,
  CharacterActionEvent,
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
}

// Module-scoped scratch vectors for zero-GC render loop
const _camGoalPos = new THREE.Vector3();
const _camGoalLook = new THREE.Vector3();
const _projStart = new THREE.Vector3(-2.8, 1.55, 0.2);
const _projEnd = new THREE.Vector3(3.1, 1.55, 0);
const _projPos = new THREE.Vector3();

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
  });
  stateRef.current = {
    difficulty,
    gamePhase,
    theme,
    graphicsQuality,
    cameraPreset,
  };

  const sceneRefs = useRef<{
    scene?: THREE.Scene;
    renderer?: THREE.WebGLRenderer;
    sunLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    rimLight?: THREE.DirectionalLight;
    guardianAnchor?: THREE.Group;
    guardianRig?: GuardianRig;
    shadowTex?: THREE.Texture;
    isSoftwareGl?: boolean;
    controls?: OrbitControls;
    userDragging?: boolean;
    animState?: {
      mode: 'idle' | 'attack' | 'hit' | 'hint' | 'victory';
      timer: number;
      projectileActive: boolean;
      projectileProgress: number;
      projectileFromHero: boolean;
    };
    spawnBurst?: (origin: THREE.Vector3, colorHex: number, count?: number) => void;
    projectileMesh?: THREE.Mesh;
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
    const skyColor = initialDark ? 0x0b1326 : 0xcfe8ff;
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
    scene.add(env.group);

    // Characters
    const shadowTex = createContactShadowTexture();
    const heroRig: HeroRig = createHeroCharacter(shadowTex);
    heroRig.root.position.set(-3.1, 0, 0.35);
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

    // Magic projectile sphere
    const projGeo = new THREE.SphereGeometry(0.26, 14, 14);
    const projMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const projectileMesh = new THREE.Mesh(projGeo, projMat);
    projectileMesh.visible = false;
    scene.add(projectileMesh);

    // Particle burst pool (reused meshes, no per-frame allocation)
    const particlePoolGeo = new THREE.OctahedronGeometry(0.11, 0);
    const particles: Particle[] = [];
    for (let i = 0; i < 28; i++) {
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
      mode: 'idle' as 'idle' | 'attack' | 'hit' | 'hint' | 'victory',
      timer: 0,
      projectileActive: false,
      projectileProgress: 0,
      projectileFromHero: true,
    };

    sceneRefs.current = {
      scene,
      renderer,
      sunLight,
      hemiLight,
      rimLight,
      guardianAnchor,
      guardianRig: initialGuardian,
      shadowTex,
      isSoftwareGl,
      controls,
      animState,
      spawnBurst,
      projectileMesh,
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
      const { gamePhase: phase, cameraPreset: preset } = stateRef.current;

      // 1. Environment subtle motion
      env.runeCircle.rotation.z = elapsed * 0.14;
      for (const crystal of env.floatingCrystals) {
        const offset = (crystal.userData.phaseOffset as number) || 0;
        crystal.position.y = 3.55 + Math.sin(elapsed * 2 + offset) * 0.16;
        crystal.rotation.y = elapsed * 0.8 + offset;
      }

      // 2. Hero & Guardian Animations
      const gRig = sceneRefs.current.guardianRig;
      const aState = animState;

      // Base idle breathing
      let heroTargetY = Math.sin(elapsed * 2.2) * 0.04;
      let heroRightArmX = -0.25 + Math.sin(elapsed * 2.2) * 0.08;
      let heroLeftArmX = Math.sin(elapsed * 2.2 + Math.PI) * 0.08;
      let heroBodyRotY = 0;

      let guardTargetY = Math.sin(elapsed * 1.8 + 1) * 0.06;
      let guardBodyRotZ = 0;

      if (aState.mode !== 'idle') {
        aState.timer += dt;
        if (aState.mode === 'attack') {
          const swing = Math.sin(Math.min(1, aState.timer * 3.5) * Math.PI);
          heroRightArmX = -1.65 * swing;
          heroTargetY = 0.35 * swing;
          if (aState.timer > 0.7) aState.mode = 'idle';
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
      heroRig.cape.rotation.x = 0.14 + Math.sin(elapsed * 3.1) * 0.06;
      heroRig.staffOrb.rotation.y = elapsed * 2.1;

      if (gRig) {
        if (aState.mode === 'attack' && aState.timer > 0.3 && aState.timer < 0.7) {
          guardBodyRotZ = Math.sin(aState.timer * 32) * 0.12;
          guardTargetY = -0.08;
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
        gRig.leftArm.rotation.x = Math.sin(elapsed * 1.8) * 0.12;
        gRig.rightArm.rotation.x = Math.cos(elapsed * 1.8) * 0.12;
      }

      // 3. Projectile travel
      if (aState.projectileActive) {
        aState.projectileProgress += dt * 3.1;
        const t = Math.min(1, aState.projectileProgress);
        if (aState.projectileFromHero) {
          _projPos.lerpVectors(_projStart, _projEnd, t);
        } else {
          _projPos.lerpVectors(_projEnd, _projStart, t);
        }
        _projPos.y += Math.sin(t * Math.PI) * 0.9;
        projectileMesh.position.copy(_projPos);
        projectileMesh.visible = true;

        if (t >= 1) {
          aState.projectileActive = false;
          projectileMesh.visible = false;
          spawnBurst(
            aState.projectileFromHero ? _projEnd : _projStart,
            aState.projectileFromHero ? 0x10b981 : 0xf43f5e,
            18
          );
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
      if (sceneRefs.current.guardianRig) {
        disposeGroupResources(sceneRefs.current.guardianRig.root);
      }
      projGeo.dispose();
      projMat.dispose();
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
    const { scene, renderer, sunLight, hemiLight, rimLight, isSoftwareGl } =
      sceneRefs.current;
    if (!scene || !renderer || !sunLight || !hemiLight || !rimLight) return;

    const isDark = theme === 'dark';
    const skyHex = isDark ? 0x0b1326 : 0xcfe8ff;
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

  // React to Character Action Events (attack / hit / hint / victory)
  useEffect(() => {
    if (!actionEvent) return;
    const { animState, projectileMesh, spawnBurst } = sceneRefs.current;
    if (!animState || !projectileMesh || !spawnBurst) return;

    animState.mode = actionEvent.type;
    animState.timer = 0;

    if (actionEvent.type === 'attack') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = true;
    } else if (actionEvent.type === 'hit') {
      (projectileMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
      animState.projectileActive = true;
      animState.projectileProgress = 0;
      animState.projectileFromHero = false;
    } else if (actionEvent.type === 'hint') {
      spawnBurst(_projStart, 0xfbbf24, 16);
    } else if (actionEvent.type === 'victory') {
      spawnBurst(new THREE.Vector3(-3.1, 2.2, 0.35), 0xfbbf24, 24);
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
