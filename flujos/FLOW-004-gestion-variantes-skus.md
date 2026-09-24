# FLOW-004 — Gestión avanzada de variantes (SKUs)

## 1. Identificación

- **Código:** FLOW-004
- **Funcionalidad:** Gestión avanzada de variantes (SKUs)
- **Relacionado con:** [HU-004](../hu/HU-004-gestion-variantes-skus.md) / [SPEC-004](../specs/SPEC-004-gestion-variantes-skus.md) / [WF-004](../wireframes/flows/WF-004-gestion-variantes-skus.md)
- **Prototipo de referencia:** [WF-004 — Prototipo HTML](../wireframes/prototipos/WF-004-gestion-variantes-skus/index.html)
- **Flujos relacionados:** [FLOW-003 — Productos](FLOW-003-gestion-productos-crud.md) / [FLOW-001 — Carga masiva](FLOW-001-carga-exportacion-masiva-productos.md)
- **Responsable:** Gabriel Poma Gutierrez
- **Última actualización:** 2026-09-23

---

## 2. Objetivo del flujo

Representar la configuración de características identificadoras, consulta, creación en borrador, edición, activación, reactivación y desactivación de variantes para productos con `tiene_variantes=true`. El flujo contempla un `variant_id` interno inmutable, SKU comercial suministrado o generado, combinación única de valores e imagen propia, así como la preparación en Pricing e Inventario y el efecto de la baja de la última variante activa sobre el producto padre.

El producto padre aporta sus datos generales; cada variante identifica una combinación comercial concreta. El stock pertenece exclusivamente a Inventario y el precio a Pricing. Las variantes se conservan mediante baja lógica, sin eliminación física ni alteración de snapshots de pedidos confirmados.

**Criterio de lectura de las fuentes:** se aplica SPEC → HU → WF, conforme a WF-004. El HTML se toma como referencia de navegación y estados, no como contrato completo: su validación de activación no verifica todas las preparaciones, su baja no inactiva todavía al padre y su ejemplo genera SKU a partir de etiquetas. Este FLOW conserva las reglas normativas: identidad basada en IDs estables, preparación confirmada y baja del padre junto con la última variante activa.

---

## 3. Actores participantes

- **Gestor comercial:** configura identificadores del producto, consulta y administra las variantes y confirma cambios de estado.
- **Sistema de Catálogo:** valida autorización, identidad y reglas; genera `variant_id`; valida o genera SKU; guarda variantes y registra trazabilidad.
- **Inventario:** inicializa el stock por SKU en cero, confirma su registro y entrega disponibilidad vigente.
- **Pricing:** confirma preparación del precio y determina el precio específico por SKU o la herencia del precio base.
- **Canales de venta:** consultan variantes comercialmente elegibles y su disponibilidad.
- **Sistema de carga masiva:** entrega filas de creación o actualización y recibe resultados correlacionados.

---

## 4. Diagramas de flujo

Se siguen las convenciones de [FLOW_TEMPLATE](FLOW_TEMPLATE.md). Toda operación administrativa valida sesión y permiso en el sistema, incluso si la interfaz oculta la acción. Cada creación, edición, cambio de imagen o estado deja trazabilidad con usuario, fecha/hora, modificación y resultado. Los errores de autorización, conexión, existencia y concurrencia son transversales y se detallan en 4.8.

### 4.1 Acceso, consulta administrativa y configuración de identificadores

La entrada habitual es **Gestionar variantes** desde el detalle del producto. El contexto del padre se conserva al consultar, crear o editar; el listado incluye variantes en borrador, activas e inactivas y permite filtrar por característica o estado.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Gestión de variantes solicitada))
        G1["Abrir variantes del producto"]
        G2["Consultar listado y filtrar por característica o estado"]
        D2{"¿Qué acción necesita?"}
        G3["Consultar detalle de variante"]
        G4["Seleccionar características identificadoras del producto"]
        G5["Corregir selección"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar acceso y consultar producto padre"]
        D1{"¿El producto tiene variantes habilitadas?"}
        S2["Informar producto simple y ofrecer retorno a Gestión de Productos"]
        S3["Mostrar variantes o lista vacía con contexto del padre"]
        S4["Mostrar identidad, imagen, estado y datos heredados"]
        D3{"¿Ya existe alguna variante registrada?"}
        S5["Mostrar configuración identificadora como solo lectura"]
        S6["Validar conjunto no vacío de características LISTA activas del tipo"]
        D4{"¿La selección es válida y no contiene IDs repetidos?"}
        S7["Guardar configuración previa a la primera variante"]
        S8["Mostrar motivos de selección inválida"]
    end

    FIN_SIMPLE(((Funcionalidad no aplicable al producto simple)))
    FIN_CONSULTA(((Consulta administrativa completada)))
    FIN_CONFIG(((Configuración disponible para crear variantes)))

    INICIO --> G1 --> S1 --> D1
    D1 -->|"No"| S2 --> FIN_SIMPLE
    D1 -->|"Sí"| S3 --> G2 --> D2
    D2 -->|"Ver variante"| G3 --> S4 --> FIN_CONSULTA
    D2 -->|"Configurar identificadores"| D3
    D3 -->|"Sí, en cualquier estado"| S5 --> FIN_CONFIG
    D3 -->|"No"| G4 --> S6 --> D4
    D4 -->|"No"| S8 --> G5 --> G4
    D4 -->|"Sí"| S7 --> FIN_CONFIG
    D2 -->|"Finalizar consulta"| FIN_CONSULTA
```

La configuración pertenece al producto y puede completarse desde WF-003 antes de la primera variante; no implica una pantalla nueva obligatoria. Solo admite `caracteristica_id` distintos, de tipo LISTA, activos y aplicables al `tipo_producto_id`. NUMERO y TEXTO no identifican variantes en este alcance.

Desde la primera variante, el conjunto queda fijo aunque todas se desactiven después. Cambiar la categoría de navegación o renombrar etiquetas no cambia identidad ni SKU. Un cambio incompatible de tipo requiere migración fuera del CRUD; no reescribe identidades existentes y bloquea nuevas creaciones o activaciones con configuración inválida.

La ausencia de variantes o de coincidencias con los filtros produce una lista vacía exitosa. Sin variantes, el gestor puede iniciar 4.2; el padre no puede activarse hasta contar con al menos una variante activa válida y cumplir FLOW-003.

### 4.2 Creación de variante con SKU suministrado o generado

La creación individual parte de un producto existente en borrador o activo con `tiene_variantes=true`. Cada variante requiere exactamente un `valor_id` activo, perteneciente a cada LISTA identificadora configurada, y al menos una imagen propia; la imagen general del padre no sustituye este requisito.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Creación de variante iniciada))
        G1["Elegir valores, adjuntar imagen y aportar SKU opcional"]
        G2["Solicitar creación de variante"]
        G3["Corregir datos, combinación o archivo"]
        G4["Corregir SKU aportado o reintentar generación"]
        G5["Consultar variant_id, SKU y estado borrador confirmados"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        E1((Solicitud de creación recibida))
        S1["Validar padre, configuración, valores e imagen propia"]
        D1{"¿Son válidos y están completos los datos?"}
        S2["Informar error sin crear variante"]
        D2{"¿Ya existe la combinación de IDs en este producto?"}
        S3["Rechazar combinación duplicada incluso si está inactiva"]
        D3{"¿Se informó SKU comercial?"}
        S4["Validar formato del SKU solicitado"]
        S5["Generar SKU desde sku_base e identidad estable"]
        D4{"¿El SKU es válido y único en todo el catálogo?"}
        S6["Rechazar SKU inválido o colisión sin exponer variante"]
        S7["Generar variant_id y persistir variante en borrador con unicidad confirmada"]
        S8["Fijar conjunto identificador del producto y registrar alta"]
        E2((Variante creada en borrador))
        S9["Notificar creación a Inventario para inicialización del SKU"]
    end

    FIN(((Variante creada, preparación y activación pendientes)))

    INICIO --> G1 --> G2 --> E1 --> S1 --> D1
    D1 -->|"No"| S2 --> G3 --> G1
    D1 -->|"Sí"| D2
    D2 -->|"Sí"| S3 --> G3
    D2 -->|"No"| D3
    D3 -->|"Sí"| S4 --> D4
    D3 -->|"No"| S5 --> D4
    D4 -->|"No"| S6 --> G4 --> G1
    D4 -->|"Sí"| S7 --> S8 --> E2 --> S9 --> G5 --> FIN
```

La combinación no admite identificadores faltantes ni extra y se compara por IDs estables, no por etiquetas. Su unicidad se comprueba dentro del padre frente a todas sus variantes; la del SKU se comprueba globalmente frente a productos y variantes. Ambas restricciones se confirman al persistir, incluso ante solicitudes concurrentes.

`variant_id` se genera siempre y no es el SKU comercial. Si el gestor aporta un SKU válido, se conserva; si lo omite, se aplica la convención vigente sin inventar aquí una nomenclatura nueva. Un rechazo de creación no expone una variante parcial. La imagen se valida por formato, tamaño y contenido, sin fijar límites que aún están pendientes en WF-004.

### 4.3 Preparación, activación y reactivación

Inventario inicializa el SKU recién creado en cero y confirma su registro. Catálogo no almacena ni calcula esa cantidad. Pricing confirma el precio base del padre y el precio aplicable al SKU: específico si existe, o heredado del precio base vigente. La preparación puede quedar pendiente después de crear el borrador.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Activación o reactivación solicitada))
        G1["Revisar variante y requisitos pendientes"]
        D1{"¿Confirma activar o reactivar?"}
        G2["Consultar faltantes y conservar contexto"]
        G3["Consultar variante activa y estado del padre"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Revalidar autorización, estado de origen, identidad, atributos e imagen"]
        S2["Validar configuración del padre y categoría y marca activas"]
        D2{"¿Se cumplen las condiciones de Catálogo?"}
        S3["Informar rechazo sin cambiar borrador o inactiva"]
        S4["Verificar preparación confirmada de precio e inventario"]
        D3{"¿Ambos dominios confirmaron la preparación?"}
        S5["Informar preparación pendiente y conservar estado original"]
        S6["Cambiar variante a activa conservando variant_id y SKU"]
        S7["Registrar operación y conservar estado del producto padre"]
        E1((Variante activada))
    end

    subgraph PRECIOS["Pricing"]
        direction TB
        P1["Entregar confirmación de precio base y precio aplicable al SKU"]
    end

    subgraph STOCK["Inventario"]
        direction TB
        I1["Entregar confirmación de inicialización del SKU"]
    end

    FIN_CANCELADO(((Cambio cancelado sin efectos)))
    FIN_PENDIENTE(((Activación no aplicada)))
    FIN_ACTIVA(((Variante activa, elegibilidad comercial sujeta al padre)))

    INICIO --> G1 --> D1
    D1 -->|"No"| FIN_CANCELADO
    D1 -->|"Sí"| S1 --> S2 --> D2
    D2 -->|"No"| S3 --> G2 --> FIN_PENDIENTE
    D2 -->|"Sí"| S4
    P1 --> S4
    I1 --> S4
    S4 --> D3
    D3 -->|"No o sin confirmación"| S5 --> G2
    D3 -->|"Sí"| S6 --> S7 --> E1 --> G3 --> FIN_ACTIVA
```

Las transiciones son **BORRADOR → ACTIVA** e **INACTIVA → ACTIVA**, mediante acción explícita y las mismas validaciones. La prevalidación de pantalla no sustituye la comprobación al ejecutar. Tras corregir datos o recibir la preparación pendiente se vuelve a solicitar la operación; la llegada de una confirmación no activa por sí sola la variante.

Una variante preparada puede activarse con padre borrador o inactivo: el padre no se activa ni reactiva automáticamente. Su activación corresponde a FLOW-003 y la elegibilidad comercial se comprueba en 4.6. Inventario inicializado en cero cumple la preparación del registro, pero no garantiza existencias para vender.

### 4.4 Edición de atributos no identificadores e imagen

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Edición de variante iniciada))
        G1["Modificar atributos no identificadores o seleccionar nueva imagen"]
        G2["Solicitar guardado"]
        G3["Corregir datos o elegir otra imagen"]
        G4["Revisar procedimiento de baja y nueva variante para corregir identidad"]
        G5["Consultar detalle actualizado"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar existencia, pertenencia al padre, permiso y vigencia"]
        D1{"¿Se intenta modificar identidad o SKU?"}
        S2["Rechazar edición de variant_id, SKU o atributos identificadores"]
        S3["Validar atributos editables y archivo de reemplazo si existe"]
        D2{"¿Los cambios son válidos?"}
        S4["Informar error y conservar datos e imagen vigentes"]
        S5["Guardar cambios y sustituir imagen solo al confirmar el guardado"]
        S6["Registrar modificación conservando identidad y estado"]
        E1((Edición confirmada))
    end

    FIN_RECHAZADO(((Identidad conservada sin aplicar el cambio)))
    FIN_OK(((Variante actualizada)))

    INICIO --> G1 --> G2 --> S1 --> D1
    D1 -->|"Sí"| S2 --> G4 --> FIN_RECHAZADO
    D1 -->|"No"| S3 --> D2
    D2 -->|"No"| S4 --> G3 --> G1
    D2 -->|"Sí"| S5 --> S6 --> E1 --> G5 --> FIN_OK
```

El formulario presenta identidad y SKU como solo lectura, sin controles de precio, stock ni cambio de estado. La imagen vigente permanece asociada si el archivo nuevo es inválido o el guardado falla; un reemplazo no confirmado no se presenta como aplicado. Los mensajes distinguen formato no permitido y tamaño excedido cuando el contrato lo informa.

Los atributos identificadores son inmutables desde la creación, incluso con SKU externo. Para corregir una combinación se sigue la baja y el registro de una nueva combinación, sin reutilizar una identidad ya registrada. La recodificación de un SKU publicado exige migración explícita fuera de este flujo; no se ofrece edición ordinaria del SKU.

### 4.5 Desactivación y efecto sobre la última variante activa

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Baja de variante activa solicitada))
        G1["Revisar variante, padre e impacto sobre nuevas ventas"]
        D1{"¿Confirma la desactivación?"}
        G2["Consultar estados actualizados de variante y padre"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Informar si la baja afecta también al producto padre"]
        S2["Revalidar autorización, estado y variantes activas del padre"]
        D2{"¿La baja deja al padre sin variantes activas?"}
        S3["Inactivar únicamente la variante solicitada"]
        S4["Inactivar variante y padre en la misma transacción local"]
        S5["Registrar baja y conservar identidad, historial y snapshots"]
        E1((Baja lógica confirmada))
        S6["Notificar baja a Inventario y consumidores correspondientes"]
        S7["Excluir SKU de nuevas ventas y nuevos combos"]
    end

    FIN_CANCELADO(((Baja cancelada sin cambios)))
    FIN_OK(((Variante inactiva con historial conservado)))

    INICIO --> S1 --> G1 --> D1
    D1 -->|"No"| FIN_CANCELADO
    D1 -->|"Sí"| S2 --> D2
    D2 -->|"No, quedan otras activas"| S3 --> S5
    D2 -->|"Sí, es la última activa"| S4 --> S5
    S5 --> E1 --> S6 --> S7 --> G2 --> FIN_OK
```

La confirmación advierte explícitamente la baja del padre cuando corresponda. El sistema vuelve a comprobar el contexto al ejecutar; un conflicto se trata según 4.8. Si quedan otras variantes activas, el padre mantiene su estado. Si era la última, ambas bajas se confirman en la misma transacción de Catálogo y se emiten las notificaciones correspondientes, incluida `catalog.product.deactivated` para el padre según FLOW-003.

No se modifican los stocks de las demás variantes ni se borran pedidos confirmados. La reactivación posterior conserva SKU y `variant_id`, ejecuta 4.3 y no reactiva al padre; este debe pasar por FLOW-003.

### 4.6 Consulta comercial y disponibilidad por SKU

```mermaid
flowchart LR
    subgraph CANAL["Canales de venta"]
        direction TB
        INICIO((Consulta de variantes para venta recibida))
        C1["Solicitar variantes por producto, combinación o SKU"]
        C2["Consultar variante exacta y disponibilidad vigente"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Consultar variante y producto padre"]
        D1{"¿Padre y variante están activos y preparados?"}
        S2["Excluir variante de la oferta comercial"]
        S3["Entregar identidad, atributos e imagen de la variante elegible"]
    end

    subgraph PRECIOS["Pricing"]
        direction TB
        P1["Resolver precio vigente específico del SKU o heredado del padre"]
    end

    subgraph STOCK["Inventario"]
        direction TB
        I1["Consultar disponibilidad vigente del SKU"]
        D2{"¿Se obtuvo la disponibilidad?"}
        I2["Devolver disponibilidad consultada"]
        I3["Informar disponibilidad no disponible para consulta"]
    end

    FIN_NO_ELEGIBLE(((Variante no ofrecida para nuevas ventas)))
    FIN_OK(((Consulta comercial completada)))
    FIN_ERROR(((Disponibilidad pendiente de consulta)))

    INICIO --> C1 --> S1 --> D1
    D1 -->|"No"| S2 --> FIN_NO_ELEGIBLE
    D1 -->|"Sí"| S3 --> P1 --> I1 --> D2
    D2 -->|"Sí"| I2 --> C2 --> FIN_OK
    D2 -->|"No"| I3 --> FIN_ERROR
```

La elegibilidad requiere simultáneamente padre activo, variante activa, precio preparado y SKU inicializado. Un fallo de consulta de Inventario no equivale a stock cero; tampoco se infiere disponibilidad a partir del estado ACTIVA. El orden del diagrama es funcional y no prescribe la arquitectura de consulta entre servicios. Si precio o disponibilidad se muestran en el detalle administrativo, son datos informativos de sus dominios propietarios.

Los combos utilizan el SKU vendible de la variante, no el identificador genérico del padre. La creación de pedidos, reservas, precios y combos queda fuera de este flujo.

### 4.7 Entrada desde carga masiva

Este subflujo corresponde al requisito 4.2 de SPEC-004. La selección del archivo, validación estructural, procesamiento del lote y reporte global pertenecen a FLOW-001; aquí se representa únicamente la operación de Catálogo sobre la variante.

```mermaid
flowchart LR
    subgraph CARGA["Sistema de carga masiva"]
        direction TB
        INICIO((Fila de variante preparada))
        B1["Enviar padre, tipo, atributos y SKU opcional con batch_id y row_id"]
        B2["Registrar resultado de Catálogo para la fila"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Resolver producto padre por sku_base"]
        D1{"¿Existe el producto padre?"}
        S2["Crear padre borrador una sola vez por grupo según FLOW-003"]
        S3["Validar padre y configuración identificadora"]
        D2{"¿Se resolvió un padre válido con variantes?"}
        D3{"¿La fila señala un SKU existente?"}
        S4["Validar actualización sin cambiar identidad ni recodificar SKU"]
        S5["Aplicar creación de 4.2 con SKU suministrado o generado"]
        D4{"¿La operación de Catálogo fue válida y se confirmó?"}
        S6["Devolver product_id, variant_id y sku correlacionados con la fila"]
        S7["Devolver rechazo y motivo correlacionados con la fila"]
    end

    FIN(((Resultado de Catálogo entregado a carga masiva)))

    INICIO --> B1 --> S1 --> D1
    D1 -->|"No"| S2 --> S3
    D1 -->|"Sí"| S3
    S3 --> D2
    D2 -->|"No"| S7
    D2 -->|"Sí"| D3
    D3 -->|"Sí"| S4 --> D4
    D3 -->|"No o SKU vacío"| S5 --> D4
    D4 -->|"Sí"| S6 --> B2
    D4 -->|"No"| S7 --> B2
    B2 --> FIN
```

Si el SKU informado ya existe, la fila representa una actualización de esa identidad, no la creación de otra variante con código duplicado. Se rechaza cualquier intento de cambiar sus atributos identificadores o recodificarla. Para el alta con SKU vacío, Catálogo genera el SKU; siempre genera el `variant_id` de una nueva variante.

Las creaciones conservan los requisitos de combinación e imagen propios de la variante y quedan en BORRADOR. La respuesta exitosa de Catálogo no significa que Pricing e Inventario hayan completado sus operaciones ni garantiza éxito total de la fila: la consolidación por dominio pertenece a FLOW-001.

### 4.8 Autorización, recuperación de errores y cancelación

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Solicitud administrativa enviada))
        G1["Enviar o reintentar operación"]
        G2["Iniciar sesión y retomar contexto del producto"]
        G3["Reintentar conservando datos y filtros"]
        G4["Recargar variante o producto y revisar cambios"]
        IC((Salida del formulario solicitada))
        D4{"¿Confirma descartar los cambios?"}
        G5["Continuar edición"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar sesión y permiso de la operación"]
        D1{"¿Cuál es el resultado de acceso?"}
        S2["Solicitar autenticación"]
        S3["Rechazar solicitud sin cambios"]
        S4["Ejecutar subflujo y comunicar su resultado"]
        D2{"¿Cuál es el resultado de la solicitud?"}
        S5["Informar fallo recuperable sin asumir guardado"]
        S6["Informar conflicto conservando versión e imagen vigentes"]
        S7["Informar producto o variante no encontrados"]
        D3{"¿Hay cambios sin guardar?"}
        S8["Descartar cambios locales y volver al origen"]
    end

    FIN_PERMISO(((Operación no autorizada)))
    FIN_RESULTADO(((Resultado funcional comunicado)))
    FIN_NO_EXISTE(((Operación no aplicada)))
    FIN_CANCELADO(((Formulario cerrado sin guardar)))

    INICIO --> G1 --> S1 --> D1
    D1 -->|"Sesión expirada"| S2 --> G2 --> G1
    D1 -->|"Sin permiso"| S3 --> FIN_PERMISO
    D1 -->|"Autorizado"| S4 --> D2
    D2 -->|"Respuesta funcional recibida"| FIN_RESULTADO
    D2 -->|"Sin conexión o fallo recuperable"| S5 --> G3 --> G1
    D2 -->|"Datos desactualizados"| S6 --> G4 --> G1
    D2 -->|"Entidad inexistente"| S7 --> FIN_NO_EXISTE
    IC --> D3
    D3 -->|"No"| S8
    D3 -->|"Sí"| D4
    D4 -->|"Sí"| S8 --> FIN_CANCELADO
    D4 -->|"No"| G5 --> G1
```

Las validaciones de combinación, SKU, imagen y preparación se muestran en su subflujo y permiten corregir sin perder el contexto. Se conserva el archivo seleccionado cuando sea posible y seguro; en edición nunca se elimina la imagen vigente por un fallo. Durante el envío se bloquea la repetición de la solicitud y el éxito se muestra solo después de la confirmación.

Tras crear, editar o cambiar estado se refrescan listado, detalle y resumen del padre. Los contratos exactos de API, formatos y límites de archivo, permisos granulares y estrategia de concurrencia permanecen pendientes en WF-004; este flujo no los convierte en decisiones de implementación.
