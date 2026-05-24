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

// ================= SISTEMA AUTOMÁTICO DE RECONEXIÓN POR ACTUALIZACIÓN =================
const CODE_VERSION = "1.4.2"; // Cambia este string cada vez que edites el código

window.HotReloader = {
  checkUpdates: function() {
    // Almacenar el estado actual si el juego ya inició para no perder progreso
    if(window.gameState.gameStarted) {
      localStorage.setItem('quest_wizard_backup', JSON.stringify({
        energy: window.gameState.energy,
        mana: window.gameState.mana,
        inGame: true
      }));
    }

    // Monitoreo simulado de cambios en el servidor local/GitHub
    setInterval(() => {
      // En una infraestructura de desarrollo real, aquí se consulta un endpoint o websocket.
      // Si detectamos un desfase, disparamos la secuencia de auto-unión:
      let checkRemoteVersion = CODE_VERSION; 
      if (localStorage.getItem('force_update_trigger') === 'true') {
        localStorage.removeItem('force_update_trigger');
        this.executeReconnectionSequence();
      }
    }, 2000);
  },

  executeReconnectionSequence: function() {
    let screen = document.getElementById('hot-reload-screen');
    if(screen) screen.classList.add('active'); // Saca a los jugadores a la pantalla negra técnica

    setTimeout(() => {
      window.location.reload(); // Recarga la pestaña y renderiza el nuevo código
    }, 1000);
  },

  recoverSession: function() {
    let backup = localStorage.getItem('quest_wizard_backup');
    if(backup) {
      let data = JSON.parse(backup);
      localStorage.removeItem('quest_wizard_backup');
      
      // Auto-unión inmediata tras renderizar
      setTimeout(() => {
        let menuComp = document.querySelector('[menu-system]').components['menu-system'];
        if(menuComp) {
          window.gameState.energy = data.energy;
          window.gameState.mana = data.mana;
          menuComp.toggleMatchState(true);
        }
      }, 500);
    }
  }
};

// Iniciar rastreadores al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
  window.HotReloader.checkUpdates();
  window.HotReloader.recoverSession();
});

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
      osc.type = 'triangle'; osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.09);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'charge_red') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(95, t);
      osc.frequency.linearRampToValueAtTime(580, t + 1.5);
      gain.gain.setValueAtTime(0.18, t); osc.start(t); osc.stop(t + 1.55);
    } else if (type === 'purple_nuke') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(15, t + 0.5);
      gain.gain.setValueAtTime(0.55, t); osc.start(t); osc.stop(t + 0.52);
    } else if (type === 'fireball') {
      osc.type = 'square'; osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.18);
      gain.gain.setValueAtTime(0.2, t); osc.start(t); osc.stop(t + 0.2);
    }
  }
};

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');
    let returnBtn = document.querySelector('#exit-to-menu-btn');
    let installBtn = document.querySelector('#install-app-button');

    if (startBtn) startBtn.addEventListener('click', () => this.toggleMatchState(true));
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => this.toggleMatchState(true));
    if (returnBtn) returnBtn.addEventListener('click', () => this.toggleMatchState(false));
    
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        installBtn.setAttribute('color', '#00ffcc');
        // Comando útil para probar el auto-reload de forma manual desde las Quest:
        localStorage.setItem('force_update_trigger', 'true');
        alert("¡Ejecutando forzado de actualización! Guardando sesión y reiniciando...");
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
      rightHand.setAttribute('raycaster', 'objects: .none; far: 0.01'); // Apaga colisiones molestas del menú en juego
      this.buildMannequinArena();
    } else {
      rightHand.setAttribute('raycaster', 'objects: [data-clickable], .raycastable; far: 12');
      this.clearArena();
    }
  },

  buildMannequinArena: function() {
    let enemyContainer = document.querySelector('#enemy-container');
    let weaponContainer = document.querySelector('#ground-weapons-container');
    this.clearArena();

    let weaponPositions = [{x: -1.2, z: -3}, {x: 1.8, z: -4.5}, {x: -0.5, z: -7}];
    weaponPositions.forEach((pos, i) => {
      let w = document.createElement('a-entity');
      w.setAttribute('class', 'raycastable ground-weapon');
      w.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
      w.setAttribute('geometry', {primitive: 'box', width: 0.08, height: 0.08, depth: 0.25});
      w.setAttribute('material', {color: '#00ddff'});
      weaponContainer.appendChild(w);
      window.gameState.groundWeapons.push(w);
    });

    let npcPositions = [{x: -3.5, z: -9}, {x: 0, z: -12}, {x: 4.5, z: -8}];
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

AFRAME.registerComponent('mannequin-npc-ai', {
  init: function() {
    let el = this.el;
    window.gameState.activeEnemies.push(el);
    
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.12'); head.setAttribute('position', '0 1.5 0'); head.setAttribute('color', '#a8a8a8'); el.appendChild(head);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.15'); torso.setAttribute('height', '0.58'); torso.setAttribute('position', '0 0.95 0'); torso.setAttribute('color', '#3a3a3a'); el.appendChild(torso);
    let lLeg = document.createElement('a-cylinder'); lLeg.setAttribute('radius', '0.04'); lLeg.setAttribute('height', '0.55'); lLeg.setAttribute('position', '-0.07 0.38 0'); lLeg.setAttribute('color', '#222'); el.appendChild(lLeg);
    let rLeg = document.createElement('a-cylinder'); rLeg.setAttribute('radius', '0.04'); rLeg.setAttribute('height', '0.55'); rLeg.setAttribute('position', '0.07 0.38 0'); rLeg.setAttribute('color', '#222'); el.appendChild(rLeg);
  },
  tick: function(time, timeDelta) {
    if (!window.gameState.gameStarted) return;

    let playerCam = document.querySelector('[camera]').object3D;
    let npcObj = this.el.object3D;
    
    let toNPC = new THREE.Vector3().subVectors(npcObj.position, playerCam.position).normalize();
    let camDir = new THREE.Vector3(); playerCam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1);
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    let isPlayerLooking = angle < 50;

    if (!isPlayerLooking) {
      let dir = new THREE.Vector3(0, 0, 0).subVectors(new THREE.Vector3(0,0,0), npcObj.position).normalize();
      npcObj.translateOnAxis(dir, 1.9 * (timeDelta / 1000));
      npcObj.position.y = 0;
    }
  }
});
