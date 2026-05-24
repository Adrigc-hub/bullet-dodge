// COMPONENTE PARA CREAR ENEMIGOS CON FORMA HUMANA (NPCs)
AFRAME.registerComponent('human-npc-behavior', {
  init: function () {
    let el = this.el;
    window.gameState.activeEnemies.push(el);

    // --- CONSTRUCCIÓN PROCEDURAL DE MODELO HUMANO (Tronco, Cabeza, Brazos, Piernas) ---
    // Cabeza
    let head = document.createElement('a-sphere');
    head.setAttribute('radius', '0.14'); head.setAttribute('position', '0 1.6 0');
    head.setAttribute('color', '#dddddd'); el.appendChild(head);

    // Tronco / Pecho
    let torso = document.createElement('a-cylinder');
    torso.setAttribute('radius', '0.18'); torso.setAttribute('height', '0.6');
    torso.setAttribute('position', '0 1.1 0'); torso.setAttribute('color', '#222222');
    el.appendChild(torso);

    // Brazos (Izquierdo y Derecho)
    let leftArm = document.createElement('a-cylinder');
    leftArm.setAttribute('radius', '0.05'); leftArm.setAttribute('height', '0.5');
    leftArm.setAttribute('position', '-0.25 1.1 0'); leftArm.setAttribute('color', '#555555');
    el.appendChild(leftArm);

    let rightArm = document.createElement('a-cylinder');
    rightArm.setAttribute('radius', '0.05'); rightArm.setAttribute('height', '0.5');
    rightArm.setAttribute('position', '0.25 1.1 0'); rightArm.setAttribute('color', '#555555');
    el.appendChild(rightArm);

    // Piernas
    let leftLeg = document.createElement('a-cylinder');
    leftLeg.setAttribute('radius', '0.06'); leftLeg.setAttribute('height', '0.6');
    leftLeg.setAttribute('position', '-0.1 0.5 0'); leftLeg.setAttribute('color', '#111111');
    el.appendChild(leftLeg);

    let rightLeg = document.createElement('a-cylinder');
    rightLeg.setAttribute('radius', '0.06'); rightLeg.setAttribute('height', '0.6');
    rightLeg.setAttribute('position', '0.1 0.5 0'); rightLeg.setAttribute('color', '#111111');
    el.appendChild(rightLeg);
  },

  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;
    // Inteligencia Artificial Básica: Avanzar lentamente hacia la posición de la cámara del jugador
    let playerPos = new THREE.Vector3(0, 0, 0); // Rig Origen
    let npcPos = this.el.object3D.position;
    
    let dir = new THREE.Vector3().subVectors(playerPos, npcPos).normalize();
    this.el.object3D.translateOnAxis(dir, 0.8 * (timeDelta / 1000));
    this.el.object3D.position.y = 0; // Pegados al suelo
  }
});

AFRAME.registerComponent('vr-weapon', {
  init: function () {
    let el = this.el;

    // EVENTO RECOGER ARMA (Mango de agua inferior)
    el.addEventListener('gripdown', () => {
      if (window.gameState.isNearMenuGun && !window.gameState.hasWeapon) {
        window.gameState.hasWeapon = true;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
        document.querySelector('#menu-gun-anchor').setAttribute('visible', 'false');
        
        // ACTIVAR EL INFINITO PASIVO AL PORTAR EL ARMA
        document.querySelector('#gojo-infinity-fire').setAttribute('visible', 'true');
      }
    });

    // ACCIÓN DISPARAR BALA DE AGUA
    el.addEventListener('triggerdown', () => {
      if (!window.gameState.hasWeapon || !window.gameState.gameStarted) return;
      
      window.GameAudio.play('shoot');

      // Animación física de retroceso
      let visualGun = document.querySelector('#player-weapon-visual');
      visualGun.setAttribute('position', '0 0.08 0.0');
      setTimeout(() => { visualGun.setAttribute('position', '0 0.08 -0.04'); }, 70);

      // Crear proyectil cilíndrico de agua
      let bullet = document.createElement('a-entity');
      let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos);
      this.el.object3D.getWorldDirection(dir);
      
      bullet.setAttribute('geometry', {primitive: 'cylinder', radius: 0.02, height: 0.15});
      bullet.setAttribute('material', {src: '#water-tex', color: '#00eeff'});
      bullet.setAttribute('position', pos);
      bullet.setAttribute('rotation', '90 0 0');
      dir.multiplyScalar(-1);
      bullet.setAttribute('bullet-behavior', { dx: dir.x, dy: dir.y, dz: dir.z, isRed: false });
      this.el.sceneEl.appendChild(bullet);
    });
  }
});

// ================= TÉCNICA REVERSAL ROJO MEJORADA (Efecto de Compresión a Canica) =================
AFRAME.registerComponent('gojo-red-power', {
  init: function () {
    this.isCharging = false;
    this.chargeTimer = 0;
    this.core = document.querySelector('#red-core');
    this.r1 = document.querySelector('#red-ring-1');
    this.r2 = document.querySelector('#red-ring-2');

    this.el.addEventListener('xbuttondown', () => {
      if (!window.gameState.gameStarted) return;
      this.isCharging = true;
      this.chargeTimer = 0;
      
      window.GameAudio.play('charge');

      // EFECTO ANIME DE CARGA: Empieza translúcido como aire, crece y luego se comprime al tamaño de una canica ultra-concentrada
      this.core.setAttribute('material', 'opacity: 0.95; color: #ff0011');
      this.core.setAttribute('animation', 'property: scale; from: 0.2 0.2 0.2; to: 4 4 4; dur: 900; easing: easeOutQuad');
      
      // Pasar a modo canica miniatura super-brillante a los 1000ms
      setTimeout(() => {
        if(this.isCharging) {
          this.core.setAttribute('animation', 'property: scale; to: 0.4 0.4 0.4; dur: 800; easing: easeInElastic');
          this.core.setAttribute('material', 'color: #ffffff; emissive: #ff0033;'); // Núcleo blanco incandescente
        }
      }, 1000);

      // Anillos orbitales girando salvajemente
      this.r1.setAttribute('material', 'opacity: 0.8');
      this.r1.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 400; loop: true; easing: linear');
      this.r2.setAttribute('material', 'opacity: 0.8');
      this.r2.setAttribute('animation', 'property: rotation; to: 360 0 360; dur: 400; loop: true; easing: linear');
    });

    this.el.addEventListener('xbuttonup', () => {
      if (this.isCharging) {
        this.isCharging = false;
        
        this.core.setAttribute('material', 'opacity: 0');
        this.r1.setAttribute('material', 'opacity: 0');
        this.r2.setAttribute('material', 'opacity: 0');

        if (this.chargeTimer >= 1.8) {
          this.fireRedVacuum();
        }
      }
    });
  },

  tick: function (time, timeDelta) {
    if (this.isCharging) { this.chargeTimer += timeDelta / 1000; }
  },

  fireRedVacuum: function() {
    window.GameAudio.play('red_blast');

    let redOrb = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos);
    this.el.object3D.getWorldDirection(dir);

    // Sale disparado inicialmente compacto y explota al avanzar
    redOrb.setAttribute('geometry', {primitive: 'sphere', radius: 0.12}); // Comienza del tamaño de una canica de plasma
    redOrb.setAttribute('material', {color: '#ff0033', shader: 'flat'});
    redOrb.setAttribute('position', pos);
    
    // Ondas de choque secundarias pegadas al proyectil
    let waves = document.createElement('a-torus');
    waves.setAttribute('radius', 0.25); waves.setAttribute('radius-tubular', 0.015);
    waves.setAttribute('color', '#ffaa00');
    waves.setAttribute('animation', 'property: scale; to: 3 3 3; dur: 250; loop: true');
    redOrb.appendChild(waves);

    dir.multiplyScalar(-1);
    redOrb.setAttribute('bullet-behavior', { dx: dir.x, dy: dir.y, dz: dir.z, isRed: true });
    this.el.sceneEl.appendChild(redOrb);
  }
});

// COMPORTAMIENTO DE BALAS DE AGUA Y ROJO MÁXIMO
AFRAME.registerComponent('bullet-behavior', {
  schema: { dx: {type: 'number'}, dy: {type: 'number'}, dz: {type: 'number'}, isRed: {type: 'boolean'} },
  tick: function (time, timeDelta) {
    let currentSpeed = (this.data.isRed ? 45 : 20) * (timeDelta / 1000);
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), currentSpeed);
    
    let bulletPos = this.el.object3D.position;

    // Verificar colisión con todos los enemigos activos de la habitación
    let enemies = window.gameState.activeEnemies;
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      if (enemy && enemy.object3D) {
        let enemyPos = enemy.object3D.position;
        if (bulletPos.distanceTo(enemyPos) < 1.4) {
          // Destruir al enemigo y removerlo del registro global
          if (enemy.parentNode) enemy.parentNode.removeChild(enemy);
          enemies.splice(i, 1);
          
          if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
          return;
        }
      }
    }

    // Auto-destrucción por distancia fuera de rango
    if (Math.abs(bulletPos.z) > 45) { if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
  }
});
