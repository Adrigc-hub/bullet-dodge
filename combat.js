AFRAME.registerComponent('vr-weapon', {
  init: function () {
    this.el.addEventListener('triggerdown', () => { this.shoot(); });
    this.el.addEventListener('abuttondown', () => { this.shoot(); });

    // Disparar haciendo un "Tap" en la pantalla si ya recogiste el arma
    window.addEventListener('click', () => {
      if(window.gameState.hasWeapon && window.gameState.gameStarted) {
        this.shoot();
      }
    });
  },
  shoot: function () {
    if(!window.gameState.hasWeapon) return;

    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    // Balas mágicas HD hiperrealistas con luz propia incorporada
    bullet.setAttribute('geometry', {primitive: 'sphere', radius: 0.08});
    bullet.setAttribute('material', {color: '#00ffcc', emissive: '#00ffcc', roughness: 0.1});
    bullet.setAttribute('light', {type: 'point', color: '#00ffcc', intensity: 1, distance: 3});
    bullet.setAttribute('position', weaponPos);
    
    weaponDir.multiplyScalar(-1);
    bullet.setAttribute('bullet-behavior', {
      directionX: weaponDir.x,
      directionY: weaponDir.y,
      directionZ: weaponDir.z,
      isEnemy: false
    });
    
    this.el.sceneEl.appendChild(bullet);
  }
});

AFRAME.registerComponent('equippable-gun', {
  init: function () {
    this.el.addEventListener('click', () => {
      window.gameState.hasWeapon = true;
      document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
      this.el.setAttribute('visible', 'false');
      this.el.setAttribute('position', '0 -50 0');
    });
  }
});

AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'} },
  tick: function (time, timeDelta) {
    let speed = 22 * (timeDelta / 1000) * window.gameState.timeScale;
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    let bulletPos = this.el.object3D.position;
    
    // Verificar impacto en el maniquí gigante
    let enemy = document.querySelector('#enemy-target');
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      let dist = bulletPos.distanceTo(enemyPos);
      if(dist < 0.9) { // Caja de colisión adaptada al tamaño del enemigo
        enemy.emit('destroy-enemy');
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
      }
    }

    if (Math.abs(bulletPos.z) > 40 || Math.abs(bulletPos.x) > 40) {
      if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }
});

// Romper al enemigo a puros golpes (Estilo Gorilla Tag agresivo)
AFRAME.registerComponent('fist-melee', {
  tick: function () {
    let handPos = this.el.object3D.position;
    let enemy = document.querySelector('#enemy-target');
    if(enemy) {
      let enemyPos = enemy.object3D.position;
      let dist = handPos.distanceTo(enemyPos);
      if(dist < 0.9) { 
        enemy.emit('destroy-enemy');
      }
    }
  }
});
