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
  swordAura: THREE.Mesh;
  swordRings: THREE.Mesh[];
  haloCrest: THREE.Mesh;
  auraGroup: THREE.Group;
  rainbowArc: THREE.Group;
  auraShell: THREE.Mesh;
  auraRings: THREE.Mesh[];
  auraOrbs: THREE.Mesh[];
  auraLight: THREE.PointLight;
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

export interface RefereeRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  heroFlag: THREE.Mesh;
  bossFlag: THREE.Mesh;
  whistle: THREE.Mesh;
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
  root.scale.setScalar(1.24);

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

  // Materials with crisp heroic silver/gold/sapphire contrast
  const tunicMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.58,
    metalness: 0.16,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    emissive: 0x334155,
    emissiveIntensity: 0.18,
    roughness: 0.18,
    metalness: 0.9,
  });
  const silverGlowMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xe2e8f0,
    emissiveIntensity: 1.15,
    roughness: 0.12,
    metalness: 0.92,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xb45309,
    emissiveIntensity: 0.22,
    roughness: 0.2,
    metalness: 0.92,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.72,
    metalness: 0.12,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.6,
    metalness: 0.0,
  });
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.24,
    roughness: 0.72,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.25,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
  });

  // Legs (pivot at hip y = 0.78) with armored greaves & golden knee guards
  const makeLeg = (xOffset: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0.78, 0);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.125, 0.42, 12),
      tunicMat
    );
    thigh.position.y = -0.21;
    legGroup.add(thigh);

    const kneeGuard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.11, 0),
      goldMat
    );
    kneeGuard.position.set(0, -0.39, 0.09);
    kneeGuard.scale.set(1, 0.9, 0.6);
    legGroup.add(kneeGuard);

    const greave = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.11, 0.3, 12),
      armorMat
    );
    greave.position.y = -0.52;
    legGroup.add(greave);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.24, 0.36),
      leatherMat
    );
    boot.position.set(0, -0.66, 0.06);
    legGroup.add(boot);

    const bootTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.06, 0.2),
      goldMat
    );
    bootTrim.position.set(0, -0.63, 0.16);
    legGroup.add(bootTrim);

    return legGroup;
  };

  const leftLeg = makeLeg(-0.2);
  const rightLeg = makeLeg(0.2);
  body.add(leftLeg, rightLeg);

  // Torso (heroic armored silhouette)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.31, 0.86, 14),
    tunicMat
  );
  torso.position.y = 1.22;
  body.add(torso);

  // Sculpted silver-titanium chest plate + gold collar + glowing chest core crystal
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.46, 0.46),
    armorMat
  );
  chestPlate.position.set(0, 1.35, 0.04);
  body.add(chestPlate);

  const collarRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.31, 0.045, 8, 22),
    goldMat
  );
  collarRim.position.set(0, 1.6, 0.02);
  collarRim.rotation.x = Math.PI / 2;
  body.add(collarRim);

  const chestCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.115, 0),
    crystalMat
  );
  chestCore.position.set(0, 1.38, 0.29);
  chestCore.scale.set(1, 1.25, 0.55);
  body.add(chestCore);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.34, 0.12, 14),
    leatherMat
  );
  belt.position.y = 0.88;
  body.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.14, 0.1),
    goldMat
  );
  buckle.position.set(0, 0.88, 0.31);
  body.add(buckle);

  // Regal two-layer flowing Cape with golden shoulder clasps
  const capeGeo = new THREE.PlaneGeometry(0.88, 1.18, 4, 4);
  capeGeo.translate(0, -0.58, 0);
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.6, -0.25);
  cape.rotation.x = 0.14;
  body.add(cape);

  const capeTrimGeo = new THREE.BoxGeometry(0.9, 0.08, 0.04);
  const capeTrim = new THREE.Mesh(capeTrimGeo, goldMat);
  capeTrim.position.set(0, -1.14, 0.01);
  cape.add(capeTrim);

  // Floating Celestial Halo Crest behind upper back
  const haloCrest = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.026, 8, 28),
    silverGlowMat
  );
  haloCrest.position.set(0, 1.82, -0.34);
  body.add(haloCrest);

  // Layered Pauldrons + Gauntlets + Weapons (Silver-Aura Sword & Arcane Buckler)
  const makeArm = (xOffset: number, withSword: boolean) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 1.56, 0);

    const pauldron = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 12),
      armorMat
    );
    pauldron.scale.set(1.12, 0.9, 1.05);
    armGroup.add(pauldron);

    const pauldronFin = new THREE.Mesh(
      new THREE.ConeGeometry(0.085, 0.24, 6),
      goldMat
    );
    pauldronFin.position.set(Math.sign(xOffset) * 0.11, 0.18, 0);
    pauldronFin.rotation.z = -Math.sign(xOffset) * 0.45;
    armGroup.add(pauldronFin);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.095, 0.32, 12),
      tunicMat
    );
    sleeve.position.y = -0.18;
    armGroup.add(sleeve);

    const gauntlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.09, 0.28, 12),
      armorMat
    );
    gauntlet.position.y = -0.44;
    armGroup.add(gauntlet);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 12, 10),
      silverGlowMat
    );
    hand.position.y = -0.61;
    armGroup.add(hand);

    if (withSword) {
      const daoGroup = new THREE.Group();
      daoGroup.position.set(0, -0.58, 0.12);
      daoGroup.rotation.x = Math.PI / 2.55;

      // Dark crimson leather-wrapped hilt
      const hiltMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        roughness: 0.72,
        metalness: 0.1,
      });
      const hilt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.05, 0.46, 10),
        hiltMat
      );
      hilt.position.y = -0.16;
      daoGroup.add(hilt);

      // Golden pommel & classic Dao ring
      const pommel = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 10),
        goldMat
      );
      pommel.position.y = -0.41;
      daoGroup.add(pommel);

      const pommelRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.02, 8, 18),
        goldMat
      );
      pommelRing.position.y = -0.51;
      pommelRing.rotation.y = Math.PI / 2;
      daoGroup.add(pommelRing);

      // Ornate winged golden handguard (Hộ thủ)
      const guard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.14, 0.065, 16),
        goldMat
      );
      guard.position.y = 0.07;
      guard.scale.set(0.8, 1, 1.45);
      daoGroup.add(guard);

      // Gleaming Silver Broadsword Blade (Thanh Đao ánh bạc)
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.048, 0.09);
      bladeShape.quadraticCurveTo(-0.02, 0.9, -0.15, 1.62);
      bladeShape.lineTo(-0.06, 1.82);
      bladeShape.lineTo(0.11, 1.71);
      bladeShape.quadraticCurveTo(0.28, 1.3, 0.155, 0.68);
      bladeShape.quadraticCurveTo(0.095, 0.34, 0.065, 0.09);
      bladeShape.closePath();

      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.044,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012,
        bevelSegments: 2,
      });
      bladeGeo.translate(0, 0, -0.022);

      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0xcbd5e1,
        emissiveIntensity: 0.45,
        roughness: 0.1,
        metalness: 0.96,
      });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.rotation.y = Math.PI / 2;
      daoGroup.add(bladeMesh);

      // Spine ridge along the back of the blade
      const spineShape = new THREE.Shape();
      spineShape.moveTo(-0.058, 0.1);
      spineShape.quadraticCurveTo(-0.03, 0.9, -0.16, 1.61);
      spineShape.lineTo(-0.12, 1.63);
      spineShape.quadraticCurveTo(0.01, 0.9, -0.015, 0.1);
      spineShape.closePath();

      const spineGeo = new THREE.ExtrudeGeometry(spineShape, {
        depth: 0.058,
        bevelEnabled: false,
      });
      spineGeo.translate(0, 0, -0.029);
      const spineMesh = new THREE.Mesh(spineGeo, goldMat);
      spineMesh.rotation.y = Math.PI / 2;
      daoGroup.add(spineMesh);

      // Radiant Silver Aura Sheath hugging the entire sword blade (Vầng sáng bạc)
      const auraBladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.048,
        bevelSize: 0.052,
        bevelSegments: 2,
      });
      auraBladeGeo.translate(0, 0, -0.06);
      const swordAuraMat = new THREE.MeshBasicMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0.44,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const swordAura = new THREE.Mesh(auraBladeGeo, swordAuraMat);
      swordAura.rotation.y = Math.PI / 2;
      swordAura.scale.set(1.18, 1.04, 1.45);
      daoGroup.add(swordAura);

      // Silver orbiting energy halo rings along the sword
      const swordRingMat = new THREE.MeshBasicMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const swordRingLow = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.018, 8, 24),
        swordRingMat
      );
      swordRingLow.position.set(0, 0.55, 0.02);
      swordRingLow.rotation.x = Math.PI / 2.2;
      const swordRingHigh = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.015, 8, 24),
        swordRingMat
      );
      swordRingHigh.position.set(0, 1.18, 0.06);
      swordRingHigh.rotation.x = -Math.PI / 2.4;
      daoGroup.add(swordRingLow, swordRingHigh);

      // Glowing spirit core gem set right above the handguard
      const staffOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.115, 0),
        crystalMat
      );
      staffOrb.position.set(0, 0.2, 0);
      daoGroup.add(staffOrb);

      // Cool bright silver-white PointLight illuminating the blade & aura
      const orbLight = new THREE.PointLight(0xe2e8f0, 2.2, 6.2, 2);
      orbLight.position.set(0, 1.0, 0.12);
      daoGroup.add(orbLight);

      armGroup.add(daoGroup);
      return {
        armGroup,
        staffOrb,
        orbLight,
        swordAura,
        swordRings: [swordRingLow, swordRingHigh],
      };
    }

    // Left Forearm Arcane Silver-Cyan Energy Buckler
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.14, -0.42, 0.08);
    shieldGroup.rotation.y = -Math.PI / 2.4;

    const shieldRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.045, 6),
      goldMat
    );
    shieldRim.rotation.x = Math.PI / 2;
    const shieldPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.055, 6),
      crystalMat
    );
    shieldPlate.rotation.x = Math.PI / 2;
    const shieldBoss = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1, 0),
      silverGlowMat
    );
    shieldBoss.position.z = 0.04;
    shieldGroup.add(shieldRim, shieldPlate, shieldBoss);
    armGroup.add(shieldGroup);

    return {
      armGroup,
      staffOrb: null,
      orbLight: null,
      swordAura: null,
      swordRings: [],
    };
  };

  const leftArmRig = makeArm(-0.49, false);
  const rightArmRig = makeArm(0.49, true);
  body.add(leftArmRig.armGroup, rightArmRig.armGroup);

  // Head + Epic Crowned Knight-Arcane Helm & Sweeping Crest Plume
  const head = new THREE.Group();
  head.position.set(0, 1.9, 0);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 18, 16),
    skinMat
  );
  head.add(cranium);

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.6,
    roughness: 0.15,
  });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), eyeMat);
  leftEye.position.set(-0.1, 0.02, 0.265);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), eyeMat);
  rightEye.position.set(0.1, 0.02, 0.265);
  head.add(leftEye, rightEye);

  // Sleek Armored Helm Dome & Cheek Guards
  const helmDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.325, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    armorMat
  );
  helmDome.position.y = 0.02;
  head.add(helmDome);

  const cheekGuardGeo = new THREE.BoxGeometry(0.08, 0.26, 0.22);
  const leftCheek = new THREE.Mesh(cheekGuardGeo, armorMat);
  leftCheek.position.set(-0.27, -0.05, 0.04);
  const rightCheek = new THREE.Mesh(cheekGuardGeo, armorMat);
  rightCheek.position.set(0.27, -0.05, 0.04);
  head.add(leftCheek, rightCheek);

  // Golden Royal Diadem Crown + Winged Ear Crests + Forehead Gem
  const crownBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.315, 0.04, 8, 22),
    goldMat
  );
  crownBand.position.y = 0.16;
  crownBand.rotation.x = Math.PI / 2;
  head.add(crownBand);

  const crownGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.075, 0),
    crystalMat
  );
  crownGem.position.set(0, 0.18, 0.33);
  head.add(crownGem);

  const wingGeo = new THREE.ConeGeometry(0.08, 0.34, 6);
  const leftWing = new THREE.Mesh(wingGeo, silverGlowMat);
  leftWing.position.set(-0.32, 0.28, -0.04);
  leftWing.rotation.z = 0.55;
  leftWing.rotation.x = -0.35;
  const rightWing = new THREE.Mesh(wingGeo, silverGlowMat);
  rightWing.position.set(0.32, 0.28, -0.04);
  rightWing.rotation.z = -0.55;
  rightWing.rotation.x = -0.35;
  head.add(leftWing, rightWing);

  // Sweeping Azure-Gold Helm Plume
  const plumeBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.14, 0.24),
    goldMat
  );
  plumeBase.position.set(0, 0.36, -0.02);
  const plumeCrest = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.52, 8),
    capeMat
  );
  plumeCrest.position.set(0, 0.45, -0.22);
  plumeCrest.rotation.x = -1.15;
  head.add(plumeBase, plumeCrest);

  body.add(head);

  // Full-body luminous aura around the Hero (attached to body so it moves with jumps/flight)
  const auraGroup = new THREE.Group();
  auraGroup.name = 'HeroAura';

  const auraShellMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const auraShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 22, 18),
    auraShellMat
  );
  auraShell.position.set(0, 1.18, 0);
  auraShell.scale.set(0.76, 1.32, 0.76);
  auraGroup.add(auraShell);

  const auraRingMat1 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const baseAuraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.028, 10, 40),
    auraRingMat1
  );
  baseAuraRing.position.y = 0.08;
  baseAuraRing.rotation.x = Math.PI / 2;
  auraGroup.add(baseAuraRing);

  const auraRingMat2 = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const orbitAuraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.022, 10, 40),
    auraRingMat2
  );
  orbitAuraRing.position.y = 1.18;
  orbitAuraRing.rotation.x = Math.PI / 2.6;
  orbitAuraRing.rotation.y = 0.32;
  auraGroup.add(orbitAuraRing);

  const wispMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.1,
  });
  const auraOrbs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const wisp = new THREE.Mesh(new THREE.OctahedronGeometry(0.068, 0), wispMat);
    const angle = (i * Math.PI) / 2;
    wisp.position.set(Math.cos(angle) * 0.85, 0.9 + (i % 2) * 0.55, Math.sin(angle) * 0.85);
    wisp.userData.phase = angle;
    auraGroup.add(wisp);
    auraOrbs.push(wisp);
  }

  // 7-Color Luminous Rainbow Arc (Vòng cung màu sắc cầu vồng) arching around the Hero
  const rainbowArc = new THREE.Group();
  rainbowArc.name = 'HeroRainbowArc';
  rainbowArc.position.set(0, 1.15, -0.14);
  rainbowArc.rotation.y = 0.12;
  rainbowArc.rotation.x = -0.14;

  const rainbowColors = [
    0xef4444, // Đỏ
    0xf97316, // Cam
    0xfacc15, // Vàng
    0x22c55e, // Lục
    0x06b6d4, // Lam
    0x3b82f6, // Chàm
    0xa855f7, // Tím
  ];
  const arcSpan = Math.PI * 1.38;
  const arcStart = (Math.PI - arcSpan) / 2;

  rainbowColors.forEach((hex, idx) => {
    const bandRadius = 1.32 - idx * 0.042;
    const bandMat = new THREE.MeshBasicMaterial({
      color: hex,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const bandMesh = new THREE.Mesh(
      new THREE.TorusGeometry(bandRadius, 0.022, 10, 48, arcSpan),
      bandMat
    );
    bandMesh.rotation.z = arcStart;
    rainbowArc.add(bandMesh);
  });

  // Secondary diagonal rainbow ribbon curving around the waist/chest
  const innerRainbow = new THREE.Group();
  innerRainbow.position.set(0, -0.05, 0.14);
  innerRainbow.rotation.x = Math.PI / 2.6;
  innerRainbow.rotation.y = -0.35;
  const innerSpan = Math.PI * 1.45;
  const innerStart = (Math.PI - innerSpan) / 2;
  rainbowColors.forEach((hex, idx) => {
    const r = 1.06 - idx * 0.028;
    const mat = new THREE.MeshBasicMaterial({
      color: hex,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.014, 8, 42, innerSpan),
      mat
    );
    ribbon.rotation.z = innerStart;
    innerRainbow.add(ribbon);
  });
  rainbowArc.add(innerRainbow);
  auraGroup.add(rainbowArc);

  const auraLight = new THREE.PointLight(0x38bdf8, 2.3, 6.8, 2);
  auraLight.position.set(0, 1.25, 0.12);
  auraGroup.add(auraLight);

  body.add(auraGroup);

  setShadowFlags(root, true, true);
  shadowPlane.castShadow = false;
  shadowPlane.receiveShadow = false;
  setShadowFlags(auraGroup, false, false);

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
    swordAura: rightArmRig.swordAura!,
    swordRings: rightArmRig.swordRings,
    haloCrest,
    auraGroup,
    rainbowArc,
    auraShell,
    auraRings: [baseAuraRing, orbitAuraRing],
    auraOrbs,
    auraLight,
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
  'Không thể': {
    armor: 0x09090b,
    accent: 0xdc2626,
    core: 0xff2a55,
    scale: 1.42,
    spikes: 4,
  },
  'Không thể vượt qua': {
    armor: 0x030308,
    accent: 0x9333ea,
    core: 0xe879f9,
    scale: 1.56,
    spikes: 5,
  },
  'Thảm họa': {
    armor: 0x050202,
    accent: 0xff4500,
    core: 0xffb703,
    scale: 1.66,
    spikes: 6,
  },
  'Ác mộng': {
    armor: 0x0d061c,
    accent: 0x7c3aed,
    core: 0xe879f9,
    scale: 1.71,
    spikes: 7,
  },
  'Địa ngục': {
    armor: 0x1a0404,
    accent: 0xdc2626,
    core: 0xff5400,
    scale: 1.76,
    spikes: 8,
  },
  'Bất khả thi': {
    armor: 0x030816,
    accent: 0x0284c7,
    core: 0x38bdf8,
    scale: 1.81,
    spikes: 9,
  },
  'Thần thánh': {
    armor: 0xf1f5f9,
    accent: 0xf59e0b,
    core: 0xfef08a,
    scale: 1.86,
    spikes: 10,
  },
  'Vượt giới hạn': {
    armor: 0x0a192f,
    accent: 0x10b981,
    core: 0x2dd4bf,
    scale: 1.91,
    spikes: 11,
  },
  'Vô tận': {
    armor: 0x03010a,
    accent: 0xec4899,
    core: 0xfef08a,
    scale: 1.96,
    spikes: 12,
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

  // Arms + Pauldrons + Boss Weapon (leftArm, camera-facing) & Runic Shield (rightArm)
  const makeArm = (xOffset: number, side: 'weapon' | 'shield') => {
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

    if (side === 'weapon') {
      const swordGroup = new THREE.Group();
      swordGroup.position.set(-0.04, -0.74, 0.16);
      swordGroup.rotation.x = Math.PI / 2.45;

      const tierScale = 1 + Math.min(palette.spikes, 12) * 0.032;
      const bladeLength = 1.65 * tierScale;
      const bladeHalfWidth = 0.11 + Math.min(palette.spikes, 12) * 0.004;

      // Dedicated intense glowing energy blade material
      const glowBladeMat = new THREE.MeshStandardMaterial({
        color: palette.core,
        emissive: palette.core,
        emissiveIntensity: 1.9 + Math.min(palette.spikes, 12) * 0.08,
        roughness: 0.1,
        metalness: 0.2,
      });

      // Outer translucent aura sheath for unmistakable glow
      const auraMat = new THREE.MeshBasicMaterial({
        color: palette.core,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Armored hilt grip
      const hilt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.05, 0.44, 10),
        armorMat
      );
      hilt.position.y = -0.16;
      swordGroup.add(hilt);

      // Glowing pommel crystal
      const pommel = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.085, 0),
        glowBladeMat
      );
      pommel.position.y = -0.42;
      swordGroup.add(pommel);

      // Metallic winged crossguard (Chắn kiếm)
      const guardBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.09, 0.56 * tierScale),
        trimMat
      );
      guardBar.position.y = 0.09;
      swordGroup.add(guardBar);

      [-1, 1].forEach((dir) => {
        const wing = new THREE.Mesh(
          new THREE.ConeGeometry(0.065, 0.24 * tierScale, 6),
          trimMat
        );
        wing.position.set(0, 0.14, dir * 0.28 * tierScale);
        wing.rotation.x = dir * (Math.PI / 3);
        swordGroup.add(wing);
      });

      // Central glowing core gem above the guard
      const guardGem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.105, 0),
        glowBladeMat
      );
      guardGem.position.y = 0.13;
      swordGroup.add(guardGem);

      // Double-edged glowing sword blade using beveled ExtrudeGeometry
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-bladeHalfWidth, 0.13);
      bladeShape.lineTo(-bladeHalfWidth * 0.88, 0.13 + bladeLength * 0.78);
      bladeShape.lineTo(0, 0.13 + bladeLength);
      bladeShape.lineTo(bladeHalfWidth * 0.88, 0.13 + bladeLength * 0.78);
      bladeShape.lineTo(bladeHalfWidth, 0.13);
      bladeShape.closePath();

      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.042,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012,
        bevelSegments: 2,
      });
      bladeGeo.translate(0, 0, -0.021);

      const bladeMesh = new THREE.Mesh(bladeGeo, glowBladeMat);
      bladeMesh.rotation.y = Math.PI / 2;
      swordGroup.add(bladeMesh);

      // Translucent outer energy aura sheath matching the blade silhouette
      const auraGeo = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.085,
        bevelEnabled: true,
        bevelThickness: 0.024,
        bevelSize: 0.026,
        bevelSegments: 1,
      });
      auraGeo.translate(0, 0, -0.0425);
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.rotation.y = Math.PI / 2;
      swordGroup.add(auraMesh);

      // Central metallic fuller ridge so the sword retains crisp structural contrast
      const fuller = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, bladeLength * 0.72, 0.045),
        trimMat
      );
      fuller.position.y = 0.13 + bladeLength * 0.38;
      swordGroup.add(fuller);

      // High-tier Boss sword runic flares & floating energy ring
      if (palette.spikes >= 4) {
        const runeGuardRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.18 * tierScale, 0.022, 8, 22),
          glowBladeMat
        );
        runeGuardRing.position.y = 0.18;
        runeGuardRing.rotation.x = Math.PI / 2;
        swordGroup.add(runeGuardRing);
      }

      if (palette.spikes >= 8) {
        [-1, 1].forEach((dir) => {
          const fang = new THREE.Mesh(
            new THREE.ConeGeometry(0.048, 0.34, 4),
            glowBladeMat
          );
          fang.position.set(0, 0.45, dir * (bladeHalfWidth + 0.09));
          fang.rotation.x = dir * 0.28;
          swordGroup.add(fang);
        });
      }

      // Dedicated PointLight so the glowing sword illuminates the Boss and arena
      const swordLight = new THREE.PointLight(
        palette.core,
        2.1 + Math.min(palette.spikes, 12) * 0.12,
        6.5,
        2
      );
      swordLight.position.set(0, 0.13 + bladeLength * 0.55, 0.12);
      swordGroup.add(swordLight);

      armGroup.add(swordGroup);
    } else {
      // Runic Armored Shield on rightArm
      const shieldGroup = new THREE.Group();
      shieldGroup.position.set(0.12, -0.45, 0.18);
      shieldGroup.rotation.y = Math.PI / 2.6;

      const shieldPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.36, 0.07, 6),
        armorMat
      );
      shieldPlate.rotation.x = Math.PI / 2;
      shieldGroup.add(shieldPlate);

      const shieldRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.39, 0.032, 8, 6),
        trimMat
      );
      shieldGroup.add(shieldRim);

      const shieldBoss = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        coreMat
      );
      shieldBoss.position.z = 0.05;
      shieldGroup.add(shieldBoss);

      armGroup.add(shieldGroup);
    }

    return armGroup;
  };

  const leftArm = makeArm(-0.74, 'weapon');
  const rightArm = makeArm(0.74, 'shield');
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

  if (palette.spikes >= 4) {
    const outerHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.04, 10, 36),
      coreMat
    );
    outerHalo.position.set(0, 1.45, -0.25);
    outerHalo.rotation.y = 0.2;
    body.add(outerHalo);

    [-0.52, 0.52].forEach((x) => {
      const wingSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.72, 6),
        coreMat
      );
      wingSpike.position.set(x, 1.72, -0.35);
      wingSpike.rotation.z = x < 0 ? 0.65 : -0.65;
      wingSpike.rotation.x = -0.35;
      body.add(wingSpike);
    });
  }

  if (palette.spikes >= 5) {
    const abyssRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.38, 0.045, 10, 40),
      trimMat
    );
    abyssRing.position.set(0, 1.48, -0.2);
    abyssRing.rotation.x = Math.PI / 5;
    abyssRing.rotation.y = -0.35;
    body.add(abyssRing);

    const centralHorn = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.52, 6),
      coreMat
    );
    centralHorn.position.set(0, 0.48, 0.08);
    centralHorn.rotation.x = 0.25;
    head.add(centralHorn);

    [-0.85, 0.85].forEach((x, idx) => {
      const shard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        coreMat
      );
      shard.position.set(x, 2.35 + (idx === 0 ? 0.1 : -0.05), -0.15);
      body.add(shard);
    });
  }

  if (palette.spikes >= 6) {
    const cataclysmRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.56, 0.05, 10, 44),
      coreMat
    );
    cataclysmRing.position.set(0, 1.52, -0.2);
    cataclysmRing.rotation.x = -Math.PI / 4.5;
    cataclysmRing.rotation.y = 0.42;
    body.add(cataclysmRing);

    [-1.08, 1.08].forEach((x) => {
      const pillar = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.95, 6),
        trimMat
      );
      pillar.position.set(x, 2.05, -0.35);
      pillar.rotation.z = x < 0 ? 0.35 : -0.35;
      body.add(pillar);
    });

    auraLight.intensity = 3.1;
    auraLight.distance = 10;
  }

  if (palette.spikes >= 8) {
    const abyssCrown = new THREE.Mesh(
      new THREE.TorusGeometry(1.74, 0.045, 10, 48),
      trimMat
    );
    abyssCrown.position.set(0, 1.56, -0.25);
    abyssCrown.rotation.z = Math.PI / 6;
    abyssCrown.rotation.y = -0.35;
    body.add(abyssCrown);
  }

  if (palette.spikes >= 10) {
    [-0.95, 0.95].forEach((x) => {
      const wingBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.25, 0.08),
        coreMat
      );
      wingBlade.position.set(x, 1.85, -0.45);
      wingBlade.rotation.z = x < 0 ? 0.55 : -0.55;
      body.add(wingBlade);
    });
  }

  if (palette.spikes >= 12) {
    const cosmicRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.94, 0.055, 12, 52),
      coreMat
    );
    cosmicRing.position.set(0, 1.55, -0.25);
    cosmicRing.rotation.x = Math.PI / 3;
    body.add(cosmicRing);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const orbiter = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        coreMat
      );
      orbiter.position.set(Math.cos(angle) * 1.45, 1.65 + Math.sin(angle) * 0.85, -0.15);
      body.add(orbiter);
    }
    auraLight.intensity = 3.8;
    auraLight.distance = 12;
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

export function createRefereeCharacter(shadowTex: THREE.Texture): RefereeRig {
  const root = new THREE.Group();
  root.name = 'ArenaReferee';

  // Contact shadow grounding
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 2.0),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.03;
  root.add(shadowPlane);

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.85,
  });

  const body = new THREE.Group();
  root.add(body);

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.72,
    metalness: 0.1,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.62,
    metalness: 0.05,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.65,
    metalness: 0.0,
  });

  // Articulated Legs & Boots (hip pivot at y = 0.68)
  const makeRefLeg = (xOffset: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0.68, 0);

    const trouser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.52, 10),
      darkMat
    );
    trouser.position.y = -0.26;
    legGroup.add(trouser);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.28),
      darkMat
    );
    boot.position.set(0, -0.58, 0.04);
    legGroup.add(boot);

    return legGroup;
  };

  const rightLeg = makeRefLeg(-0.17);
  const leftLeg = makeRefLeg(0.17);
  body.add(rightLeg, leftLeg);

  // Classic Black-and-White Striped Referee Jersey (5 stacked bands)
  for (let i = 0; i < 5; i++) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3 + i * 0.012, 0.285 + i * 0.012, 0.155, 14),
      i % 2 === 0 ? darkMat : whiteMat
    );
    band.position.y = 0.78 + i * 0.155;
    body.add(band);
  }

  // Collar & Golden Whistle on chest
  const lanyard = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.015, 6, 18),
    goldTrimMat
  );
  lanyard.position.set(0, 1.48, 0.12);
  lanyard.rotation.x = Math.PI / 3;
  body.add(lanyard);

  const whistle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.042, 0.12, 10),
    goldTrimMat
  );
  whistle.position.set(0, 1.32, 0.32);
  whistle.rotation.z = Math.PI / 2;
  body.add(whistle);

  // Helper for Referee Arms holding Signal Flags
  const makeRefArm = (xOffset: number, flagColorHex: number) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 1.44, 0);

    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      whiteMat
    );
    armGroup.add(shoulder);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.48, 10),
      darkMat
    );
    sleeve.position.y = -0.24;
    armGroup.add(sleeve);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 10, 8),
      skinMat
    );
    hand.position.y = -0.5;
    armGroup.add(hand);

    // Signal Flag Pole & Pennant
    const flagGroup = new THREE.Group();
    flagGroup.position.set(0, -0.5, 0.06);
    flagGroup.rotation.x = Math.PI / 2.2;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.022, 0.95, 8),
      whiteMat
    );
    pole.position.y = 0.36;
    flagGroup.add(pole);

    const flagMat = new THREE.MeshStandardMaterial({
      color: flagColorHex,
      emissive: flagColorHex,
      emissiveIntensity: 0.35,
      roughness: 0.45,
      side: THREE.DoubleSide,
    });
    const flagCloth = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.28, 3, 2),
      flagMat
    );
    flagCloth.position.set(xOffset < 0 ? -0.21 : 0.21, 0.68, 0);
    flagGroup.add(flagCloth);

    armGroup.add(flagGroup);
    return { armGroup, flagCloth };
  };

  // Right arm (-X = Hero side on screen) holds Green Hero Signal Flag
  const rightArmRig = makeRefArm(-0.44, 0x10b981);
  // Left arm (+X = Boss side on screen) holds Crimson Boss Signal Flag
  const leftArmRig = makeRefArm(0.44, 0xf43f5e);
  body.add(rightArmRig.armGroup, leftArmRig.armGroup);

  // Head + Referee Cap with Visor
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 14),
    skinMat
  );
  head.add(cranium);

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
  });
  [-0.085, 0.085].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), eyeMat);
    eye.position.set(x, 0.02, 0.23);
    head.add(eye);
  });

  const capDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.275, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    darkMat
  );
  capDome.position.y = 0.04;
  head.add(capDome);

  const capStripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.022, 8, 22),
    whiteMat
  );
  capStripe.rotation.x = Math.PI / 2;
  capStripe.position.y = 0.08;
  head.add(capStripe);

  const capVisor = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.035, 0.22),
    darkMat
  );
  capVisor.position.set(0, 0.08, 0.27);
  capVisor.rotation.x = 0.12;
  head.add(capVisor);

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
    heroFlag: rightArmRig.flagCloth,
    bossFlag: leftArmRig.flagCloth,
    whistle,
  };
}
