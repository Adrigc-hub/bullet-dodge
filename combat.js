AFRAME.registerComponent('vr-weapon', {
  init: function () {
    // Disparar con gatillo de RV
    this.el.addEventListener('triggerdown', () => { this.shoot(); });
    
    // Disparar con botón A del mando derecho
    this.el.addEventListener('abuttondown', () => { this.shoot(); });

    // Disparar en celular sin controles (Clic general en pantalla si tiene el arma)
    window.addEventListener('click', () => {
      if(window.gameState.hasWeapon) {
        this.shoot();
      }
    });
  },
  shoot: function () {
    if(!window.gameState.hasWeapon) return; // No dispara si no la ha recogido

    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    bullet.setAttribute('geometry', {primitive: 'sphere', radius: 0.06});
    bullet.setAttribute('material', {color: '#00ffcc', emissive: '#00ffcc'});
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

// Mecánica para equipar la pistola del menú
AFRAME.registerComponent('equippable-gun', {
  init: function () {
    // Al hacerle click (con la mirada o con el gatillo)
    this.el.addEventListener('click', () => {
      window.gameState.hasWeapon = true;
      
      // Hacer visible la pistola en la mano/pantalla del jugador
      document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
      
      // Hacer desaparecer la pistola flotante del menú
      this.el.setAttribute('visible', 'false');
      this.el.setAttribute('position', '0 -100 0');
    });
  }
});

AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'}, isEnemy: {type: 'boolean'} },
  tick: function (time, timeDelta) {
    let speed = (this.data.isEnemy ? 3 : 18) * (timeDelta / 1000) * window.gameState.timeScale;
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    let bulletPos = this.el.object3D.position;
    if (Math.abs(bulletPos.z) > 35 || Math.abs(bulletPos.x) > 35) {
      if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }
});

// Sistema de golpes físicos mejorado (Melee)
AFRAME.registerComponent('fist-melee', {
  tick: function () {
    let handPos = this.el.object3D.position;
    let enemies = document.querySelectorAll('[enemy-behavior]');
    
    enemies.forEach((enemy) => {
      let enemyPos = enemy.object3D.position;
      let dist = handPos.distanceTo(enemyPos);
      if(dist < 0.6) { // Rango de golpe extendido
        enemy.emit('destroy-enemy');
      }
    });
  }
});
