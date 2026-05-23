// Generador de texturas procedurales usando HTML5 Canvas
const Textures = {
  createGrid: (color1, color2, size = 256) => {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color1; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = color2; ctx.lineWidth = 4;
    for(let i=0; i<=size; i+=32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    return canvas.toDataURL();
  },
  createCyber: (size = 256) => {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f0c1b'; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2;
    for(let i = 0; i < 5; i++) {
      ctx.strokeRect(i*25, i*25, size - i*50, size - i*50);
    }
    return canvas.toDataURL();
  },
  createEnemyPattern: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0055'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#330011';
    for(let i=0; i<128; i+=16) { ctx.fillRect(i, 0, 8, 128); }
    return canvas.toDataURL();
  }
};
