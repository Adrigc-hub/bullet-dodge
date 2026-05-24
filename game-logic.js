window.gameState = {
  timeScale: 1.0,
  score: 0,
  currentMapIndex: 0,
  maps: ['NEBULA CORP', 'VACIO TON 618', 'NUCLEO INDUSTRIAL'],
  hasWeapon: false,
  gameStarted: false,
  isNearWeapon: false,
  droppedWeaponId: null
};

AFRAME.registerComponent('control-fix', {
  init: function () {
    let sceneEl = this.el.sceneEl;
    let rightHand = document.querySelector('#right-hand');
    
    // Configuración al entrar a Realidad Virtual con las Quest
    sceneEl.addEventListener('enter-vr', () => {
      document.querySelector('#rig').setAttribute('movement-controls', 'controls: gamepad; speed: 0.22');
    });

    // SISTEMA DE BOTONES FÍSICOS TOCABLES (Colisión de mano golpeando el botón)
    rightHand.addEventListener('hitstart', (e) => {
      let target = e.detail.el;
      if (target.classList.contains('clickable')) {
        target.emit('click'); // Forzar la ejecución del botón
        // Feedback visual de hundimiento al apachurrar
        target.setAttribute('position', {x: target.object3D.position.x, y: target.object3D.position.y, z: -0.05});
        setTimeout(() => { target.setAttribute('position', {x: target.object3D.position.x, y: target.object3D.position.y, z: 0}); }, 150);
      }
    });
    
    // Cambiar de mapa al presionar el botón correspondiente
    let mapBtn = document.querySelector('#map-selection-btn');
    if(mapBtn) {
      mapBtn.addEventListener('click', () => {
        window.gameState.currentMapIndex = (window.gameState.currentMapIndex + 1) % window.gameState.maps.length;
        let nextMap = window.gameState.maps[window.gameState.currentMapIndex];
        document.querySelector('#map-btn-text').setAttribute('text', `value: MAPA: ${nextMap} (CLICK PARA CAMBIAR); color: #fff; align: center; width: 2.5`);
      });
    }
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    let sandboxBtn = document.querySelector('#sandbox-button');

    startBtn.addEventListener('click', () => { this.startGame('history'); });
    sandboxBtn.addEventListener('click', () => { this.startGame('sandbox'); });
  },
  startGame: function(mode) {
    window.gameState.gameStarted = true;
    let menu = document.querySelector('#main-menu');
    menu.setAttribute('animation', 'property: position; to: 0 -15 0; dur: 900; easing: easeInBack');
    
    setTimeout(() => {
      menu.setAttribute('visible', 'false');
      document.querySelector('#game-elements').setAttribute('visible', 'true');
      document.querySelector('#enemy-target').emit('spawn');
    }, 900);
  }
});

AFRAME.registerComponent('real-jump-detector', {
  tick: function (time, timeDelta) {
    let cameraY = this.el.object3D.position.y;
    if (cameraY > 1.88 && !this.isJumping) {
      this.isJumping = true;
      let rig = document.querySelector('#rig');
      let startY = rig.object3D.position.y;
      let t = 0;
      let jump = setInterval(() => {
        t += 0.12;
        rig.object3D.position.y = startY + (Math.sin(t) * 1.5); 
        if(t >= Math.PI) { clearInterval(jump); rig.object3D.position.y = startY; this.isJumping = false; }
      }, 20);
    }
  }
});
