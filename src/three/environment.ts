import * as THREE from 'three';
import {
  createArenaFloorTexture,
  createRuneCircleTexture,
  createTerrainTexture,
} from './textures';

export interface ArenaEnvironment {
  group: THREE.Group;
  runeCircle: THREE.Mesh;
  floatingCrystals: THREE.Mesh[];
  moon: THREE.Mesh;
  moonHalo: THREE.Sprite;
  sun: THREE.Mesh;
  sunHalo: THREE.Sprite;
  setDaytime: (isDay: boolean) => void;
  updateSpectators: (elapsed: number, excitement: number) => void;
  updateDrummers: (elapsed: number, tempoBoost: number) => void;
  updateAtmosphere: (dt: number, elapsed: number) => void;
  disposables: {
    textures: THREE.Texture[];
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
  };
}

interface SpectatorSlot {
  x: number;
  baseY: number;
  z: number;
  rotY: number;
  phase: number;
  scale: number;
}

const _specDummy = new THREE.Object3D();

function createMoonSurfaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(112, 108, 12, 128, 128, 128);
  grad.addColorStop(0, '#fff7cc');
  grad.addColorStop(0.55, '#fde047');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle soft lunar craters for natural depth
  const craters = [
    { x: 88, y: 92, r: 22, a: 0.14 },
    { x: 164, y: 78, r: 16, a: 0.12 },
    { x: 148, y: 158, r: 26, a: 0.13 },
    { x: 76, y: 154, r: 13, a: 0.1 },
    { x: 118, y: 52, r: 11, a: 0.09 },
    { x: 184, y: 128, r: 14, a: 0.11 },
  ];
  for (const c of craters) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 105, 10, ${c.a})`;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMoonHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 22, 128, 128, 128);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
  grad.addColorStop(0.35, 'rgba(250, 204, 21, 0.45)');
  grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.12)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSunSurfaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(116, 112, 16, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.38, '#fef08a');
  grad.addColorStop(0.75, '#facc15');
  grad.addColorStop(1, '#f97316');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSunHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 251, 214, 1)');
  grad.addColorStop(0.32, 'rgba(253, 224, 71, 0.72)');
  grad.addColorStop(0.66, 'rgba(251, 146, 60, 0.24)');
  grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createArenaEnvironment(maxAnisotropy: number): ArenaEnvironment {
  const group = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const floatingCrystals: THREE.Mesh[] = [];

  const arenaTex = createArenaFloorTexture(maxAnisotropy);
  const terrainTex = createTerrainTexture(maxAnisotropy);
  const runeTex = createRuneCircleTexture(maxAnisotropy);
  textures.push(arenaTex, terrainTex, runeTex);

  const getTerrainHeight = (x: number, z: number): number => {
    const dist = Math.hypot(x, z);
    if (dist <= 13.5) return -0.18;
    const falloff = Math.min(1, (dist - 13.5) / 28);
    const hill =
      (Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3.2 +
        Math.sin(x * 0.16 + 1.4) * 1.4) *
      falloff;
    return hill - 0.18;
  };

  // 1. Extended natural outdoor terrain with gentle perimeter hills (no box void)
  const terrainGeo = new THREE.PlaneGeometry(180, 180, 44, 44);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setY(i, getTerrainHeight(x, z));
  }
  terrainGeo.computeVertexNormals();
  geometries.push(terrainGeo);

  const terrainMat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    roughness: 0.92,
    metalness: 0.02,
  });
  materials.push(terrainMat);

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 2. Elevated Circular Stone Arena Platform (top surface cleanly at y = 0)
  const daisGeo = new THREE.CylinderGeometry(10.5, 11.2, 0.36, 48);
  geometries.push(daisGeo);
  const daisMat = new THREE.MeshStandardMaterial({
    map: arenaTex,
    roughness: 0.72,
    metalness: 0.14,
  });
  materials.push(daisMat);

  const dais = new THREE.Mesh(daisGeo, daisMat);
  dais.position.y = -0.18;
  dais.receiveShadow = true;
  group.add(dais);

  // Outer carved stone rim
  const rimGeo = new THREE.TorusGeometry(10.6, 0.24, 12, 56);
  rimGeo.rotateX(Math.PI / 2);
  geometries.push(rimGeo);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.55,
    metalness: 0.35,
  });
  materials.push(rimMat);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.02;
  rim.receiveShadow = true;
  group.add(rim);

  // 3. Rotating Glowing Math Rune Circle
  const runeGeo = new THREE.PlaneGeometry(11.6, 11.6);
  runeGeo.rotateX(-Math.PI / 2);
  geometries.push(runeGeo);
  const runeMat = new THREE.MeshBasicMaterial({
    map: runeTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  materials.push(runeMat);

  const runeCircle = new THREE.Mesh(runeGeo, runeMat);
  runeCircle.position.y = 0.025;
  group.add(runeCircle);

  // 4. Perimeter Stone Pillars with Hovering Crystals (Composite 4-part models)
  const pillarBaseGeo = new THREE.BoxGeometry(1.15, 0.35, 1.15);
  const pillarShaftGeo = new THREE.CylinderGeometry(0.36, 0.44, 2.4, 8);
  const pillarCapGeo = new THREE.BoxGeometry(1.0, 0.26, 1.0);
  const crystalGeo = new THREE.OctahedronGeometry(0.34, 0);
  geometries.push(pillarBaseGeo, pillarShaftGeo, pillarCapGeo, crystalGeo);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.78,
    metalness: 0.12,
  });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1,
  });
  materials.push(stoneMat, crystalMat);

  const pillarCount = 6;
  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2 + Math.PI / 6;
    const radius = 10.6;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const pillar = new THREE.Group();
    pillar.position.set(px, 0, pz);
    pillar.lookAt(0, 0, 0);

    const base = new THREE.Mesh(pillarBaseGeo, stoneMat);
    base.position.y = 0.175;
    base.castShadow = true;
    base.receiveShadow = true;

    const shaft = new THREE.Mesh(pillarShaftGeo, stoneMat);
    shaft.position.y = 1.55;
    shaft.castShadow = true;
    shaft.receiveShadow = true;

    const cap = new THREE.Mesh(pillarCapGeo, stoneMat);
    cap.position.y = 2.88;
    cap.castShadow = true;

    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 3.55;
    crystal.userData.phaseOffset = i * 1.1;
    floatingCrystals.push(crystal);

    pillar.add(base, shaft, cap, crystal);
    group.add(pillar);
  }

  // Precompute village house placements so trees & rocks frame them cleanly without clipping
  const houseConfigs = [
    // Left hillside village cluster (clearly visible on left flank)
    { angle: -Math.PI * 0.94, r: 19.8, scale: 1.08, roofIdx: 0 },
    { angle: -Math.PI * 0.83, r: 22.8, scale: 1.16, roofIdx: 1 },
    { angle: -Math.PI * 0.74, r: 18.9, scale: 1.0, roofIdx: 2 },
    // Rear & behind-drummers village cottages (framing skyline behind stands)
    { angle: -Math.PI * 0.66, r: 24.8, scale: 1.22, roofIdx: 3 },
    { angle: -Math.PI * 0.54, r: 21.6, scale: 1.14, roofIdx: 0 },
    { angle: -Math.PI * 0.45, r: 22.0, scale: 1.12, roofIdx: 1 },
    { angle: -Math.PI * 0.34, r: 24.6, scale: 1.22, roofIdx: 2 },
    // Right hillside village cluster (clearly visible on right flank)
    { angle: -Math.PI * 0.25, r: 19.0, scale: 1.02, roofIdx: 3 },
    { angle: -Math.PI * 0.16, r: 22.6, scale: 1.15, roofIdx: 0 },
    { angle: -Math.PI * 0.06, r: 19.6, scale: 1.06, roofIdx: 1 },
    // Side & outer front-flank cottages (leaving front camera lane clear)
    { angle: Math.PI * 0.08, r: 19.2, scale: 1.02, roofIdx: 2 },
    { angle: Math.PI * 0.22, r: 21.4, scale: 1.1, roofIdx: 3 },
    { angle: Math.PI * 0.78, r: 21.2, scale: 1.1, roofIdx: 0 },
    { angle: Math.PI * 0.92, r: 19.4, scale: 1.04, roofIdx: 1 },
  ];

  const houseCoords = houseConfigs.map((h) => ({
    ...h,
    x: Math.cos(h.angle) * h.r,
    z: Math.sin(h.angle) * h.r,
  }));

  const isNearReservedZone = (px: number, pz: number, minHouseDist: number) => {
    if (houseCoords.some((h) => Math.hypot(px - h.x, pz - h.z) < minHouseDist)) {
      return true;
    }
    // Keep front camera lane open & avoid overlapping the 2 drummer towers
    if (pz > 5.5 && Math.abs(px) < 11.5) return true;
    for (const da of [-Math.PI * 0.63, -Math.PI * 0.37]) {
      const dx = Math.cos(da) * 14.35;
      const dz = Math.sin(da) * 14.35;
      if (Math.hypot(px - dx, pz - dz) < 3.2) return true;
    }
    return false;
  };

  // 5. InstancedMesh Pine Grove around outer hills (44 trees, avoiding houses & front view)
  const treeCount = 44;
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.5, 7);
  trunkGeo.translate(0, 0.75, 0);
  const foliageGeo = new THREE.ConeGeometry(1.15, 3.2, 8);
  foliageGeo.translate(0, 2.8, 0);
  geometries.push(trunkGeo, foliageGeo);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.9,
  });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.85,
  });
  materials.push(trunkMat, foliageMat);

  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const foliages = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  trunks.castShadow = true;
  foliages.castShadow = true;
  foliages.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < treeCount; i++) {
    let angle = (i / treeCount) * Math.PI * 2 + (i % 3) * 0.11;
    let dist = 16.5 + (i % 5) * 4.4;
    let x = Math.cos(angle) * dist;
    let z = Math.sin(angle) * dist;
    let attempts = 0;
    while (isNearReservedZone(x, z, 3.6) && attempts < 10) {
      attempts++;
      angle += 0.24;
      dist += 1.4;
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
    }
    const scale = 0.85 + ((i * 37) % 30) / 100;
    const groundY = getTerrainHeight(x, z);

    dummy.position.set(x, groundY, z);
    dummy.rotation.y = (i * 1.7) % (Math.PI * 2);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();

    trunks.setMatrixAt(i, dummy.matrix);
    foliages.setMatrixAt(i, dummy.matrix);

    const tint = 0.85 + ((i * 19) % 30) / 100;
    color.setRGB(0.08 * tint, 0.52 * tint, 0.24 * tint);
    foliages.setColorAt(i, color);
  }
  trunks.computeBoundingSphere();
  foliages.computeBoundingSphere();
  group.add(trunks, foliages);

  // 6. InstancedMesh Outer Boulders (24 rocks)
  const rockCount = 24;
  const rockGeo = new THREE.DodecahedronGeometry(0.85, 0);
  geometries.push(rockGeo);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.88,
    metalness: 0.05,
  });
  materials.push(rockMat);

  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  rocks.castShadow = true;
  rocks.receiveShadow = true;

  for (let i = 0; i < rockCount; i++) {
    let angle = (i / rockCount) * Math.PI * 2 + 0.25;
    let dist = 14.5 + (i % 4) * 3.8;
    let x = Math.cos(angle) * dist;
    let z = Math.sin(angle) * dist;
    let attempts = 0;
    while (isNearReservedZone(x, z, 3.0) && attempts < 8) {
      attempts++;
      angle += 0.27;
      dist += 1.1;
      x = Math.cos(angle) * dist;
      z = Math.sin(angle) * dist;
    }
    const scale = 0.65 + ((i * 23) % 45) / 100;
    dummy.position.set(x, getTerrainHeight(x, z) + 0.2, z);
    dummy.rotation.set(i * 0.4, i * 1.1, i * 0.2);
    dummy.scale.set(scale * 1.2, scale * 0.75, scale);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.computeBoundingSphere();
  group.add(rocks);

  // 7. Golden Full Moon (Night) & Radiant Sun (Morning/Day) + Drifting 3D Clouds
  const moonTex = createMoonSurfaceTexture();
  const moonHaloTex = createMoonHaloTexture();
  const sunTex = createSunSurfaceTexture();
  const sunHaloTex = createSunHaloTexture();
  textures.push(moonTex, moonHaloTex, sunTex, sunHaloTex);

  const skyBodyPos = new THREE.Vector3(-6.8, 8.1, -52);

  const moonGeo = new THREE.SphereGeometry(2.9, 32, 32);
  geometries.push(moonGeo);
  const moonMat = new THREE.MeshBasicMaterial({
    map: moonTex,
    color: 0xffe57f,
    fog: false,
  });
  materials.push(moonMat);

  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.copy(skyBodyPos);
  moon.rotation.y = -0.35;
  group.add(moon);

  const moonHaloMat = new THREE.SpriteMaterial({
    map: moonHaloTex,
    color: 0xfde047,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  materials.push(moonHaloMat);

  const moonHalo = new THREE.Sprite(moonHaloMat);
  moonHalo.position.copy(skyBodyPos);
  moonHalo.scale.set(12.5, 12.5, 1);
  group.add(moonHalo);

  const sunGeo = new THREE.SphereGeometry(3.25, 32, 32);
  geometries.push(sunGeo);
  const sunMat = new THREE.MeshBasicMaterial({
    map: sunTex,
    color: 0xfffbeb,
    fog: false,
  });
  materials.push(sunMat);

  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.copy(skyBodyPos);
  sun.visible = false;
  group.add(sun);

  const sunHaloMat = new THREE.SpriteMaterial({
    map: sunHaloTex,
    color: 0xfde047,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  materials.push(sunHaloMat);

  const sunHalo = new THREE.Sprite(sunHaloMat);
  sunHalo.position.copy(skyBodyPos);
  sunHalo.scale.set(16.5, 16.5, 1);
  sunHalo.visible = false;
  group.add(sunHalo);

  // Drifting 3D Puffy Clouds across the sky
  interface CloudInstance {
    group: THREE.Group;
    baseY: number;
    speed: number;
    phase: number;
  }

  const cloudPuffGeo = new THREE.SphereGeometry(1, 14, 12);
  geometries.push(cloudPuffGeo);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe0f2fe,
    emissiveIntensity: 0.28,
    roughness: 0.92,
    metalness: 0.0,
    transparent: true,
    opacity: 0.92,
    fog: false,
  });
  materials.push(cloudMat);

  const cloudConfigs = [
    { x: -20, y: 8.6, z: -26, scale: 1.15, speed: 0.36 },
    { x: -11.5, y: 7.4, z: -22, scale: 0.92, speed: 0.44 },
    { x: -3.2, y: 9.8, z: -34, scale: 1.38, speed: 0.28 },
    { x: 5.8, y: 7.9, z: -24, scale: 1.05, speed: 0.4 },
    { x: 14.5, y: 9.1, z: -30, scale: 1.25, speed: 0.32 },
    { x: 22.5, y: 6.9, z: -20, scale: 0.88, speed: 0.48 },
    { x: -16.5, y: 10.6, z: -40, scale: 1.5, speed: 0.24 },
    { x: 1.5, y: 6.6, z: -19, scale: 0.82, speed: 0.5 },
    { x: 11.2, y: 11.0, z: -42, scale: 1.48, speed: 0.22 },
    { x: -26.0, y: 7.2, z: -28, scale: 1.08, speed: 0.35 },
  ];

  const puffOffsets: Array<[number, number, number, number, number, number]> = [
    [0, 0.15, 0, 1.35, 0.92, 0.95],
    [-1.05, -0.05, 0.12, 0.95, 0.72, 0.78],
    [1.1, -0.08, -0.08, 1.02, 0.76, 0.82],
    [-0.45, 0.42, -0.1, 0.88, 0.78, 0.78],
    [0.52, 0.38, 0.14, 0.84, 0.74, 0.76],
  ];

  const clouds: CloudInstance[] = cloudConfigs.map((cfg, idx) => {
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(cfg.x, cfg.y, cfg.z);
    cloudGroup.scale.setScalar(cfg.scale);

    for (const [px, py, pz, sx, sy, sz] of puffOffsets) {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
      puff.position.set(px, py, pz);
      puff.scale.set(sx, sy, sz);
      cloudGroup.add(puff);
    }

    group.add(cloudGroup);
    return {
      group: cloudGroup,
      baseY: cfg.y,
      speed: cfg.speed,
      phase: idx * 0.9,
    };
  });

  const setDaytime = (isDay: boolean) => {
    moon.visible = !isDay;
    moonHalo.visible = !isDay;
    sun.visible = isDay;
    sunHalo.visible = isDay;

    if (isDay) {
      cloudMat.color.setHex(0xffffff);
      cloudMat.emissive.setHex(0xe0f2fe);
      cloudMat.emissiveIntensity = 0.28;
      cloudMat.opacity = 0.92;
    } else {
      cloudMat.color.setHex(0x64748b);
      cloudMat.emissive.setHex(0x1e293b);
      cloudMat.emissiveIntensity = 0.42;
      cloudMat.opacity = 0.62;
    }
  };

  // 8. Two-Tier Stone Spectator Grandstands & Animated Cheering 3D Crowd
  const standGeo = new THREE.BoxGeometry(1.78, 0.74, 1.35);
  geometries.push(standGeo);
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x3f4c5e,
    roughness: 0.78,
    metalness: 0.12,
  });
  materials.push(standMat);

  const tier1Count = 17;
  const tier2Count = 19;
  const stands = new THREE.InstancedMesh(standGeo, standMat, tier1Count + tier2Count);
  stands.castShadow = true;
  stands.receiveShadow = true;

  const spectatorSlots: SpectatorSlot[] = [];
  const pillarAngles = Array.from(
    { length: pillarCount },
    (_, i) => (i / pillarCount) * Math.PI * 2 + Math.PI / 6
  );
  const isNearPillar = (a: number) =>
    pillarAngles.some((pa) => {
      const diff = Math.atan2(Math.sin(a - pa), Math.cos(a - pa));
      return Math.abs(diff) < 0.16;
    });

  // Tier 1 curved bleacher blocks (y = 0.74)
  for (let i = 0; i < tier1Count; i++) {
    const t = i / (tier1Count - 1);
    const angle = -Math.PI * 0.98 + t * Math.PI * 0.96;
    const r = 11.75;
    const sx = Math.cos(angle) * r;
    const sz = Math.sin(angle) * r;

    _specDummy.position.set(sx, 0.37, sz);
    _specDummy.lookAt(0, 0.37, 0);
    _specDummy.scale.set(1, 1, 1);
    _specDummy.updateMatrix();
    stands.setMatrixAt(i, _specDummy.matrix);

    if (!isNearPillar(angle)) {
      spectatorSlots.push({
        x: sx,
        baseY: 0.74,
        z: sz,
        rotY: Math.atan2(-sx, -sz),
        phase: angle * 2.2,
        scale: 0.9 + ((i * 17) % 16) / 100,
      });
    }
  }

  // Tier 2 upper curved bleacher blocks (y = 1.48) so crowd is packed and visible over rim
  for (let i = 0; i < tier2Count; i++) {
    const t = i / (tier2Count - 1);
    const angle = -Math.PI * 0.96 + t * Math.PI * 0.92;
    const r = 13.15;
    const sx = Math.cos(angle) * r;
    const sz = Math.sin(angle) * r;

    _specDummy.position.set(sx, 0.74, sz);
    _specDummy.lookAt(0, 0.74, 0);
    _specDummy.scale.set(1.06, 2, 1.02);
    _specDummy.updateMatrix();
    stands.setMatrixAt(tier1Count + i, _specDummy.matrix);

    if (!isNearPillar(angle)) {
      spectatorSlots.push({
        x: sx,
        baseY: 1.48,
        z: sz,
        rotY: Math.atan2(-sx, -sz),
        phase: angle * 2.2 + 0.6,
        scale: 0.92 + ((i * 19) % 16) / 100,
      });
    }
  }

  stands.computeBoundingSphere();
  group.add(stands);

  // Front standing row cheering around the inner stone rim behind/beside the fighters
  const frontRowCount = 15;
  for (let i = 0; i < frontRowCount; i++) {
    const t = i / (frontRowCount - 1);
    const angle = -Math.PI * 0.94 + t * Math.PI * 0.88;
    if (isNearPillar(angle)) continue;
    const r = 9.45;
    const sx = Math.cos(angle) * r;
    const sz = Math.sin(angle) * r;
    spectatorSlots.push({
      x: sx,
      baseY: 0.0,
      z: sz,
      rotY: Math.atan2(-sx, -sz),
      phase: angle * 2.2 + 1.1,
      scale: 0.86 + ((i * 23) % 16) / 100,
    });
  }

  const specCount = spectatorSlots.length;
  const specBodyGeo = new THREE.CylinderGeometry(0.19, 0.25, 0.68, 10);
  specBodyGeo.translate(0, 0.34, 0);
  const specHeadGeo = new THREE.SphereGeometry(0.2, 12, 10);
  const specArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.42, 8);
  specArmGeo.translate(0, -0.18, 0);
  const cheerStickGeo = new THREE.CylinderGeometry(0.036, 0.028, 0.48, 8);
  cheerStickGeo.translate(0, -0.48, 0);
  geometries.push(specBodyGeo, specHeadGeo, specArmGeo, cheerStickGeo);

  const specBodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.68,
    metalness: 0.08,
  });
  const specHeadMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.65,
    metalness: 0.02,
  });
  const specArmMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.68,
    metalness: 0.08,
  });
  const cheerStickMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.1,
  });
  materials.push(specBodyMat, specHeadMat, specArmMat, cheerStickMat);

  const specBodies = new THREE.InstancedMesh(specBodyGeo, specBodyMat, specCount);
  const specHeads = new THREE.InstancedMesh(specHeadGeo, specHeadMat, specCount);
  const specArms = new THREE.InstancedMesh(specArmGeo, specArmMat, specCount * 2);
  const cheerSticks = new THREE.InstancedMesh(cheerStickGeo, cheerStickMat, specCount * 2);
  specBodies.castShadow = true;
  specBodies.receiveShadow = true;
  specHeads.castShadow = true;
  specArms.castShadow = true;

  const tunicPalette = [
    0x2563eb,
    0x10b981,
    0xf59e0b,
    0xec4899,
    0x8b5cf6,
    0x06b6d4,
    0xef4444,
  ];
  const stickPalette = [
    0xfacc15,
    0x38bdf8,
    0x34d399,
    0xf472b6,
    0xfb923c,
  ];
  const specColor = new THREE.Color();
  for (let i = 0; i < specCount; i++) {
    specColor.setHex(tunicPalette[i % tunicPalette.length]);
    specBodies.setColorAt(i, specColor);
    specArms.setColorAt(i * 2, specColor);
    specArms.setColorAt(i * 2 + 1, specColor);

    specColor.setHex(stickPalette[i % stickPalette.length]);
    cheerSticks.setColorAt(i * 2, specColor);
    cheerSticks.setColorAt(i * 2 + 1, specColor);
  }
  if (specBodies.instanceColor) specBodies.instanceColor.needsUpdate = true;
  if (specArms.instanceColor) specArms.instanceColor.needsUpdate = true;
  if (cheerSticks.instanceColor) cheerSticks.instanceColor.needsUpdate = true;

  group.add(specBodies, specHeads, specArms, cheerSticks);

  const updateSpectators = (elapsed: number, excitement: number) => {
    const bounceAmp = 0.06 + excitement * 0.16;
    const waveFreq = 3.2 + excitement * 5.5;

    for (let i = 0; i < specCount; i++) {
      const s = spectatorSlots[i];
      const stadiumWave = Math.max(0, Math.sin(elapsed * 2.1 + s.phase));
      const bounce =
        (Math.abs(Math.sin(elapsed * waveFreq + s.phase)) * bounceAmp +
          stadiumWave * 0.07) *
        s.scale;
      const sway = Math.sin(elapsed * 2.2 + s.phase) * 0.1;
      const y = s.baseY + bounce;

      // Body
      _specDummy.position.set(s.x, y, s.z);
      _specDummy.rotation.set(0, s.rotY + sway, 0);
      _specDummy.scale.setScalar(s.scale);
      _specDummy.updateMatrix();
      specBodies.setMatrixAt(i, _specDummy.matrix);

      // Head
      _specDummy.position.set(s.x, y + 0.88 * s.scale, s.z);
      _specDummy.rotation.set(Math.sin(elapsed * 2.8 + s.phase) * 0.1, s.rotY + sway, 0);
      _specDummy.scale.setScalar(s.scale);
      _specDummy.updateMatrix();
      specHeads.setMatrixAt(i, _specDummy.matrix);

      // Left & Right cheering arms + glowing cheer batons raised in celebration
      const cosR = Math.cos(s.rotY + sway);
      const sinR = Math.sin(s.rotY + sway);
      const shoulderOffset = 0.25 * s.scale;
      const shoulderY = y + 0.62 * s.scale;

      const cheerLiftLeft =
        -1.95 - stadiumWave * 0.45 + Math.sin(elapsed * (7.5 + excitement * 5) + s.phase) * 0.42;
      const cheerLiftRight =
        -1.85 - stadiumWave * 0.45 + Math.cos(elapsed * (7.5 + excitement * 5) + s.phase) * 0.42;

      // Left arm & left cheer stick
      _specDummy.position.set(
        s.x - cosR * shoulderOffset,
        shoulderY,
        s.z + sinR * shoulderOffset
      );
      _specDummy.rotation.set(cheerLiftLeft, s.rotY + sway, 0.26);
      _specDummy.scale.setScalar(s.scale);
      _specDummy.updateMatrix();
      specArms.setMatrixAt(i * 2, _specDummy.matrix);
      cheerSticks.setMatrixAt(i * 2, _specDummy.matrix);

      // Right arm & right cheer stick
      _specDummy.position.set(
        s.x + cosR * shoulderOffset,
        shoulderY,
        s.z - sinR * shoulderOffset
      );
      _specDummy.rotation.set(cheerLiftRight, s.rotY + sway, -0.26);
      _specDummy.scale.setScalar(s.scale);
      _specDummy.updateMatrix();
      specArms.setMatrixAt(i * 2 + 1, _specDummy.matrix);
      cheerSticks.setMatrixAt(i * 2 + 1, _specDummy.matrix);
    }

    specBodies.instanceMatrix.needsUpdate = true;
    specHeads.instanceMatrix.needsUpdate = true;
    specArms.instanceMatrix.needsUpdate = true;
    cheerSticks.instanceMatrix.needsUpdate = true;
  };

  // Initialize spectator matrices cleanly for frame 1
  updateSpectators(0, 0.35);

  // 9. Sky Clouds Motion
  const updateAtmosphere = (dt: number, elapsed: number) => {
    for (const c of clouds) {
      c.group.position.x += c.speed * dt;
      if (c.group.position.x > 30) {
        c.group.position.x = -30;
      }
      c.group.position.y = c.baseY + Math.sin(elapsed * 0.45 + c.phase) * 0.18;
    }
  };

  updateAtmosphere(0, 0);

  // 10. Two Festival Drummers on raised ceremonial stages clearly visible behind the spectators
  interface DrummerRig {
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    body: THREE.Group;
    head: THREE.Mesh;
    drum: THREE.Group;
    phase: number;
  }

  const drummers: DrummerRig[] = [];
  const drumPlatformMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.68,
    metalness: 0.18,
  });
  const drumShellMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.25,
    roughness: 0.42,
    metalness: 0.18,
  });
  const drumHeadMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4,
    roughness: 0.5,
  });
  const drumGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xb45309,
    emissiveIntensity: 0.28,
    roughness: 0.25,
    metalness: 0.82,
  });
  const drummerTunicMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0x881337,
    emissiveIntensity: 0.28,
    roughness: 0.55,
    metalness: 0.1,
  });
  const drummerPantsMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.72,
    metalness: 0.1,
  });
  const drummerSkinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.6,
  });
  const drummerStickMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.15,
    roughness: 0.22,
  });
  materials.push(
    drumPlatformMat,
    drumShellMat,
    drumHeadMat,
    drumGoldMat,
    drummerTunicMat,
    drummerPantsMat,
    drummerSkinMat,
    drummerStickMat
  );

  const stageGeo = new THREE.CylinderGeometry(1.38, 1.58, 2.65, 8);
  const stageTrimGeo = new THREE.TorusGeometry(1.4, 0.075, 8, 24);
  stageTrimGeo.rotateX(Math.PI / 2);
  const stageCollarGeo = new THREE.CylinderGeometry(1.44, 1.44, 0.26, 8);
  const drumBodyGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.64, 18);
  const drumHeadGeo = new THREE.CylinderGeometry(0.57, 0.57, 0.04, 18);
  const drumRimGeo = new THREE.TorusGeometry(0.62, 0.055, 8, 24);
  drumRimGeo.rotateX(Math.PI / 2);
  const drumStandGeo = new THREE.BoxGeometry(0.14, 0.78, 0.66);
  const drummerLegGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.58, 10);
  const drummerTorsoGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.88, 12);
  const drummerShoulderGeo = new THREE.SphereGeometry(0.14, 10, 10);
  const drummerHeadGeo = new THREE.SphereGeometry(0.28, 16, 14);
  const drummerBandGeo = new THREE.TorusGeometry(0.285, 0.04, 6, 18);
  drummerBandGeo.rotateX(Math.PI / 2);
  const drummerPlumeGeo = new THREE.ConeGeometry(0.12, 0.32, 8);
  const drummerArmGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.56, 8);
  drummerArmGeo.translate(0, -0.26, 0);
  const drumstickGeo = new THREE.CylinderGeometry(0.028, 0.042, 0.74, 8);
  drumstickGeo.translate(0, 0.34, 0);
  geometries.push(
    stageGeo,
    stageTrimGeo,
    stageCollarGeo,
    drumBodyGeo,
    drumHeadGeo,
    drumRimGeo,
    drumStandGeo,
    drummerLegGeo,
    drummerTorsoGeo,
    drummerShoulderGeo,
    drummerHeadGeo,
    drummerBandGeo,
    drummerPlumeGeo,
    drummerArmGeo,
    drumstickGeo
  );

  const drummerAngles = [-Math.PI * 0.63, -Math.PI * 0.37];
  drummerAngles.forEach((angle, idx) => {
    const r = 14.35;
    const dx = Math.cos(angle) * r;
    const dz = Math.sin(angle) * r;

    const tower = new THREE.Group();
    tower.position.set(dx, 0, dz);
    tower.lookAt(0, 0, 0);

    // Raised stage above Tier 2 spectators (top y = 2.65)
    const stage = new THREE.Mesh(stageGeo, drumPlatformMat);
    stage.position.y = 1.325;
    stage.castShadow = true;
    stage.receiveShadow = true;
    tower.add(stage);

    const stageCollar = new THREE.Mesh(stageCollarGeo, drumShellMat);
    stageCollar.position.y = 2.52;
    tower.add(stageCollar);

    const stageTrim = new THREE.Mesh(stageTrimGeo, drumGoldMat);
    stageTrim.position.y = 2.66;
    tower.add(stageTrim);

    // Drum stand + festival drum mounted at waist height in front (+Z) so drummer stands cleanly ABOVE it
    const standLeft = new THREE.Mesh(drumStandGeo, drumPlatformMat);
    standLeft.position.set(-0.44, 3.04, 0.44);
    const standRight = new THREE.Mesh(drumStandGeo, drumPlatformMat);
    standRight.position.set(0.44, 3.04, 0.44);
    tower.add(standLeft, standRight);

    const drum = new THREE.Group();
    drum.position.set(0, 3.3, 0.46);
    drum.rotation.x = -0.26;

    const drumBody = new THREE.Mesh(drumBodyGeo, drumShellMat);
    drumBody.castShadow = true;
    drum.add(drumBody);

    const topHead = new THREE.Mesh(drumHeadGeo, drumHeadMat);
    topHead.position.y = 0.33;
    drum.add(topHead);

    const topRim = new THREE.Mesh(drumRimGeo, drumGoldMat);
    topRim.position.y = 0.31;
    drum.add(topRim);

    const bottomRim = new THREE.Mesh(drumRimGeo, drumGoldMat);
    bottomRim.position.y = -0.31;
    drum.add(bottomRim);

    tower.add(drum);

    // Articulated Drummer standing on podium behind drum (-Z), chest & head rising clearly above drum!
    const drummerBody = new THREE.Group();
    drummerBody.position.set(0, 2.65, -0.28);

    const leftLeg = new THREE.Mesh(drummerLegGeo, drummerPantsMat);
    leftLeg.position.set(0.16, 0.29, 0);
    const rightLeg = new THREE.Mesh(drummerLegGeo, drummerPantsMat);
    rightLeg.position.set(-0.16, 0.29, 0);
    drummerBody.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(drummerTorsoGeo, drummerTunicMat);
    torso.position.y = 0.96;
    torso.castShadow = true;
    drummerBody.add(torso);

    const leftShoulder = new THREE.Mesh(drummerShoulderGeo, drumGoldMat);
    leftShoulder.position.set(0.36, 1.32, 0);
    const rightShoulder = new THREE.Mesh(drummerShoulderGeo, drumGoldMat);
    rightShoulder.position.set(-0.36, 1.32, 0);
    drummerBody.add(leftShoulder, rightShoulder);

    const head = new THREE.Mesh(drummerHeadGeo, drummerSkinMat);
    head.position.y = 1.66;
    head.castShadow = true;
    const headband = new THREE.Mesh(drummerBandGeo, drumGoldMat);
    headband.position.y = 0.07;
    const plume = new THREE.Mesh(drummerPlumeGeo, drummerTunicMat);
    plume.position.set(0, 0.32, -0.05);
    plume.rotation.x = -0.25;
    head.add(headband, plume);
    drummerBody.add(head);

    const makeDrumArm = (xOff: number) => {
      const arm = new THREE.Group();
      arm.position.set(xOff, 1.32, 0.08);

      const armMesh = new THREE.Mesh(drummerArmGeo, drummerTunicMat);
      armMesh.castShadow = true;
      arm.add(armMesh);

      const stick = new THREE.Mesh(drumstickGeo, drummerStickMat);
      stick.position.set(0, -0.52, 0.04);
      stick.rotation.x = Math.PI / 2.15;
      arm.add(stick);

      drummerBody.add(arm);
      return arm;
    };

    const leftArm = makeDrumArm(0.38);
    const rightArm = makeDrumArm(-0.38);

    tower.add(drummerBody);
    group.add(tower);

    drummers.push({
      leftArm,
      rightArm,
      body: drummerBody,
      head,
      drum,
      phase: idx * Math.PI,
    });
  });

  const updateDrummers = (elapsed: number, tempoBoost: number) => {
    const beatSpeed = 8.4 * tempoBoost;
    for (const d of drummers) {
      const beatL = Math.sin(elapsed * beatSpeed + d.phase);
      const beatR = Math.sin(elapsed * beatSpeed + d.phase + Math.PI);

      // Wide energetic alternating drumming strokes clearly visible from arena camera
      d.leftArm.rotation.x = -0.55 - Math.max(0, beatL) * 1.15;
      d.rightArm.rotation.x = -0.55 - Math.max(0, beatR) * 1.15;
      d.head.rotation.x = Math.sin(elapsed * beatSpeed * 0.5) * 0.16;
      d.body.position.y = 2.65 + Math.abs(Math.sin(elapsed * beatSpeed * 0.5 + d.phase)) * 0.07;

      // Subtle drum rebound bounce on hit
      const hitPulse = Math.max(0, Math.abs(Math.sin(elapsed * beatSpeed + d.phase)) - 0.68) * 0.22;
      d.drum.scale.set(1 + hitPulse, 1 - hitPulse * 0.45, 1 + hitPulse);
    }
  };

  updateDrummers(0, 1);

  // 11. Surrounding Cozy 3D Village Houses & Cottage Lamps
  const houseFoundationMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.86,
    metalness: 0.06,
  });
  const houseWallMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.78,
    metalness: 0.02,
  });
  const houseTimberMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.84,
    metalness: 0.06,
  });
  const houseWindowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.35,
    roughness: 0.25,
  });
  const roofMats = [
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.68 }),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.68 }),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.68 }),
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.68 }),
  ];
  materials.push(houseFoundationMat, houseWallMat, houseTimberMat, houseWindowMat, ...roofMats);

  const houseFoundationGeo = new THREE.BoxGeometry(2.85, 0.75, 2.55);
  const houseWallGeo = new THREE.BoxGeometry(2.55, 1.85, 2.25);
  const houseRoofGeo = new THREE.ConeGeometry(2.18, 1.45, 4);
  houseRoofGeo.rotateY(Math.PI / 4);
  const houseChimneyGeo = new THREE.BoxGeometry(0.36, 0.9, 0.36);
  const houseDoorGeo = new THREE.BoxGeometry(0.56, 1.05, 0.12);
  const houseWindowGeo = new THREE.BoxGeometry(0.46, 0.46, 0.12);
  const houseSideWindowGeo = new THREE.BoxGeometry(0.12, 0.46, 0.46);
  const houseBeamGeo = new THREE.BoxGeometry(2.62, 0.14, 2.32);
  const fencePostGeo = new THREE.BoxGeometry(0.12, 0.56, 0.12);
  const fenceRailGeo = new THREE.BoxGeometry(0.85, 0.08, 0.08);
  geometries.push(
    houseFoundationGeo,
    houseWallGeo,
    houseRoofGeo,
    houseChimneyGeo,
    houseDoorGeo,
    houseWindowGeo,
    houseSideWindowGeo,
    houseBeamGeo,
    fencePostGeo,
    fenceRailGeo
  );

  houseCoords.forEach((hc) => {
    const groundY = getTerrainHeight(hc.x, hc.z);
    const house = new THREE.Group();
    house.position.set(hc.x, groundY, hc.z);
    house.lookAt(0, groundY, 0);
    house.scale.setScalar(hc.scale);

    // Stone foundation anchored into slope so no floating edge
    const foundation = new THREE.Mesh(houseFoundationGeo, houseFoundationMat);
    foundation.position.y = 0.02;
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    house.add(foundation);

    // Main plaster cottage walls
    const walls = new THREE.Mesh(houseWallGeo, houseWallMat);
    walls.position.y = 1.3;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Timber eaves beam
    const eavesBeam = new THREE.Mesh(houseBeamGeo, houseTimberMat);
    eavesBeam.position.y = 2.2;
    house.add(eavesBeam);

    // Colorful pitched roof
    const roof = new THREE.Mesh(houseRoofGeo, roofMats[hc.roofIdx % roofMats.length]);
    roof.position.y = 2.92;
    roof.castShadow = true;
    house.add(roof);

    // Stone chimney
    const chimney = new THREE.Mesh(houseChimneyGeo, houseFoundationMat);
    chimney.position.set(0.68, 3.15, -0.35);
    chimney.castShadow = true;
    house.add(chimney);

    // Wooden front door (+Z facing arena)
    const door = new THREE.Mesh(houseDoorGeo, houseTimberMat);
    door.position.set(0, 0.9, 1.13);
    house.add(door);

    // Warm glowing front & side windows
    const frontWinL = new THREE.Mesh(houseWindowGeo, houseWindowMat);
    frontWinL.position.set(-0.74, 1.48, 1.13);
    const frontWinR = new THREE.Mesh(houseWindowGeo, houseWindowMat);
    frontWinR.position.set(0.74, 1.48, 1.13);
    const sideWinL = new THREE.Mesh(houseSideWindowGeo, houseWindowMat);
    sideWinL.position.set(-1.28, 1.42, 0.2);
    const sideWinR = new THREE.Mesh(houseSideWindowGeo, houseWindowMat);
    sideWinR.position.set(1.28, 1.42, 0.2);
    house.add(frontWinL, frontWinR, sideWinL, sideWinR);

    // Cozy front porch picket fence segments flanking the doorway
    for (const side of [-1, 1]) {
      const postA = new THREE.Mesh(fencePostGeo, houseTimberMat);
      postA.position.set(side * 0.52, 0.56, 1.56);
      const postB = new THREE.Mesh(fencePostGeo, houseTimberMat);
      postB.position.set(side * 1.26, 0.56, 1.56);
      const rail = new THREE.Mesh(fenceRailGeo, houseTimberMat);
      rail.position.set(side * 0.89, 0.66, 1.56);
      house.add(postA, postB, rail);
    }

    group.add(house);
  });

  // 12. Rich Arena & Village Decorations (Bunting Flags, Tall Banners, Glowing Lanterns, Braziers, Flower Beds & Sky Lanterns)
  const decorPoleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.48,
    metalness: 0.55,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf97316,
    emissiveIntensity: 1.5,
    roughness: 0.25,
  });
  const lanternCapMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.5,
  });
  const bannerClothMats = [
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.22, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1e3a8a, emissiveIntensity: 0.22, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x78350f, emissiveIntensity: 0.22, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b, emissiveIntensity: 0.22, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.22, side: THREE.DoubleSide }),
  ];
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xfb923c,
    transparent: true,
    opacity: 0.92,
  });
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.95,
  });
  const shrubMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.85,
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x444444,
    emissiveIntensity: 0.22,
    roughness: 0.45,
  });
  const buntingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x334155,
    emissiveIntensity: 0.2,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const ropeMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  const skyLanternMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.75,
    roughness: 0.3,
  });

  materials.push(
    decorPoleMat,
    lanternGlowMat,
    lanternCapMat,
    ...bannerClothMats,
    flameMat,
    innerFlameMat,
    shrubMat,
    flowerMat,
    buntingMat,
    ropeMat,
    skyLanternMat
  );

  // 12a. Colorful Festival Bunting Flag Strings between Rear/Side Pillars & Drummer Towers
  const buntingShape = new THREE.Shape();
  buntingShape.moveTo(-0.16, 0);
  buntingShape.lineTo(0.16, 0);
  buntingShape.lineTo(0, -0.34);
  buntingShape.closePath();
  const buntingFlagGeo = new THREE.ShapeGeometry(buntingShape);
  const ropeSegGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 6);
  ropeSegGeo.rotateX(Math.PI / 2);
  geometries.push(buntingFlagGeo, ropeSegGeo);

  const buntingAnchors: Array<[THREE.Vector3, THREE.Vector3]> = [];
  for (let i = 2; i < 5; i++) {
    const a1 = pillarAngles[i];
    const a2 = pillarAngles[(i + 1) % pillarCount];
    buntingAnchors.push([
      new THREE.Vector3(Math.cos(a1) * 10.6, 2.95, Math.sin(a1) * 10.6),
      new THREE.Vector3(Math.cos(a2) * 10.6, 2.95, Math.sin(a2) * 10.6),
    ]);
  }
  // Connect side pillars to the two Drummer Towers
  buntingAnchors.push(
    [
      new THREE.Vector3(Math.cos(pillarAngles[3]) * 10.6, 2.95, Math.sin(pillarAngles[3]) * 10.6),
      new THREE.Vector3(Math.cos(-Math.PI * 0.63) * 14.35, 3.2, Math.sin(-Math.PI * 0.63) * 14.35),
    ],
    [
      new THREE.Vector3(Math.cos(-Math.PI * 0.63) * 14.35, 3.2, Math.sin(-Math.PI * 0.63) * 14.35),
      new THREE.Vector3(Math.cos(pillarAngles[4]) * 10.6, 2.95, Math.sin(pillarAngles[4]) * 10.6),
    ],
    [
      new THREE.Vector3(Math.cos(pillarAngles[4]) * 10.6, 2.95, Math.sin(pillarAngles[4]) * 10.6),
      new THREE.Vector3(Math.cos(-Math.PI * 0.37) * 14.35, 3.2, Math.sin(-Math.PI * 0.37) * 14.35),
    ],
    [
      new THREE.Vector3(Math.cos(-Math.PI * 0.37) * 14.35, 3.2, Math.sin(-Math.PI * 0.37) * 14.35),
      new THREE.Vector3(Math.cos(pillarAngles[5]) * 10.6, 2.95, Math.sin(pillarAngles[5]) * 10.6),
    ]
  );

  const flagsPerSpan = 11;
  const totalFlags = buntingAnchors.length * flagsPerSpan;
  const buntingInstanced = new THREE.InstancedMesh(buntingFlagGeo, buntingMat, totalFlags);
  const buntingPalette = [0xef4444, 0xfacc15, 0x3b82f6, 0x10b981, 0xec4899, 0xf97316];
  const flagColor = new THREE.Color();
  const flagPos = new THREE.Vector3();

  let flagIdx = 0;
  for (const [pA, pB] of buntingAnchors) {
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
    mid.y -= 0.45;
    const spanLen = pA.distanceTo(pB);
    const rope = new THREE.Mesh(ropeSegGeo, ropeMat);
    rope.position.copy(pA).lerp(pB, 0.5);
    rope.position.y -= 0.2;
    rope.scale.set(1, 1, spanLen);
    rope.lookAt(pB.x, pB.y - 0.1, pB.z);
    group.add(rope);

    const yaw = Math.atan2(pB.x - pA.x, pB.z - pA.z);
    for (let f = 0; f < flagsPerSpan; f++) {
      const t = (f + 0.5) / flagsPerSpan;
      flagPos.lerpVectors(pA, pB, t);
      flagPos.y -= Math.sin(t * Math.PI) * 0.55;
      _specDummy.position.copy(flagPos);
      _specDummy.rotation.set(0, yaw + Math.PI / 2, 0);
      _specDummy.scale.setScalar(1);
      _specDummy.updateMatrix();
      buntingInstanced.setMatrixAt(flagIdx, _specDummy.matrix);
      flagColor.setHex(buntingPalette[flagIdx % buntingPalette.length]);
      buntingInstanced.setColorAt(flagIdx, flagColor);
      flagIdx++;
    }
  }
  if (buntingInstanced.instanceColor) buntingInstanced.instanceColor.needsUpdate = true;
  group.add(buntingInstanced);

  // 12b. Tall Heraldic Festival Banners around Stands & Villages
  const bannerPoleGeo = new THREE.CylinderGeometry(0.055, 0.075, 4.1, 8);
  bannerPoleGeo.translate(0, 2.05, 0);
  const bannerCrossGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.92, 8);
  bannerCrossGeo.rotateZ(Math.PI / 2);
  const bannerClothGeo = new THREE.PlaneGeometry(0.76, 1.85, 1, 4);
  const bannerFinialGeo = new THREE.OctahedronGeometry(0.16, 0);
  geometries.push(bannerPoleGeo, bannerCrossGeo, bannerClothGeo, bannerFinialGeo);

  const bannerCloths: Array<{ mesh: THREE.Mesh; phase: number }> = [];
  const bannerAngles = [
    -Math.PI * 0.97,
    -Math.PI * 0.87,
    -Math.PI * 0.72,
    -Math.PI * 0.53,
    -Math.PI * 0.47,
    -Math.PI * 0.28,
    -Math.PI * 0.13,
    -Math.PI * 0.03,
    Math.PI * 0.12,
    Math.PI * 0.88,
  ];
  bannerAngles.forEach((angle, idx) => {
    const r = idx >= 8 ? 11.4 : 14.6;
    const bx = Math.cos(angle) * r;
    const bz = Math.sin(angle) * r;
    const by = Math.max(0, getTerrainHeight(bx, bz));

    const bannerGroup = new THREE.Group();
    bannerGroup.position.set(bx, by, bz);
    bannerGroup.lookAt(0, by, 0);

    const pole = new THREE.Mesh(bannerPoleGeo, decorPoleMat);
    pole.castShadow = true;
    const cross = new THREE.Mesh(bannerCrossGeo, drumGoldMat);
    cross.position.y = 3.72;
    const finial = new THREE.Mesh(bannerFinialGeo, drumGoldMat);
    finial.position.y = 4.22;
    const cloth = new THREE.Mesh(
      bannerClothGeo,
      bannerClothMats[idx % bannerClothMats.length]
    );
    cloth.position.set(0, 2.75, 0.06);
    cloth.castShadow = true;

    bannerGroup.add(pole, cross, finial, cloth);
    group.add(bannerGroup);
    bannerCloths.push({ mesh: cloth, phase: idx * 0.8 });
  });

  // 12c. Glowing Curved Festival Lantern Posts along Rim & Village Paths
  const lanternPostGeo = new THREE.CylinderGeometry(0.05, 0.075, 2.7, 8);
  lanternPostGeo.translate(0, 1.35, 0);
  const lanternArmGeo = new THREE.BoxGeometry(0.07, 0.07, 0.56);
  const lanternBodyGeo = new THREE.SphereGeometry(0.21, 12, 10);
  lanternBodyGeo.scale(1, 1.25, 1);
  const lanternCapGeo = new THREE.CylinderGeometry(0.14, 0.2, 0.09, 10);
  geometries.push(lanternPostGeo, lanternArmGeo, lanternBodyGeo, lanternCapGeo);

  const lanternPositions: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI * 0.92 + (i / 7) * Math.PI * 0.84;
    lanternPositions.push({ x: Math.cos(a) * 15.6, z: Math.sin(a) * 15.6 });
  }
  lanternPositions.push(
    { x: -11.4, z: 3.4 },
    { x: 11.4, z: 3.4 },
    { x: -9.8, z: 6.4 },
    { x: 9.8, z: 6.4 }
  );

  for (const lp of lanternPositions) {
    const ly = getTerrainHeight(lp.x, lp.z);
    const postGroup = new THREE.Group();
    postGroup.position.set(lp.x, ly, lp.z);
    postGroup.lookAt(0, ly, 0);

    const post = new THREE.Mesh(lanternPostGeo, decorPoleMat);
    post.castShadow = true;
    const arm = new THREE.Mesh(lanternArmGeo, decorPoleMat);
    arm.position.set(0, 2.66, 0.24);
    const body = new THREE.Mesh(lanternBodyGeo, lanternGlowMat);
    body.position.set(0, 2.38, 0.48);
    const topCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
    topCap.position.set(0, 2.62, 0.48);
    const botCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
    botCap.position.set(0, 2.13, 0.48);

    postGroup.add(post, arm, body, topCap, botCap);
    group.add(postGroup);
  }

  // 12d. Ceremonial Fire Braziers with Animated Flickering Flames around Arena Rim
  const brazierPedestalGeo = new THREE.CylinderGeometry(0.28, 0.4, 0.95, 8);
  brazierPedestalGeo.translate(0, 0.475, 0);
  const brazierBowlGeo = new THREE.CylinderGeometry(0.46, 0.24, 0.32, 10);
  const outerFlameGeo = new THREE.ConeGeometry(0.28, 0.72, 8);
  outerFlameGeo.translate(0, 0.36, 0);
  const innerFlameGeo = new THREE.ConeGeometry(0.15, 0.48, 8);
  innerFlameGeo.translate(0, 0.24, 0);
  geometries.push(brazierPedestalGeo, brazierBowlGeo, outerFlameGeo, innerFlameGeo);

  const brazierFlames: Array<{ outer: THREE.Mesh; inner: THREE.Mesh; phase: number }> = [];
  const brazierAngles = [
    -Math.PI * 0.8,
    -Math.PI * 0.58,
    -Math.PI * 0.42,
    -Math.PI * 0.2,
    Math.PI * 0.14,
    Math.PI * 0.86,
  ];
  brazierAngles.forEach((angle, idx) => {
    const r = 10.15;
    const bx = Math.cos(angle) * r;
    const bz = Math.sin(angle) * r;

    const brazier = new THREE.Group();
    brazier.position.set(bx, 0, bz);

    const pedestal = new THREE.Mesh(brazierPedestalGeo, stoneMat);
    pedestal.castShadow = true;
    const bowl = new THREE.Mesh(brazierBowlGeo, drumGoldMat);
    bowl.position.y = 1.06;
    const outer = new THREE.Mesh(outerFlameGeo, flameMat);
    outer.position.y = 1.15;
    const inner = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    inner.position.y = 1.18;

    brazier.add(pedestal, bowl, outer, inner);
    group.add(brazier);
    brazierFlames.push({ outer, inner, phase: idx * 1.3 });
  });

  // 12e. Colorful Flower Beds & Bushes around Arena Rim, Stands, and Village Cottages
  const shrubGeo = new THREE.DodecahedronGeometry(0.42, 1);
  shrubGeo.scale(1.25, 0.68, 1.25);
  const blossomGeo = new THREE.SphereGeometry(0.11, 7, 6);
  geometries.push(shrubGeo, blossomGeo);

  const flowerCoords: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * 0.96 + (i / 13) * Math.PI * 0.92;
    const r = i % 2 === 0 ? 10.95 : 14.05;
    const fx = Math.cos(a) * r;
    const fz = Math.sin(a) * r;
    flowerCoords.push({ x: fx, y: Math.max(0, getTerrainHeight(fx, fz)) + 0.12, z: fz });
  }
  for (const hc of houseCoords) {
    const dirX = -hc.x / hc.r;
    const dirZ = -hc.z / hc.r;
    const fx = hc.x + dirX * 1.9;
    const fz = hc.z + dirZ * 1.9;
    flowerCoords.push({ x: fx, y: getTerrainHeight(fx, fz) + 0.12, z: fz });
  }

  const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, flowerCoords.length);
  const bloomsPerBed = 5;
  const blossoms = new THREE.InstancedMesh(
    blossomGeo,
    flowerMat,
    flowerCoords.length * bloomsPerBed
  );
  const bloomPalette = [0xf43f5e, 0xfacc15, 0x38bdf8, 0xc084fc, 0xfb923c, 0xf472b6];
  const bloomColor = new THREE.Color();

  flowerCoords.forEach((fc, idx) => {
    _specDummy.position.set(fc.x, fc.y, fc.z);
    _specDummy.rotation.set(0, idx * 0.9, 0);
    _specDummy.scale.setScalar(1.0 + (idx % 3) * 0.15);
    _specDummy.updateMatrix();
    shrubs.setMatrixAt(idx, _specDummy.matrix);

    for (let b = 0; b < bloomsPerBed; b++) {
      const ba = (b / bloomsPerBed) * Math.PI * 2 + idx;
      const br = 0.28;
      _specDummy.position.set(
        fc.x + Math.cos(ba) * br,
        fc.y + 0.24 + (b % 2) * 0.06,
        fc.z + Math.sin(ba) * br
      );
      _specDummy.rotation.set(0, 0, 0);
      _specDummy.scale.setScalar(1);
      _specDummy.updateMatrix();
      const bIdx = idx * bloomsPerBed + b;
      blossoms.setMatrixAt(bIdx, _specDummy.matrix);
      bloomColor.setHex(bloomPalette[(idx + b) % bloomPalette.length]);
      blossoms.setColorAt(bIdx, bloomColor);
    }
  });
  if (blossoms.instanceColor) blossoms.instanceColor.needsUpdate = true;
  group.add(shrubs, blossoms);

  // 12f. Floating Warm Sky-Lanterns above Village & Trees
  const skyLanternGeo = new THREE.CylinderGeometry(0.16, 0.11, 0.34, 8);
  geometries.push(skyLanternGeo);

  interface SkyLanternItem {
    mesh: THREE.Mesh;
    baseY: number;
    phase: number;
  }
  const skyLanterns: SkyLanternItem[] = [];
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * 0.98 + (i / 13) * Math.PI * 0.96;
    const r = 15.8 + (i % 3) * 3.4;
    const lx = Math.cos(a) * r;
    const lz = Math.sin(a) * r;
    const ly = 4.2 + (i % 4) * 0.95;

    const mesh = new THREE.Mesh(skyLanternGeo, skyLanternMat);
    mesh.position.set(lx, ly, lz);
    group.add(mesh);
    skyLanterns.push({ mesh, baseY: ly, phase: i * 1.1 });
  }

  const updateDecorations = (elapsed: number) => {
    for (const bc of bannerCloths) {
      bc.mesh.rotation.x = Math.sin(elapsed * 2.4 + bc.phase) * 0.09;
    }
    for (const bf of brazierFlames) {
      const flick = 0.88 + Math.sin(elapsed * 11 + bf.phase) * 0.16;
      bf.outer.scale.set(0.95 + Math.cos(elapsed * 9 + bf.phase) * 0.08, flick, 0.95);
      bf.inner.scale.set(1, 0.92 + Math.sin(elapsed * 14 + bf.phase) * 0.18, 1);
    }
    for (const sl of skyLanterns) {
      sl.mesh.position.y = sl.baseY + Math.sin(elapsed * 1.15 + sl.phase) * 0.32;
      sl.mesh.rotation.y = elapsed * 0.4 + sl.phase;
    }
  };

  // Override atmosphere updater cleanly by hooking decoration animation into returned updateAtmosphere
  const updateEnvironmentAtmosphere = (dt: number, elapsed: number) => {
    updateAtmosphere(dt, elapsed);
    updateDecorations(elapsed);
  };

  const applyTimeOfDay = (isDay: boolean) => {
    setDaytime(isDay);
    houseWindowMat.emissiveIntensity = isDay ? 0.38 : 1.55;
    lanternGlowMat.emissiveIntensity = isDay ? 0.65 : 1.75;
    skyLanternMat.emissiveIntensity = isDay ? 0.7 : 1.85;
  };

  return {
    group,
    runeCircle,
    floatingCrystals,
    moon,
    moonHalo,
    sun,
    sunHalo,
    setDaytime: applyTimeOfDay,
    updateSpectators,
    updateDrummers,
    updateAtmosphere: updateEnvironmentAtmosphere,
    disposables: { textures, geometries, materials },
  };
}
