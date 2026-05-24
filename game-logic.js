window.gameState = {
  timeScale: 1.0,
  score: 0,
  hasWeapon: false,
  gameStarted: false,
  isNearMenuGun: false
};

AFRAME.registerComponent('control-fix', {
  init: function () {
    let sceneEl = this.el.sceneEl;
    let rightHand = document.querySelector('#right-hand');

    sceneEl.addEventListener('enter-vr', () => {
      document.querySelector('#rig').setAttribute('movement-controls', 'controls: gamepad; speed: 0.20');
    });

    // Detectar proximidad física al arma usando la distancia del objeto 3D
    this.menuGun = document.querySelector('#menu-gun');
  },
  tick: function() {
    if(!this.menuGun || window.gameState.hasWeapon) return;
    
    let handPos = new THREE.Vector3();
    document.querySelector('#right-hand').object3D.getWorldPosition(handPos);
    let gunPos = new THREE.Vector3();
    this.menuGun.object3D.getWorldPosition(gunPos);
    
    // Si la mano está a menos de 45 centímetros del arma, se activa la flag de agarre
    window.gameState.isNearMenuGun = handPos.distanceTo(gunPos) < 0.45;
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');

    // Escuchadores de eventos nativos del puntero láser (Raycaster de A-Frame)
    if(startBtn) startBtn.addEventListener('click', () => { this.startGame(); });
    if(sandboxBtn) sandboxBtn.addEventListener('click', () => { this.startGame(); });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    
    // Apagar el láser visual para que no estorbe en los disparos
    document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: false; far: 0');
    
    document.querySelector('#main-menu').setAttribute('visible', 'false');
    document.querySelector('#rear-menu').setAttribute('visible', 'false');
    document.querySelector('#game-elements').setAttribute('visible', 'true');
    document.querySelector('#enemy-target').emit('spawn');
  }
});
