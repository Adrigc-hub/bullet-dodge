// Variable global para no machacar configuraciones externas
window.gameState = {
  gameStarted: false,
  energy: 100,
  mana: 100,
  hasWeapon: false,
  activeEnemies: [],
  groundWeapons: [],
  wandEquipped: false,
  spellsCastCount: 0
};

// ================= MOTOR DE AUDIO PROCEDURAL SIN DELAY =================
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
      osc.type = 'triangle'; osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'blue') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(450, t + 0.25);
      gain.gain.setValueAtTime(0.25, t); osc.start(t); osc.stop(t + 0.26);
    } else if (type === 'charge_red') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(650, t + 1.4);
      gain.gain.setValueAtTime(0.18, t); osc.start(t); osc.stop(t + 1.45);
    } else if (type === 'fireball') {
      osc.type = 'square'; osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.18);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.18);
    } else if (type === 'purple') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(350, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);
      gain.gain.setValueAtTime(0.6, t); osc.start(t); osc.stop(t + 0.6);
    }
  }
};

// ================= COMPONENTE DE SISTEMA DE MENÚ ORIGINAL =================
AFRAME.registerComponent('menu-system', {
  init: function () {
    let playBtn = document.querySelector('#btn-play');
    let tutorialBtn = document.querySelector('#btn-tutorial');
    let closeTutBtn = document.querySelector('#btn-close-tut');
    let returnBtn = document.querySelector('#exit-to-menu-btn');

    // Desencadenantes del click usando el raycaster mapeado
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.toggleMatchState(true);
      });
    }

    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => {
        document.querySelector('#mannequin-menu').setAttribute('visible', false);
        document.querySelector('#tutorial-screen').setAttribute('visible', true);
      });
    }

    if (closeTutBtn) {
      closeTutBtn.addEventListener('click', () => {
        document.querySelector('#tutorial-screen').setAttribute('visible', false);
        document.querySelector('#mannequin-menu').setAttribute('visible', true);
      });
    }

    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        this.toggleMatchState(false);
      });
    }
  },

  toggleMatchState: function(inGame) {
    window.gameState.gameStarted = inGame;
    
    document.querySelector('#mannequin-menu').setAttribute('visible', !inGame);
    document.querySelector('#game-world').setAttribute('visible', inGame);
    document.querySelector('#ingame-hud').setAttribute('visible', inGame);
    
    document.querySelector('#left-controller-mesh').setAttribute('visible', !inGame);
    document.querySelector('#right-controller-mesh').setAttribute('visible', !inGame);
    document.querySelector('#left-hand-mesh').setAttribute('visible', inGame);
    document.querySelector('#right-hand-mesh').setAttribute('visible', inGame);

    let rightHand = document.querySelector('#right-hand');
    if (inGame) {
      // Ajuste milimétrico para desactivar la línea del raycaster en combate y evitar colisiones falsas
      rightHand.setAttribute('raycaster', 'objects: .ground-weapon; far: 1.5; showLine: false'); 
      this.buildMannequinArena();
    } else {
      rightHand.setAttribute('raycaster', 'objects: .raycastable; far: 12; showLine: true');
      this.clearArena();
    }
  },

  buildMannequinArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    this.clearArena();

    // Spawn Procedural de Pistolas en el Suelo
    let weaponPositions = [{x: -1.5, z: -4}, {x: 2.0, z: -6}, {x: -0.2, z: -8}];
    weaponPositions.forEach(pos => {
      let w = document.createElement('a-entity');
      w.setAttribute('class', 'raycastable ground-weapon');
      w.setAttribute('position', `${pos.x} 0.15 ${pos.z}`);
      w.setAttribute('geometry', {primitive: 'box', width: 0.08, height: 0.08, depth: 0.25});
      w.setAttribute('material', {color: '#00ddff', shader: 'flat'});
      weaponContainer.appendChild(w);
      window.gameState.groundWeapons.push(w);
    });

    // Invocación de variantes originales (Estándar y Acechadores Ocultos)
    let npcConfigs = [
      {x: -3.8, z: -9, type: 'standard'},
      {x: 0, z: -13, type: 'stalker'}, // La variante oculta y difícil del video
      {x: 4.2, z: -8, type: 'standard'}
    ];
    
    npcConfigs.forEach(conf => {
      let npc = document.createElement('a-entity');
      npc.setAttribute('mannequin-npc-ai', {behavior: conf.type});
      npc.setAttribute('position', `${conf.x} 0 ${conf.z}`);
      enemyContainer.appendChild(npc);
    });
  },

  clearArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    if(enemyContainer) { while(enemyContainer.firstChild) { enemyContainer.removeChild(enemyContainer.firstChild); } }
    if(weaponContainer) { while(weaponContainer.firstChild) { weaponContainer.removeChild(weaponContainer.firstChild); } }
    window.gameState.activeEnemies = [];
    window.gameState.groundWeapons = [];
    window.gameState.hasWeapon = false;
    document.querySelector('#player-weapon-visual').setAttribute('visible', 'false');
    document.querySelector('#gojo-infinity-shield').setAttribute('visible', 'false');
  }
});

// ================= REPLICA GEOMÉTRICA DE LOS MANIQUÍES =================
AFRAME.registerComponent('mannequin-npc-ai', {
  schema: { behavior: {type: 'string', default: 'standard'} },
  init: function() {
    let el = this.el;
    window.gameState.activeEnemies.push(el);
    
    let modelColor = this.data.behavior === 'stalker' ? '#334155' : '#cbd5e1'; 
    
    // Construcción literal del modelo del maniquí (Cuerpo articulado articulado por primitivos)
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.11'); head.setAttribute('position', '0 1.55 0'); head.setAttribute('color', modelColor); el.appendChild(head);
    let neck = document.createElement('a-cylinder'); neck.setAttribute('radius', '0.03'); neck.setAttribute('height', '0.08'); neck.setAttribute('position', '0 1.42 0'); neck.setAttribute('color', '#475569'); el.appendChild(neck);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.14'); torso.setAttribute('height', '0.58'); torso.setAttribute('position', '0 1.05 0'); torso.setAttribute('color', '#1e293b'); el.appendChild(torso);
    
    let lArm = document.createElement('a-cylinder'); lArm.setAttribute('radius', '0.035'); lArm.setAttribute('height', '0.45'); lArm.setAttribute('position', '-0.18 1.1 -0.05'); lArm.setAttribute('rotation', '15 0 10'); lArm.setAttribute('color', modelColor); el.appendChild(lArm);
    let rArm = document.createElement('a-cylinder'); rArm.setAttribute('radius', '0.035'); rArm.setAttribute('height', '0.45'); rArm.setAttribute('position', '0.18 1.1 -0.05'); rArm.setAttribute('rotation', '15 0 -10'); rArm.setAttribute('color', modelColor); el.appendChild(rArm);
    
    let lLeg = document.createElement('a-cylinder'); lLeg.setAttribute('radius', '0.045'); lLeg.setAttribute('height', '0.6'); lLeg.setAttribute('position', '-0.07 0.45 0'); lLeg.setAttribute('color', '#0f172a'); el.appendChild(lLeg);
    let rLeg = document.createElement('a-cylinder'); rLeg.setAttribute('radius', '0.045'); rLeg.setAttribute('height', '0.6'); rLeg.setAttribute('position', '0.07 0.45 0'); rLeg.setAttribute('color', '#0f172a'); el.appendChild(rLeg);
    
    // Vincular soporte a texturas de textures.js si están disponibles en tiempo de ejecución
    if (window.TextureRegistry && typeof window.TextureRegistry.applyMannequinTexture === 'function') {
      window.TextureRegistry.applyMannequinTexture(el, this.data.behavior);
    }
  },
  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;

    let playerCam = document.querySelector('[camera]').object3D;
    let npcObj = this.el.object3D;
    
    let toNPC = new THREE.Vector3().subVectors(npcObj.position, playerCam.position).normalize();
    let camDir = new THREE.Vector3(); playerCam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1);
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    let isPlayerLooking = angle < 52; // Campo visual técnico

    if (this.data.behavior === 'stalker') {
      // El acechador inteligente: SOLO avanza cuando miras a otro lado
      if (!isPlayerLooking) {
        let dir = new THREE.Vector3().subVectors(playerCam.position, npcObj.position).normalize();
        npcObj.translateOnAxis(dir, 1.6 * (timeDelta / 1000));
        npcObj.position.y = 0;
      }
    } else {
      // Comportamiento base: Avanza lento al verse, corre en las sombras
      let moveSpeed = isPlayerLooking ? 0.35 : 1.9;
      let dir = new THREE.Vector3().subVectors(playerCam.position, npcObj.position).normalize();
      npcObj.translateOnAxis(dir, moveSpeed * (timeDelta / 1000));
      npcObj.position.y = 0;
    }
  }
});
