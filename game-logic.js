// Variables globales de estado del juego
window.gameState = {
  timeScale: 1.0,      // 1.0 = normal, 0.2 = cámara lenta
  isTimeSlowed: false,
  score: 0,
  currentMode: 'map'   // 'map' o 'passthrough'
};

// Componente para ralentizar el tiempo mediante el botón Grip (abajo del gatillo)
AFRAME.registerComponent('time-controller', {
  init: function () {
    this.el.addEventListener('gripdown', () => {
      window.gameState.timeScale = 0.15; // Ralentiza al 15%
      window.gameState.isTimeSlowed = true;
      document.querySelector('#ambient-light').setAttribute('color', '#4466aa');
    });
    this.el.addEventListener('gripup', () => {
      window.gameState.timeScale = 1.0;  // Tiempo normal
      window.gameState.isTimeSlowed = false;
      document.querySelector('#ambient-light').setAttribute('color', '#fff');
    });
  }
});

// Selector de Modos (Passthrough de Meta vs Mapa diseñado)
AFRAME.registerComponent('game-mode-manager', {
  init: function () {
    // Detectar si el usuario inicia el modo WebXR AR (Passthrough)
    this.el.sceneEl.addEventListener('enter-vr', () => {
      if (this.el.sceneEl.is('ar-mode')) {
        window.gameState.currentMode = 'passthrough';
        document.querySelector('#virtual-map').setAttribute('visible', 'false');
        document.querySelector('#sky-box').setAttribute('visible', 'false');
      } else {
        window.gameState.currentMode = 'map';
        document.querySelector('#virtual-map').setAttribute('visible', 'true');
      }
    });
  }
});

// Sistema de detección de saltos reales mediante acelerómetro / altura de cámara
AFRAME.registerComponent('real-jump-detector', {
  tick: function (time, timeDelta) {
    let cameraY = this.el.object3D.position.y;
    // Si la cabeza sube abruptamente más allá del estándar de estatura
    if (cameraY > 1.9 && !this.isJumping) {
      this.isJumping = true;
      this.el.emit('jump-trigger');
      setTimeout(() => { this.isJumping = false; }, 800);
    }
  }
});
