# FLOW-003 — Gestión de productos (CRUD principal)

## 1. Identificación

- **Código:** FLOW-003
- **Funcionalidad:** Gestión de productos (CRUD principal)
- **Relacionado con:** [HU-003](../hu/HU-003-gestion-productos-crud.md) / [SPEC-003](../specs/SPEC-003-gestion-productos-crud.md) / [WF-003](../wireframes/flows/WF-003-gestion-productos-crud.md)
- **Prototipo de referencia:** [WF-003 — Prototipo HTML](../wireframes/prototipos/WF-003-gestion-productos-crud/index.html)
- **Responsable:** Gabriel Poma Gutierrez
- **Última actualización:** 2026-09-23

---

## 2. Objetivo del flujo

Representar la consulta, creación en borrador, actualización, activación, desactivación y reactivación de productos. Incluye las validaciones según el estado, la preparación de precio e inventario, la conservación del historial y los caminos de rechazo, cancelación y recuperación.

La baja es lógica. La gestión de variantes pertenece a WF-004; el CRUD solo configura sus características identificadoras antes de la primera variante, verifica su elegibilidad para activar el producto y recibe el efecto de la baja de la última variante activa. El precio posterior al alta y el stock se gestionan en sus funcionalidades correspondientes.

**Criterio de lectura de las fuentes:** se aplica la prioridad SPEC → HU → WF establecida en WF-003. Por ello, nombre y marca coincidentes generan una advertencia confirmable, aunque el escenario 5 de la HU todavía mencione un rechazo; los atributos provienen del tipo de producto, no de la categoría; y los cambios se confirman en Catálogo y se propagan por eventos, sin garantizar visibilidad instantánea global. Los controles de simulación del HTML no representan acciones reales del gestor.

---

## 3. Actores participantes

- **Gestor comercial:** consulta productos, completa sus datos, confirma operaciones y corrige requisitos pendientes.
- **Sistema de Catálogo:** autoriza operaciones, valida datos y estados, mantiene el producto y su slug, registra trazabilidad y comunica cambios.
- **Pricing:** registra y confirma el precio inicial y abre su historial de auditoría.
- **Inventario:** inicializa y confirma el registro de inventario de los SKU vendibles; es propietario del stock.
- **Canales de venta:** consultan el catálogo comercial y la disponibilidad vigente.
- **Taxonomía:** coordina con Catálogo la verificación de bajas de categorías, marcas y valores LISTA.

---

## 4. Diagramas de flujo

Los subflujos siguen las convenciones de [FLOW_TEMPLATE](FLOW_TEMPLATE.md). Cada solicitud administrativa valida sesión y permisos en el sistema, aunque el prototipo oculte una acción. Los rechazos y las operaciones de escritura dejan trazabilidad con usuario, fecha/hora y resultado; los cambios exitosos registran también la modificación realizada. Los errores transversales se desarrollan en 4.8.

### 4.1 Consulta de listado y detalle

El listado administrativo permite consultar borradores, activos e inactivos mediante filtros por categoría, marca y estado. La consulta comercial solo expone productos activos y verifica las condiciones vigentes del SKU ofrecido.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Consulta administrativa solicitada))
        G1["Consultar listado por categoría, marca o estado"]
        G2["Seleccionar producto o consultar identificador o slug"]
        G3["Revisar detalle y acciones según estado y permiso"]
        G4["Limpiar o ajustar filtros"]
    end

    subgraph CANAL["Canales de venta"]
        direction TB
        IC((Consulta comercial solicitada))
        C1["Solicitar listado o detalle comercial"]
        C2["Consultar productos y disponibilidad vigente"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar acceso y consultar productos administrativos"]
        D1{"¿Hay resultados?"}
        S2["Mostrar catálogo vacío o filtros sin coincidencias"]
        S3["Mostrar listado y conservar filtros y página"]
        S4["Consultar detalle del producto"]
        D2{"¿Existe el producto?"}
        S5["Informar producto no encontrado"]
        S6["Mostrar datos, estado y requisitos pendientes"]
        S7["Consultar solo productos activos y verificar preparación y disponibilidad vigente"]
        S8["Devolver listado o detalle comercial elegible"]
    end

    FIN_ADMIN(((Consulta administrativa completada)))
    FIN_NO_EXISTE(((Producto no encontrado)))
    FIN_CANAL(((Consulta comercial completada)))

    INICIO --> G1 --> S1 --> D1
    D1 -->|"No"| S2 --> G4 --> G1
    D1 -->|"Sí"| S3 --> G2
    INICIO --> G2
    G2 --> S4 --> D2
    D2 -->|"No"| S5 --> FIN_NO_EXISTE
    D2 -->|"Sí"| S6 --> G3 --> FIN_ADMIN
    IC --> C1 --> S7 --> S8 --> C2 --> FIN_CANAL
```

Un listado sin coincidencias es una respuesta exitosa, no un error. Desde el detalle se inicia la edición (4.4) o el cambio de estado correspondiente (4.5–4.6); al regresar al listado se conserva el contexto de consulta. La comprobación de acceso también aplica a la consulta directa del detalle.

### 4.2 Creación de producto en borrador

Los ocho datos mínimos son nombre, descripción, `categoria_id`, `tipo_producto_id`, `marca_id`, precio base referencial, `sku_base` y `tiene_variantes`. No se exige imagen ni completar valores obligatorios del tipo para guardar un borrador.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Creación de producto iniciada))
        G1["Completar datos mínimos del producto"]
        G2["Solicitar guardado del borrador"]
        G3["Corregir datos conservando el formulario"]
        D3{"¿Confirma que es una referencia distinta?"}
        G4["Consultar borrador y preparación pendiente"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        E1((Solicitud de registro recibida))
        S1["Validar datos, relaciones activas y barreras aplicables"]
        D1{"¿Los datos son válidos y el sku_base es único?"}
        S2["Mostrar causas del rechazo sin crear producto"]
        D2{"¿Coinciden nombre normalizado y marca con otro producto?"}
        S3["Mostrar advertencia y productos coincidentes"]
        S4["Revalidar restricciones al guardar y crear borrador con identificador y slug"]
        S5["Registrar alta y confirmar creación administrativa"]
        E2((Borrador creado))
        S6["Iniciar preparación de precio e inventario según 4.3"]
    end

    FIN(((Producto en borrador, sin publicación comercial)))

    INICIO --> G1 --> G2 --> E1 --> S1 --> D1
    D1 -->|"No"| S2 --> G3 --> G1
    D1 -->|"Sí"| D2
    D2 -->|"Sí"| S3 --> D3
    D3 -->|"No"| G3
    D3 -->|"Sí"| S4
    D2 -->|"No"| S4
    S4 --> S5 --> E2 --> S6 --> G4 --> FIN
```

`sku_base` es único frente a productos en cualquier estado. Categoría, tipo y marca deben existir y estar activos; una barrera de baja impide crear vínculos con la entidad afectada. La revalidación al guardar puede rechazar el registro por las mismas causas, sin crear el producto.

Si `tiene_variantes=true`, se configuran las características identificadoras LISTA activas permitidas por el tipo antes de crear la primera variante. Su conjunto queda fijo desde esa primera variante, aunque luego se inactive. Cambiar categoría no altera el esquema ni las identidades existentes. Un producto simple utiliza `sku_base` como su único SKU vendible.

### 4.3 Preparación posterior al alta

Crear el borrador no confirma la preparación comercial. Este subflujo representa responsabilidades y resultados; no impone un orden entre las confirmaciones de Pricing e Inventario.

```mermaid
flowchart LR
    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        INICIO((Borrador creado))
        S1["Solicitar a Pricing la inicialización idempotente del precio"]
        D1{"¿El producto es simple?"}
        S2["Notificar alta del SKU vendible a Inventario"]
        S3["Consultar preparación de los SKU de variantes gestionados en WF-004"]
        S4["Consolidar confirmaciones de los dominios propietarios"]
        D2{"¿Están confirmados precio e inventario de los SKU publicables?"}
        S5["Mantener borrador e informar Pendiente de preparación"]
        S6["Registrar preparación confirmada sin activar el producto"]
    end

    subgraph PRECIOS["Pricing"]
        direction TB
        P1["Procesar alta de precio con motivo ALTA_PRODUCTO y contexto del actor"]
        D3{"¿Se persistió el precio inicial?"}
        P2["Abrir historial, confirmar resultado y emitir pricing.price.changed"]
        P3["Informar fallo de inicialización sin confirmar preparación"]
    end

    subgraph STOCK["Inventario"]
        direction TB
        I1["Inicializar stock del SKU simple en cero con versión inicial"]
        D4{"¿Se confirmó la inicialización?"}
        I2["Confirmar registro de inventario"]
        I3["Mantener inicialización sin confirmar"]
    end

    FIN_PENDIENTE(((Preparación pendiente, activación impedida)))
    FIN_LISTO(((Preparación confirmada, activación aún explícita)))

    INICIO --> S1 --> P1 --> D3
    D3 -->|"Sí"| P2 --> S4
    D3 -->|"No"| P3 --> S4
    INICIO --> D1
    D1 -->|"Sí"| S2 --> I1 --> D4
    D4 -->|"Sí"| I2 --> S4
    D4 -->|"No o pendiente"| I3 --> S4
    D1 -->|"No, tiene variantes"| S3 --> S4
    S4 --> D2
    D2 -->|"No"| S5 --> FIN_PENDIENTE
    D2 -->|"Sí"| S6 --> FIN_LISTO
```

La solicitud a Pricing contiene `product_id`, `sku_base` y precio base. Solo Pricing emite `pricing.price.changed`, después de persistir. La ausencia de respuesta también deja la preparación pendiente; una confirmación posterior permite reevaluarla. No se fija aquí una política de reintentos no definida en SPEC-003.

El padre con variantes no tiene stock propio. La inicialización de sus SKU pertenece a la gestión de variantes y a Inventario. Inventario inicializado no significa stock positivo ni disponibilidad asegurada para una venta.

### 4.4 Actualización de producto

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Edición de producto iniciada))
        G1["Modificar atributos editables y solicitar guardado"]
        G2["Corregir datos o recargar y conciliar la versión vigente"]
        D5{"¿Confirma la referencia distinta ante posible duplicado?"}
        G3["Consultar detalle actualizado"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar existencia, autorización y vigencia de los datos"]
        D1{"¿Existe el producto y no hay conflicto?"}
        S2["Informar producto inexistente o conflicto sin sobrescribir"]
        S3["Validar campos, unicidad, relaciones, barreras e identidad"]
        D2{"¿La modificación cumple las reglas del CRUD?"}
        S4["Mostrar errores y conservar la última versión válida"]
        D3{"¿El producto está activo?"}
        S5["Revalidar íntegramente las condiciones de activación"]
        D4{"¿Conserva todas las condiciones?"}
        S6["Detectar posible duplicado de nombre y marca"]
        D6{"¿Existe una coincidencia con otro producto?"}
        S7["Guardar cambios, mantener slug y actualizar fecha de modificación"]
        S8["Registrar modificación y propagar cambios por eventos"]
        E1((Actualización confirmada en Catálogo))
    end

    FIN(((Producto actualizado sin cambiar su estado)))
    FIN_ERROR(((Edición no aplicada)))

    INICIO --> G1 --> S1 --> D1
    D1 -->|"No"| S2 --> FIN_ERROR
    D1 -->|"Sí"| S3 --> D2
    D2 -->|"No"| S4 --> G2 --> G1
    D2 -->|"Sí"| D3
    D3 -->|"Sí"| S5 --> D4
    D4 -->|"No"| S4
    D4 -->|"Sí"| S6
    D3 -->|"No, borrador o inactivo"| S6
    S6 --> D6
    D6 -->|"Sí"| D5
    D5 -->|"No"| G2
    D5 -->|"Sí"| S7
    D6 -->|"No"| S7
    S7 --> S8 --> E1 --> G3 --> FIN
```

El formulario mantiene `tiene_variantes` de solo lectura y no permite cambiar el precio posterior al alta ni el stock. Cambiar `tipo_producto_id` cuando afecta identidad publicada o variantes requiere migración controlada, fuera de este CRUD. No se modifican por edición ordinaria las características identificadoras fijadas por la primera variante.

Una edición inválida de un activo se rechaza completa: no lo convierte en borrador ni sustituye su última versión válida. Guardar un inactivo no lo reactiva. El mantenimiento del slug pertenece a Catálogo; la política de redirección de enlaces anteriores y el mecanismo concreto de concurrencia siguen pendientes en WF-003.

### 4.5 Activación y reactivación

Este subflujo aplica a **borrador → activo** y **inactivo → activo**. La reactivación repite todas las validaciones, incluidas las confirmaciones de preparación; no reutiliza como garantía las condiciones de una activación anterior.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Activación o reactivación solicitada))
        G1["Revisar requisitos y solicitar cambio de estado"]
        D1{"¿Confirma la operación?"}
        G2["Consultar requisitos faltantes o preparación pendiente"]
        G3["Consultar producto activo"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Verificar permisos, existencia y estado de origen"]
        S2["Validar datos mínimos, relaciones activas, barreras, atributos e imagen"]
        D2{"¿Cumple los requisitos del producto?"}
        D3{"¿Tiene variantes?"}
        S3["Verificar al menos una variante activa válida con SKU e imagen"]
        D4{"¿Existe una variante elegible?"}
        S4["Verificar confirmaciones de Pricing e Inventario para los SKU publicables"]
        D5{"¿Está confirmada la preparación?"}
        S5["Informar rechazo y conservar borrador o inactivo"]
        S6["Informar Pendiente de preparación y conservar estado"]
        S7["Cambiar estado a activo y registrar la operación"]
        E1((Activación confirmada))
        S8["Habilitar consulta comercial y propagar cambio por eventos"]
    end

    FIN_CANCELADO(((Operación cancelada sin cambios)))
    FIN_RECHAZADO(((Activación no aplicada)))
    FIN_ACTIVO(((Producto activo)))

    INICIO --> G1 --> D1
    D1 -->|"No"| FIN_CANCELADO
    D1 -->|"Sí"| S1 --> S2 --> D2
    D2 -->|"No"| S5
    D2 -->|"Sí"| D3
    D3 -->|"Sí"| S3 --> D4
    D4 -->|"No"| S5
    D4 -->|"Sí"| S4
    D3 -->|"No, producto simple"| S4
    S4 --> D5
    D5 -->|"No"| S6 --> G2
    S5 --> G2 --> FIN_RECHAZADO
    D5 -->|"Sí"| S7 --> E1 --> S8 --> G3 --> FIN_ACTIVO
```

Se exige al menos una imagen y todos los valores obligatorios definidos por el tipo activo. Si no hay atributos obligatorios, ese requisito se considera cumplido sin inventar uno. La prevalidación del detalle puede mostrar faltantes antes de confirmar; el sistema vuelve a validar al ejecutar la solicitud. Los fallos de autorización, existencia o conflicto siguen 4.8.

Para resolver faltantes, el gestor edita el producto (4.4), gestiona variantes en WF-004 o espera la preparación de 4.3 y vuelve a solicitar activación. Una variante activa con padre borrador no es comercialmente vendible.

### 4.6 Desactivación manual y baja por última variante activa

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Desactivación solicitada))
        G1["Revisar impacto de la baja lógica"]
        D1{"¿Confirma la desactivación?"}
        G2["Consultar producto inactivo e historial conservado"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar permisos, existencia y estado actual"]
        D2{"¿Cuál es el estado del producto?"}
        S2["Informar que ya está inactivo sin cambios adicionales"]
        S3["Rechazar transición no aplicable al borrador"]
        S4["Cambiar producto a inactivo y conservar registro y snapshots"]
        IV((Baja de variante solicitada desde WF-004))
        S5["Validar baja de variante según WF-004"]
        D3{"¿La baja deja al producto sin variantes activas?"}
        S6["Inactivar variante y producto padre en la misma transacción local"]
        S7["Completar baja de variante sin inactivar al padre"]
        S8["Registrar baja y emitir catalog.product.deactivated"]
        E1((Producto desactivado))
        S9["Excluir producto de nuevas ventas y notificar a consumidores"]
    end

    FIN_CANCELADO(((Baja cancelada)))
    FIN_SIN_CAMBIO(((Producto sin cambios)))
    FIN_INACTIVO(((Producto inactivo con historial conservado)))

    INICIO --> G1 --> D1
    D1 -->|"No"| FIN_CANCELADO
    D1 -->|"Sí"| S1 --> D2
    D2 -->|"Inactivo"| S2 --> FIN_SIN_CAMBIO
    D2 -->|"Borrador"| S3 --> FIN_SIN_CAMBIO
    D2 -->|"Activo"| S4 --> S8
    IV --> S5 --> D3
    D3 -->|"Sí"| S6 --> S8
    D3 -->|"No"| S7 --> FIN_SIN_CAMBIO
    S8 --> E1 --> S9 --> G2 --> FIN_INACTIVO
```

La baja de la variante se valida y audita en WF-004; aquí se representa su efecto sobre el padre y se emiten los eventos correspondientes a ambas bajas. Promociones, Combos y otros consumidores reaccionan a la notificación para nuevas operaciones. Los pedidos confirmados conservan sus snapshots. Reactivar al padre requiere una variante elegible y volver a ejecutar 4.5.

### 4.7 Verificación asíncrona de bajas de entidades maestras

Este subflujo cubre la coordinación exigida por CA-14 y CA-17, sin incorporar la administración de categorías, marcas o características al CRUD.

```mermaid
flowchart LR
    subgraph TAXONOMIA["Taxonomía"]
        direction TB
        INICIO((Verificación de baja solicitada))
        T1["Solicitar verificación con operation_id"]
        T2["Recibir confirmación o rechazo de Catálogo"]
        T3["Comunicar resultado final de la operación de baja"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Instalar barrera local para la entidad o valor LISTA"]
        S2["Bloquear creación, activación y reasignación hacia el elemento bajo baja"]
        S3["Verificar referencias que impiden la baja"]
        D1{"¿Existen usos que impiden la baja?"}
        S4["Publicar rechazo correlacionado con operation_id"]
        S5["Publicar confirmación correlacionada con operation_id"]
        D2{"¿Se recibió y reconcilió el resultado final?"}
        S6["Conservar barrera y esperar conciliación"]
        S7["Reconciliar barrera con el estado final de la entidad"]
    end

    FIN_PENDIENTE(((Verificación pendiente, barrera conservada)))
    FIN(((Verificación conciliada)))

    INICIO --> T1 --> S1 --> S2 --> S3 --> D1
    D1 -->|"Sí"| S4 --> T2
    D1 -->|"No"| S5 --> T2
    T2 --> T3 --> D2
    D2 -->|"No o fallo de confirmación"| S6 --> FIN_PENDIENTE
    D2 -->|"Sí"| S7 --> FIN
```

Para un valor LISTA se comprueba si lo usa un SKU activo como identidad o un producto activo como valor requerido. Las reglas de baja de categorías y marcas pertenecen a SPEC-008 y SPEC-011. La comprobación de barrera y la escritura del producto se coordinan transaccionalmente; una proyección conocida como obsoleta no autoriza la operación. Un fallo de confirmación no autoriza la baja ni altera SKU o pedidos históricos.

### 4.8 Autorización, errores recuperables y cancelación

Aplica a los subflujos administrativos anteriores. No define endpoints, códigos de error ni mecanismos de concurrencia que siguen pendientes en WF-003.

```mermaid
flowchart LR
    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Operación administrativa solicitada))
        G1["Enviar solicitud"]
        G2["Iniciar sesión y retomar contexto"]
        G3["Reintentar conservando formulario o filtros"]
        G4["Recargar datos y conciliar cambios"]
        IC((Salida del formulario solicitada))
        D4{"¿Confirma descartar los cambios?"}
        G5["Continuar edición"]
    end

    subgraph CATALOGO["Sistema de Catálogo"]
        direction TB
        S1["Validar sesión y permiso de la operación"]
        D1{"¿Cuál es el resultado de acceso?"}
        S2["Solicitar autenticación"]
        S3["Rechazar operación sin aplicar cambios"]
        S4["Ejecutar subflujo y comunicar resultado confirmado"]
        D2{"¿Cuál es el resultado de la solicitud?"}
        S5["Informar error recuperable sin asumir guardado"]
        S6["Informar conflicto y conservar versión vigente"]
        S7["Informar producto no encontrado"]
        D3{"¿Hay cambios sin guardar?"}
        S8["Descartar cambios locales y regresar al listado o detalle"]
    end

    FIN_ACCESO(((Operación no autorizada)))
    FIN_OK(((Resultado del subflujo comunicado)))
    FIN_NO_EXISTE(((Operación no aplicada)))
    FIN_CANCELADO(((Formulario cerrado sin guardar)))

    INICIO --> G1 --> S1 --> D1
    D1 -->|"Sesión expirada"| S2 --> G2 --> G1
    D1 -->|"Sin permiso"| S3 --> FIN_ACCESO
    D1 -->|"Autorizado"| S4 --> D2
    D2 -->|"Respuesta funcional recibida"| FIN_OK
    D2 -->|"Sin conexión o error recuperable"| S5 --> G3 --> G1
    D2 -->|"Conflicto de datos"| S6 --> G4 --> G1
    D2 -->|"Producto inexistente"| S7 --> FIN_NO_EXISTE
    IC --> D3
    D3 -->|"No"| S8
    D3 -->|"Sí"| D4
    D4 -->|"Sí"| S8 --> FIN_CANCELADO
    D4 -->|"No"| G5 --> G1
```

Durante una solicitud se evita el envío repetido. Crear o cambiar estado solo se presenta como exitoso tras confirmación del sistema; después se refrescan detalle y listado. Un rechazo funcional conserva los datos para corregirlos según el subflujo correspondiente. Ante errores de conexión no se afirma que la operación haya sido guardada.
