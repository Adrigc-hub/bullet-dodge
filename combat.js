AFRAME.registerComponent('vr-weapon', {
  init: function () {
    let el = this.el;

    // Detectar si la mano está cerca de un arma (Menú o tiradas en el suelo)
    el.addEventListener('hitstart', (e) => {
      let hitEl = e.detail.el;
      if (hitEl.id === 'menu-gun' || hitEl.classList.contains('loot-weapon')) {
        window.gameState.isNearWeapon = true;
        window.gameState.droppedWeaponId = hitEl;
      }
    });

    el.addEventListener('hitend', () => {
      window.gameState.isNearWeapon = false;
    });

    // APACHAR GRIP: Agarrar arma si está cerca / Ralentizar tiempo si hay enemigos
    el.addEventListener('gripdown', () => {
      if (window.gameState.isNearWeapon && !window.gameState.hasWeapon) {
        // Equipar el arma mágicamente
        window.gameState.hasWeapon = true;
        document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
        
        // Esconder el arma del suelo/menú de forma fluida
        if(window.gameState.droppedWeaponId) {
          window.gameState.droppedWeaponId.setAttribute('visible', 'false');
          window.gameState.droppedWeaponId.setAttribute('position', '0 -100 0'); // Mandar al abismo
        }
      }

      // El tiempo SOLO se ralentiza si tienes el arma equipada o hay enemigos activos
      if (window.gameState.hasWeapon || window.gameState.gameStarted) {
        window.gameState.timeScale = 0.12;
      }
    });

    el.addEventListener('gripup', () => {
      window.gameState.timeScale = 1.0;
    });

    // APACHAR BOTÓN B (Mando derecho): Soltar el arma al suelo con efecto físico
    el.addEventListener('bbuttondown', () => {
      if (window.gameState.hasWeapon) {
        this.dropWeaponToFloor();
      }
    });

    // Disparar con el Gatillo principal (Trigger)
    el.addEventListener('triggerdown', () => { this.shoot(); });
  },

  dropWeaponToFloor: function() {
    window.gameState.hasWeapon = false;
    document.querySelector('#player-weapon-visual').setAttribute('visible', 'false');

    // Efecto de Soltar: Volver a materializar el arma tirada en la posición del jugador
    let handPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(handPos);

    let droppedWeapon = window.gameState.droppedWeaponId || document.createElement('a-entity');
    droppedWeapon.setAttribute('class', 'loot-weapon');
    // Forzar caída al suelo plano (Y = 0.1) sin importar dónde la tires
    droppedWeapon.setAttribute('position', {x: handPos.x, y: 0.1, z: handPos.z}); 
    droppedWeapon.setAttribute('rotation', '0 90 90');
    droppedWeapon.setAttribute('visible', 'true');

    if(!droppedWeapon.parentNode) {
      document.querySelector('#virtual-map').appendChild(droppedWeapon);
    }
  },

  shoot: function () {
    if (!window.gameState.hasWeapon) return;

    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    // BALAS REALISTAS DE AGUA: Forma ojival de proyectil alargada translucida
    bullet.setAttribute('geometry', {primitive: 'cone', radiusBottom: 0.02, radiusTop: 0.0, height: 0.15});
    bullet.setAttribute('material', {src: '#water-tex', opacity: 0.8, transparent: true, roughness: 0.0, metalness: 0.5});
    bullet.setAttribute('rotation', '90 0 0');
    bullet.setAttribute('position', weaponPos);
    
    weaponDir.multiplyScalar(-1);
    bullet.setAttribute('bullet-behavior', {
      directionX: weaponDir.x, directionY: weaponDir.y, directionZ: weaponDir.z
    });
    
    this.el.sceneEl.appendChild(bullet);
  }
});

AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'} },
  tick: function (time, timeDelta) {
    let speed = 26 * (timeDelta / 1000) * window.gameState.timeScale;
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    let bulletPos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      let dist = bulletPos.distanceTo(enemyPos);
      if(dist < 0.95) { 
        enemy.emit('destroy-enemy');
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }
    if (Math.abs(bulletPos.z) > 40) {
      if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }
});
