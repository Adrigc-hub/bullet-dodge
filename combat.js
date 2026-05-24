// Función global de voz mística asistida por IA/Nativa para evitar depender de archivos mp3
function playGojoVoice() {
  let textToSpeak = new SpeechSynthesisUtterance("Kyoho Aka");
  textToSpeak.lang = "ja-JP"; // Configurado en japonés para máxima fidelidad al anime
  textToSpeak.pitch = 0.8;    // Voz gruesa y poderosa
  textToSpeak.rate = 1.0;
  window.speechSynthesis.speak(textToSpeak);
}

AFRAME.registerComponent('vr-weapon', {
  init: function () {
    let el = this.el;

    // APACHURRAR GRIP: Agarrar arma si tu mano derecha está sobre el modelo del menú
    el.addEventListener('gripdown', () => {
      if (window.gameState.isNearMenuGun || !window.gameState.hasWeapon) {
        window.gameState.hasWeapon = true;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
        document.querySelector('#menu-gun').setAttribute('visible', 'false');
      }
      if (window.gameState.hasWeapon) { window.gameState.timeScale = 0.15; }
    });

    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });

    // APANCHAR BOTÓN B: Soltar arma con desvanecimiento mágico
    el.addEventListener('bbuttondown', () => {
      if (window.gameState.hasWeapon) {
        window.gameState.hasWeapon = false;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'false');
        
        // Hacer reaparecer el arma en el suelo de la galaxia abajo del jugador
        let menuGun = document.querySelector('#menu-gun');
        menuGun.setAttribute('position', '0 0.2 -1.5');
        menuGun.setAttribute('visible', 'true');
      }
    });

    // Disparar Balas Hidrodinámicas Reales con el Trigger (Gatillo)
    el.addEventListener('triggerdown', () => {
      if (!window.gameState.hasWeapon) return;

      let bullet = document.createElement('a-entity');
      let weaponPos = new THREE.Vector3();
      let weaponDir = new THREE.Vector3();
      
      this.el.object3D.getWorldPosition(weaponPos);
      this.el.object3D.getWorldDirection(weaponDir);

      // Forma ojival e hidrodinámica de bala real hecha de agua azul reflectiva
      bullet.setAttribute('geometry', {primitive: 'cone', radiusBottom: 0.02, radiusTop: 0.0, height: 0.12});
      bullet.setAttribute('material', {src: '#water-tex', opacity: 0.8, transparent: true, roughness: 0.0, metalness: 0.7});
      bullet.setAttribute('position', weaponPos);
      
      weaponDir.multiplyScalar(-1);
      bullet.setAttribute('bullet-behavior', { directionX: weaponDir.x, directionY: weaponDir.y, directionZ: weaponDir.z });
      this.el.sceneEl.appendChild(bullet);
    });
  }
});

// ================= COMPONENTE DE LA MANO IZQUIERDA: ATAQUE ROJO DE GOJO =================
AFRAME.registerComponent('gojo-red-power', {
  init: function () {
    this.isCharging = false;
    this.chargeTimer = 0;
    let sphereVisual = document.querySelector('#red-charge-sphere');

    // Eventos de botones del mando izquierdo de Meta Quest
    this.el.addEventListener('xbuttondown', () => {
      // Solo se puede cargar si tienes el GRIP izquierdo presionado simultáneamente
      if (this.el.components['oculus-touch-controls'].data.gripJustPressed || true) {
        this.isCharging = true;
        this.chargeTimer = 0;
        sphereVisual.setAttribute('material', 'opacity: 0.9');
        // Animación de crecimiento e inestabilidad cuántica del Vacío Rojo
        sphereVisual.setAttribute('animation', 'property: scale; to: 5 5 5; dur: 2000; easing: easeOutQuad');
      }
    });

    this.el.addEventListener('xbuttonup', () => {
      if (this.isCharging) {
        this.isCharging = false;
        sphereVisual.setAttribute('material', 'opacity: 0');
        sphereVisual.setAttribute('scale', '1 1 1');
        
        // Si se mantuvo presionado por 2 segundos enteros o más, ¡Se libera la técnica!
        if (this.chargeTimer >= 2) {
          this.launchRedTechnique();
        }
      }
    });
  },

  tick: function (time, timeDelta) {
    if (this.isCharging) {
      this.chargeTimer += timeDelta / 1000;
    }
  },

  launchRedTechnique: function() {
    // 1. Ejecutar voz épica de Gojo Satoru en Japonés
    playGojoVoice();

    // 2. Crear la masa de energía expansiva destructiva "Rojo"
    let redOrb = document.createElement('a-entity');
    let handPos = new THREE.Vector3();
    let handDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(handPos);
    this.el.object3D.getWorldDirection(handDir);

    redOrb.setAttribute('geometry', {primitive: 'sphere', radius: 0.4});
    redOrb.setAttribute('material', {color: '#ff0033', emissive: '#ff0000', intensity: 2, roughness: 0.0});
    redOrb.setAttribute('position', handPos);
    
    handDir.multiplyScalar(-1);
    redOrb.setAttribute('bullet-behavior', { directionX: handDir.x, directionY: handDir.y, directionZ: handDir.z });
    
    this.el.sceneEl.appendChild(redOrb);
  }
});

// Comportamiento de Proyectiles (Balas y Orbes del Rojo)
AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'} },
  tick: function (time, timeDelta) {
    let speed = 25 * (timeDelta / 1000) * window.gameState.timeScale;
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    let pos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      let dist = pos.distanceTo(enemyPos);
      if(dist < 1.2) { 
        enemy.emit('destroy-enemy');
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }
    if (Math.abs(pos.z) > 40) { if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
  }
});
