window.gameState = {
  timeScale: 1.0,
  hasWeapon: false,
  gameStarted: false,
  isNearMenuGun: false
};

AFRAME.registerComponent('control-fix', {
  tick: function() {
    let menuGun = document.querySelector('#menu-gun');
    if(!menuGun || window.gameState.hasWeapon) return;
    
    let handPos = new THREE.Vector3();
    document.querySelector('#right-hand').object3D.getWorldPosition(handPos);
    let gunPos = new THREE.Vector3();
    menuGun.object3D.getWorldPosition(gunPos);
    
    window.gameState.isNearMenuGun = handPos.distanceTo(gunPos) < 0.5;
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');

    if(startBtn) startBtn.addEventListener('click', () => { this.startGame(); });
    if(sandboxBtn) sandboxBtn.addEventListener('click', () => { this.startGame(); });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    
    // Apagar la línea guía del láser al iniciar combate
    document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: false; far: 0');
    
    document.querySelector('#main-menu').setAttribute('visible', 'false');
    document.querySelector('#rear-menu').setAttribute('visible', 'false');
    document.querySelector('#game-elements').setAttribute('visible', 'true');
    document.querySelector('#enemy-target').emit('spawn');
  }
});
