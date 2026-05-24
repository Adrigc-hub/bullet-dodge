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
      b.setAttribute('geometry', {primitive: 'sphere', radius: 0.03});
      b.setAttribute('material', {color: '#00ffff'});
      b.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      b.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'water'});
      this.el.sceneEl.appendChild(b);
    });
  }
});

// ================= GESTIÓN LIMPIA DE HECHIZOS CRUZADOS DE GOJO =================
AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isChargingRed = false;
    this.chargeTimer = 0;
    this.activeChargeGroup = null;

    this.el.addEventListener('xbuttondown', () => {
      if(window.gameState.hasWeapon || !window.gameState.gameStarted || window.gameState.energy < 49) return;
      this.fireBlueOrb(false);
    });

    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.gameStarted && window.gameState.energy >= 51) {
        this.fireBlueOrb(true);
      }
    });

    // SISTEMA MEJORADO: Generación procedural dinámica del Rojo para evitar colisiones estáticas basura
    this.el.addEventListener('ybuttondown', () => {
      if(window.gameState.hasWeapon || window.gameState.energy < 49 || !window.gameState.gameStarted) return;
      this.isChargingRed = true;
      this.chargeTimer = 0;
      window.GameAudio.play('charge_red');

      // Crear grupo contenedor del efecto temporal
      this.activeChargeGroup = document.createElement('a-entity');
      this.activeChargeGroup.setAttribute('position', '0 0.05 -0.12');
      this.el.appendChild(this.activeChargeGroup);

      // Crear los 3 rayos helicoidales estilo anime
      for(let i=1; i<=3; i++) {
        let ray = document.createElement('a-cylinder');
        ray.setAttribute('id', 'dynamic-ray-' + i);
        ray.setAttribute('radius', '0.005');
        ray.setAttribute('height', '0.25');
        ray.setAttribute('color', i===1 ? '#ff0000' : (i===2 ? '#ff0055' : '#ffaa00'));
        ray.setAttribute('material', 'shader: flat');
        this.activeChargeGroup.appendChild(ray);
      }

      // Núcleo minúsculo que empieza desde el aire
      this.dynamicCore = document.createElement('a-sphere');
      this.dynamicCore.setAttribute('radius', '0.01');
      this.dynamicCore.setAttribute('color', '#ff0033');
      this.dynamicCore.setAttribute('material', 'shader: flat');
      this.activeChargeGroup.appendChild(this.dynamicCore);
    });

    this.el.addEventListener('ybuttonup', () => {
      if(this.isChargingRed) {
        this.isChargingRed = false;
        
        // Remover el contenedor del mapa para liberar la colisión del raycaster de inmediato
        if(this.activeChargeGroup && this.activeChargeGroup.parentNode) {
          this.activeChargeGroup.parentNode.removeChild(this.activeChargeGroup);
        }

        if(this.chargeTimer >= 1.5) {
          window.gameState.energy -= 49;
          document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + Math.max(0, window.gameState.energy) + '%;');
          this.launchRedCanica();
        }
      }
    });
  },

  tick: function(time, timeDelta) {
    if(this.isChargingRed && this.activeChargeGroup) {
      this.chargeTimer += timeDelta / 1000;
      
      let r1 = this.activeChargeGroup.querySelector('#dynamic-ray-1');
      let r2 = this.activeChargeGroup.querySelector('#dynamic-ray-2');
      let r3 = this.activeChargeGroup.querySelector('#dynamic-ray-3');
      let speedRot = time * 0.009;
      
      // Los 3 rayos giran contrayéndose hacia el centro de forma impecable
      let radiusOffset = Math.max(0.02, 0.15 - (this.chargeTimer * 0.08));
      if(r1) r1.setAttribute('position', `${Math.sin(speedRot)*radiusOffset} 0 ${Math.cos(speedRot)*radiusOffset}`);
      if(r2) r2.setAttribute('position', `${Math.sin(speedRot + 2)*radiusOffset} 0 ${Math.cos(speedRot + 2)*radiusOffset}`);
      if(r3) r3.setAttribute('position', `${Math.sin(speedRot + 4)*radiusOffset} 0 ${Math.cos(speedRot + 4)*radiusOffset}`);
      
      // Animación de tamaño canica hiperconcentrada
      if(this.chargeTimer > 0.8 && this.dynamicCore) {
        this.dynamicCore.setAttribute('radius', '0.03');
        this.dynamicCore.setAttribute('material', 'color: #ffffff; emissive: #ff0033;');
      }
    }
  },

  fireBlueOrb: function(isVortex) {
    window.gameState.energy -= isVortex ? 51 : 49;
    document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + Math.max(0, window.gameState.energy) + '%;');

    let blue = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    blue.setAttribute('geometry', {primitive: 'sphere', radius: isVortex ? 0.22 : 0.15});
    blue.setAttribute('material', {color: '#0055ff', shader: 'flat'});
    blue.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    blue.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: isVortex ? 'blue_vortex' : 'blue_static'});
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

// ================= WAR OF WIZARDS: MANÁ Y BOLA DE FUEGO PROCEDURAL =================
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
      this.castFireballSpell();

      if(window.gameState.spellsCastCount >= 3) {
        window.gameState.wandEquipped = false;
        window.gameState.mana = 0;
        this.wandVisual.setAttribute('visible', 'false');
      }
    });
  },

  castFireballSpell: function() {
    let fb = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    fb.setAttribute('geometry', {primitive: 'sphere', radius: 0.15});
    fb.setAttribute('material', {color: '#ffaa00', emissive: '#ff3300'});
    fb.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    fb.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'fireball'});
    this.el.sceneEl.appendChild(fb);
  }
});

// ================= RUNTIME DE COMPORTAMIENTO DE BALAS DE COMBATE =================
AFRAME.registerComponent('bullet-runtime', {
  schema: { dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}, type: {type:'string'} },
  init: function() {
    this.timer = 0;
    this.isStaticBlue = this.data.type === 'blue_static';
  },
  tick: function(time, timeDelta) {
    let obj = this.el.object3D;
    this.timer += timeDelta / 1000;

    if (this.isStaticBlue) {
      if(this.timer < 0.2) {
        obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 12 * (timeDelta / 1000));
      }
      if(this.timer >= 5.0) {
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
      let projectiles = document.querySelectorAll('[bullet-runtime]');
      projectiles.forEach(p => {
        if(p !== this.el && p.components['bullet-runtime'].data.type === 'red') {
          if(obj.position.distanceTo(p.object3D.position) < 0.8) {
            this.detonatePurpleNuke(obj.position);
            if(p.parentNode) p.parentNode.removeChild(p);
            if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
          }
        }
      });
      return;
    }

    if (this.data.type === 'blue_vortex') {
      obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 9 * (timeDelta / 1000));
      window.gameState.activeEnemies.forEach(e => {
        if(e.object3D && obj.position.distanceTo(e.object3D.position) < 4.0) {
          let pullDir = new THREE.Vector3().subVectors(obj.position, e.object3D.position).normalize();
          e.object3D.translateOnAxis(pullDir, 4.5 * (timeDelta / 1000));
        }
      });
    } else {
      let speed = (this.data.type === 'red') ? 38 : 18;
      obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), speed * (timeDelta / 1000));
    }

    let enemies = window.gameState.activeEnemies;
    for(let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      if(e && e.object3D && obj.position.distanceTo(e.object3D.position) < 1.2) {
        if(e.parentNode) e.parentNode.removeChild(e);
        enemies.splice(i, 1);
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
    }

    if(this.timer > 5.0 && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  detonatePurpleNuke: function(impactPos) {
    window.GameAudio.play('purple_nuke');
    let explosion = document.createElement('a-sphere');
    explosion.setAttribute('position', impactPos);
    explosion.setAttribute('radius', '0.5');
    explosion.setAttribute('material', {color: '#9900ff', shader: 'flat', transparent: true, opacity: 0.85});
    explosion.setAttribute('animation', 'property: scale; to: 14 14 14; dur: 600; easing: easeOutQuad');
    this.el.sceneEl.appendChild(explosion);

    setTimeout(() => {
      let enemies = window.gameState.activeEnemies;
      for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if(e && e.object3D && impactPos.distanceTo(e.object3D.position) < 8.5) {
          if(e.parentNode) e.parentNode.removeChild(e);
          enemies.splice(i, 1);
        }
      }
      if(explosion.parentNode) explosion.parentNode.removeChild(explosion);
    }, 600);
  }
});
