---
version: alpha
name: Industry Standard Wireframe
description: Un sistema de diseño de baja fidelidad para wireframes enfocado puramente en UX, estructura, arquitectura de la información y jerarquía visual.
colors:
  surface: "#FFFFFF"
  neutral-10: "#F3F4F6"
  neutral-20: "#E5E7EB"
  neutral-30: "#D1D5DB"
  neutral-50: "#6B7280"
  neutral-70: "#374151"
  neutral-90: "#111827"
  primary: "#111827"
typography:
  headline-display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
  headline-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "Roboto Mono, monospace"
    fontSize: 12px
    fontWeight: 500
    letterSpacing: 0.05em
    lineHeight: 1
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px
breakpoints:
  tablet: 900px
  mobile: 600px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.neutral-90}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-90}"
    rounded: "{rounded.sm}"
    padding: 12px
  image-placeholder:
    backgroundColor: "{colors.neutral-10}"
    rounded: "{rounded.none}"
---

# Wireframe Design System

## Overview

También conocido como "Brand & Style". En el contexto de un wireframe, el "estilo" es intencionalmente neutral y utilitario. 

El objetivo de este sistema de diseño es eliminar distracciones visuales (colores, sombras, fotografías) para centrar la discusión de los stakeholders en la arquitectura de la información, los flujos de usuario y la funcionalidad. La estética debe sentirse como el plano estructural de un edificio: clara, matemática, densa cuando sea necesario, pero siempre altamente legible y objetiva.

## Colors

El wireframe se construye estrictamente en escala de grises. La ausencia de color evita que el usuario final o los stakeholders asuman que el diseño visual está terminado.

- **Surface (#FFFFFF):** Blanco puro para el fondo general y el interior de las tarjetas.
- **Neutral-10 (#F3F4F6):** Gris muy claro, utilizado principalmente para rellenar marcadores de posición de imágenes (placeholders), fondos secundarios de tablas y contenedores.
- **Neutral-20 (#E5E7EB):** Gris claro de transición para fondos de pestañas inactivas y separadores sutiles.
- **Neutral-30 (#D1D5DB):** Gris medio-claro empleado para bordes de contenedores, inputs inactivos y divisores horizontales.
- **Neutral-50 (#6B7280):** Gris medio-oscuro utilizado para texto secundario, descripciones y estados deshabilitados.
- **Neutral-70 (#374151):** Gris oscuro para etiquetas de alto contraste y encabezados de tabla técnicos.
- **Neutral-90 / Primary (#111827):** Casi negro, utilizado para el texto principal, encabezados, y botones de llamada a la acción (CTA) para garantizar un contraste máximo y legibilidad WCAG AAA.

## Typography

La tipografía debe ser estándar, sin adornos y fácil de leer. Utilizamos fuentes del sistema o sin remates (sans-serif) para el contenido general, y una fuente monoespaciada para anotaciones técnicas.

- **Headlines:** `Inter` o fuente del sistema en pesos Bold/Semi-Bold. Define la jerarquía clara de la página. En wireframes adaptables, se recomienda `font-size: clamp(24px, 4vw, 36px); line-height: 1.15;` para que los títulos se ajusten naturalmente a móviles sin quebrar el layout.
- **Body:** `Inter` en peso Regular. Se utiliza para simular cómo ocupará espacio el contenido real o el texto simulado (Lorem Ipsum).
- **Labels (Anotaciones):** `Roboto Mono` o cualquier tipografía monoespaciada en tamaño pequeño. Se usa exclusivamente para notas técnicas del diseñador (ej. "Área dinámica", códigos SKU, fechas de auditoría).

## Layout & Responsive Design

El sistema está diseñado para adaptarse fluidamente a tres rangos de pantalla:

1. **Escritorio (`> 900px`):** Cuadrícula de 12 columnas (Grid), ancho máximo de contenedor unificado a `1200px` (o `100%` con margen interno de `24px`).
2. **Tablet / Ventanas intermedias (`<= 900px`):** Cuadrícula colapsada a 8 columnas o formularios/filtros en 2 columnas.
3. **Dispositivos móviles (`<= 600px`):** Cuadrícula de 4 columnas, margen interno de página reducido a `16px`, toolbars de filtro y formularios colapsados a 1 columna (`grid-template-columns: 1fr`).

Nos basamos en un sistema de espaciado estricto múltiplo de 8px (4, 8, 16, 24, 32, 64px). Los contenedores y las secciones se agrupan utilizando bordes sólidos de 1px (`neutral-30`) en lugar de colores de fondo.

### Tablas y Contención Móvil
En pantallas de smartphone, las tablas densas deben evitar forzar el desbordamiento horizontal de la página completa. Se aplican dos técnicas:
- Envolver la tabla en un contenedor `.table-wrap` con `overflow-x: auto; -webkit-overflow-scrolling: touch;`.
- O alternar a una vista de tarjetas apiladas en móvil (`.desktop-table { display: none }` / `.mobile-list { display: block }`).

## Elevation & Depth

En los wireframes, **no se utilizan sombras ni desenfoques (blurs)**. 

La profundidad y la separación de elementos (ej. modales, menús desplegables o popovers) se logran mediante:
1. Un borde de mayor contraste (`neutral-90`).
2. Una capa de oscurecimiento en el fondo (overlay al 50% de opacidad usando `neutral-90`: `rgba(17, 24, 39, 0.5)`).
3. Modales elásticos en móvil: `width: min(600px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow-y: auto;`.

## Shapes

Las formas son puramente utilitarias e informativas:
- **Cajas rectangulares con una "X" diagonal:** Representan imágenes o videos (placeholders).
- **Círculos perfectos:** Representan avatares de usuarios o íconos principales.
- **Bordes rectos o mínimamente redondeados (4px):** Para botones y campos de entrada de texto.

## Components & Accessibility

- **Buttons (Botones):** Los primarios utilizan relleno oscuro (`neutral-90`) con texto blanco. Los secundarios tienen borde (`neutral-90` o `neutral-30`) y fondo blanco. En dispositivos móviles, las acciones modales se apilan verticalmente a ancho completo (`width: 100%`).
- **Touch Target:** Todos los botones, campos de texto y enlaces deben tener un área de contacto mínima de `44x44px` para accesibilidad táctil WCAG.
- **Input fields (Campos de texto):** Rectángulos con borde gris (`neutral-30`) y etiqueta superior. En estado de error o `[aria-invalid="true"]`, el borde se eleva a `2px solid var(--neutral-90)` con mensaje de error en escala de grises.
- **Checkboxes & Radios:** Usar `accent-color: var(--neutral-90);` para garantizar que la selección activa respete la escala de grises.
- **Focus Indicators:** Todo elemento interactivo debe contar con un foco visible accesible: `outline: 3px solid var(--neutral-90); outline-offset: 2px;`.
- **Anotaciones técnicas (`A-01`, `A-02`):** Pertenecen exclusivamente a la documentación de flujo (`wireframes/flows/`). No deben renderizarse en el HTML visible del prototipo.
- **Convención de título:** Cada prototipo debe identificar su código y función en el `<title>`: `<title>WF-XXX — [Nombre funcional]</title>`.
- **Identidad de cabecera:** La marca oficial del sistema es `PO Productos y ofertas`.

## Do's and Don'ts

- **Do (Hacer):** Utiliza siempre escala de grises para no desviar la atención de la funcionalidad.
- **Don't (No hacer):** No utilices fotografías reales o logotipos finales; usa cajas con una "X" y texto genérico como "Logo de Marca".
- **Do (Hacer):** Asegúrate de que el tamaño de los botones (mínimo 44x44px) respete los estándares de accesibilidad para áreas táctiles en móviles y escritorio.
- **Don't (No hacer):** No uses sombras (drop shadows); define las áreas flotantes utilizando bordes oscuros de 1px o 2px y fondos blancos.
- **Do (Hacer):** Garantiza que la página sea navegable en 320px de ancho sin scroll horizontal indeseado en el `<body>`.
- **Do (Hacer):** Utiliza texto real (copy) en botones y títulos en lugar de *Lorem Ipsum* siempre que sea posible.