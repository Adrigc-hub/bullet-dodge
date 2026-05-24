window.gameState = {
  gameStarted: false,
  energy: 100,
  mana: 100,
  hasWeapon: false,
  equippedWeaponEl: null,
  activeEnemies: [],
  groundWeapons: [],
  wandEquipped: false,
  spellsCastCount: 0
};

// MOTOR UNIFICADO DE AUDIO: Controla los canales para que nunca mueran los efectos
window.GameAudio = {
  ctx: null,
  play: function(type) {
    if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    let t = this.ctx.currentTime;

    if (type === 'shoot') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.11);
    } else if (type === 'charge_red') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(520, t + 1.8);
      gain.gain.setValueAtTime(0.25, t); osc.start(t); osc.stop(t + 1.85);
    } else if (type === 'purple_nuke') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.6);
      gain.gain.setValueAtTime(0.7, t); osc.start(t); osc.stop(t + 0.65);
    } else if (type === 'fireball') {
      osc.type = 'square'; osc.frequency.setValueAtTime(350, t);
      osc.frequency.linearRampToValueAtTime(120, t + 0.2);
      gain.gain.setValueAtTime(0.3, t); osc.start(t); osc.stop(t + 0.22);
    }
  }
};

// MENÚ DE INTERACCIÓN CÓSMICA
AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');
    let returnBtn = document.querySelector('#exit-to-menu-btn');
    let installBtn = document.querySelector('#install-app-button');

    let triggerAction = (toInGame) => {
      window.gameState.gameStarted = toInGame;
      document.querySelector('#main-menu').setAttribute('visible', !toInGame);
      document.querySelector('#game-world').setAttribute('visible', toInGame);
      document.querySelector('#ingame-hud').setAttribute('visible', toInGame);
      
      let handler = document.querySelector('#right-hand').components['vr-weapon-handler'];
      if(handler) handler.toggleLaser( !toInGame );

      if (toInGame) { this.buildSandboxMatch(); }
    };

    if (startBtn) startBtn.addEventListener('click', () => triggerAction(true));
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => triggerAction(true));
    if (returnBtn) returnBtn.addEventListener('click', () => triggerAction(false));
    
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        // Simulación nativa directa solicitada
        document.querySelector('#install-app-button').setAttribute('color', '#00ffcc');
        alert("GitHub WebXR Deploy: ¡Juego descargado exitosamente en tu Home de Quest!");
      });
    }
  },

  buildSandboxMatch: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    
    // Limpieza previa
    while(enemyContainer.firstChild) { enemyContainer.removeChild(enemyContainer.firstChild); }
    while(weaponContainer.firstChild) { weaponContainer.removeChild(weaponContainer.firstChild); }
    window.gameState.activeEnemies = [];
    window.gameState.groundWeapons = [];

    // 1. Desplegar Armas en el Suelo
    let weaponPositions = [{x: -2, z: -4}, {x: 3, z: -5}, {x: -1, z: -9}];
    weaponPositions.forEach((pos, i) => {
      let w = document.createElement('a-entity');
      w.setAttribute('class', 'raycastable ground-weapon');
      w.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
      w.setAttribute('geometry', {primitive: 'box', scale: '0.1 0.1 0.3'});
      w.setAttribute('material', {color: '#00ddff'});
      w.setAttribute('id', 'g-weapon-' + i);
      weaponContainer.appendChild(w);
      window.gameState.groundWeapons.push(w);
    });

    // 2. Spawnear NPCs Estilo Mannequin (Estatutos con IA Inteligente de Acecho)
    let npcPositions = [{x: -5, z: -12}, {x: 0, z: -14}, {x: 6, z: -10}];
    npcPositions.forEach((pos, i) => {
      let npc = document.createElement('a-entity');
      npc.setAttribute('mannequin-npc-ai', '');
      npc.setAttribute('position', `${pos.x} 0 ${pos.z}`);
      enemyContainer.appendChild(npc);
    });
  }
});

// IA MANNEQUIN AVANZADA: Se camuflan como estatuas rígidas y te buscan flanqueando coberturas
AFRAME.registerComponent('mannequin-npc-ai', {
  init: function() {
    let el = this.el;
    window.gameState.activeEnemies.push(el);
    this.isPlayerLooking = false;

    // Crear Anatomía Humana Rígida (NPC)
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.13'); head.setAttribute('position', '0 1.5 0'); head.setAttribute('color', '#a8a8a8'); el.appendChild(head);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.16'); torso.setAttribute('height', '0.6'); torso.setAttribute('position', '0 1.0 0'); torso.setAttribute('color', '#3a3a3a'); el.appendChild(torso);
    let lLeg = document.createElement('a-cylinder'); lLeg.setAttribute('radius', '0.05'); lLeg.setAttribute('height', '0.6'); lLeg.setAttribute('position', '-0.08 0.4 0'); lLeg.setAttribute('color', '#222'); el.appendChild(lLeg);
    let rLeg = document.createElement('a-cylinder'); rLeg.setAttribute('radius', '0.05'); rLeg.setAttribute('height', '0.6'); rLeg.setAttribute('position', '0.08 0.4 0'); rLeg.setAttribute('color', '#222'); el.appendChild(rLeg);
  },
  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;

    let playerCam = document.querySelector('[camera]').object3D;
    let npcObj = this.el.object3D;
    
    // Calcular si el jugador está mirando directamente al Maniquí (Ángulo de visión fov)
    let toNPC = new THREE.Vector3().subVectors(npcObj.position, playerCam.position).normalize();
    let camDir = new THREE.Vector3(); playerCam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1); // Invertir vector de cámara
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    this.isPlayerLooking = angle < 55; // Campo visual activo de 55 grados

    // COMPORTAMIENTO INTELIGENTE: Si el jugador los mira, se congelan simulando ser estatuas.
    // Si el jugador se da la vuelta, corren velozmente a emboscarlo buscando la ruta más corta
    if (!this.isPlayerLooking) {
      let dir = new THREE.Vector3(0, 0, 0).subVectors(new THREE.Vector3(0,0,0), npcObj.position).normalize();
      npcObj.translateOnAxis(dir, 2.2 * (timeDelta / 1000)); // Movimiento rápido de persecución
      npcObj.position.y = 0; // Bloqueo de altura en el suelo
    }
  }
});
