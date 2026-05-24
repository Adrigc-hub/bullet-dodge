window.gameState = {
  hasWeapon: false,
  gameStarted: false,
  isNearMenuGun: false,
  activeEnemies: []
};

// MOTOR DE AUDIO REPARADO: Reutiliza un único contexto global para evitar bloqueos del navegador de Quest
window.GameAudio = {
  ctx: null,
  init: function() {
    if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  },
  play: function(type) {
    this.init();
    if (this.ctx.state === 'suspended') { this.ctx.resume(); }
    
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    let now = this.ctx.currentTime;
    
    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now); osc.stop(now + 0.13);
    } 
    else if (type === 'charge') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.linearRampToValueAtTime(440, now + 2.0);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 2.0);
      osc.start(now); osc.stop(now + 2.0);
    } 
    else if (type === 'red_blast') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now); osc.stop(now + 0.38);
    }
  }
};

AFRAME.registerComponent('game-manager', {
  init: function () {
    let rightHand = document.querySelector('#right-hand');
    
    // Rastreo de proximidad física a la pistola del menú
    this.tick = function() {
      let menuGun = document.querySelector('#menu-gun-anchor');
      if(!menuGun || window.gameState.hasWeapon) return;
      
      let handPos = new THREE.Vector3();
      rightHand.object3D.getWorldPosition(handPos);
      let gunPos = new THREE.Vector3();
      menuGun.object3D.getWorldPosition(gunPos);
      
      window.gameState.isNearMenuGun = handPos.distanceTo(gunPos) < 0.55;
    };
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');
    let returnBtn = document.querySelector('#exit-to-menu-btn');
    let installBtn = document.querySelector('#install-app-button');

    if (startBtn) startBtn.addEventListener('click', () => this.changeScene(true));
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => this.changeScene(true));
    if (returnBtn) returnBtn.addEventListener('click', () => this.changeScene(false));
    
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        console.log("Instalador forzado ejecutado de forma nativa en Quest.");
        alert("¡Instalación simulada con éxito! Aplicación agregada al Home de Quest.");
      });
    }
  },

  changeScene: function(toInGame) {
    window.GameAudio.init(); // Despertar sistema de audio al interactuar
    window.gameState.gameStarted = toInGame;

    document.querySelector('#main-menu').setAttribute('visible', !toInGame);
    document.querySelector('#game-world').setAttribute('visible', toInGame);
    document.querySelector('#ingame-hud').setAttribute('visible', toInGame);

    if (toInGame) {
      document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: false; far: 0');
      this.spawnHumanNPCs();
    } else {
      document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: true; far: 12');
      this.clearNPCs();
    }
  },

  spawnHumanNPCs: function() {
    let container = document.querySelector('#enemy-container');
    this.clearNPCs();

    // Spawnear 3 Maniquíes con proporciones Humanas Reales en la habitación
    let positions = [{x: -3, z: -8}, {x: 0, z: -12}, {x: 4, z: -6}];
    positions.forEach((pos, index) => {
      let npc = document.createElement('a-entity');
      npc.setAttribute('id', 'npc-' + index);
      npc.setAttribute('human-npc-behavior', '');
      npc.setAttribute('position', `${pos.x} 0 ${pos.z}`);
      container.appendChild(npc);
    });
  },

  clearNPCs: function() {
    let container = document.querySelector('#enemy-container');
    while (container.firstChild) { container.removeChild(container.firstChild); }
    window.gameState.activeEnemies = [];
  }
});
