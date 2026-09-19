# SPEC-007 — Especificación: Reglas de venta cruzada y upselling

## 1. Contexto

La capacidad permite configurar manualmente reglas de Cross-sell y Upsell para exponer recomendaciones a Marketplace, Chatbot y Retail.

## 2. Propósito

Permitir al Gestor Comercial definir recomendaciones basadas en producto o categoría, ordenarlas de forma determinista y exponer únicamente alternativas vigentes y disponibles.

## 3. Alcance

Incluye:
- Registrar reglas Cross-sell y Upsell.
- Registrar una justificación comercial por cada producto recomendado como Upsell.
- Definir origen por producto o por categoría.
- Asociar uno o más productos recomendados.
- Definir prioridad de la regla.
- Definir orden de los productos dentro de la regla.
- Definir periodo de vigencia.
- Activar y desactivar reglas.
- Validar existencia y estado activo de productos.
- Filtrar por stock.
- Deduplicar recomendaciones.
- Devolver precio vigente y disponibilidad.
- Consultar recomendaciones mediante API.

## 4. Modelo de prioridad y orden

Cada regla posee `prioridad`, donde `1` representa la mayor prioridad.

Cada producto relacionado dentro de una regla posee `orden`.

La salida se ordena primero por `prioridad` ascendente y luego por `orden` ascendente.

Si el mismo producto recomendado aparece por múltiples reglas, se conserva una sola aparición: la primera según el orden anterior.

## 5. Requisitos

### Requisito 1: Registrar reglas de Cross-sell

El sistema DEBE permitir relacionar un origen —producto o categoría— con uno o más productos complementarios.

### Requisito 2: Registrar reglas de Upsell

El sistema DEBE permitir relacionar un origen (producto o categoría) con uno o más productos clasificados expresamente por el Gestor Comercial como alternativas superiores.

**Criterio de negocio acordado para esta funcionalidad:** la superioridad es una **clasificación comercial manual y justificada**, no el resultado de una comparación automática. Por cada producto recomendado en una regla UPSELL, el gestor DEBE registrar una `justificacion_comercial` que identifique una mejora concreta frente al producto origen o, si el origen es una categoría, frente al tipo de productos comprendidos por ella (por ejemplo, mayor amortiguación, material de mayor resistencia o una funcionalidad adicional). La justificación DEBE referirse a una característica o prestación identificable en la ficha del producto recomendado, de modo que pueda revisarse administrativamente.

El sistema DEBE exigir que la justificación no esté vacía al crear o modificar la regla; el gestor es responsable de la pertinencia y veracidad de la clasificación. El sistema NO verifica automáticamente si la mejora declarada es verdadera, NO calcula una puntuación de superioridad y NO considera el precio más alto, por sí solo, como justificación suficiente. No se exige una diferencia de precio, ni que origen y recomendado pertenezcan a la misma categoría.

Si una regla UPSELL utiliza origen por categoría, el gestor DEBE justificar la mejora respecto del tipo de productos de esa categoría; la plataforma no comprueba individualmente la superioridad respecto de cada producto que coincida con ella. La `justificacion_comercial` se conserva asociada a cada producto recomendado para consulta y revisión administrativa; no es obligatorio exponerla en la API consumida por los canales.

### Requisito 3: Validar productos

Todos los productos configurados como origen específico o recomendados DEBEN existir y estar activos.

No se permite recomendar el mismo producto de origen ni repetir un producto dentro de una misma regla.

### Requisito 4: Definir prioridad y orden

Cada regla DEBE tener una prioridad válida.

Cada producto recomendado DEBE tener un orden de presentación dentro de la regla.

### Requisito 5: Validar vigencia y estado

Cada regla DEBE incluir fecha/hora de inicio y fin, con inicio anterior al fin, además de estado ACTIVA o INACTIVA.

Solo las reglas activas y vigentes participan en las consultas.

### Requisito 6: Evaluar reglas por producto o categoría

Una regla puede activarse:
- por coincidencia con un producto origen específico; o
- porque el producto consultado pertenece a la categoría configurada como origen.

### Requisito 7: Filtrar disponibilidad

Antes de devolver recomendaciones, el sistema DEBE excluir productos:
- inactivos;
- inexistentes;
- sin stock disponible.

### Requisito 8: Deduplicar

Si varias reglas producen el mismo producto recomendado, la salida DEBE contenerlo una sola vez, conservando la primera aparición de acuerdo con prioridad y orden.

### Requisito 9: Consultar recomendaciones por API

La respuesta DEBE incluir como mínimo:
- identificador del producto recomendado;
- tipo CROSS_SELL o UPSELL;
- prioridad de la regla;
- orden de presentación;
- precio vigente;
- disponibilidad.

Si no existen resultados válidos, se devuelve una lista vacía.

### Requisito 10: Consultar reglas configuradas

La consulta administrativa DEBE mostrar como mínimo:
- nombre;
- tipo;
- origen;
- prioridad;
- estado;
- fecha/hora de inicio y fin;
- productos recomendados y su orden;
- justificación comercial de cada producto recomendado cuando la regla sea UPSELL.

## 6. Requisitos no funcionales

- Rendimiento: respuesta adecuada para interacción en tiempo real.
- Seguridad: solo Gestor Comercial autorizado administra reglas.
- Auditoría: registrar creación y última modificación.
- Integración: recomendaciones expuestas por API.
- Escalabilidad: permitir incorporar nuevas reglas sin modificar la lógica de los canales consumidores.

## 7. Fuera de alcance

- Inteligencia artificial o machine learning.
- Historial de navegación o compras.
- Determinar o verificar automáticamente si una alternativa es “superior”.
- Agregar o reemplazar automáticamente productos en una compra.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando todos los requisitos anteriores se cumplen.
