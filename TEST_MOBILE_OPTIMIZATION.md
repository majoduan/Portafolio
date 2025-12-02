# 📱 Testing de Optimización Móvil v2.3

## 🎯 Objetivo
Verificar que el sistema de videos selectivos funciona correctamente en móviles, reduciendo consumo de GPU, RAM y batería sin afectar el rendimiento en desktop.

---

## ✅ **CHECKLIST DE TESTING**

### **1. Build del Proyecto**
```bash
# Instalar dependencias (si es necesario)
npm install

# Build de producción
npm run build

# Preview local
npm run preview
```

**Verificar:**
- ✅ Build exitoso sin errores
- ✅ Warnings mínimos o inexistentes
- ✅ Bundle size ~280KB

---

### **2. Testing en Chrome DevTools (Simulación Móvil)**

#### **2.1 Abrir DevTools**
1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Seleccionar: **Galaxy S23** (o cualquier Android)
3. Network: **Fast 3G** (simular conexión real)

#### **2.2 Performance Monitor**
1. F12 → Performance Monitor (Ctrl+Shift+P → "Show Performance Monitor")
2. Monitorear:
   - **CPU Usage**: Debe estar <30%
   - **JS Heap Size**: Debe estar <100 MB
   - **Layouts/sec**: Debe estar <10

#### **2.3 Console Logs**
Abrir Console (F12 → Console) y verificar:

```
[Preload] 📱 Device: Mobile
[Preload] 🌐 Connection: 3g
[Preload] 🚫 Skipping video preload (mobile or slow connection)
[Preload] 📹 Videos will load on-demand when visible in viewport
```

**✅ Correcto:** No debe precargar videos en móvil
**❌ Incorrecto:** Si dice "Preloading videos", hay un problema

---

### **3. Testing Visual**

#### **3.1 Scroll a la Sección de Proyectos**
1. Abrir el portfolio en modo móvil
2. Scroll lento hacia "Proyectos"
3. **Observar:**
   - Solo 1 video reproduce a la vez
   - Otros muestran poster estático con play icon
   - Video pausa al salir del viewport

#### **3.2 Verificar Transiciones**
- **Al entrar en viewport:** Video se reproduce suavemente
- **Al salir de viewport:** Video pausa automáticamente
- **Sin lag:** Scroll debe ser fluido (~60 FPS)

---

### **4. Testing de Performance**

#### **4.1 Lighthouse Audit (Móvil)**
1. F12 → Lighthouse
2. Mode: **Navigation**
3. Device: **Mobile**
4. Categories: Todas
5. Click "Analyze page load"

**Métricas Esperadas:**
| Métrica | Target | Status |
|---------|--------|--------|
| Performance | >85 | ✅ |
| LCP | <3.5s | ✅ |
| TBT | <400ms | ✅ |
| CLS | <0.1 | ✅ |

#### **4.2 Performance Recording**
1. F12 → Performance
2. Click 🔴 Record
3. Scroll por toda la página durante 10 segundos
4. Stop recording

**Verificar:**
- **FPS:** Debe estar ~55-60 (verde)
- **Main Thread:** No debe tener bloques largos (>50ms)
- **Memory:** Debe ser estable (~90-100 MB)

---

### **5. Testing en Desktop**

#### **5.1 Comportamiento Normal**
1. Desactivar Device Toolbar (volver a desktop)
2. Recargar página (Ctrl+R)
3. Console debe mostrar:

```
[Preload] 🖥️ Device: Desktop
[Preload] 🌐 Connection: 4g
[Preload] 🎬 Preloading videos (desktop + fast connection)
[Preload] ✅ Remaining videos prefetched
```

#### **5.2 Verificar Videos**
- Scroll a Proyectos
- **TODOS los videos** deben reproducirse simultáneamente
- Sin cambios en comportamiento original

---

### **6. Testing en Dispositivo Real (Recomendado)**

#### **6.1 Samsung Galaxy S23 FE (tu caso)**
1. Build y deploy a Vercel/Netlify
2. Abrir en tu S23 FE
3. **Monitorear:**
   - Temperatura del dispositivo (debe ser normal)
   - Batería no debe drenar rápido
   - No debe haber lag al hacer scroll

#### **6.2 Herramientas Móviles**
En Android:
1. Activar **Opciones de Desarrollador**
2. Habilitar **Profile GPU Rendering**
3. Ver barras en pantalla (deben estar <16ms)

---

## 📊 **RESULTADOS ESPERADOS**

### **Móvil (Galaxy S23 FE)**
| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Videos simultáneos | 8 | 1 | -87.5% |
| GPU Usage | 85-95% | 15-25% | -80% |
| RAM | 280 MB | 95 MB | -66% |
| FPS | 15-25 | 55-60 | +200% |
| Temperatura | 🔥🔥🔥 | 🔥 | -70% |
| Batería/min | -8% | -2% | -75% |

### **Desktop**
| Métrica | Esperado |
|---------|----------|
| Videos simultáneos | 8 (sin cambios) |
| FPS | 55-60 |
| GPU Usage | 35-45% |
| Comportamiento | Idéntico a v2.2 |

---

## 🐛 **TROUBLESHOOTING**

### **Problema 1: Videos no cargan en móvil**
**Síntoma:** Posters se muestran pero videos nunca cargan

**Solución:**
1. Verificar console logs
2. Verificar que los posters existen en `/public/videos/`
3. Verificar red: puede ser conexión muy lenta

### **Problema 2: Todos los videos cargan en móvil**
**Síntoma:** Console muestra "Preloading videos" en móvil

**Solución:**
1. Limpiar cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+Shift+R)
3. Verificar `window.innerWidth < 768` en console

### **Problema 3: Videos no pausan al salir del viewport**
**Síntoma:** Múltiples videos reproducen simultáneamente

**Solución:**
1. Verificar que `useVideoVisibility` hook está funcionando
2. Console log para debug:
```javascript
console.log('Video visible:', isVideoVisible);
console.log('Is mobile:', isMobile);
```

### **Problema 4: Desktop carga posters en lugar de videos**
**Síntoma:** Desktop muestra comportamiento de móvil

**Solución:**
1. Verificar ancho de ventana: debe ser >768px
2. Resize ventana del navegador
3. Hard reload

---

## 🚀 **COMANDOS ÚTILES**

```bash
# Development con hot reload
npm run dev

# Build de producción
npm run build

# Preview build local
npm run preview

# Analizar bundle size
npm run build:analyze

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 **REGISTRO DE PRUEBAS**

### **Fecha:** _________
### **Dispositivo:** _________
### **Navegador:** _________

| Test | Resultado | Notas |
|------|-----------|-------|
| Build exitoso | ⬜ Pass / ⬜ Fail | |
| Logs de precarga correctos | ⬜ Pass / ⬜ Fail | |
| 1 video activo en móvil | ⬜ Pass / ⬜ Fail | |
| Videos pausan fuera viewport | ⬜ Pass / ⬜ Fail | |
| FPS >55 en móvil | ⬜ Pass / ⬜ Fail | |
| Desktop sin cambios | ⬜ Pass / ⬜ Fail | |
| Lighthouse >85 | ⬜ Pass / ⬜ Fail | |
| Temperatura normal | ⬜ Pass / ⬜ Fail | |

---

## ✅ **CRITERIOS DE ACEPTACIÓN**

- [ ] **Build:** Sin errores
- [ ] **Móvil:** Solo 1 video activo
- [ ] **Desktop:** Todos los videos activos
- [ ] **Performance:** FPS >55 en móvil
- [ ] **Memoria:** <100 MB en móvil
- [ ] **Lighthouse:** >85 en móvil
- [ ] **UX:** Sin lag al hacer scroll
- [ ] **Batería:** Consumo normal (<3%/min)

---

**Si todos los criterios pasan: ✅ Optimización exitosa**
**Si alguno falla: ❌ Revisar troubleshooting**
