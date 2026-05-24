// Motor de síntesis de voz de Gojo Satoru con modulación de frecuencia armónica
function playGojoVoice() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cortar audios colgados
    let voiceMsg = new SpeechSynthesisUtterance("Kyōho... Aka");
    voiceMsg.lang = "ja-JP"; 
    voiceMsg.pitch = 0.65; // Ajuste ultra-bajo para emular el tono del video
    voiceMsg.rate = 0.85;  // Velocidad dramática pausa integrada
    window.speechSynthesis.speak(voiceMsg);
  }
}

AFRAME.registerComponent('vr-weapon', {
  init: function () {
    let el = this.el;

    // SISTEMA GRIP SEGURO: Equipar arma instantáneamente
    el.addEventListener('gripdown', () => {
      if (window.gameState.isNearMenuGun && !window.gameState.hasWeapon) {
        window.gameState.hasWeapon = true;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
        document.querySelector('#menu-gun').setAttribute('visible', 'false');
        
        // ACTIVAR EL INFINITO (Fuego azul) SOLO CUANDO SUTIENES EL ARMA
        document.querySelector('#gojo-infinity-fire').setAttribute('visible', 'true');
      }
      if (window.gameState.hasWeapon) { window.gameState.timeScale = 0.15; }
    });

    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });

    // DESEQUIPAR Y DESACTIVAR EFECTOS
    el.addEventListener('bbuttondown', () => {
      if (window.gameState.hasWeapon) {
        window.gameState.hasWeapon = false;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'false');
        document.querySelector('#gojo-infinity-fire').setAttribute('visible', 'false'); // Apagar infinito
        
        let menuGun = document.querySelector('#menu-gun');
        menuGun.setAttribute('position', '0 0.2 -1.2');
        menuGun.setAttribute('visible', 'true');
      }
    });

    // SISTEMA DE GATILLO REPARADO PARA BALAS DE AGUA REALES
    el.addEventListener('triggerdown', () => {
      if (!window.gameState.hasWeapon) return;
      this.shootWaterBullet();
    });
  },

  shootWaterBullet: function() {
    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    // Render de bala real cónica hidrodinámica
    bullet.setAttribute('geometry', {primitive: 'cone', radiusBottom: 0.025, radiusTop: 0.0, height: 0.14});
    bullet.setAttribute('material', {src: '#water-tex', opacity: 0.85, transparent: true, metalness: 0.8});
    bullet.setAttribute('position', weaponPos);
    
    weaponDir.multiplyScalar(-1);
    bullet.setAttribute('bullet-behavior', { directionX: weaponDir.x, directionY: weaponDir.y, directionZ: weaponDir.z, isRed: false });
    this.el.sceneEl.appendChild(bullet);
  }
});

// ================= COMPONENTE CORREGIDO: TÉCNICA REVERSAL ROJO =================
AFRAME.registerComponent('gojo-red-power', {
  init: function () {
    this.isCharging = false;
    this.chargeTimer = 0;
    this.sphereVisual = document.querySelector('#red-charge-sphere');
    this.ringVisual = document.querySelector('#red-plasma-ring');

    // Iniciar acumulación (Grip Izquierdo + Botón X)
    this.el.addEventListener('xbuttondown', () => {
      this.isCharging = true;
      this.chargeTimer = 0;
      
      // Animación de acumulación progresiva (Estilo el video de referencia)
      this.sphereVisual.setAttribute('material', 'opacity: 0.95; color: #ff0033');
      this.sphereVisual.setAttribute('animation', 'property: scale; to: 6 6 6; dur: 2000; easing: easeOutElastic');
      
      this.ringVisual.setAttribute('material', 'opacity: 0.7');
      this.ringVisual.setAttribute('animation', 'property: rotation; to: 360 180 360; dur: 2000; loop: true');
    });

    // Desatar técnica al soltar el botón X
    this.el.addEventListener('xbuttonup', () => {
      if (this.isCharging) {
        this.isCharging = false;
        
        // Resetear elementos visuales de carga de la mano
        this.sphereVisual.setAttribute('material', 'opacity: 0');
        this.sphereVisual.setAttribute('scale', '1 1 1');
        this.ringVisual.setAttribute('material', 'opacity: 0');

        // Validar si completó los 2 segundos reglamentarios de carga
        if (this.chargeTimer >= 2.0) {
          this.launchRedVacuum();
        }
      }
    });
  },

  tick: function (time, timeDelta) {
    if (this.isCharging) {
      this.chargeTimer += timeDelta / 1000;
    }
  },

  launchRedVacuum: function() {
    // Voz del sistema
    playGojoVoice();

    let redOrb = document.createElement('a-entity');
    let handPos = new THREE.Vector3();
    let handDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(handPos);
    this.el.object3D.getWorldDirection(handDir);

    // Esfera expansiva masiva de energía destructiva roja
    redOrb.setAttribute('geometry', {primitive: 'sphere', radius: 0.45});
    redOrb.setAttribute('material', {color: '#ff0022', emissive: '#ff0011', roughness: 0.1});
    redOrb.setAttribute('position', handPos);
    
    handDir.multiplyScalar(-1);
    redOrb.setAttribute('bullet-behavior', { directionX: handDir.x, directionY: handDir.y, directionZ: handDir.z, isRed: true });
    this.el.sceneEl.appendChild(redOrb);
  }
});

// Comportamiento unificado de proyectiles
AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'}, isRed: {type: 'boolean'} },
  tick: function (time, timeDelta) {
    // Si es el ataque Rojo, viaja al doble de velocidad rompiendo la barrera física
    let baseSpeed = this.data.isRed ? 48 : 24;
    let speed = baseSpeed * (timeDelta / 1000) * window.gameState.timeScale;
    
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    let pos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      if(pos.distanceTo(enemyPos) < 1.3) { 
        enemy.emit('destroy-enemy');
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }
    if (Math.abs(pos.z) > 40) { if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
  }
});
