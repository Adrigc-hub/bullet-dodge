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

// Generador de audio procedural para efectos sin retardo
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
      osc.type = 'triangle'; osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'charge') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(600, t + 1.5);
      gain.gain.setValueAtTime(0.15, t); osc.start(t); osc.stop(t + 1.5);
    } else if (type === 'fireball') {
      osc.type = 'square'; osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.2);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.2);
    }
  }
};

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let tutorialBtn = document.querySelector('#tutorial-button');
    let closeTutorialBtn = document.querySelector('#close-tutorial-btn');
    let returnBtn = document.querySelector('#exit-to-menu-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.toggleMatchState(true));
    if (returnBtn) returnBtn.addEventListener('click', () => this.toggleMatchState(false));
    
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => {
        document.querySelector('#main-menu').setAttribute('visible', false);
        document.querySelector('#tutorial-panel').setAttribute('visible', true);
      });
    }

    if (closeTutorialBtn) {
      closeTutorialBtn.addEventListener('click', () => {
        document.querySelector('#tutorial-panel').setAttribute('visible', false);
        document.querySelector('#main-menu').setAttribute('visible', true);
      });
    }
  },

  toggleMatchState: function(inGame) {
    window.gameState.gameStarted = inGame;
    
    document.querySelector('#main-menu').setAttribute('visible', !inGame);
    document.querySelector('#game-world').setAttribute('visible', inGame);
    document.querySelector('#ingame-hud').setAttribute('visible', inGame);
    
    document.querySelector('#left-controller-mesh').setAttribute('visible', !inGame);
    document.querySelector('#right-controller-mesh').setAttribute('visible', !inGame);
    document.querySelector('#left-hand-mesh').setAttribute('visible', inGame);
    document.querySelector('#right-hand-mesh').setAttribute('visible', inGame);

    let rightHand = document.querySelector('#right-hand');
    if (inGame) {
      rightHand.setAttribute('raycaster', 'objects: .none; far: 0.01'); // Apagar puntero láser molesto al combatir
      this.buildMannequinArena();
    } else {
      rightHand.setAttribute('raycaster', 'objects: [data-clickable], .raycastable; far: 10');
      this.clearArena();
    }
  },

  buildMannequinArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    this.clearArena();

    // Spawn de armas (Estilo Mannequin original)
    let weaponPositions = [{x: -1, z: -3}, {x: 2, z: -5}];
    weaponPositions.forEach(pos => {
      let w = document.createElement('a-entity');
      w.setAttribute('class', 'raycastable ground-weapon');
      w.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
      w.setAttribute('geometry', {primitive: 'box', width: 0.08, height: 0.08, depth: 0.25});
      w.setAttribute('material', {color: '#00ddff'});
      weaponContainer.appendChild(w);
      window.gameState.groundWeapons.push(w);
    });

    // Spawn de enemigos variantes (Estándar y el Acechador Sigiloso inteligente)
    let npcPositions = [
      {x: -3, z: -8, type: 'standard'},
      {x: 0, z: -11, type: 'stalker'}, // ¡Esta es la variante difícil que se esconde y te caza de espaldas!
      {x: 4, z: -7, type: 'standard'}
    ];
    
    npcPositions.forEach(config => {
      let npc = document.createElement('a-entity');
      npc.setAttribute('mannequin-npc-ai', {behavior: config.type});
      npc.setAttribute('position', `${config.x} 0 ${config.z}`);
      enemyContainer.appendChild(npc);
    });
  },

  clearArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    while(enemyContainer.firstChild) { enemyContainer.removeChild(enemyContainer.firstChild); }
    while(weaponContainer.firstChild) { weaponContainer.removeChild(weaponContainer.firstChild); }
    window.gameState.activeEnemies = [];
    window.gameState.groundWeapons = [];
    window.gameState.hasWeapon = false;
    document.querySelector('#player-weapon-visual').setAttribute('visible', 'false');
    document.querySelector('#gojo-infinity-shield').setAttribute('visible', 'false');
  }
});

// IA DE COMPORTAMIENTO INTELIGENTE DE LOS MANIQUÍES
AFRAME.registerComponent('mannequin-npc-ai', {
  schema: { behavior: {type: 'string', default: 'standard'} },
  init: function() {
    let el = this.el;
    window.gameState.activeEnemies.push(el);
    
    // Apariencia geométrica limpia de maniquí
    let colorManiqui = this.data.behavior === 'stalker' ? '#555566' : '#a8a8a8'; // El acechador es más oscuro
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.12'); head.setAttribute('position', '0 1.5 0'); head.setAttribute('color', colorManiqui); el.appendChild(head);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.14'); torso.setAttribute('height', '0.55'); torso.setAttribute('position', '0 0.95 0'); torso.setAttribute('color', '#333333'); el.appendChild(torso);
    let lLeg = document.createElement('a-cylinder'); lLeg.setAttribute('radius', '0.04'); lLeg.setAttribute('height', '0.5'); lLeg.setAttribute('position', '-0.06 0.35 0'); lLeg.setAttribute('color', '#111'); el.appendChild(lLeg);
    let rLeg = document.createElement('a-cylinder'); rLeg.setAttribute('radius', '0.04'); rLeg.setAttribute('height', '0.5'); rLeg.setAttribute('position', '0.06 0.35 0'); rLeg.setAttribute('color', '#111'); el.appendChild(rLeg);
  },
  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;

    let playerCam = document.querySelector('[camera]').object3D;
    let npcObj = this.el.object3D;
    
    let toNPC = new THREE.Vector3().subVectors(npcObj.position, playerCam.position).normalize();
    let camDir = new THREE.Vector3(); playerCam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1); // Invertir vector de cámara nativo
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    let isPlayerLooking = angle < 55; // Campo de visión de detección del jugador

    // LÓGICA DE MANNEQUIN CRUCIAL:
    if (this.data.behavior === 'stalker') {
      // El acechador sigiloso avanzado: Solo avanza si NO lo estás mirando.
      if (!isPlayerLooking) {
        let dir = new THREE.Vector3().subVectors(playerCam.position, npcObj.position).normalize();
        npcObj.translateOnAxis(dir, 1.4 * (timeDelta / 1000)); // Movimiento sigiloso y constante
        npcObj.position.y = 0; // Mantener los pies pegados al piso
      }
    } else {
      // Maniquí estándar: Te persigue de todas formas pero frena levemente al contacto visual
      let speed = isPlayerLooking ? 0.4 : 1.8;
      let dir = new THREE.Vector3().subVectors(playerCam.position, npcObj.position).normalize();
      npcObj.translateOnAxis(dir, speed * (timeDelta / 1000));
      npcObj.position.y = 0;
    }
  }
});
