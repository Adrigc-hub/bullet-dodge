// Variable global para capturar el evento de instalación del navegador
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Evita que el navegador intente mostrar su propio aviso feo automáticamente
  e.preventDefault();
  deferredPrompt = e;
  
  // Hacer visible o resaltar el botón de instalación ya que el dispositivo es compatible
  let btnText = document.querySelector('#install-btn-text');
  if(btnText) btnText.setAttribute('text', 'value: INSTALAR APLICACIÓN AHORA; color: #000; align: center; width: 2.6');
});

AFRAME.registerComponent('installer-system', {
  init: function () {
    let installBtn = document.querySelector('#install-app-button');
    
    if(installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          // Lanzar la ventana emergente oficial de instalación dentro de las Quest / Celular
          deferredPrompt.prompt();
          
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            document.querySelector('#install-btn-text').setAttribute('text', 'value: ¡INSTALADO CON ÉXITO!; color: #00ff00; align: center; width: 2.6');
          }
          deferredPrompt = null;
        } else {
          // Si ya está instalado o entraste directo desde el navegador sin compatibilidad temporal
          alert("Para instalar: Si estás en Quest Browser, haz clic en el icono de los '3 puntos' en la barra del navegador de arriba y selecciona 'Añadir a Aplicaciones'. ¡Listo!");
        }
      });
    }
  }
});
