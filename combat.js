// ================= MANEJO DE LA PISTOLA DE AGUA DE MANNEQUIN =================
AFRAME.registerComponent('vr-weapon-handler', {
  init: function() {
    let el = this.el;
    
    el.addEventListener('gripdown', () => {
      if(!window.gameState.gameStarted || window.gameState.hasWeapon) return;
      let handPos = new THREE.Vector3(); el.object3D.getWorldPosition(handPos);
      
      window.gameState.groundWeapons.forEach(w => {
        if(w && w.object3D) {
          let wPos = new THREE.Vector3(); w.object3D.getWorldPosition(wPos);
          if(handPos.distanceTo(wPos) < 0.7) {
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
      b.setAttribute('material', {color: '#22d3ee', shader: 'flat'});
      b.setAttribute('position', pos);
      dir.multiplyScalar(-1);
      
      b.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'water'});
      this.el.sceneEl.appendChild(b);
    });
  }
});

// ================= ARSENAL DE TÉCNICAS JUJUTSU (ANIMA ROJO, HACE AZUL Y PÚRPURA) =================
AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isChargingRed = false;
    this.chargeTimer = 0;
    this.activeChargeGroup = null;

    // Lanzamiento del Orbe Azul Instantáneo (Botón X)
    this.el.addEventListener('xbuttondown', () => {
      if(window.gameState.hasWeapon || !window.gameState.gameStarted || window.gameState.energy < 35) return;
      window.GameAudio.play('blue');
      this.fireBlueOrb();
    });

    // Carga de la Inversión de Técnica: Rojo Estilo Canica (Botón Y)
    this.el.addEventListener('ybuttondown', () => {
      if(window.gameState.hasWeapon || window.gameState.energy < 45 || !window.gameState.gameStarted) return;
      this.isChargingRed = true;
      this.chargeTimer = 0;
      window.GameAudio.play('charge_red');

      // Crear grupo contenedor local sin colisiones estáticas para la animación procedural
      this.activeChargeGroup = document.createElement('a-entity');
      this.activeChargeGroup.setAttribute('position', '0 0.05 -0.15');
      this.el.appendChild(this.activeChargeGroup);

      // Crear hilos de energía rotativos (Aire inicial)
      this.rayCore1 = document.createElement('a-cylinder');
      this.rayCore1.setAttribute('radius', '0.006');
      this.rayCore1.setAttribute('height', '0.22');
      this.rayCore1.setAttribute('color', '#ff0044');
      this.rayCore1.setAttribute('material', 'shader: flat');
      this.activeChargeGroup.appendChild(this.rayCore1);

      this.rayCore2 = document.createElement('a-cylinder');
      this.rayCore2.setAttribute('radius', '0.006');
      this.rayCore2.setAttribute('height', '0.22');
      this.rayCore2.setAttribute('color', '#ff6b6b');
      this.rayCore2.setAttribute('material', 'shader: flat');
      this.activeChargeGroup.appendChild(this.rayCore2);

      // Núcleo central
      this.dynamicCore = document.createElement('a-sphere');
      this.dynamicCore.setAttribute('radius', '0.01');
      this.dynamicCore.setAttribute('color', '#ff0000');
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
          window.gameState.energy -= 45;
          document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + window.gameState.energy + '%;');
          this.launchRedCanica();
        }
      }
    });
  },

  tick: function(time, timeDelta) {
    // Animación procedural hiper-fluida del Rojo pasando de "Aire" a "Canica"
    if(this.isChargingRed && this.activeChargeGroup) {
      this.chargeTimer += timeDelta / 1000;
      let rotSpeed = time * 0.012;
      
      // Espiral de contracción de energía
      let radiusOffset = Math.max(0.015, 0.12 - (this.chargeTimer * 0.07));
      if(this.rayCore1) this.rayCore1.setAttribute('position', `${Math.sin(rotSpeed)*radiusOffset} 0 ${Math.cos(rotSpeed)*radiusOffset}`);
      if(this.rayCore2) this.rayCore2.setAttribute('position', `${Math.sin(rotSpeed + Math.PI)*radiusOffset} 0 ${Math.cos(rotSpeed + Math.PI)*radiusOffset}`);
      
      // Compresión final: Se convierte en una canica blanca incandescente de alto brillo
      if(this.chargeTimer >= 0.8 && this.dynamicCore) {
        this.dynamicCore.setAttribute('radius', '0.032');
        this.dynamicCore.setAttribute('material', 'color: #ffffff; emissive: #ff0033; shader: flat');
      }
    }
  },

  fireBlueOrb: function() {
    let blue = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    blue.setAttribute('geometry', {primitive: 'sphere', radius: 0.14});
    blue.setAttribute('material', {color: '#1d4ed8', shader: 'flat'});
    blue.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    blue.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'blue_orbe'});
    this.el.sceneEl.appendChild(blue);
  },

  launchRedCanica: function() {
    let red = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    red.setAttribute('geometry', {primitive: 'sphere', radius: 0.045});
    red.setAttribute('material', {color: '#ef4444', shader: 'flat'});
    red.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    red.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'red_canica'});
    this.el.sceneEl.appendChild(red);
  }
});

// SISTEMA DE HECHIZOS EXTRA (VARITA DE MAGO COMPATIBLE)
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
      document.querySelector('#hud-mana-text').setAttribute('text', 'value: MANA / HECHIZOS: ' + Math.max(0, window.gameState.mana) + '%;');
      window.GameAudio.play('fireball');
      
      let fb = document.createElement('a-entity');
      let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
      this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
      fb.setAttribute('geometry', {primitive: 'sphere', radius: 0.12});
      fb.setAttribute('material', {color: '#f97316'});
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

// ================= OPERACIONES EN CURSO DE BALAS Y EVENTO PÚRPURA =================
AFRAME.registerComponent('bullet-runtime', {
  schema: { dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}, type: {type:'string'} },
  init: function() { 
    this.timer = 0; 
    this.isBlue = this.data.type === 'blue_orbe';
  },
  tick: function(time, timeDelta) {
    let obj = this.el.object3D;
    this.timer += timeDelta / 1000;

    // Configuración de velocidades dinámicas por variante
    let bulletSpeed = 16;
    if (this.data.type === 'red_canica') bulletSpeed = 34;
    if (this.data.type === 'purple_nuke') bulletSpeed = 12;

    obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), bulletSpeed * (timeDelta / 1000));

    // LÓGICA DE FUSIÓN PARA LOGRAR EL PÚRPURA
    if (this.isBlue) {
      let activeProjectiles = document.querySelectorAll('[bullet-runtime]');
      activeProjectiles.forEach(p => {
        if (p !== this.el && p.components['bullet-runtime'].data.type === 'red_canica') {
          if (obj.position.distanceTo(p.object3D.position) < 0.75) {
            // Detonación cruzada y nacimiento del Vacío Púrpura
            this.generatePurpleVoid(obj.position);
            if(p.parentNode) p.parentNode.removeChild(p);
            if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
          }
        }
      });
    }

    // Impacto fulminante contra Maniquíes
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

    // Destrucción por rango límite
    if(this.timer > 4.5 && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  generatePurpleVoid: function(impactPos) {
    window.GameAudio.play('purple');
    
    let purpleBall = document.createElement('a-entity');
    purpleBall.setAttribute('position', impactPos);
    purpleBall.setAttribute('geometry', {primitive: 'sphere', radius: 0.35});
    purpleBall.setAttribute('material', {color: '#a855f7', shader: 'flat'});
    
    // El Púrpura hereda el vector de avance destructivo hacia adelante
    purpleBall.setAttribute('bullet-runtime', {dx: this.data.dx, dy: this.data.dy, dz: this.data.dz, type: 'purple_nuke'});
    this.el.sceneEl.appendChild(purpleBall);

    // Onda expansiva de impacto
    let wave = document.createElement('a-sphere');
    wave.setAttribute('position', impactPos);
    wave.setAttribute('radius', '0.6');
    wave.setAttribute('material', {color: '#c084fc', transparent: true, opacity: 0.8, shader: 'flat'});
    wave.setAttribute('animation', 'property: scale; to: 12 12 12; dur: 550; easing: easeOutQuad');
    this.el.sceneEl.appendChild(wave);

    setTimeout(() => {
      let enemies = window.gameState.activeEnemies;
      for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if(e && e.object3D && impactPos.distanceTo(e.object3D.position) < 7.5) {
          if(e.parentNode) e.parentNode.removeChild(e);
          enemies.splice(i, 1);
        }
      }
      if(wave.parentNode) wave.parentNode.removeChild(wave);
    }, 550);
  }
});
