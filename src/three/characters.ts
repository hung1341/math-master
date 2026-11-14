import * as THREE from 'three';
import type { Difficulty } from '../types/game';

export interface HeroRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  staffOrb: THREE.Mesh;
  orbLight: THREE.PointLight;
}

export interface GuardianRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  core: THREE.Mesh;
  runeRing: THREE.Mesh;
  auraLight: THREE.PointLight;
  baseScale: number;
}

function setShadowFlags(obj: THREE.Object3D, cast = true, receive = true): void {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

export function createHeroCharacter(shadowTex: THREE.Texture): HeroRig {
  const root = new THREE.Group();
  root.name = 'MathHero';

  // Contact shadow grounding
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.03;
  root.add(shadowPlane);

  const body = new THREE.Group();
  root.add(body);

  // Materials with clear roughness/metalness contrast
  const tunicMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.65,
    metalness: 0.1,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.85,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.22,
    metalness: 0.9,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.8,
    metalness: 0.05,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.65,
    metalness: 0.0,
  });
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.82,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
  });

  // Legs (pivot at hip y = 0.78)
  const makeLeg = (xOffset: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0.78, 0);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 0.44, 12),
      tunicMat
    );
    thigh.position.y = -0.22;
    legGroup.add(thigh);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.34, 0.34),
      leatherMat
    );
    boot.position.set(0, -0.61, 0.05);
    legGroup.add(boot);

    return legGroup;
  };

  const leftLeg = makeLeg(-0.2);
  const rightLeg = makeLeg(0.2);
  body.add(leftLeg, rightLeg);

  // Torso (primary silhouette)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.3, 0.84, 14),
    tunicMat
  );
  torso.position.y = 1.22;
  body.add(torso);

  // Chest plate & belt (secondary metallic read)
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.38, 0.42),
    armorMat
  );
  chestPlate.position.set(0, 1.35, 0.04);
  body.add(chestPlate);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.1, 14),
    leatherMat
  );
  belt.position.y = 0.88;
  body.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.12, 0.08),
    goldMat
  );
  buckle.position.set(0, 0.88, 0.31);
  body.add(buckle);

  // Flowing Cape
  const capeGeo = new THREE.PlaneGeometry(0.72, 1.05, 4, 4);
  capeGeo.translate(0, -0.52, 0);
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.58, -0.24);
  cape.rotation.x = 0.14;
  body.add(cape);

  // Shoulders + Arms
  const makeArm = (xOffset: number, withStaff: boolean) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 1.54, 0);

    const pauldron = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 12),
      armorMat
    );
    armGroup.add(pauldron);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.09, 0.56, 12),
      tunicMat
    );
    sleeve.position.y = -0.28;
    armGroup.add(sleeve);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 10),
      skinMat
    );
    hand.position.y = -0.6;
    armGroup.add(hand);

    if (withStaff) {
      const staffGroup = new THREE.Group();
      staffGroup.position.set(0, -0.58, 0.12);
      staffGroup.rotation.x = Math.PI / 2.6;

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.038, 1.85, 10),
        leatherMat
      );
      shaft.position.y = 0.35;
      staffGroup.add(shaft);

      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.028, 10, 20),
        goldMat
      );
      collar.position.y = 1.28;
      staffGroup.add(collar);

      const staffOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        crystalMat
      );
      staffOrb.position.y = 1.5;
      staffGroup.add(staffOrb);

      const orbLight = new THREE.PointLight(0x38bdf8, 1.6, 5.5, 2);
      orbLight.position.y = 1.5;
      staffGroup.add(orbLight);

      armGroup.add(staffGroup);
      return { armGroup, staffOrb, orbLight };
    }

    return { armGroup, staffOrb: null, orbLight: null };
  };

  const leftArmRig = makeArm(-0.46, false);
  const rightArmRig = makeArm(0.46, true);
  body.add(leftArmRig.armGroup, rightArmRig.armGroup);

  // Head + Scholar Wizard Hat
  const head = new THREE.Group();
  head.position.set(0, 1.86, 0);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 18, 16),
    skinMat
  );
  head.add(cranium);

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.1,
  });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), eyeMat);
  leftEye.position.set(-0.1, 0.03, 0.26);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), eyeMat);
  rightEye.position.set(0.1, 0.03, 0.26);
  head.add(leftEye, rightEye);

  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20),
    tunicMat
  );
  hatBrim.position.y = 0.22;
  head.add(hatBrim);

  const hatBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.31, 0.08, 20),
    goldMat
  );
  hatBand.position.y = 0.28;
  head.add(hatBand);

  const hatCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.62, 18),
    tunicMat
  );
  hatCone.position.set(0, 0.58, -0.03);
  hatCone.rotation.x = -0.1;
  head.add(hatCone);

  body.add(head);

  setShadowFlags(root, true, true);
  shadowPlane.castShadow = false;
  shadowPlane.receiveShadow = false;

  return {
    root,
    body,
    head,
    leftArm: leftArmRig.armGroup,
    rightArm: rightArmRig.armGroup,
    leftLeg,
    rightLeg,
    cape,
    staffOrb: rightArmRig.staffOrb!,
    orbLight: rightArmRig.orbLight!,
  };
}

interface GuardianPalette {
  armor: number;
  accent: number;
  core: number;
  scale: number;
  spikes: number;
}

const GUARDIAN_PALETTES: Record<Difficulty, GuardianPalette> = {
  'Dễ': {
    armor: 0x475569,
    accent: 0x10b981,
    core: 0x34d399,
    scale: 0.92,
    spikes: 0,
  },
  'Bình thường': {
    armor: 0x334155,
    accent: 0x3b82f6,
    core: 0x60a5fa,
    scale: 1.04,
    spikes: 1,
  },
  'Khó': {
    armor: 0x27272a,
    accent: 0xf97316,
    core: 0xfbbf24,
    scale: 1.16,
    spikes: 2,
  },
  'Rất khó': {
    armor: 0x1e1b4b,
    accent: 0xc026d3,
    core: 0xf43f5e,
    scale: 1.28,
    spikes: 3,
  },
};

export function createGuardianCharacter(
  difficulty: Difficulty,
  shadowTex: THREE.Texture
): GuardianRig {
  const palette = GUARDIAN_PALETTES[difficulty];
  const root = new THREE.Group();
  root.name = `Guardian_${difficulty}`;

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8 * palette.scale, 2.8 * palette.scale),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.8,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.03;
  root.add(shadowPlane);

  const body = new THREE.Group();
  body.scale.setScalar(palette.scale);
  root.add(body);

  const armorMat = new THREE.MeshStandardMaterial({
    color: palette.armor,
    roughness: 0.42,
    metalness: 0.72,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: palette.accent,
    roughness: 0.25,
    metalness: 0.85,
  });
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: palette.core,
    emissive: palette.core,
    emissiveIntensity: 1.15,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 1,
  });

  // Pedestal legs
  [-0.32, 0.32].forEach((x) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.82, 10),
      armorMat
    );
    leg.position.set(x, 0.41, 0);
    body.add(leg);
  });

  // Armored Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.38, 1.05, 8),
    armorMat
  );
  torso.position.y = 1.32;
  body.add(torso);

  // Glowing Core Crystal in chest
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    coreMat
  );
  core.position.set(0, 1.38, 0.46);
  body.add(core);

  const auraLight = new THREE.PointLight(palette.core, 1.8, 7, 2);
  auraLight.position.set(0, 1.45, 0.65);
  body.add(auraLight);

  // Orbiting rune ring around guardian
  const runeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.035, 10, 32),
    trimMat
  );
  runeRing.position.y = 1.38;
  runeRing.rotation.x = Math.PI / 2.2;
  body.add(runeRing);

  // Arms + Pauldrons
  const makeArm = (xOffset: number) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 1.72, 0);

    const pauldron = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.32, 0.42),
      trimMat
    );
    armGroup.add(pauldron);

    if (palette.spikes >= 2) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.32, 6),
        coreMat
      );
      spike.position.set(xOffset > 0 ? 0.12 : -0.12, 0.28, 0);
      spike.rotation.z = xOffset > 0 ? -0.35 : 0.35;
      armGroup.add(spike);
    }

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.72, 8),
      armorMat
    );
    forearm.position.y = -0.46;
    armGroup.add(forearm);

    return armGroup;
  };

  const leftArm = makeArm(-0.74);
  const rightArm = makeArm(0.74);
  body.add(leftArm, rightArm);

  // Head / Helmet
  const head = new THREE.Group();
  head.position.set(0, 2.1, 0);

  const helm = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.48, 0.5),
    armorMat
  );
  head.add(helm);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.1, 0.06),
    coreMat
  );
  visor.position.set(0, 0.03, 0.25);
  head.add(visor);

  // Crown / Horns scaling with difficulty
  if (palette.spikes >= 1) {
    [-0.22, 0.22].forEach((x) => {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.3 + palette.spikes * 0.08, 8),
        trimMat
      );
      horn.position.set(x, 0.34, 0);
      horn.rotation.z = x < 0 ? 0.28 : -0.28;
      head.add(horn);
    });
  }

  if (palette.spikes >= 3) {
    const crown = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.035, 8, 24),
      coreMat
    );
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 0.42;
    head.add(crown);
  }

  body.add(head);

  setShadowFlags(root, true, true);
  shadowPlane.castShadow = false;
  shadowPlane.receiveShadow = false;

  return {
    root,
    body,
    head,
    leftArm,
    rightArm,
    core,
    runeRing,
    auraLight,
    baseScale: palette.scale,
  };
}
