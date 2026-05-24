AFRAME.registerComponent('menu-system', {
  init: function () {
    let playBtn = document.querySelector('#btn-play');
    let tutBtn = document.querySelector('#btn-tutorial');
    let closeTutBtn = document.querySelector('#btn-close-tut');

    // Función para entrar a la partida
    playBtn.addEventListener('click', () => {
      document.querySelector('#mannequin-menu').setAttribute('visible', false);
      document.querySelector('#game-world').setAttribute('visible', true);
      document.querySelector('#right-hand').setAttribute('raycaster', 'showLine: false; far: 0.01');
      this.spawnEnemies();
    });

    // Abrir Tutorial
    tutBtn.addEventListener('click', () => {
      document.querySelector('#mannequin-menu').setAttribute('visible', false);
      document.querySelector('#tutorial-screen').setAttribute('visible', true);
    });

    // Cerrar Tutorial
    closeTutBtn.addEventListener('click', () => {
      document.querySelector('#tutorial-screen').setAttribute('visible', false);
      document.querySelector('#mannequin-menu').setAttribute('visible', true);
    });
  },

  spawnEnemies: function() {
    let container = document.querySelector('#enemy-container');
    for(let i=0; i<3; i++) {
      let npc = document.createElement('a-entity');
      npc.setAttribute('mannequin-ai', '');
      npc.setAttribute('position', `${(Math.random()-0.5)*10} 0 -${5 + Math.random()*10}`);
      container.appendChild(npc);
    }
  }
});

AFRAME.registerComponent('mannequin-ai', {
  init: function() {
    // Cuerpo de maniquí humanoide
    let head = document.createElement('a-sphere'); head.setAttribute('radius', '0.12'); head.setAttribute('position', '0 1.5 0'); head.setAttribute('color', '#a8a8a8'); this.el.appendChild(head);
    let torso = document.createElement('a-cylinder'); torso.setAttribute('radius', '0.15'); torso.setAttribute('height', '0.6'); torso.setAttribute('position', '0 1 0'); torso.setAttribute('color', '#333'); this.el.appendChild(torso);
  },
  tick: function(time, timeDelta) {
    if (!document.querySelector('#game-world').getAttribute('visible')) return;

    let cam = document.querySelector('[camera]').object3D;
    let npc = this.el.object3D;
    
    // IA DE MANNEQUIN: Solo se mueve si no lo ves
    let toNPC = new THREE.Vector3().subVectors(npc.position, cam.position).normalize();
    let camDir = new THREE.Vector3(); cam.getWorldDirection(camDir);
    camDir.multiplyScalar(-1);
    
    let angle = camDir.angleTo(toNPC) * (180 / Math.PI);
    if (angle > 50) { // Si el jugador NO lo está viendo (fuera de 50 grados)
      let dir = new THREE.Vector3().subVectors(cam.position, npc.position).normalize();
      npc.translateOnAxis(dir, 1.5 * (timeDelta / 1000)); // Se acerca rápido
      npc.position.y = 0;
    }
  }
});
