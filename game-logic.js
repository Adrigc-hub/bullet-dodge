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

    // Desactivar el rayo láser de selección automática en cuanto empiece el juego para que no estorbe
    sceneEl.addEventListener('enter-vr', () => {
      document.querySelector('#rig').setAttribute('movement-controls', 'controls: gamepad; speed: 0.20');
    });

    // Detectar si la mano de la pistola está físicamente sobre el arma del menú
    rightHand.addEventListener('hitstart', (e) => {
      if (e.detail.el.id === 'menu-gun') { window.gameState.isNearMenuGun = true; }
    });
    rightHand.addEventListener('hitend', () => { window.gameState.isNearMenuGun = false; });
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');

    // El láser lanza eventos de tipo 'click'. Al recibirlos, cambiamos de fase.
    if(startBtn) startBtn.addEventListener('click', () => { this.startGame(); });
    if(sandboxBtn) sandboxBtn.addEventListener('click', () => { this.startGame(); });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    
    // Apagar el rayo láser visual del control derecho al iniciar el combate
    document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: false; far: 0');
    
    let menu = document.querySelector('#main-menu');
    let rearMenu = document.querySelector('#rear-menu');
    menu.setAttribute('visible', 'false');
    rearMenu.setAttribute('visible', 'false');
    
    document.querySelector('#game-elements').setAttribute('visible', 'true');
    document.querySelector('#enemy-target').emit('spawn');
  }
});
