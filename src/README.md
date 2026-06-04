# Estructura de Carpetas · src/

## 📁 Organización

```
src/
├── index.html          # Punto de entrada de Vite
├── styles/
│   ├── globals.css     # Estilos globales (Tailwind + base)
│   └── ...             # Otros estilos específicos (si aplica)
├── scripts/
│   ├── main.js         # Script principal (punto de entrada)
│   └── ...             # Otros scripts reutilizables
├── components/
│   ├── Button.js       # Componentes reutilizables
│   ├── Input.js
│   ├── Card.js
│   └── ...
└── utils/
    ├── helpers.js      # Funciones auxiliares
    └── ...
```

## 📄 Descripción de Carpetas

### `styles/`
Contiene archivos CSS.

- **globals.css**: Importa Tailwind, define estilos base y utilidades personalizadas
- Otros archivos CSS para estilos específicos (si es necesario)

**Nota**: La mayoría de estilos deberían usar **Tailwind CSS** mediante clases. Evitar CSS custom.

### `scripts/`
Contiene archivos JavaScript que NO son componentes UI.

- **main.js**: Punto de entrada principal. Aquí se importan estilos globales e inicializa la app
- Otros scripts para lógica general, inicializaciones, etc.

### `components/`
Componentes reutilizables de la UI.

Cada componente debe tener:
- Un archivo `.js` con la lógica
- Documentación clara
- Ser agnóstico a la página (reutilizable en cualquier lugar)

**Ejemplo**: `Button.js`
```javascript
export function createButton(label, options = {}) {
  const {
    variant = 'primary',
    size = 'md',
    onClick = null,
  } = options;

  const button = document.createElement('button');
  
  // Clases Tailwind basadas en tokens
  const baseClasses = 'font-semibold rounded-lg transition-all focus-ring';
  const sizeClasses = {
    sm: 'px-md py-sm text-sm',
    md: 'px-lg py-md text-base',
    lg: 'px-xl py-lg text-lg',
  };
  const variantClasses = {
    primary: 'bg-brand-bun text-neutral-charcoal hover:bg-brand-bun-dark',
    secondary: 'border-2 border-brand-bun text-brand-bun hover:bg-brand-bun/10',
    danger: 'bg-brand-ketchup text-white hover:opacity-90',
  };

  button.className = `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary}`;
  button.textContent = label;

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
```

### `utils/`
Funciones auxiliares y utilidades no visuales.

- Helpers para formateo de datos
- Funciones de validación
- Utilidades de date/time
- Etc.

---

## ✅ Reglas de Oro

1. ✅ **Siempre usa Tailwind para estilos**
   - Usa clases de Tailwind en lugar de CSS custom
   - Si necesitas algo especial, extender `tailwind.config.js`

2. ✅ **Componentes reutilizables en `components/`**
   - No duplicar lógica de UI
   - Documentar cada componente
   - Hacer componentes agnósticos

3. ✅ **Tokens en `tailwind.config.js`**
   - Colores, espaciados, fuentes, etc. van en el config
   - Nunca hardcodear valores

4. ✅ **Imports en `main.js`**
   - `main.js` es el punto de entrada
   - Aquí se importan estilos y se inicializa la app

5. ✅ **Scripts en `scripts/`**
   - Lógica, event listeners, inicialización
   - Componentes visuales van en `components/`

---

## 🚀 Uso

### Importar un componente en HTML

```html
<script type="module">
  import { createButton } from './src/components/Button.js';
  
  const btn = createButton('Enviar', {
    variant: 'primary',
    size: 'lg',
    onClick: () => console.log('Clicked!'),
  });
  
  document.body.appendChild(btn);
</script>
```

### Importar un componente en JavaScript

```javascript
// main.js o cualquier otro script
import { createButton } from './components/Button.js';

const submitBtn = createButton('Guardar', { variant: 'primary' });
document.getElementById('form').appendChild(submitBtn);
```

### Usar clases Tailwind

```html
<div class="p-lg bg-brand-bun rounded-lg shadow-lg">
  <h2 class="text-2xl font-bold text-neutral-charcoal">Título</h2>
  <p class="text-base text-neutral-charcoal/72 mt-md">Descripción</p>
</div>
```

---

## 📚 Referencias

- [`tailwind.config.js`](../tailwind.config.js) - Tokens y configuración de Tailwind
- [`globals.css`](./styles/globals.css) - Estilos base y utilidades
- [`Docs/DESIGN_SYSTEM.md`](../Docs/DESIGN_SYSTEM.md) - Documentación del Design System

---

**Última actualización**: 2026-06-04
