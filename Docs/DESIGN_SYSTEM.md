# Design System · La Victoria

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Design Tokens](#design-tokens)
3. [Colores](#colores)
4. [Tipografía](#tipografía)
5. [Espaciado](#espaciado)
6. [Componentes](#componentes)
7. [Cómo Empezar](#cómo-empezar)

---

## Introducción

Este documento define el **Design System centralizado** para La Victoria. Todos los desarrolladores deben seguir estas directrices para garantizar consistencia visual y escalabilidad.

### Principios Fundamentales
- ✅ **Tokens Centralizados**: Todos los valores visuales provienen de un único lugar
- ✅ **Componentes Reutilizables**: No duplicar código ni estilos
- ✅ **Escalabilidad**: El sistema debe crecer sin complejidad
- ✅ **Consistencia**: UX/UI idéntica en toda la aplicación
- ✅ **Documentación**: Siempre actualizada y accesible

### Prohibiciones
- ❌ Valores hardcodeados (colores, espaciados, tamaños)
- ❌ Estilos específicos a una página
- ❌ Componentes no documentados
- ❌ Duplicación de lógica CSS

---

## Design Tokens

Los **Design Tokens** son las variables fundamentales del sistema. Se definen en `tailwind.config.js` bajo el objeto `theme.extend`.

### Estructura
```
tailwind.config.js
├── colors          # Paleta de colores
├── fontFamily      # Familias tipográficas
├── fontSize        # Tamaños de fuente
├── spacing         # Espaciados y gaps
├── borderRadius    # Radios de bordes
├── boxShadow       # Sombras
└── ... (más tokens)
```

---

## Colores

La paleta de La Victoria está basada en una temática de comida rápida.

### Colores de Marca

```css
/* Primarios */
--brand-bun:        #ff8a13  /* Naranja - Color principal */
--brand-bun-dark:   #d96700  /* Naranja oscuro - Variante */
--brand-cheese:     #ffc928  /* Amarillo - Complementario */

/* Secundarios */
--brand-ketchup:    #ef3b2d  /* Rojo - Acción/Error */
--brand-lettuce:    #19a66a  /* Verde - Éxito */

/* Neutrales */
--charcoal:         #14100d  /* Principal oscuro */
--charcoal-light:   #211813  /* Variante clara */
--cream:            #fff5e4  /* Crema/Beige */
--muted:            #806957  /* Texto deshabilitado */
```

### Colores Semánticos

```css
success: #19a66a    /* Basado en lettuce */
warning: #ffc928    /* Basado en cheese */
error:   #ef3b2d    /* Basado en ketchup */
info:    #ff8a13    /* Basado en bun */
```

### Uso en Tailwind

```html
<!-- Fondo primario -->
<div class="bg-brand-bun">Botón primario</div>

<!-- Fondo oscuro -->
<div class="bg-neutral-charcoal">Fondo oscuro</div>

<!-- Texto de éxito -->
<span class="text-green-600">Operación exitosa</span>

<!-- Con opacity -->
<div class="bg-brand-bun/50">50% de opacidad</div>
```

---

## Tipografía

### Familia de Fuentes

```
Primaria:  Inter
Fallback:  system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"
Mono:      SF Mono, Monaco, Cascadia Code, Roboto Mono
```

### Tamaños y Estilos

| Clase      | Tamaño | Altura | Uso                           |
|------------|--------|--------|-------------------------------|
| `text-xs`  | 12px   | 16px   | Pequeños labels, captions     |
| `text-sm`  | 14px   | 20px   | Texto secundario              |
| `text-base`| 16px   | 24px   | Texto estándar (body)         |
| `text-lg`  | 18px   | 28px   | Subheadings                   |
| `text-xl`  | 20px   | 28px   | Pequeños títulos              |
| `text-2xl` | 24px   | 32px   | Títulos medianos              |
| `text-3xl` | 30px   | 36px   | Títulos grandes               |
| `text-4xl` | 36px   | 40px   | Títulos principales           |
| `text-5xl` | 48px   | 48px   | Héroe                         |
| `text-6xl` | 64px   | 64px   | Máximo impacto                |

### Pesos de Fuente

```
font-thin:       100
font-light:      300
font-normal:     400
font-medium:     500
font-semibold:   600
font-bold:       700
font-extrabold:  800
font-black:      900
```

### Ejemplo

```html
<h1 class="text-4xl font-black text-neutral-charcoal">Título Principal</h1>
<p class="text-base text-neutral-charcoal/72">Párrafo descriptivo</p>
<small class="text-xs text-neutral-muted">Texto pequeño</small>
```

---

## Espaciado

Utilizar siempre tokens de espaciado. Nunca valores hardcodeados.

### Escala de Espaciado

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 28px
4xl: 32px
5xl: 36px
6xl: 40px
```

### Uso

```html
<!-- Padding -->
<div class="p-lg">Padding grande</div>
<div class="px-md py-lg">Padding horizontal md, vertical lg</div>

<!-- Margin -->
<div class="m-xl">Margen XL</div>
<div class="mx-auto">Centrado horizontalmente</div>

<!-- Gap (Flexbox/Grid) -->
<div class="flex gap-md">Items con gap md</div>
<div class="grid gap-lg">Grid con gap lg</div>
```

---

## Componentes

### Estructura de Componentes

Cada componente debe tener:
1. **HTML**: Estructura semántica
2. **CSS**: Basado en Tailwind + Design Tokens
3. **JavaScript**: Interactividad (si es necesaria)
4. **Variantes**: Diferentes estados visuales
5. **Documentación**: Casos de uso

### Estado Actual Del Set Base

Actualmente el sistema ya incluye:

- `Button.js`
- `Input.js`
- `Card.js`
- `Badge.js`
- `ActionCard.js`
- `LoadingOverlay.js`
- `PageHero.js`
- `StatGrid.js`
- `ResourceList.js`

Pilotos y previews actuales:

- `src/adminPanel.html`: piloto migrado del panel administrativo con auth
- `src/adminPanel-preview.html`: ruta visual sin auth para revisar layout del panel
- `src/misTurnos.html`: piloto migrado de la vista personal de turnos con auth
- `src/misTurnos-preview.html`: ruta visual sin auth para revisar calendario y densidad de información

Estado del trabajo en esta rama:

- la demo principal del design system ya compila como artefacto Vite autosuficiente
- los tokens y primitives base ya sostienen hero, cards, acciones, badges, recursos y overlays
- `adminPanel` ya quedó convertido a patrones formales reutilizables dentro de `src/components/`
- `misTurnos` ya tiene piloto y preview visual funcional
- el selector de mes en `misTurnos` quedó resuelto temporalmente con un `select` nativo

Pendiente importante:

- el popover custom para seleccionar meses no quedó con el comportamiento ni la experiencia visual esperada; hay que rediseñarlo y corregirlo antes de dar por cerrada la interacción final del calendario

Siguientes pasos recomendados:

1. corregir el popover custom del selector de meses en `misTurnos` y `misTurnos-preview`
2. revisar responsividad fina de `misTurnos` en móvil, tablet y desktop
3. migrar la siguiente pantalla real reutilizando los componentes ya formalizados
4. conectar el build del design system al pipeline de despliegue cuando los previews queden cerrados

### Button

Existe una implementación base en `src/components/Button.js` para generar botones consistentes desde JavaScript.

```html
<!-- Primario -->
<button class="px-lg py-md bg-brand-bun text-neutral-charcoal rounded-lg font-semibold hover:bg-brand-bun-dark transition-colors">
  Acción Principal
</button>

<!-- Secundario -->
<button class="px-lg py-md border-2 border-brand-bun text-brand-bun rounded-lg font-semibold hover:bg-brand-bun/10 transition-colors">
  Acción Secundaria
</button>

<!-- Peligro -->
<button class="px-lg py-md bg-error text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
  Eliminar
</button>

<!-- Deshabilitado -->
<button disabled class="px-lg py-md bg-neutral-muted text-white rounded-lg font-semibold opacity-50 cursor-not-allowed">
  Deshabilitado
</button>
```

### Input

Existe una implementación base en `src/components/Input.js` con `label`, `hint` y estilos consistentes.

```html
<div class="flex flex-col gap-sm">
  <label class="text-sm font-semibold text-neutral-charcoal">Email</label>
  <input 
    type="email"
    class="px-md py-md border border-neutral-charcoal/20 rounded-lg text-base font-normal focus:ring-2 focus:ring-brand-bun focus:border-transparent transition-ring"
    placeholder="tu@email.com"
  />
</div>
```

### Card

Existe una implementación base en `src/components/Card.js` para contenedores neutros, destacados y oscuros.

```html
<div class="p-lg bg-neutral-paper rounded-2xl border border-neutral-charcoal/10 shadow-lg">
  <h3 class="text-xl font-semibold text-neutral-charcoal mb-md">Título</h3>
  <p class="text-base text-neutral-charcoal/72">Contenido de la tarjeta</p>
</div>
```

---

## Cómo Empezar

### 1. Instalación

El proyecto ya tiene todo instalado. Solo necesitas:

```bash
npm install
```

### 2. Modo Desarrollo

```bash
npm run dev
```

Abre la demo del sistema en `src/index.html`.

### Artefactos Generados

`npm run build` deja:

- `dist/design-system.html`: demo del sistema
- `dist/adminPanel.html`: piloto migrado del panel administrativo
- recursos legacy copiados a `dist/` para navegación y pruebas locales del piloto

Se abrirá un servidor en `http://localhost:3000`

### 3. Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

### 4. Importar Estilos

En tus archivos HTML o JS, importa los estilos globales:

```html
<!-- En el head del HTML -->
<link rel="stylesheet" href="/src/styles/globals.css">

<!-- O en JS/TypeScript -->
import '../styles/globals.css';
```

### 5. Crear Componentes

Sigue esta estructura:

```
src/
├── components/
│   ├── Button.js          # Lógica del componente
│   ├── Button.css         # Estilos específicos (si existen)
│   └── README.md          # Documentación
```

**Ejemplo de componente (Button.js)**:

```javascript
export function createButton(label, variant = 'primary', onClick = null) {
  const button = document.createElement('button');
  
  // Clases base
  button.className = 'px-lg py-md rounded-lg font-semibold transition-all focus-ring';
  
  // Variantes
  const variants = {
    primary: 'bg-brand-bun text-neutral-charcoal hover:bg-brand-bun-dark',
    secondary: 'border-2 border-brand-bun text-brand-bun hover:bg-brand-bun/10',
    danger: 'bg-error text-white hover:opacity-90',
  };
  
  button.className += ' ' + (variants[variant] || variants.primary);
  button.textContent = label;
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}
```

---

## ✅ Checklist para Developers

Antes de hacer commit:

- [ ] ¿Usé colores del Design System?
- [ ] ¿Usé espaciados del Design System?
- [ ] ¿Usé tipografía del Design System?
- [ ] ¿El componente es reutilizable?
- [ ] ¿Documenté el componente?
- [ ] ¿Probé en móvil y desktop?
- [ ] ¿El componente respeta el foco visual?
- [ ] ¿Sin valores hardcodeados?

---

## 📞 Preguntas Frecuentes

**P: ¿Necesito crear un nuevo token?**
A: Primero verifica si existe uno similar. Si no existe, crea una issue para discutirlo antes.

**P: ¿Puedo usar colores diferentes?**
A: No. Siempre usa colores del Design System. Si no existe el color que necesitas, sugiere agregarlo.

**P: ¿Y si necesito un valor específico?**
A: Usa tokens. Si realmente necesitas un valor específico, documenta por qué en tu PR.

---

## 📚 Referencias

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens en Figma](https://www.figma.com) (crear link a Figma del proyecto)
- [`tailwind.config.js`](../tailwind.config.js)
- [`src/styles/globals.css`](../src/styles/globals.css)

---

**Última actualización**: 2026-06-04
**Responsable**: El equipo de desarrollo
