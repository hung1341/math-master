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
  disposables: {
    textures: THREE.Texture[];
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
  };
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

  // 1. Extended natural outdoor terrain with gentle perimeter hills (no box void)
  const terrainGeo = new THREE.PlaneGeometry(180, 180, 44, 44);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const dist = Math.hypot(x, z);
    if (dist > 13.5) {
      const falloff = Math.min(1, (dist - 13.5) / 28);
      const hill =
        (Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3.2 +
          Math.sin(x * 0.16 + 1.4) * 1.4) *
        falloff;
      posAttr.setY(i, hill - 0.18);
    } else {
      posAttr.setY(i, -0.18);
    }
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

  // 5. InstancedMesh Pine Grove around outer hills (44 trees)
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
    const angle = (i / treeCount) * Math.PI * 2 + (i % 3) * 0.11;
    const dist = 16 + (i % 5) * 4.5;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const scale = 0.85 + ((i * 37) % 30) / 100;

    dummy.position.set(x, -0.2, z);
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
    const angle = (i / rockCount) * Math.PI * 2 + 0.25;
    const dist = 13.2 + (i % 4) * 3.8;
    const scale = 0.65 + ((i * 23) % 45) / 100;
    dummy.position.set(Math.cos(angle) * dist, 0.15, Math.sin(angle) * dist);
    dummy.rotation.set(i * 0.4, i * 1.1, i * 0.2);
    dummy.scale.set(scale * 1.2, scale * 0.75, scale);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.computeBoundingSphere();
  group.add(rocks);

  return {
    group,
    runeCircle,
    floatingCrystals,
    disposables: { textures, geometries, materials },
  };
}
