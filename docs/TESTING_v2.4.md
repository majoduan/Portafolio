# 🧪 Testing Plan - v2.4 Optimizations

## Cambios Implementados (Diciembre 2025)

### ✅ Optimizaciones Aplicadas

1. **Threshold 50% (vs 80% anterior)**
   - Videos se reproducen solo cuando 50% está visible
   - Más agresivo = menos videos activos simultáneos

2. **Límite 10s en Móvil**
   - Videos en móvil se pausan automáticamente a los 10 segundos
   - Loop reset: Si el video vuelve a empezar, el límite se resetea

3. **Desktop también usa IntersectionObserver**
   - ANTES: Todos los videos autoplay sin control
   - AHORA: Solo videos visibles se reproducen
   - Unifica comportamiento desktop/móvil

4. **Limpieza Agresiva de Cache al Abrir Modal**
   - Al abrir modal: Se pausan y descargan todos los videos de las cards
   - Al cerrar modal: Se restauran los videos (IntersectionObserver maneja reproducción)
   - Previene trabas en móviles

---

## 📊 Testing Checklist

### 🖥️ Desktop Testing

#### A. Comportamiento de Videos en Cards

- [ ] Scroll lento por la sección de proyectos
- [ ] **EXPECTED**: Solo videos visibles (50%+) se reproducen
- [ ] **EXPECTED**: Videos fuera de pantalla NO se reproducen (muestran poster)
- [ ] Scroll rápido hacia abajo y arriba
- [ ] **EXPECTED**: Videos se pausan inmediatamente al salir del viewport

#### B. Performance Metrics (Chrome DevTools)

1. Abrir DevTools (F12) → **Performance** tab
2. Start recording
3. Scroll por toda la página por 10 segundos
4. Stop recording

**EXPECTED METRICS:**
- FPS: 55-60 (constante)
- Memory: <100 MB (antes: ~125 MB)
- GPU: <30% (desktop no es crítico)

#### C. Modal Behavior

- [ ] Abrir un proyecto (click en card)
- [ ] **Console debe mostrar**: `[Modal] 🔓 Modal abierto - Limpiando cache...`
- [ ] **Console debe mostrar**: `[VideoCache] 🧹 Cache limpiado: X videos...`
- [ ] Ver video del proyecto en el modal
- [ ] Cerrar modal
- [ ] **Console debe mostrar**: `[Modal] 🔒 Modal cerrado - Restaurando videos`
- [ ] **Console debe mostrar**: `[VideoCache] ♻️ Cache restaurado: X videos...`
- [ ] Videos visibles deben volver a reproducirse automáticamente

---

### 📱 Mobile Testing (CRÍTICO)

**Device recomendado**: Samsung Galaxy S23 FE (o similar)

#### A. Comportamiento de Videos en Cards

- [ ] Scroll lento por la sección de proyectos
- [ ] **EXPECTED**: Solo 1-2 videos visibles se reproducen
- [ ] Dejar un video visible por 15 segundos
- [ ] **EXPECTED**: Video se pausa automáticamente a los 10s
- [ ] **Console debe mostrar**: `[VideoControl] 📱 Video pausado (límite 10s móvil)`
- [ ] Scroll para ocultar el video y volver a mostrarlo
- [ ] **EXPECTED**: Video se reproduce de nuevo desde el inicio

#### B. Performance Metrics (Chrome Remote Debugging)

1. Conectar móvil a PC (USB Debugging)
2. Chrome → `chrome://inspect` → Select device
3. Abrir DevTools → **Performance** tab
4. Record por 15 segundos mientras scrolleas

**EXPECTED METRICS (Samsung Galaxy S23 FE):**
- FPS: 50-60 (antes: 15-25)
- Memory: <120 MB (antes: ~280 MB)
- GPU: <30% (antes: 85-95%)
- Temperature: No debe calentarse excesivamente

#### C. Modal Behavior (CRÍTICO - Esto causaba trabas)

- [ ] Scroll hasta ver varios videos reproduciéndose
- [ ] Abrir un proyecto
- [ ] **EXPECTED**: El teléfono NO debe trabarse
- [ ] **Console debe mostrar**: Cache limpiado (todos los videos pausados)
- [ ] Usar el teléfono dentro del modal (scroll, botones)
- [ ] **EXPECTED**: Interacción fluida, sin lag
- [ ] Cerrar modal
- [ ] **EXPECTED**: Videos visibles vuelven a reproducirse suavemente

#### D. Battery Drain Test (Opcional, 5 min)

1. Cargar batería al 100%
2. Desconectar cargador
3. Navegar por la página (scroll, abrir modales) por 5 minutos
4. **EXPECTED**: Batería baja <3% (antes: ~8%)

---

## 🛠️ Debugging Tools

### Console Commands

Abre la consola del navegador y ejecuta:

```javascript
// Ver estadísticas de memoria de videos
import { getVideoMemoryStats } from './utils/videoCache.js';
getVideoMemoryStats();

// Output esperado:
// totalVideos: 8
// activeVideos: 1-2 (móvil) o 2-3 (desktop)
// inactiveVideos: 6-7
// estimatedMemoryMB: ~10-30 MB
```

### Chrome Performance Monitor

1. F12 → **More Tools** → **Performance Monitor**
2. Monitorear mientras navegas:
   - **CPU Usage**: <40% ideal
   - **JS Heap Size**: <50 MB ideal
   - **DOM Nodes**: Debe mantenerse estable

---

## 🚨 Expected Console Output

### Desktop - Navegación Normal

```
[VideoControl] ▶️ Video reproduciendo
[VideoControl] ⏸️ Video pausado (fuera del viewport)
[VideoControl] ▶️ Video reproduciendo
```

### Mobile - Navegación Normal

```
[VideoControl] ▶️ Video reproduciendo
[VideoControl] 📱 Video pausado (límite 10s móvil)
[VideoControl] 🔄 Loop detectado, reset límite
[VideoControl] ⏸️ Video pausado (fuera del viewport)
```

### Modal Open (Desktop & Mobile)

```
[Modal] 🔓 Modal abierto - Limpiando cache de videos de cards
[VideoCache] 🧹 Cache limpiado: 8 videos pausados y descargados
```

### Modal Close (Desktop & Mobile)

```
[Modal] 🔒 Modal cerrado - Restaurando videos
[VideoCache] ♻️ Cache restaurado: 8 videos recargados
[VideoControl] ▶️ Video reproduciendo
[VideoControl] ▶️ Video reproduciendo
```

---

## 📈 Success Criteria

### Must Have (Blocker si falla)

- ✅ Videos se pausan a los 10s en móvil
- ✅ Cache se limpia al abrir modal (no traba móvil)
- ✅ Threshold 50% funciona (videos no se reproducen fuera de pantalla)
- ✅ FPS móvil >50 (antes: 15-25)

### Should Have

- ✅ Memory desktop <100 MB
- ✅ Memory móvil <120 MB
- ✅ No console errors
- ✅ Smooth transitions en modal open/close

### Nice to Have

- ✅ GPU móvil <25%
- ✅ Battery drain <3%/5min
- ✅ Temperature normal (no calentamiento)

---

## 🐛 Known Issues / Limitations

### 1. Loop en Videos Muy Cortos (<10s)

**Issue**: Si un video dura <10s, el límite móvil no aplica.

**Workaround**: Los videos del proyecto duran >15s, no es un problema real.

### 2. React Strict Mode - Console Warnings

**Issue**: En desarrollo, useEffect se ejecuta 2 veces (React 18+ Strict Mode).

**Expected**: Logs duplicados en desarrollo. NO ocurre en producción.

### 3. Restauración de Videos en Slow Connections

**Issue**: En 3G/2G, restaurar cache toma 1-2s adicionales.

**Expected**: El sistema de precarga (`preloadResources.js`) ya maneja esto.

---

## 📝 Next Steps (Post-Testing)

Si todos los tests pasan:

1. ✅ Actualizar [CHANGELOG.md](./CHANGELOG.md) con v2.4
2. ✅ Actualizar [GUIDE.md](./GUIDE.md) con nuevas métricas
3. ✅ Actualizar [README.md](./README.md) con performance metrics actualizadas
4. ✅ Git commit + push
5. ✅ Deploy a producción (Vercel)
6. ✅ Testing en producción con Lighthouse

---

**Testing Date**: _________________

**Tester**: _________________

**Device Desktop**: _________________

**Device Mobile**: _________________

**Results**: ☐ PASS | ☐ FAIL (details: _________________)
