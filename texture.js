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
    // Degradado de agua real
    let grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#00d2ff');
    grad.addColorStop(0.5, '#0066ff');
    grad.addColorStop(1, '#001166');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    for(let i=0; i<3; i++) {
      ctx.beginPath(); ctx.arc(64 * i, 64 * i, 50, 0, Math.PI*2); ctx.stroke();
    }
    return canvas.toDataURL();
  },
  createNebulaSky: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    
    // Base espacial profunda
    ctx.fillStyle = '#030014';
    ctx.fillRect(0, 0, 1024, 512);
    
    // Nubes de la galaxia hipercolorida (Magentas, púrpuras y cian)
    let colors = ['rgba(255, 0, 128, 0.25)', 'rgba(0, 221, 255, 0.2)', 'rgba(110, 0, 255, 0.3)'];
    for(let i = 0; i < 45; i++) {
      let x = Math.random() * 1024;
      let y = Math.random() * 512;
      let r = Math.random() * 200 + 80;
      let grad = ctx.createRadialGradient(x, y, 10, x, y, r);
      grad.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    
    // Capa de estrellas brillantes
    ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 400; i++) {
      let size = Math.random() * 2.5 + 0.5;
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, size, size);
    }
    return canvas.toDataURL();
  }
};
