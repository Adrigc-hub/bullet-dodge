window.gameState = {
  timeScale: 1.0,
  isTimeSlowed: false,
  score: 0,
  currentMode: 'map',
  hasWeapon: false // El jugador empieza desarmado hasta que agarra la pistola
};

// Corrección de controles y soporte sin mandos (Mirada / Clic)
AFRAME.registerComponent('control-fix', {
  init: function () {
    let el = this.el;
    
    // Si el usuario usa controles de RV (Grip lateral)
    el.addEventListener('gripdown', () => { window.gameState.timeScale = 0.15; });
    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });
    
    // Soporte para pantallas táctiles de celular (Si tocas la pantalla sin VR, caminas)
    window.addEventListener('touchstart', (e) => {
      let rig = document.querySelector('#rig');
      if(rig && window.gameState.gameStarted) {
        // Mover hacia adelante en la dirección que mira la cámara
        let camDir = new THREE.Vector3();
        document.querySelector('[camera]').object3D.getWorldDirection(camDir);
        rig.object3D.position.addScaledVector(camDir.negate(), 0.3);
      }
    });
  }
});

// Componente para iniciar el juego desde el menú
AFRAME.registerComponent('menu-system', {
  init: function () {
    let el = this.el;
    let startBtn = document.querySelector('#start-button');
    
    // Iniciar al mirar el botón o hacerle clic
    startBtn.addEventListener('click', () => {
      this.startGame();
    });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    document.querySelector('#main-menu').setAttribute('visible', 'false');
    document.querySelector('#main-menu').setAttribute('position', '0 -100 0'); // Lo alejamos
    document.querySelector('#game-elements').setAttribute('visible', 'true');
    // Activar enemigos
    document.querySelector('#enemy-target').emit('spawn');
  }
});

// Sistema de detección de saltos reales
AFRAME.registerComponent('real-jump-detector', {
  tick: function (time, timeDelta) {
    let cameraY = this.el.object3D.position.y;
    if (cameraY > 1.85 && !this.isJumping) {
      this.isJumping = true;
      // Simular salto en el rig del jugador
      let rig = document.querySelector('#rig');
      rig.removeAttribute('movement-controls'); // Bloqueo momentáneo
      let startY = rig.object3D.position.y;
      
      // Animación matemática simple de salto
      let t = 0;
      let jumpInterval = setInterval(() => {
        t += 0.1;
        rig.object3D.position.y = startY + (Math.sin(t) * 1.2);
        if(t >= Math.PI) {
          clearInterval(jumpInterval);
          rig.object3D.position.y = startY;
          rig.setAttribute('movement-controls', 'controls: checkpoint, gamepad, keyboard; speed: 0.15');
          this.isJumping = false;
        }
      }, 25);
    }
  }
});
