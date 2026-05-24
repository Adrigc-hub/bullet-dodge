AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isCharging = false;
    this.timer = 0;

    this.el.addEventListener('ybuttondown', () => {
      this.isCharging = true;
      this.timer = 0;
      
      // Crear núcleo que empieza desde "aire" (escala 0.001)
      this.core = document.createElement('a-sphere');
      this.core.setAttribute('radius', '0.01');
      this.core.setAttribute('color', '#ff0033');
      this.core.setAttribute('material', 'shader: flat; opacity: 0.8');
      this.core.setAttribute('position', '0 0.05 -0.1');
      this.el.appendChild(this.core);
    });

    this.el.addEventListener('ybuttonup', () => {
      if (this.isCharging) {
        this.isCharging = false;
        if (this.timer > 1.2) {
           this.shootRed();
        }
        if (this.core) this.el.removeChild(this.core);
      }
    });
  },

  tick: function(time, timeDelta) {
    if (this.isCharging && this.core) {
      this.timer += timeDelta / 1000;
      // Primero crece como energía de aire, luego se comprime a canica
      if (this.timer < 0.6) {
        this.core.setAttribute('scale', `${this.timer * 10} ${this.timer * 10} ${this.timer * 10}`);
      } else {
        this.core.setAttribute('scale', '0.3 0.3 0.3'); // Tamaño Canica
        this.core.setAttribute('material', 'color: #ffffff; emissive: #ff0000');
      }
    }
  },

  shootRed: function() {
    let red = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos);
    this.el.object3D.getWorldDirection(dir);
    
    red.setAttribute('geometry', {primitive: 'sphere', radius: 0.05}); // Bala tipo Canica
    red.setAttribute('material', {color: '#ff0000', shader: 'flat'});
    red.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    // Componente de movimiento
    red.setAttribute('velocity-script', {dx: dir.x, dy: dir.y, dz: dir.z});
    this.el.sceneEl.appendChild(red);
  }
});

// Script simple de movimiento para las balas
AFRAME.registerComponent('velocity-script', {
  schema: {dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}},
  tick: function(t, dt) {
    this.el.object3D.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 25 * (dt/1000));
    if (Math.abs(this.el.object3D.position.z) > 30) this.el.parentNode.removeChild(this.el);
  }
});

// Disparo básico Mano Derecha
AFRAME.registerComponent('vr-weapon-handler', {
  init: function() {
    this.el.addEventListener('triggerdown', () => {
      if (!document.querySelector('#game-world').getAttribute('visible')) return;
      let b = document.createElement('a-sphere');
      let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
      b.setAttribute('radius', '0.02'); b.setAttribute('color', '#00ffff'); b.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      b.setAttribute('velocity-script', {dx: dir.x, dy: dir.y, dz: dir.z});
      this.el.sceneEl.appendChild(b);
    });
  }
});
