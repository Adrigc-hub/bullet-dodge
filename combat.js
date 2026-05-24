AFRAME.registerComponent('vr-weapon', {
  init: function () {
    // Escuchar eventos de disparo físicos (Mandos Meta Quest)
    this.el.addEventListener('triggerdown', () => { this.shoot(); });
    this.el.addEventListener('abuttondown', () => { this.shoot(); });

    // Escuchar clics en pantallas o clicks del puntero WebXR
    window.addEventListener('click', () => {
      if(window.gameState.gameStarted) {
        this.shoot();
      }
    });
  },
  shoot: function () {
    // El jugador siempre tiene el arma activa gracias al efecto mágico indestructible
    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    // Las balas cambian a esferas purificadoras de agua mística a alta velocidad
    bullet.setAttribute('geometry', {primitive: 'sphere', radius: 0.07});
    bullet.setAttribute('material', {color: '#00ccff', emissive: '#0055ff', roughness: 0.0, opacity: 0.8, transparent: true});
    bullet.setAttribute('light', {type: 'point', color: '#00aaff', intensity: 1.5, distance: 4});
    bullet.setAttribute('position', weaponPos);
    
    weaponDir.multiplyScalar(-1);
    bullet.setAttribute('bullet-behavior', {
      directionX: weaponDir.x,
      directionY: weaponDir.y,
      directionZ: weaponDir.z
    });
    
    this.el.sceneEl.appendChild(bullet);
  }
});

// Mantener el componente equippable por compatibilidad con el objeto del menú decorativo
AFRAME.registerComponent('equippable-gun', {
  init: function () {
    this.el.addEventListener('click', () => {
      // Al dispararle o mirarlo en el menú, genera una explosión mística visual
      this.el.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 200');
    });
  }
});

AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'} },
  tick: function (time, timeDelta) {
    let speed = 24 * (timeDelta / 1000) * window.gameState.timeScale;
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

    if (Math.abs(bulletPos.z) > 40 || Math.abs(bulletPos.x) > 40) {
      if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }
});

// Sistema Melee (Golpes cuerpo a cuerpo con las manos físicas)
AFRAME.registerComponent('fist-melee', {
  tick: function () {
    let handPos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      let dist = handPos.distanceTo(enemyPos);
      if(dist < 0.95) { 
        enemy.emit('destroy-enemy');
      }
    }
  }
});
