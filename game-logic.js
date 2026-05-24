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

// MOTOR UNIFICADO DE AUDIO INMORTAL
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
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'charge_red') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(550, t + 1.6);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 1.65);
    } else if (type === 'purple_nuke') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
      gain.gain.setValueAtTime(0.6, t); osc.start(t); osc.stop(t + 0.55);
    } else if (type === 'fireball') {
      osc.type = 'square'; osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.25, t); osc.start(t); osc.stop(t + 0.22);
    }
  }
};

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');
    let returnBtn = document.querySelector('#exit-to-menu-btn');
    let installBtn = document.querySelector('#install-app-button');

    let toggleMatchState = (inGame) => {
      window.gameState.gameStarted = inGame;
      
      // Control de interfaces del canvas
      document.querySelector('#main-menu').setAttribute('visible', !inGame);
      document.querySelector('#game-world').setAttribute('visible', inGame);
      document.querySelector('#ingame-hud').setAttribute('visible', inGame);
      
      // SWAP VISUAL: Cambiar Mandos por Manos Reales sin romper los componentes
      document.querySelector('#left-controller-mesh').setAttribute('visible', !inGame);
      document.querySelector('#right-controller-mesh').setAttribute('visible', !inGame);
      document.querySelector('#left-hand-mesh').setAttribute('visible', inGame);
      document.querySelector('#right-hand-mesh').setAttribute('visible', inGame);

      // Activar o congelar el puntero raycaster del menú de forma limpia
      let rightHand = document.querySelector('#right-hand');
      if (inGame) {
        rightHand.setAttribute('raycaster', 'showLine: false; far: 0.01');
        this.buildMannequinArena();
      } else {
        rightHand.setAttribute('raycaster', 'showLine: true; far: 12');
        this.clearArena();
      }
    };

    if (startBtn) startBtn.addEventListener('click', () => toggleMatchState(true));
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => toggleMatchState(true));
    if (returnBtn) returnBtn.addEventListener('click', () => toggleMatchState(false));
    
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        installBtn.setAttribute('color', '#00ffcc');
        alert("GitHub WebXR: ¡Juego descargado exitosamente en tu Home de Quest!");
      });
    }
  },

  buildMannequinArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    this.clearArena();

    // Spawnear 3 pistolas en el suelo
    let weaponPositions = [{x: -1.5, z: -3.5}, {x: 2, z: -5}, {x: -0.5, z: -8}];
    weaponPositions.forEach((pos, i) => {
      let w = document.createElement('a-entity');
      w.setAttribute('class', 'raycastable ground-weapon');
      w.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
      w.setAttribute('geometry', {primitive: 'box', width: 0.08, height: 0.08, depth: 0.25});
      w.setAttribute('material', {color: '#00ddff'});
      weaponContainer.appendChild(w);
      window.gameState.groundWeapons.push(w);
    });

    // Spawnear NPCs inteligentes de Mannequin
    let npcPositions = [{x: -4, z: -10}, {x: 0, z: -13}, {x: 5, z: -9}];
    npcPositions.forEach(pos => {
      let npc = document.createElement('a-entity');
      npc.setAttribute('mannequin-npc-ai', '');
      npc.setAttribute('position', `${pos.x} 0 ${pos.z}`);
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

// IA INTELIGENTE MANNEQUIN: Te persigue flanqueando únicamente si no lo estás mirando
AFRAME.registerComponent('mannequin-npc-ai', {
  init: function() {
    let el = this.el;
    window.gameState.activeEnemies.push(el);
    
    // Rig Humano Real
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.13'); head.setAttribute('position', '0 1.5 0'); head.setAttribute('color', '#a8a8a8'); el.appendChild(head);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.16'); torso.setAttribute('height', '0.6'); torso.setAttribute('position', '0 1.0 0'); torso.setAttribute('color', '#3a3a3a'); el.appendChild(torso);
    let lLeg = document.createElement('a-cylinder'); lLeg.setAttribute('radius', '0.05'); lLeg.setAttribute('height', '0.6'); lLeg.setAttribute('position', '-0.08 0.4 0'); lLeg.setAttribute('color', '#222'); el.appendChild(lLeg);
    let rLeg = document.createElement('a-cylinder'); rLeg.setAttribute('radius', '0.05'); rLeg.setAttribute('height', '0.6'); rLeg.setAttribute('position', '0.08 0.4 0'); rLeg.setAttribute('color', '#222'); el.appendChild(rLeg);
  },
  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;

    let playerCam = document.querySelector('[camera]').object3D;
    let npcObj = this.el.object3D;
    
    let toNPC = new THREE.Vector3().subVectors(npcObj.position, playerCam.position).normalize();
    let camDir = new THREE.Vector3(); playerCam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1);
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    let isPlayerLooking = angle < 55; // Campo de visión directo del Quest

    if (!isPlayerLooking) {
      let dir = new THREE.Vector3(0, 0, 0).subVectors(new THREE.Vector3(0,0,0), npcObj.position).normalize();
      npcObj.translateOnAxis(dir, 2.0 * (timeDelta / 1000));
      npcObj.position.y = 0;
    }
  }
});
