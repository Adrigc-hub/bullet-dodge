AFRAME.registerComponent('vr-weapon-handler', {
  init: function() {
    let el = this.el;
    
    el.addEventListener('gripdown', () => {
      if(!window.gameState.gameStarted || window.gameState.hasWeapon) return;
      let handPos = new THREE.Vector3(); el.object3D.getWorldPosition(handPos);
      
      window.gameState.groundWeapons.forEach(w => {
        if(w && w.object3D) {
          let wPos = new THREE.Vector3(); w.object3D.getWorldPosition(wPos);
          if(handPos.distanceTo(wPos) < 0.6) {
            window.gameState.hasWeapon = true;
            w.setAttribute('visible', 'false');
            document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
            document.querySelector('#gojo-infinity-shield').setAttribute('visible', 'true');
          }
        }
      });
    });

    el.addEventListener('triggerdown', () => {
      if(!window.gameState.hasWeapon || !window.gameState.gameStarted) return;
      window.GameAudio.play('shoot');
      
      let b = document.createElement('a-entity');
      let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
      b.setAttribute('geometry', {primitive: 'sphere', radius: 0.025});
      b.setAttribute('material', {color: '#00ffff', shader: 'flat'});
      b.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      b.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'water'});
      this.el.sceneEl.appendChild(b);
    });
  }
});

AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isChargingRed = false;
    this.chargeTimer = 0;
    this.activeChargeGroup = null;

    // Botón X: Lanzar Orbe Azul instantáneo
    this.el.addEventListener('xbuttondown', () => {
      if(window.gameState.hasWeapon || !window.gameState.gameStarted || window.gameState.energy < 40) return;
      this.fireBlueOrb();
    });

    // Botón Y: Cargar Técnica de Inversión: Rojo (Estilo canica concentrada)
    this.el.addEventListener('ybuttondown', () => {
      if(window.gameState.hasWeapon || window.gameState.energy < 50 || !window.gameState.gameStarted) return;
      this.isChargingRed = true;
      this.chargeTimer = 0;
      window.GameAudio.play('charge');

      // Crear efectos visuales efímeros para que NO bloqueen tus colisiones de los botones
      this.activeChargeGroup = document.createElement('a-entity');
      this.activeChargeGroup.setAttribute('position', '0 0.04 -0.1');
      this.el.appendChild(this.activeChargeGroup);

      this.dynamicCore = document.createElement('a-sphere');
      this.dynamicCore.setAttribute('radius', '0.01');
      this.dynamicCore.setAttribute('color', '#ff0033');
      this.dynamicCore.setAttribute('material', 'shader: flat');
      this.activeChargeGroup.appendChild(this.dynamicCore);
    });

    this.el.addEventListener('ybuttonup', () => {
      if(this.isChargingRed) {
        this.isChargingRed = false;
        
        if(this.activeChargeGroup && this.activeChargeGroup.parentNode) {
          this.activeChargeGroup.parentNode.removeChild(this.activeChargeGroup);
        }

        if(this.chargeTimer >= 1.2) {
          window.gameState.energy -= 50;
          document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + window.gameState.energy + '%;');
          this.launchRedCanica();
        }
      }
    });
  },

  tick: function(time, timeDelta) {
    if(this.isChargingRed && this.activeChargeGroup) {
      this.chargeTimer += timeDelta / 1000;
      if(this.chargeTimer > 0.7 && this.dynamicCore) {
        this.dynamicCore.setAttribute('radius', '0.035'); // Se comprime en una canica de alta densidad energética
        this.dynamicCore.setAttribute('material', 'color: #ffffff; emissive: #ff0044');
      }
    }
  },

  fireBlueOrb: function() {
    window.gameState.energy -= 40;
    document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + window.gameState.energy + '%;');

    let blue = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    blue.setAttribute('geometry', {primitive: 'sphere', radius: 0.12});
    blue.setAttribute('material', {color: '#0055ff', shader: 'flat'});
    blue.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    blue.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'blue'});
    this.el.sceneEl.appendChild(blue);
  },

  launchRedCanica: function() {
    let red = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    red.setAttribute('geometry', {primitive: 'sphere', radius: 0.04});
    red.setAttribute('material', {color: '#ff0033', shader: 'flat'});
    red.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    red.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'red'});
    this.el.sceneEl.appendChild(red);
  }
});

AFRAME.registerComponent('wizard-wand-system', {
  init: function() {
    this.wandVisual = document.querySelector('#wizard-wand-visual');

    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.mana >= 100 && !window.gameState.wandEquipped && window.gameState.gameStarted) {
        window.gameState.wandEquipped = true;
        window.gameState.spellsCastCount = 0;
        this.wandVisual.setAttribute('visible', 'true');
      }
    });

    this.el.addEventListener('triggerdown', () => {
      if(!window.gameState.wandEquipped) return;

      window.gameState.spellsCastCount++;
      window.gameState.mana -= 34;
      document.querySelector('#hud-mana-text').setAttribute('text', 'value: MANA: ' + Math.max(0, window.gameState.mana) + '%;');
      window.GameAudio.play('fireball');
      
      let fb = document.createElement('a-entity');
      let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
      fb.setAttribute('geometry', {primitive: 'sphere', radius: 0.14});
      fb.setAttribute('material', {color: '#ff8800'});
      fb.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      fb.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'fireball'});
      this.el.sceneEl.appendChild(fb);

      if(window.gameState.spellsCastCount >= 3) {
        window.gameState.wandEquipped = false;
        window.gameState.mana = 0;
        this.wandVisual.setAttribute('visible', 'false');
      }
    });
  }
});

AFRAME.registerComponent('bullet-runtime', {
  schema: { dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}, type: {type:'string'} },
  init: function() { this.timer = 0; },
  tick: function(time, timeDelta) {
    let obj = this.el.object3D;
    this.timer += timeDelta / 1000;

    let speed = this.data.type === 'red' ? 35 : 16;
    obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), speed * (timeDelta / 1000));

    // Detección de colisión directa contra Maniquíes
    let enemies = window.gameState.activeEnemies;
    for(let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      if(e && e.object3D && obj.position.distanceTo(e.object3D.position) < 1.1) {
        if(e.parentNode) e.parentNode.removeChild(e);
        enemies.splice(i, 1);
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
    }

    if(this.timer > 4.0 && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
});
