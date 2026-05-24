// CONTROLADOR DE ARMAS (MANO DERECHA)
AFRAME.registerComponent('vr-weapon-handler', {
  init: function() {
    let el = this.el;
    
    el.addEventListener('gripdown', () => {
      if(!window.gameState.gameStarted) return;
      // Recoger armas del suelo por proximidad táctica
      let handPos = new THREE.Vector3(); el.object3D.getWorldPosition(handPos);
      
      window.gameState.groundWeapons.forEach(w => {
        if(w && w.object3D) {
          let wPos = new THREE.Vector3(); w.object3D.getWorldPosition(wPos);
          if(handPos.distanceTo(wPos) < 0.6 && !window.gameState.hasWeapon) {
            window.gameState.hasWeapon = true;
            w.setAttribute('visible', 'false');
            document.querySelector('#player-weapon-visual').setAttribute('visible', 'true');
            document.querySelector('#gojo-infinity-shield').setAttribute('visible', 'true'); // Infinito condicional activo
          }
        }
      });
    });

    el.addEventListener('triggerdown', () => {
      if(!window.gameState.hasWeapon || !window.gameState.gameStarted) return;
      // Disparo clásico de la pistola de agua
      window.GameAudio.play('shoot');
      this.spawnWaterBullet();
    });
  },
  toggleLaser: function(state) {
    this.el.setAttribute('raycaster', {showLine: state, far: state ? 12 : 0});
  },
  spawnWaterBullet: function() {
    let b = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    b.setAttribute('geometry', {primitive: 'sphere', radius: 0.03});
    b.setAttribute('material', {color: '#00ffff'});
    b.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    b.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'water'});
    this.el.sceneEl.appendChild(b);
  }
});

// ================= HECHICERÍA DE GOJO COMPLETA (MANO IZQUIERDA) =================
AFRAME.registerComponent('gojo-left-skills', {
  init: function() {
    this.isChargingRed = false;
    this.chargeTimer = 0;
    this.lightningSys = document.querySelector('#red-lightning-system');
    this.core = document.querySelector('#red-core');

    // Mapeo de botones de Oculus Quest para Hechizos Cruzados sin Arma
    this.el.addEventListener('xbuttondown', () => {
      if(window.gameState.hasWeapon || !window.gameState.gameStarted) return;
      
      // CASO A: Lanzar "Azul" Estático (Gasta 49 de Energía Maldita, requiere 50+)
      if (window.gameState.energy >= 50 && !this.isChargingRed) {
        this.fireBlueAttraction(false); // Fuego Azul Estático
      }
    });

    // CASO B: Orbe de Atracción Activa (A + Grip Izquierdo) - Gasta 51 de energía
    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.energy >= 51 && window.gameState.gameStarted) {
        this.fireBlueAttraction(true); // Variante de Atracción
      }
    });

    // CASO C: Iniciar Carga Cinemática del "Rojo" (Gasta 49 Energía Maldita)
    this.el.addEventListener('ybuttondown', () => {
      if(window.gameState.hasWeapon || window.gameState.energy < 49 || !window.gameState.gameStarted) return;
      this.isChargingRed = true;
      this.chargeTimer = 0;
      window.GameAudio.play('charge_red');
      
      // EFECTO ANIME CORREGIDO: Los 3 rayos helicoidales orbitan generando la energía cósmica
      this.lightningSys.setAttribute('visible', 'true');
      this.core.setAttribute('material', 'opacity: 0.9; color: #ff0022; radius: 0.01');
    });

    this.el.addEventListener('ybuttonup', () => {
      if(this.isChargingRed) {
        this.isChargingRed = false;
        this.lightningSys.setAttribute('visible', 'false');
        
        if(this.chargeTimer >= 1.6) {
          // El núcleo se compacta al tamaño de una canica hiperconcentrada y sale disparado
          window.gameState.energy -= 49;
          this.updateHUD();
          this.launchRedCanica();
        } else {
          this.core.setAttribute('material', 'opacity: 0');
        }
      }
    });
  },

  tick: function(time, timeDelta) {
    if(this.isChargingRed) {
      this.chargeTimer += timeDelta / 1000;
      
      // Rotar y contraer los 3 rayos helicoidales estilo Gojo de forma matemática pura
      let r1 = document.querySelector('#ray-1');
      let r2 = document.querySelector('#ray-2');
      let r3 = document.querySelector('#ray-3');
      let rot = time * 0.6;
      
      r1.setAttribute('position', `${Math.sin(rot)*0.15} 0.05 ${Math.cos(rot)*0.15}`);
      r2.setAttribute('position', `${Math.sin(rot + 2)*0.15} 0.05 ${Math.cos(rot + 2)*0.15}`);
      r3.setAttribute('position', `${Math.sin(rot + 4)*0.15} 0.05 ${Math.cos(rot + 4)*0.15}`);
    }
  },

  fireBlueAttraction: function(isVortex) {
    window.gameState.energy -= isVortex ? 51 : 49;
    this.updateHUD();

    let blue = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    blue.setAttribute('geometry', {primitive: 'sphere', radius: isVortex ? 0.22 : 0.15});
    blue.setAttribute('material', {color: '#0055ff', emissive: '#00aaff', shader: 'flat'});
    blue.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    blue.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: isVortex ? 'blue_vortex' : 'blue_static'});
    this.el.sceneEl.appendChild(blue);
  },

  launchRedCanica: function() {
    let red = document.createElement('a-entity');
    let pos = new THREE.Vector3(); let dir = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos); this.el.object3D.getWorldDirection(dir);
    
    // Proyecciones de canica ultra compacta
    red.setAttribute('geometry', {primitive: 'sphere', radius: 0.04});
    red.setAttribute('material', {color: '#ff0033', shader: 'flat'});
    red.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    red.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'red'});
    this.el.sceneEl.appendChild(red);
  },

  updateHUD: function() {
    document.querySelector('#hud-energy-text').setAttribute('text', 'value: ENERGIA MALDITA: ' + Math.max(0, window.gameState.energy) + '%;');
  }
});

// ================= SISTEMA INTEGRADO DE WAR OF WIZARDS (SISTEMA MANÁ) =================
AFRAME.registerComponent('wizard-wand-system', {
  init: function() {
    let el = this.el;
    this.wandVisual = document.querySelector('#wizard-wand-visual');

    // Gesto e Invocación cruzada: Grip Izquierdo + Botón Y manteniendo la mano arriba de la derecha
    this.el.addEventListener('gripdown', () => {
      if(!window.gameState.hasWeapon && window.gameState.mana >= 100 && !window.gameState.wandEquipped && window.gameState.gameStarted) {
        window.gameState.wandEquipped = true;
        window.gameState.spellsCastCount = 0;
        this.wandVisual.setAttribute('visible', 'true');
      }
    });

    // Dibujo / Casatación de Hechizo con botón superior del Grip (Trigger Izquierdo)
    this.el.addEventListener('triggerdown', () => {
      if(!window.gameState.wandEquipped) return;

      window.gameState.spellsCastCount++;
      window.gameState.mana -= 34; // Permite exactamente 3 tiros antes de vaciar los 100 de Maná
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
    
    // Modelo réplica exacta de bola de fuego de War of Wizards
    fb.setAttribute('geometry', {primitive: 'sphere', radius: 0.16});
    fb.setAttribute('material', {color: '#ffaa00', emissive: '#ff3300'});
    fb.setAttribute('position', pos);
    dir.multiplyScalar(-1);
    
    fb.setAttribute('bullet-runtime', {dx: dir.x, dy: dir.y, dz: dir.z, type: 'fireball'});
    this.el.sceneEl.appendChild(fb);
  }
});

// ================= RUNTIME Y FÍSICA AVANZADA DE PROYECTILES =================
AFRAME.registerComponent('bullet-runtime', {
  schema: { dx: {type:'number'}, dy: {type:'number'}, dz: {type:'number'}, type: {type:'string'} },
  init: function() {
    this.timer = 0;
    this.isStaticBlue = this.data.type === 'blue_static';
  },
  tick: function(time, timeDelta) {
    let obj = this.el.object3D;
    this.timer += timeDelta / 1000;

    // LÓGICA DE AZUL ESTÁTICO: Se congela en el lugar por 5 segundos exactos
    if (this.isStaticBlue) {
      if(this.timer < 0.3) {
        obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 12 * (timeDelta / 1000));
      }
      if(this.timer >= 5.0) {
        if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
        return;
      }
      // Verificar colisión cruzada si un "Rojo" entra en contacto con este Azul Estático para detonar un PÚRPURA (Hollow Nuke)
      let allProjectiles = document.querySelectorAll('[bullet-runtime]');
      allProjectiles.forEach(p => {
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

    // VARIANTE AZUL VORTEX: Atrae a todos los NPCs Mannequin hacia su centro gravitatorio gravitacional
    if (this.data.type === 'blue_vortex') {
      obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), 9 * (timeDelta / 1000));
      window.gameState.activeEnemies.forEach(e => {
        if(e.object3D && obj.position.distanceTo(e.object3D.position) < 4.0) {
          let pullDir = new THREE.Vector3().subVectors(obj.position, e.object3D.position).normalize();
          e.object3D.translateOnAxis(pullDir, 4.5 * (timeDelta / 1000)); // Atracción forzada
        }
      });
    } else {
      // Movimiento estándar de balas rectilíneas
      let speed = (this.data.type === 'red') ? 38 : 18;
      obj.translateOnAxis(new THREE.Vector3(this.data.dx, this.data.dy, this.data.dz).normalize(), speed * (timeDelta / 1000));
    }

    // Colisiones del Proyectil contra NPCs de Mannequin Inteligentes
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

    if(this.timer > 6.0 && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  detonatePurpleNuke: function(impactPos) {
    window.GameAudio.play('purple_nuke');
    let explosion = document.createElement('a-sphere');
    explosion.setAttribute('position', impactPos);
    explosion.setAttribute('radius', '0.5');
    explosion.setAttribute('material', {color: '#9900ff', shader: 'flat', transparent: true, opacity: 0.85});
    // Onda expansiva gigante destructiva por escala
    explosion.setAttribute('animation', 'property: scale; to: 14 14 14; dur: 600; easing: easeOutQuad');
    this.el.sceneEl.appendChild(explosion);

    // Liquidar instantáneamente a todos los maniquíes en el área del mapa
    setTimeout(() => {
      let enemies = window.gameState.activeEnemies;
      for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if(e && e.object3D && impactPos.distanceTo(e.object3D.position) < 8.0) {
          if(e.parentNode) e.parentNode.removeChild(e);
          enemies.splice(i, 1);
        }
      }
      if(explosion.parentNode) explosion.parentNode.removeChild(explosion);
    }, 600);
  }
});
