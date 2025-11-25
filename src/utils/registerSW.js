// Registro del Service Worker para Portfolio
// Version 1.0.0

export function registerServiceWorker() {
  // Solo en producción y si el navegador lo soporta
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Notificar cuando hay actualización disponible
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuevo SW instalado, mostrar notificación opcional
                console.log('🔄 Nueva versión disponible. Recarga la página para actualizar.');
                
                // Opcional: Mostrar banner de actualización
                showUpdateNotification(newWorker);
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error);
        });

      // Escuchar mensajes del SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('📦 Cache actualizado:', event.data.url);
        }
      });
    });
  } else if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker no soportado en este navegador');
  } else {
    console.log('🔧 Service Worker deshabilitado en desarrollo');
  }
}

// Función para mostrar notificación de actualización (opcional)
function showUpdateNotification(newWorker) {
  // Puedes personalizar esto con un toast/banner elegante
  const updateMessage = document.createElement('div');
  updateMessage.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🔄</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Nueva versión disponible</div>
          <button 
            onclick="location.reload()" 
            style="
              background: white;
              color: #6366f1;
              border: none;
              padding: 6px 16px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Actualizar ahora
          </button>
        </div>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          style="
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 8px;
          "
        >
          ×
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateMessage);

  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (updateMessage.parentElement) {
      updateMessage.remove();
    }
  }, 10000);
}

// Función para limpiar cache manualmente (debugging)
export function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'CLEAR_CACHE'
    });
    console.log('🗑️ Cache limpiado');
  }
}

// Exportar para debugging en consola
if (typeof window !== 'undefined') {
  window.clearSWCache = clearServiceWorkerCache;
}
