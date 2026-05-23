// Componente de la Pistola y Disparo
AFRAME.registerComponent('vr-weapon', {
  init: function () {
    this.el.addEventListener('triggerdown', () => {
      this.shoot();
    });
  },
  shoot: function () {
    let bullet = document.createElement('a-entity');
    let weaponPos = new THREE.Vector3();
    let weaponDir = new THREE.Vector3();
    
    this.el.object3D.getWorldPosition(weaponPos);
    this.el.object3D.getWorldDirection(weaponDir);

    bullet.setAttribute('geometry', {primitive: 'sphere', radius: 0.05});
    bullet.setAttribute('material', {color: '#00ffff', emissive: '#00ffff'});
    bullet.setAttribute('position', weaponPos);
    
    // Invertir dirección de la física interna de A-Frame
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

// Comportamiento cinemático de balas (Afectadas por el TimeScale)
AFRAME.registerComponent('bullet-behavior', {
  schema: { directionX: {type: 'number'}, directionY: {type: 'number'}, directionZ: {type: 'number'}, isEnemy: {type: 'boolean'} },
  tick: function (time, timeDelta) {
    let speed = (this.data.isEnemy ? 4 : 15) * (timeDelta / 1000) * window.gameState.timeScale;
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.directionX, this.data.directionY, this.data.directionZ).normalize(), speed);
    
    // Colisiones manuales ultra-rápidas para evitar lag
    let bulletPos = this.el.object3D.position;
    if (Math.abs(bulletPos.z) > 30 || Math.abs(bulletPos.x) > 30) {
      this.el.parentNode.removeChild(this.el);
    }
  }
});

// Daño por golpes físicos directos (Mano del jugador impacta al enemigo)
AFRAME.registerComponent('fist-melee', {
  tick: function () {
    let handPos = this.el.object3D.position;
    let enemies = document.querySelectorAll('[enemy-behavior]');
    
    enemies.forEach((enemy) => {
      let enemyPos = enemy.object3D.position;
      let dist = handPos.distanceTo(enemyPos);
      if(dist < 0.4) { // Si tu mano física está a menos de 40cm del enemigo
        enemy.emit('destroy-enemy');
      }
    });
  }
});
