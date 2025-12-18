# 🛠️ Solución de Problemas (Troubleshooting)

## Mensajes de Consola en Desarrollo

### ⚠️ WebSocket Connection Failed

**Mensaje:**
```
WebSocket connection to 'ws://localhost:5173/' failed
[vite] failed to connect to websocket
```

**Causa:** 
Reconexión temporal del Hot Module Replacement (HMR) de Vite. Ocurre cuando:
- El servidor se reinicia
- Cambias archivos rápidamente
- Hay conflictos de puerto

**Solución:**
1. **Normal:** Estos mensajes son normales y no afectan funcionalidad
2. **Si persiste:** Reinicia el servidor de desarrollo:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```
3. **Puerto ocupado:** Cambia el puerto en `vite.config.js`:
   ```javascript
   server: {
     port: 3000, // Cambiar puerto
     hmr: { clientPort: 3000 }
   }
   ```

**Impacto:** ❌ Ninguno - Solo ruido visual

---

### 📊 Logs de Telemetría Excesivos

**Mensaje:**
```
[Telemetry] web_vital_ttfb Object
[Telemetry] web_vital_fcp Object
[Telemetry] page_load Object
```

**Causa:** 
Sistema de telemetría activo en desarrollo.

**Solución:**
Ya está configurado para deshabilitarse automáticamente en desarrollo. Si aún ves logs:

1. Verifica que estés en modo desarrollo:
   ```bash
   npm run dev  # Correcto (desarrollo)
   npm run preview  # Incorrecto (producción simulada)
   ```

2. Los logs solo aparecen en producción (`npm run build && npm run preview`)

**Estado actual:** ✅ Deshabilitado en desarrollo

---

### 🔄 Mensajes Duplicados

**Mensaje:**
```
[Modal] 🔒 Modal cerrado - Restaurando videos (x2)
[Preload] 🎬 Preloading videos... (x2)
[VideoCache] ♻️ Cache restaurado: 0 videos... (x2)
```

**Causa:** 
**React Strict Mode** en desarrollo monta componentes dos veces para detectar bugs.

**Comportamiento esperado:**
- En desarrollo: Todo se ejecuta 2 veces (normal)
- En producción: Se ejecuta 1 vez (automático)

**Solución (opcional, NO recomendada):**
```jsx
// main.jsx - Deshabilitar StrictMode (solo para testing)
<React.StrictMode>  {/* Quitar esto */}
  <App />
</React.StrictMode>
```

⚠️ **Recomendación:** Dejar Strict Mode activado. Los duplicados son intencionales para debugging.

**Impacto:** ❌ Ninguno - Solo en desarrollo

---

### 🎬 Logs de Video Preload

**Mensaje:**
```
[Preload] 📱 Device: Desktop
[Preload] 🌐 Connection: 4g
[Preload] 🎬 Preloading videos (desktop + fast connection)
[Preload] ✅ Remaining videos prefetched
```

**Causa:** 
Logs de debug del sistema de precarga de videos.

**Solución:**
Ya están deshabilitados por defecto. Para habilitarlos (debugging):

```javascript
// src/utils/preloadResources.js
const DEBUG = true; // Cambiar a true para ver logs
```

**Estado actual:** ✅ Deshabilitados

---

### 🔧 Service Worker Deshabilitado

**Mensaje:**
```
🔧 Service Worker deshabilitado en desarrollo
```

**Causa:** 
Por diseño - Service Worker solo funciona en producción.

**Comportamiento correcto:**
- Desarrollo (`npm run dev`): Deshabilitado ✅
- Producción (`npm run build`): Habilitado ✅

**Para testearlo en local:**
```bash
npm run build
npm run preview  # Simula producción
```

**Impacto:** ❌ Ninguno - Comportamiento correcto

---

### ⚛️ React DevTools Message

**Mensaje:**
```
Download the React DevTools for a better development experience
```

**Causa:** 
React sugiere instalar las DevTools de Chrome/Firefox.

**Solución (opcional):**
Instala la extensión:
- **Chrome:** [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Firefox:** [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Impacto:** ℹ️ Informativo - No es error

---

### 🎨 Spline Messages

**Mensaje:**
```
updating from 118 to 120
⚠️ Spline ya cargado, ignorando duplicado (React Strict Mode)
✅ Spline cargado correctamente
```

**Causa:** 
Logs internos de Spline 3D y detección de duplicados en React Strict Mode.

**Comportamiento correcto:**
- "updating from X to Y": Spline cargando assets
- "ignorando duplicado": Protección contra doble carga
- "cargado correctamente": Todo OK ✅

**Impacto:** ✅ Normal - Spline funcionando correctamente

---

## 🚨 Errores Reales (Requieren Atención)

### ❌ Module not found

**Mensaje:**
```
Error: Cannot find module './Component'
```

**Solución:**
1. Verifica que el archivo exista
2. Verifica el path (mayúsculas/minúsculas importan en Linux)
3. Reinstala dependencias:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ❌ Port 5173 already in use

**Mensaje:**
```
Port 5173 is already in use
```

**Solución:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9

# O cambiar puerto en vite.config.js
```

### ❌ Out of memory

**Mensaje:**
```
JavaScript heap out of memory
```

**Solución:**
```bash
# Aumentar memoria de Node.js
$env:NODE_OPTIONS="--max-old-space-size=4096"  # Windows
export NODE_OPTIONS="--max-old-space-size=4096"  # Linux/Mac

npm run dev
```

---

## 🧹 Limpieza de Consola

### Configuración Actual (Limpia)

Los siguientes logs están **deshabilitados por defecto**:
- ✅ Telemetría en desarrollo
- ✅ Video preload logs
- ✅ Video cache logs (excepto errores)
- ✅ Modal open/close logs

### Para Debugging Profundo

Si necesitas ver todos los logs para debugging:

```javascript
// 1. Habilitar logs de preload
// src/utils/preloadResources.js
const DEBUG = true;

// 2. Habilitar logs de video cache
// src/utils/videoCache.js
const DEBUG = true;

// 3. Habilitar telemetría en desarrollo
// src/utils/telemetry.js
const TELEMETRY_CONFIG = {
  enabled: true, // Cambiar temporalmente
  useConsole: true // Habilitar logs
};
```

---

## 📊 Performance Debugging

### Verificar Performance en Consola

```javascript
// En Chrome DevTools Console
performance.memory  // Ver uso de memoria
performance.getEntriesByType('navigation')  // Ver métricas de carga
```

### Lighthouse Audit

```bash
# 1. Build de producción
npm run build

# 2. Preview local
npm run preview

# 3. Chrome DevTools → Lighthouse → Generate Report
```

### Bundle Analysis

```bash
npm run analyze
# Abre stats.html para ver tamaño de chunks
```

---

## 🔍 Debugging Tools

### React DevTools
- Inspeccionar componentes
- Ver props/state
- Profiler para performance

### Chrome DevTools
- **Network:** Ver requests de recursos
- **Performance:** Analizar FPS y tiempo de carga
- **Memory:** Detectar memory leaks
- **Console:** Ver logs y errores

### Vite DevTools
- HMR (Hot Module Replacement)
- Fast Refresh para React
- Pre-bundling de dependencias

---

## 📞 Soporte

Si encuentras un error que no está documentado aquí:

1. **Revisa la documentación:**
   - [GUIDE.md](./GUIDE.md) - Guía completa
   - [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) - Decisiones técnicas
   - [SECURITY.md](./SECURITY.md) - Seguridad

2. **Busca en issues de GitHub:**
   - Vite: https://github.com/vitejs/vite/issues
   - React: https://github.com/facebook/react/issues
   - Spline: https://community.spline.design

3. **Contacto:**
   - Email: mate.due02@gmail.com
   - GitHub: [@majoduan](https://github.com/majoduan)

---

## ✅ Checklist de Salud del Proyecto

Antes de reportar un error, verifica:

- [ ] `node_modules` instalado (`npm install`)
- [ ] Node.js versión >= 18
- [ ] Puerto 5173 disponible
- [ ] Archivos `.env.local` configurados (opcional)
- [ ] Build funciona (`npm run build`)
- [ ] Preview funciona (`npm run preview`)
- [ ] Sin errores en `npm run lint`
- [ ] Navegador actualizado (Chrome/Firefox/Safari/Edge)

---

**Última actualización:** 18 de Diciembre, 2025
