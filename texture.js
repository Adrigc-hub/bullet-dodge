const Textures = {
  createGrid: function (baseColor, gridColor) {
    let canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 512);
    return canvas.toDataURL();
  },
  createWaterPattern: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    let ctx = canvas.getContext('2d');
    let grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 130);
    grad.addColorStop(0, '#00d2ff'); grad.addColorStop(0.5, '#0066ff'); grad.addColorStop(1, '#0022aa');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    // Añadir líneas de distorsión líquida
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
      ctx.beginPath(); ctx.arc(128, 128, 30 + i*40, 0, Math.PI*2); ctx.stroke();
    }
    return canvas.toDataURL();
  },
  createSpaceSky: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#02000a'; ctx.fillRect(0, 0, 1024, 512);
    // Dibujar nebulosa sutil
    for(let i=0; i<30; i++) {
      let x = Math.random()*1024, y = Math.random()*512, r = Math.random()*150 + 50;
      let grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(128, 0, 255, 0.15)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    // Estrellas hiperrealistas
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<300; i++) {
      ctx.fillRect(Math.random()*1024, Math.random()*512, Math.random()*2+1, Math.random()*2+1);
    }
    return canvas.toDataURL();
  }
};
