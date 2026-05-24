window.gameState = {
  timeScale: 1.0,
  isTimeSlowed: false,
  score: 0,
  currentMode: 'map',
  hasWeapon: false,
  gameStarted: false,
  isDeviceQuest: false,
  isSecretMissionActive: false // Guarda si se activó la misión secreta TON 618
};

AFRAME.registerComponent('control-fix', {
  init: function () {
    let el = this.el;
    let sceneEl = this.el.sceneEl;
    
    // Forzar modo inmersivo total al entrar a VR en Meta Quest
    sceneEl.addEventListener('enter-vr', () => {
      window.gameState.isDeviceQuest = true;
      document.querySelector('#rig').setAttribute('movement-controls', 'controls: gamepad; speed: 0.20');
      document.querySelector('#fuse-cursor').setAttribute('visible', 'false');
    });

    el.addEventListener('gripdown', () => { window.gameState.timeScale = 0.15; });
    el.addEventListener('gripup', () => { window.gameState.timeScale = 1.0; });
    
    // SISTEMA ALEATORIO 1 EN 5 (TON 618 CORRUPCIÓN CÓSMICA)
    this.checkCosmicRNG();
  },

  checkCosmicRNG: function () {
    // Genera un número entre 1 y 5
    let rng = Math.floor(Math.random() * 5) + 1;
    
    // Si sale 1 (20% de probabilidad exacta), se corrompe el menú con TON 618
    if (rng === 1) {
      window.gameState.isSecretMissionActive = true;
      
      // Esperar un milisegundo a que cargue el DOM y transformar el menú
      setTimeout(() => {
        document.querySelector('#menu-title').setAttribute('text', 'value: ALERT: SINGULARIDAD TON 618 DETECTADA; color: #ffaa00; align: center; width: 4.5');
        document.querySelector('#secret-notice').setAttribute('text', 'value: ¡ANOMALÍA DETECTADA! MISION SECRETA COMPILADA; color: #ff0000; align: center; width: 2.5');
        
        // Cambiar el color del botón e interfaz a modo apocalíptico
        document.querySelector('#start-button').setAttribute('color', '#ff0000');
        document.querySelector('#button-text').setAttribute('text', 'value: INICIAR MISIÓN SECRETA; color: #fff; align: center; width: 3');
        
        // Cambiar el núcleo del menú por un agujero negro masivo (Negro absoluto con bordes dorados de fuego)
        document.querySelector('#menu-core').setAttribute('color', '#000000');
        document.querySelector('#menu-core').setAttribute('material', 'roughness: 0.0; metalness: 1.0; emissive: #000');
        document.querySelector('#galaxy-ring-1').setAttribute('color', '#ff5500'); // Disco de acreción ardiente
        document.querySelector('#galaxy-ring-2').setAttribute('color', '#ffaa00');
        
        // Cambiar el cristal de la pistola a energía hiper-densa de TON 618
        document.querySelector('#gun-crystal').setAttribute('color', '#ff3300');
        document.querySelector('#gun-crystal').setAttribute('material', 'emissive: #ff1100');
        document.querySelector('#player-gun-crystal').setAttribute('color', '#ff3300');
        document.querySelector('#player-gun-crystal').setAttribute('material', 'emissive: #ff1100');
        
        // Cambiar la luz ambiental a un vacío morado/rojo oscuro
        document.querySelector('#menu-light').setAttribute('light', 'color: #ff3300; intensity: 4');
        document.querySelector('#ambient-light').setAttribute('light', 'color: #0d0202; intensity: 0.5');
        document.querySelector('#sky-box').setAttribute('color', '#020000');
      }, 100);
    }
  }
});

AFRAME.registerComponent('menu-system', {
  init: function () {
    let startBtn = document.querySelector('#start-button');
    startBtn.addEventListener('click', () => { this.startGame(); });
  },
  startGame: function() {
    window.gameState.gameStarted = true;
    
    let menu = document.querySelector('#main-menu');
    menu.setAttribute('animation', 'property: position; to: 0 -10 0; dur: 800; easing: easeInBack');
    
    setTimeout(() => {
      menu.setAttribute('visible', 'false');
      document.querySelector('#game-elements').setAttribute('visible', 'true');
      
      // Si la misión secreta está activa, alteramos las propiedades de los enemigos para que sean jefes de TON 618
      if (window.gameState.isSecretMissionActive) {
        let boss = document.querySelector('#enemy-target');
        boss.setAttribute('scale', '2 2 2'); // El maniquí se vuelve gigante
        boss.setAttribute('material', 'color: #110000; emissive: #ff0000');
      }
      
      document.querySelector('#enemy-target').emit('spawn');
    }, 800);
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
