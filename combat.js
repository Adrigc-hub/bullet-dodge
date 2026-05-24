// CONTROLADOR DE DISPARO Y RECOGER ARMAS EN PARTIDA (MANO DERECHA)
AFRAME.registerComponent('vr-weapon-handler', {
  init: function() {
    let el = this.el;
    
    el.addEventListener('gripdown', () => {
      if(!window.gameState.gameStarted || window.gameState.hasWeapon) return;
      
      let handPos = new THREE.Vector3(); el.object3D.getWorldPosition(handPos);
      
      window.gameState.groundWeapons.forEach(w => {
        if(w && w.object3D) {
          let wPos = new THREE.Vector3(); w.object3D.getWorldPosition(wPos);
          if(handPos.distanceTo(wPos) < 0.65) {
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
      
      // Efecto físico de retroceso en la mano virtual
      let visualGun = document.querySelector('#player-weapon-visual');
      visualGun.setAttribute('position', '0 0.07 0.0');
      setTimeout(() => { visualGun.setAttribute('position', '0 0.07 -0.04'); }, 70);

      // Bala de agua
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

// ================= JUJUTSU TÉCNICAS REVERSALES: HECHIZOS CRUZADOS (MANO IZQUIERDA) =================
AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isChargingRed = false;
    this.chargeTimer = 0;
    this.lightningSys = document.querySelector('#red-lightning-system');
    this.core = document.querySelector('#red-core');

    // BOTÓN X: Invoca Orbe Azul de Atracción Estática (Gasta 49 de Energía)
    this.el.addEventListener('xbuttondown', () => {
      if(window.gameState.hasWeapon || !window.gameState.gameStarted || window.gameState.energy < 49) return;
      this.fireBlueOrb(false); // Azul Estático (Dura 5s)
    });

    // GRIP IZQUIERDO: Orbe Vórtice que jala maniquíes hacia el centro (Gasta 51 de Energía)
    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.gameStarted && window.gameState.energy >= 51) {
        this.fireBlueOrb(true); // Variante Vórtice Atractor
      }
    });

    // BOTÓN Y: Iniciar los 3 Rayos Cinemáticos de Carga del Rojo (Gasta 49 de Energía)
    this.el.addEventListener('ybuttondown', () => {
      if(window.gameState.hasWeapon || window.gameState.energy < 49 || !window.gameState.gameStarted) return;
      this.isChargingRed = true;
      this.chargeTimer = 0;
      window.GameAudio.play('charge_red');
      
      // ANIMACIÓN FIEL DEL ANIME: Empieza del aire (invisible), los 3 rayos helicoidales convergen girando salvajemente
      this.lightningSys.setAttribute('visible', 'true');
      this.core.setAttribute('material', 'opacity: 0.95; color: #ff0022;');
      this.core.setAttribute('scale', '0.1 0.1 0.1'); // Empieza del tamaño de un átomo
    });

    this.el.addEventListener('ybuttonup', () => {
      if(this.isChargingRed) {
        this.isChargingRed = false;
        this.lightningSys.setAttribute('visible', 'false');
        
        if(this.chargeTimer >= 1.5) {
          window.gameState.energy -= 49;
          this.updateHUDValues();
          this.launchRedCanica(); // Comprimido al tamaño de una canica hiperconcentrada
        } else {
          this.core.setAttribute('material', 'opacity: 0');
        }
      }
    });
  },

  tick: function(time, timeDelta) {
    if(this.isChargingRed) {
      this.chargeTimer += timeDelta / 1000;
      
      // Control de los 3 rayos girando en círculos convergentes hacia el centro
      let r1 = document.querySelector('#ray-1');
      let r2 = document.querySelector('#ray-2');
      let r3 = document.querySelector('#ray-3');
      let speedRot = time * 0.008;
      
      r1.setAttribute('position', `${Math.sin(speedRot)*0.12} 0.05 ${Math.cos(speedRot)*0.12}`);
      r2.setAttribute('position', `${Math.sin(speedRot + 2)*0.12} 0.05 ${Math.cos(speedRot + 2)*0.12}`);
      r3.setAttribute('position', `${Math.sin(speedRot + 4)*0.12} 0.05 ${Math.cos(speedRot + 4)*0.12}`);
      
      // Crece brevemente y se comprime instantáneamente a canica blanca incandescente
      if(this.chargeTimer > 0.9) {
        this.core.setAttribute('scale', '0.3 0.3 0.3');
        this.core.setAttribute('material', 'color: #ffffff; emissive: #ff0033;');
      } else {
        this.core.setAttribute('scale', '1.5 1.5 1.5');
      }
    }
  },

  fireBlueOrb: function(isVortex) {
    window.gameState.energy -= isVortex ? 51 : 49;
    this.updateHUDValues();

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
    
    red.setAttribute('geometry', {primitive: 'sphere', radius: 0.04}); // Tamaño exacto de una canica de plasma
    red.setAttribute('material', {color: '#ff0033', shader: 'flat'});
    red.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    red.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'red'});
    this.el.sceneEl.appendChild(red);
  },

  updateHUDValues: function() {
    document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + Math.max(0, window.gameState.energy) + '%;');
  }
});

// ================= SISTEMA INTEGRADO DE WAR OF WIZARDS (SISTEMA DE MANÁ Y HECHIZOS) =================
AFRAME.registerComponent('wizard-wand-system', {
  init: function() {
    let el = this.el;
    this.wandVisual = document.querySelector('#wizard-wand-visual');

    // Invocación: Grip Izquierdo + Botón Y manteniendo la mano libre
    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.mana >= 100 && !window.gameState.wandEquipped && window.gameState.gameStarted) {
        window.gameState.wandEquipped = true;
        window.gameState.spellsCastCount = 0;
        this.wandVisual.setAttribute('visible', 'true');
      }
    });

    // Trigger de la mano izquierda dibuja y dispara el hechizo de bola de fuego
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
    
    fb.setAttribute('geometry', {primitive: 'sphere', radius: 0.16});
    fb.setAttribute('material', {color: '#ffaa00', emissive: '#ff3300'});
    fb.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    fb.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'fireball'});
    this.el.sceneEl.appendChild(fb);
  }
});

// ================= FÍSICA DE PROYECTILES, MOVIMIENTO Y COLISIONES CRUZADAS =================
AFRAME.registerComponent('bullet-runtime', {
  schema: { dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}, type: {type:'string'} },
  init: function() {
    this.timer = 0;
    this.isStaticBlue = this.data.type === 'blue_static';
  },
  tick: function(time, timeDelta) {
    let obj = this.el.object3D;
    this.timer += timeDelta / 1000;

    // LÓGICA DE AZUL ESTÁTICO: Queda suspendido en el espacio por 5 segundos
    if (this.isStaticBlue) {
      if(this.timer < 0.25) {
        obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 12 * (timeDelta / 1000));
      }
      if(this.timer >= 5.0) {
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
      // COLISIÓN DE HECHIZOS: Si le pegas con un Rojo a este Azul se genera el Vacío Púrpura Estilo Nuke
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

    // AZUL DE ATRACCIÓN (VÓRTICE): Succiona a los maniquíes cercanos
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

    // Daño directo a enemigos
    let enemies = window.gameState.activeEnemies;
    for(let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      if(e && e.object3D && obj.position.distanceTo(e.object3D.position) < 1.3) {
        if(e.parentNode) e.parentNode.removeChild(e);
        enemies.splice(i, 1);
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
    }

    if(this.timer > 5.5 && this.el.parentNode) this.el.parentNode.removeChild(this.el);
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
