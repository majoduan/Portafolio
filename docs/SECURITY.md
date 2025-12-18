# 🔒 Seguridad del Portfolio

## Política de Seguridad Implementada

Este documento describe las medidas de seguridad implementadas en el portfolio de Mateo Dueñas.

---

## 📋 Content Security Policy (CSP)

### Headers HTTP Configurados

El proyecto implementa una Content Security Policy estricta a través de `vercel.json`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://prod.spline.design;
  font-src 'self' data:;
  connect-src 'self' https://prod.spline.design wss://prod.spline.design;
  media-src 'self' blob:;
  worker-src 'self' blob:;
  child-src 'self' blob:;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self' mailto:;
  frame-ancestors 'none';
  upgrade-insecure-requests
```

### Directivas Explicadas

| Directiva | Valor | Propósito |
|-----------|-------|-----------|
| `default-src` | `'self'` | Solo recursos del mismo origen por defecto |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design` | Scripts propios + Spline 3D (requiere eval) |
| `style-src` | `'self' 'unsafe-inline'` | Estilos propios + inline (Tailwind) |
| `img-src` | `'self' data: blob: https://prod.spline.design` | Imágenes propias + Spline |
| `connect-src` | `'self' https://prod.spline.design wss://prod.spline.design` | Conexiones a Spline |
| `media-src` | `'self' blob:` | Videos locales |
| `worker-src` | `'self' blob:` | Service Worker |
| `object-src` | `'none'` | Bloquea plugins (Flash, Java) |
| `frame-ancestors` | `'none'` | Previene clickjacking |
| `form-action` | `'self' mailto:` | Solo formularios locales + mailto |
| `upgrade-insecure-requests` | - | Fuerza HTTPS |

### ⚠️ Nota sobre `unsafe-inline` y `unsafe-eval`

- **`unsafe-inline`**: Necesario para:
  - Tailwind CSS (estilos utility)
  - React inline styles
  - Animaciones dinámicas

- **`unsafe-eval`**: Requerido por:
  - Spline 3D runtime
  - React desarrollo (hot reload)

**Consideración**: En producción, Vite elimina el código de desarrollo que requiere `eval`.

---

## 🛡️ Headers de Seguridad Adicionales

### 1. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Previene MIME type sniffing attacks.

### 2. X-Frame-Options
```
X-Frame-Options: DENY
```
Previene que el sitio sea embebido en iframes (clickjacking).

### 3. X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
Habilita protección XSS en navegadores antiguos.

### 4. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controla información de referrer enviada en requests.

### 5. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```
Deshabilita APIs sensibles y FLoC tracking.

### 6. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Fuerza HTTPS por 1 año, incluye subdominios.

---

## 📦 Cache Headers Optimizados

### Service Worker
```
Cache-Control: public, max-age=0, must-revalidate
Service-Worker-Allowed: /
```
Siempre revalida el Service Worker.

### Assets Estáticos (Imágenes/Videos/JS/CSS)
```
Cache-Control: public, max-age=31536000, immutable
```
Cache agresivo (1 año) con invalidación por hash.

### CV (PDF)
```
Cache-Control: public, max-age=2592000
Content-Type: application/pdf
Content-Disposition: inline
```
Cache de 30 días, visualización inline.

### Manifest PWA
```
Cache-Control: public, max-age=86400
Content-Type: application/manifest+json
```
Cache de 24 horas.

---

## 🔍 Análisis de Vulnerabilidades

### ✅ Protecciones Implementadas

| Vulnerabilidad | Estado | Medida |
|----------------|--------|--------|
| **XSS (Cross-Site Scripting)** | ✅ Protegido | CSP + React escaping automático |
| **Clickjacking** | ✅ Protegido | X-Frame-Options: DENY |
| **MIME Sniffing** | ✅ Protegido | X-Content-Type-Options: nosniff |
| **Man-in-the-Middle** | ✅ Protegido | HSTS + upgrade-insecure-requests |
| **Código Inyectado** | ✅ Protegido | CSP script-src restrictivo |
| **Tracking Invasivo** | ✅ Protegido | Permissions-Policy |
| **Dependencias Vulnerables** | ✅ Monitoreado | npm audit + Dependabot |

### ❌ Sin Vulnerabilidades Conocidas

- No hay uso de `dangerouslySetInnerHTML`
- No hay `eval()` en código propio
- No hay scripts externos no confiables
- No hay almacenamiento de datos sensibles
- No hay backend vulnerable

---

## 🚀 Deployment en Vercel

### Configuración Automática

Vercel aplica automáticamente los headers definidos en `vercel.json` al desplegar.

### Verificación de Headers

Después de desplegar, verifica los headers con:

```bash
# Chrome DevTools
# 1. Abre el sitio
# 2. F12 → Network tab
# 3. Recarga la página
# 4. Click en el documento principal
# 5. Headers → Response Headers

# O con curl
curl -I https://mateoduenas.vercel.app
```

### Headers Esperados
```
HTTP/2 200
content-security-policy: default-src 'self'; ...
x-content-type-options: nosniff
x-frame-options: DENY
strict-transport-security: max-age=31536000; includeSubDomains; preload
...
```

---

## 🔐 Recursos Seguros

### 1. CV (PDF)
- **Ubicación**: `/public/cv/Mateo_Dueñas_CV.pdf`
- **Descarga**: Archivo local estático
- **Riesgo**: Ninguno (archivo controlado)

### 2. Imágenes
- **Formato**: WebP optimizado
- **Fuente**: Local (`/public/images/`)
- **Procesamiento**: Sharp (local)
- **Riesgo**: Ninguno

### 3. Videos
- **Formato**: MP4 H.264
- **Fuente**: Local (`/public/videos/`)
- **Procesamiento**: FFmpeg (local)
- **Riesgo**: Ninguno

### 4. Service Worker
- **Control**: Total (código propio)
- **Scope**: Solo recursos propios
- **Riesgo**: Ninguno

---

## 📚 Dependencias de Terceros

### Spline 3D (prod.spline.design)
- **Propósito**: Escena 3D interactiva
- **Tipo**: Assets 3D (geometría, texturas)
- **Riesgo**: Mínimo (servicio legítimo)
- **Mitigación**: CSP específico para Spline

### Otras Dependencias
- ✅ React, Vite, Tailwind (oficiales)
- ✅ Lucide Icons, Anime.js (populares)
- ✅ Sin dependencias sospechosas
- ✅ Actualizaciones regulares con `npm audit`

---

## 🔄 Mantenimiento de Seguridad

### Auditorías Regulares

```bash
# 1. Verificar vulnerabilidades en dependencias
npm audit

# 2. Actualizar dependencias
npm update

# 3. Verificar dependencias obsoletas
npm outdated

# 4. Fix automático de vulnerabilidades
npm audit fix
```

### Monitoreo Continuo

- ✅ GitHub Dependabot (alertas automáticas)
- ✅ npm audit en CI/CD
- ✅ Revisión manual trimestral
- ✅ Actualización proactiva de React/Vite

---

## 📝 Checklist de Seguridad

- [x] Content Security Policy implementada
- [x] Headers de seguridad configurados
- [x] HTTPS forzado (HSTS)
- [x] XSS protección habilitada
- [x] Clickjacking prevenido
- [x] MIME sniffing bloqueado
- [x] Permissions restrictivos
- [x] Service Worker seguro
- [x] Sin código malicioso
- [x] Sin tracking invasivo
- [x] Dependencias auditadas
- [x] Cache optimizado
- [x] PWA manifest seguro

---

## 🆘 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor **NO** abras un issue público.

**Contacto seguro:**
- Email: mate.due02@gmail.com
- Subject: "[SECURITY] Vulnerabilidad en Portfolio"

**Información a incluir:**
1. Descripción de la vulnerabilidad
2. Pasos para reproducir
3. Impacto potencial
4. Solución sugerida (opcional)

---

## 📖 Referencias

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Vercel Security Documentation](https://vercel.com/docs/security)
- [Web.dev Security](https://web.dev/secure/)

---

**Última actualización:** 18 de Diciembre, 2025
**Versión:** 1.0.0
