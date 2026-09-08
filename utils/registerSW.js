'use client';
// Registro del Service Worker para Portfolio
// Version 1.0.0

export function registerServiceWorker() {
  // Solo en producción y si el navegador lo soporta
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Verificar actualizaciones cada hora (guard against multiple intervals)
          if (!window.__swUpdateInterval) {
            window.__swUpdateInterval = setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          }

          // Notificar cuando hay actualización disponible
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Opcional: Mostrar banner de actualización
                showUpdateNotification(newWorker);
              }
            });
          });
        })
        .catch(() => {
          // Error al registrar Service Worker
        });

      // Escuchar mensajes del SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          // Cache actualizado
        }
      });
    });
  }
}

// Función para mostrar notificación de actualización (opcional)
function showUpdateNotification(_newWorker) {
  // Puedes personalizar esto con un toast/banner elegante
  const updateMessage = document.createElement('div');
  updateMessage.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--bg-elevated, #272727);
      color: var(--text-primary, #fff);
      border: 1px solid var(--border-color, #333);
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      font-family: var(--font-geist-sans, system-ui), -apple-system, sans-serif;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🔄</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Nueva versión disponible</div>
          <button 
            onclick="location.reload()" 
            style="
              background: var(--btn-primary, #253247);
              color: #fff;
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
            color: inherit;
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
  }
}

// Exportar para debugging en consola
if (typeof window !== 'undefined') {
  window.clearSWCache = clearServiceWorkerCache;
}
