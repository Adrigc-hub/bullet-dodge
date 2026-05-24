const Textures = {
  createNebulaSky: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    let ctx = canvas.getContext('2d');
    
    // Espacio cósmico profundo
    let grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#02000d');
    grad.addColorStop(0.5, '#19003a');
    grad.addColorStop(1, '#05001f');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 512);
    
    // Nebulosas de polvo cósmico hiper-coloridas
    let colors = ['rgba(255, 0, 128, 0.4)', 'rgba(0, 242, 255, 0.3)', 'rgba(140, 0, 255, 0.45)', 'rgba(255, 0, 255, 0.2)'];
    for(let i = 0; i < 40; i++) {
      let x = Math.random() * 1024;
      let y = Math.random() * 512;
      let r = Math.random() * 220 + 90;
      let rGrad = ctx.createRadialGradient(x, y, 10, x, y, r);
      rGrad.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
      rGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rGrad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    
    // Estrellas hiper-brillantes centelleantes
    ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 500; i++) {
      let size = Math.random() * 3 + 0.5;
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, size, size);
    }
    return canvas.toDataURL();
  },
  createWaterPattern: function () {
    let canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0066ff'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#80e5ff';
    for(let i=0; i<8; i++) { ctx.fillRect(Math.random()*128, Math.random()*128, 20, 20); }
    return canvas.toDataURL();
  }
};
