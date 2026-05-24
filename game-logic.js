window.gameState = {
  timeScale: 1.0,
  isTimeSlowed: false,
  score: 0,
  currentMode: 'map',
  hasWeapon: false,
  gameStarted: false,
  isDeviceQuest: false // Nueva variable para separar Quest de celular
};

AFRAME.registerComponent('control-fix', {
  init: function () {
    let el = this.el;
    let sceneEl = this.el.sceneEl;
    
    // DETECCIÓN DE META QUEST: Si el usuario entra en modo VR real
    sceneEl.addEventListener('enter-vr', () => {
      // Si está en unas Meta Quest (VR), desactivamos los controles táctiles de celular
      if (!sceneEl.is('am-mode')) { 
        window.gameState.isDeviceQuest = true;
        // Forzamos que el "rig" use el joystick físico de los controles de Quest
        document.querySelector('#rig').setAttribute('movement-controls', 'controls: gamepad; speed: 0.18');
        // Ocultamos el cursor del centro de la pantalla porque ya usará el puntero láser del mando
        document.querySelector('#fuse-cursor').setAttribute('visible', 'false');
      }
    });

    // DETECCIÓN DE CELULAR: Si sale de VR o juega normal
    sceneEl.addEventListener('exit-vr', () => {
      window.gameState.isDeviceQuest = false;
      document.querySelector('#fuse-cursor').setAttribute('visible', 'true');
    });

    // El botón Grip lateral de los mandos Touch de Quest frena el tiempo (Slo-mo)
    el.addEventListener('gripdown', () => { window.gameState.timeScale = 0.15; });
    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });
    
    // SOPORTE HÍBRIDO PARA CELULAR (Solo funciona si NO estás en Meta Quest)
    window.addEventListener('touchstart', (e) => {
      if (window.gameState.isDeviceQuest) return; // Si estás en Quest, ignora esto por completo

      let rig = document.querySelector('#rig');
      if(rig && window.gameState.gameStarted) {
        let camDir = new THREE.Vector3();
        document.querySelector('[camera]').object3D.getWorldDirection(camDir);
        rig.object3D.position.addScaledVector(camDir.negate(), 0.25);
      }
    });
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    
    // Funciona con el gatillo de Quest apuntando al botón, o tocando en cel
    startBtn.addEventListener('click', () => { this.startGame(); });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    
    let menu = document.querySelector('#main-menu');
    menu.setAttribute('animation', 'property: position; to: 0 -10 0; dur: 800; easing: easeInBack');
    
    setTimeout(() => {
      menu.setAttribute('visible', 'false');
      document.querySelector('#game-elements').setAttribute('visible', 'true');
      document.querySelector('#enemy-target').emit('spawn');
    }, 800);
  }
});

// DETECTOR DE SALTO REAL (Funciona de maravilla con el tracking de las Quest)
AFRAME.registerComponent('real-jump-detector', {
  tick: function (time, timeDelta) {
    let cameraY = this.el.object3D.position.y;
    
    // Si tus gafas Quest detectan que tu cabeza sube físicamente en tu sala (saltas en la vida real)
    if (cameraY > 1.88 && !this.isJumping) {
      this.isJumping = true;
      let rig = document.querySelector('#rig');
      let startY = rig.object3D.position.y;
      let t = 0;
      let jump = setInterval(() => {
        t += 0.12;
        rig.object3D.position.y = startY + (Math.sin(t) * 1.4); 
        if(t >= Math.PI) {
          clearInterval(jump);
          rig.object3D.position.y = startY;
          this.isJumping = false;
        }
      }, 20);
    }
  }
});
