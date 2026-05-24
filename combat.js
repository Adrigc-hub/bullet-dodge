// Sistema oscilatorio de sonido nativo por osciladores (Evita depender de archivos externos rotos)
function triggerSynthSound(type) {
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'shoot') {
    // Sonido de disparo hidrodinámico agudo de la pistola
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.start(); osc.stop(audioCtx.currentTime + 0.16);
  } else if (type === 'charge') {
    // Zumbido ascendente de energía maldita inestable (Rojo)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, audioCtx.currentTime + 2.0);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime + 2.0);
  } else if (type === 'red_explosion') {
    // Estallido sónico masivo del Rojo al ser liberado
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start(); osc.stop(audioCtx.currentTime + 0.45);
  }
}

AFRAME.registerComponent('vr-weapon', {
  init: function () {
    let el = this.el;

    // AGARRAR: Activación desde el mango inferior de agua
    el.addEventListener('gripdown', () => {
      if (window.gameState.isNearMenuGun && !window.gameState.hasWeapon) {
        window.gameState.hasWeapon = true;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
        document.querySelector('#menu-gun').setAttribute('visible', 'false');
        
        // El Infinito envolvente se activa únicamente al portar el arma
        document.querySelector('#gojo-infinity-fire').setAttribute('visible', 'true');
      }
      if (window.gameState.hasWeapon) { window.gameState.timeScale = 0.15; }
    });

    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });

    // DISPARO DE PISTOLA ACTIVO
    el.addEventListener('triggerdown', () => {
      if (!window.gameState.hasWeapon) return;
      
      // Lanzar sonido de disparo
      triggerSynthSound('shoot');

      // Animación de retroceso físico de la pistola (Efecto de disparo)
      let visualWeapon = document.querySelector('#player-weapon-visual');
      visualWeapon.setAttribute('position', '0 0.08 -0.01'); // Retrocede en Z
      setTimeout(() => { visualWeapon.setAttribute('position', '0 0.08 -0.05'); }, 80);

      // Crear proyectil de agua
      let bullet = document.createElement('a-entity');
      let pos = new THREE.Vector3();
      let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos);
      this.el.object3D.getWorldDirection(dir);
      
      bullet.setAttribute('geometry', {primitive: 'sphere', radius: 0.03});
      bullet.setAttribute('material', {src: '#water-tex', color: '#00ddff'});
      bullet.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      bullet.setAttribute('bullet-behavior', { dx: dir.x, dy: dir.y, dz: dir.z, isRed: false });
      this.el.sceneEl.appendChild(bullet);
    });
  }
});

// ================= COMPONENTE AVANZADO: REVERSAL ROJO (ESTILO ANIME) =================
AFRAME.registerComponent('gojo-red-power', {
  init: function () {
    this.isCharging = false;
    this.chargeTimer = 0;
    this.core = document.querySelector('#red-core');
    this.aura = document.querySelector('#red-aura');

    this.el.addEventListener('xbuttondown', () => {
      this.isCharging = true;
      this.chargeTimer = 0;
      
      // Audio de carga ascendente
      triggerSynthSound('charge');

      // ANIMACIÓN DE CARGA COMPLETA: El núcleo destella y se comprime mientras el aura gira violentamente
      this.core.setAttribute('material', 'opacity: 0.9; color: #ff0022');
      this.core.setAttribute('animation', 'property: scale; to: 4 4 4; dur: 2000; easing: easeInQuad');
      
      this.aura.setAttribute('material', 'opacity: 0.8; color: #ff5500');
      this.aura.setAttribute('animation', 'property: rotation; to: 360 360 0; dur: 500; loop: true; easing: linear');
    });

    this.el.addEventListener('xbuttonup', () => {
      if (this.isCharging) {
        this.isCharging = false;
        
        // Limpiar efectos de la mano
        this.core.setAttribute('material', 'opacity: 0');
        this.core.setAttribute('scale', '1 1 1');
        this.aura.setAttribute('material', 'opacity: 0');

        // Validar si acumuló los 2 segundos enteros
        if (this.chargeTimer >= 2.0) {
          this.fireRedTechnique();
        }
      }
    });
  },

  tick: function (time, timeDelta) {
    if (this.isCharging) { this.chargeTimer += timeDelta / 1000; }
  },

  fireRedTechnique: function() {
    // 1. Sonido de la explosión técnica
    triggerSynthSound('red_explosion');

    // 2. Voz de Gojo sintética controlada
    if ('speechSynthesis' in window) {
      let speech = new SpeechSynthesisUtterance("Kyoho Aka");
      speech.lang = "ja-JP"; speech.pitch = 0.5; speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }

    // 3. Generar Proyectil "Rojo" expansivo con ondas de choque
    let redOrb = document.createElement('a-entity');
    let pos = new THREE.Vector3();
    let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos);
    this.el.object3D.getWorldDirection(dir);

    redOrb.setAttribute('geometry', {primitive: 'sphere', radius: 0.35});
    redOrb.setAttribute('material', {color: '#ff0033', emissive: '#ff0000', roughness: 0.1});
    redOrb.setAttribute('position', pos);
    
    // EFECTO VISUAL ADICIONAL: Ondas de choque secundarias pegadas al orbe rojo
    let shockwave = document.createElement('a-torus');
    shockwave.setAttribute('radius', 0.5);
    shockwave.setAttribute('radius-tubular', 0.02);
    shockwave.setAttribute('color', '#ff5500');
    shockwave.setAttribute('animation', 'property: scale; to: 2 2 2; dur: 400; loop: true');
    redOrb.appendChild(shockwave);

    dir.multiplyScalar(-1);
    redOrb.setAttribute('bullet-behavior', { dx: dir.x, dy: dir.y, dz: dir.z, isRed: true });
    this.el.sceneEl.appendChild(redOrb);
  }
});

// Comportamiento cinemático de los proyectiles
AFRAME.registerComponent('bullet-behavior', {
  schema: { dx: {type: 'number'}, dy: {type: 'number'}, dz: {type: 'number'}, isRed: {type: 'boolean'} },
  tick: function (time, timeDelta) {
    let speedFactor = this.data.isRed ? 42 : 22; // El ataque Rojo viaja a velocidad desproporcionada estilo anime
    let currentSpeed = speedFactor * (timeDelta / 1000) * window.gameState.timeScale;
    
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), currentSpeed);
    
    let pos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    if(enemy) {
      if(pos.distanceTo(enemy.object3D.position) < 1.2) {
        enemy.emit('destroy-enemy');
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }
    if (Math.abs(pos.z) > 40) { if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
  }
});
