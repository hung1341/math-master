import * as THREE from 'three';

export function createArenaFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Stone radial base
  const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.52);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.55, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle stone grain speckles
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Concentric stone rings
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 3;
  [120, 230, 340, 440, 485].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Radial tile seams
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
    ctx.lineTo(cx + Math.cos(angle) * 490, cy + Math.sin(angle) * 490);
    ctx.stroke();
  }

  // Gold accent inner boundary
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 230, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function createTerrainTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e3a2f';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1 + Math.random() * 4;
    ctx.fillStyle =
      Math.random() > 0.5 ? 'rgba(52, 211, 153, 0.06)' : 'rgba(6, 24, 18, 0.14)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function createRuneCircleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 224, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 184, 0, Math.PI * 2);
  ctx.stroke();

  // Geometric inscribed hexagram
  for (let offset = 0; offset < 2; offset++) {
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
      const angle = ((i * 2 + offset) / 6) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * 180;
      const y = cy + Math.sin(angle) * 180;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Mathematical symbols around ring (Elementary friendly)
  const symbols = ['+', '−', '×', '÷', '=', '?', '1', '2'];
  ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  symbols.forEach((sym, i) => {
    const angle = (i / symbols.length) * Math.PI * 2;
    const x = cx + Math.cos(angle) * 204;
    const y = cy + Math.sin(angle) * 204;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(sym, 0, 0);
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    4,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.65)');
  grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.28)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
