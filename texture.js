const Textures = {
  createGrid: function (baseColor, gridColor) {
    let canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 512, 512);
    return canvas.toDataURL();
  },
  createWaterPattern: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0055ff'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#00ddff';
    for(let i=0; i<6; i++) {
      ctx.fillRect(Math.random()*256, Math.random()*256, 40, 40);
    }
    return canvas.toDataURL();
  },
  createNebulaSky: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    
    // Espacio profundo magenta/púrpura de fondo
    let skyGrad = ctx.createLinearGradient(0, 0, 1024, 512);
    skyGrad.addColorStop(0, '#02000a');
    skyGrad.addColorStop(0.5, '#12002b');
    skyGrad.addColorStop(1, '#050018');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 1024, 512);
    
    // Nubes de la galaxia coloridas
    let colors = ['rgba(255, 0, 150, 0.3)', 'rgba(0, 230, 255, 0.25)', 'rgba(130, 0, 255, 0.35)'];
    for(let i = 0; i < 30; i++) {
      let x = Math.random() * 1024;
      let y = Math.random() * 512;
      let r = Math.random() * 180 + 70;
      let grad = ctx.createRadialGradient(x, y, 5, x, y, r);
      grad.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    
    // Campo de estrellas densas
    ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 350; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2);
    }
    return canvas.toDataURL();
  }
};
