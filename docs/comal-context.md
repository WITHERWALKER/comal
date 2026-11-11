# Comal — Contexto maestro del proyecto

> **Documento de contexto para continuar Comal entre conversaciones.**  
> Consolidado a partir de los archivos y conversaciones del proyecto disponibles al 21 de octubre de 2026.  
> **Propósito:** servir como fuente de contexto de producto, arquitectura, reglas de negocio, decisiones técnicas, estado conocido y próximos pasos. No sustituye al código ni a las migraciones reales del repositorio.

---

## 1. Resumen ejecutivo

**Comal** es una aplicación web responsive para que un negocio de comida administre pedidos desde un menú digital hasta su preparación y entrega. El MVP se plantea inicialmente para un negocio de demostración, pero con un modelo de datos que pueda evolucionar a varios negocios.

El sistema contempla cuatro áreas principales:

1. **Cliente:** consulta el menú, administra su carrito y realiza un pedido sin crear una cuenta.
2. **Administración:** consulta los pedidos, administra productos y categorías, asigna repartidores y resuelve incidencias.
3. **Cocina:** consulta los pedidos en un tablero Kanban y actualiza el avance de preparación.
4. **Repartidor:** consulta únicamente sus entregas asignadas, ve los datos necesarios para entregar y confirma el resultado.

El objetivo no es construir un sistema empresarial sobredimensionado desde el primer día. Se busca un MVP funcional, seguro y demostrable, que también sirva como proyecto de portafolio y como ejemplo comercial para ofrecer servicios de desarrollo a negocios de Torreón y alrededores.

La prioridad de trabajo es **construir por etapas, validar cada cambio y entender las decisiones**, evitando implementar funcionalidades encima de errores todavía no diagnosticados.

---

## 2. Objetivos del proyecto

### 2.1 Objetivo de producto

Completar el ciclo de pedido:

- Publicar un menú digital.
- Permitir carrito y checkout sin registro de cliente.
- Recibir pedidos a domicilio o para recoger en el local.
- Gestionar preparación y estados desde un tablero.
- Asignar entregas a repartidores autenticados.
- Registrar la entrega y, según la decisión final de producto, verificarla con un código.
- Conservar historial y trazabilidad de cancelaciones e incidencias.

### 2.2 Objetivo de aprendizaje

Desarrollar el producto con acompañamiento técnico de nivel Senior Software Engineer. Las explicaciones deben cubrir no solo qué implementar, sino también por qué, sus ventajas y desventajas, y cómo comprobar que funciona.

### 2.3 Objetivo de portafolio y comercial

Conseguir una demo sólida que muestre diseño de interfaces, modelado de datos, seguridad, arquitectura y reglas de negocio, y que pueda presentarse a negocios locales.

---

## 3. Alcance funcional del MVP

### 3.1 Menú público y checkout

Ruta prevista: `/menu`, con páginas adicionales para checkout y consulta/confirmación del pedido.

El cliente debe poder:

- Explorar categorías y productos.
- Ver nombre, descripción, precio, imagen y disponibilidad.
- Añadir productos al carrito, modificar cantidades y eliminarlos.
- Ver subtotal y total.
- Añadir notas al pedido.
- Mantener el carrito durante la navegación y recargas normales.
- Indicar nombre y teléfono.
- Elegir entre **entrega a domicilio** y **recogida en local**.
- Elegir «lo antes posible» o una hora programada.
- Añadir notas generales.
- Proporcionar dirección y referencias cuando el pedido sea a domicilio.
- Ver una confirmación únicamente cuando el servidor haya creado correctamente el pedido.

Reglas importantes:

- No se permite crear un pedido sin artículos.
- Las cantidades deben ser enteros positivos y tener límites razonables.
- El servidor vuelve a consultar precios y disponibilidad; no confía en importes enviados por el navegador.
- La programación debe respetar horario del negocio y anticipación mínima configurada.
- La dirección solo es obligatoria para pedidos a domicilio.
- Si falla la creación, se muestra un error recuperable; nunca una confirmación falsa.
- Los pedidos históricos conservan una fotografía de los artículos, nombres y precios al momento de compra.

### 3.2 Administración

Ruta prevista: `/admin`.

El administrador necesita:

- Consultar pedidos activos y métricas básicas del día.
- Ver pedidos nuevos, listos y en entrega.
- Gestionar el tablero Kanban.
- Consultar el detalle de un pedido.
- Administrar productos y categorías.
- Activar/desactivar disponibilidad y archivar productos.
- Asignar un pedido a un repartidor.
- Cancelar pedidos cuando las reglas lo permitan, indicando motivo.
- Consultar el historial de incidencias relevante.

No se deben borrar físicamente productos que formen parte de pedidos históricos; es preferible archivarlos o desactivar su disponibilidad.

### 3.3 Cocina

La cocina necesita una vista enfocada en la preparación, sin capacidades administrativas innecesarias.

Puede:

- Consultar los pedidos que necesita preparar.
- Ver folio, hora, modalidad, artículos, cantidades y notas relevantes.
- Mover pedidos entre estados permitidos de preparación.

No debe administrar usuarios, configuración del negocio ni repartidores. Añadir el rol `kitchen` a una restricción de base de datos no concede por sí mismo permisos: los permisos deben implementarse explícitamente en servidor y RLS.

### 3.4 Repartidores

Ruta prevista: `/courier`.

Cada repartidor tiene una cuenta individual. La interfaz debe ser móvil y sencilla, con una lista de entregas asignadas y una vista de detalle; no necesita estadísticas ni un Kanban administrativo.

Puede:

- Consultar sus entregas asignadas.
- Ver folio, artículos, nombre y teléfono del cliente, dirección, referencias e instrucciones necesarias.
- Iniciar una entrega cuando corresponda.
- Confirmar el resultado de una entrega según el flujo elegido.

No puede consultar pedidos de otros repartidores ni administrar productos, precios, usuarios o configuración del negocio.

La asignación será manual por parte del administrador en el MVP. No se contempla inicialmente asignación automática ni optimización de rutas.

### 3.5 Productos y categorías

Se necesita poder:

- Crear, editar y ordenar categorías.
- Crear y editar productos.
- Configurar nombre, descripción, precio e imagen.
- Controlar disponibilidad.
- Archivar productos sin alterar pedidos anteriores.

### 3.6 WhatsApp

En el MVP, sin integración con la API oficial de WhatsApp, la aplicación puede abrir un enlace con un mensaje preparado, pero **no puede enviar mensajes automáticamente por sí sola**. Alguien debe revisar y enviar el mensaje.

La automatización mediante API queda para una etapa posterior. Debe definirse quién inicia el mensaje y a qué número se envía.

---

## 4. Flujo de pedidos y estados oficiales

Los estados operativos definidos son:

| Estado | Significado |
|---|---|
| `new` | Pedido creado y registrado automáticamente. |
| `preparing` | La cocina ha comenzado la preparación. |
| `ready` | Pedido listo para entregar o recoger. |
| `on_the_way` | El repartidor ha iniciado la entrega a domicilio. |
| `delivered` | Entrega completada; para domicilio se recomienda verificar el código si se adopta ese flujo. |
| `cancelled` | Pedido cancelado mediante una acción autorizada. |

No se ha definido un estado `accepted`, porque la propuesta vigente es que el pedido entre automáticamente al flujo sin aprobación manual obligatoria.

**Importante:** `new` significa que el pedido existe en el sistema; no significa que la cocina ya comenzó a prepararlo.

Para recogidas en local, el pedido puede pasar de `ready` a una confirmación de entrega en mostrador sin pasar por `on_the_way`.

Las transiciones deben validarse en el servidor o en una operación confiable de base de datos. No se debe permitir que un componente cliente cambie arbitrariamente el estado. Un pedido entregado no debe volver a un estado anterior mediante una acción normal.

### 4.1 Aceptación y capacidad operativa

La preferencia documentada es **aceptación automática con controles operativos**:

- Los pedidos se registran automáticamente.
- El negocio puede pausar temporalmente nuevos pedidos.
- Puede controlar horarios y disponibilidad de productos.
- Puede resolver cancelaciones cuando aparezcan problemas.

Esto reduce pasos para el personal, aunque no garantiza que la cocina tenga capacidad de cumplir todos los pedidos. La aceptación manual por pedido se consideró como alternativa, pero añade trabajo y no es la preferencia inicial.

### 4.2 Cancelaciones

La cancelación debe ser una acción explícita, autorizada y con motivo; no basta con cambiar un campo sin historial.

Reglas iniciales propuestas:

| Estado actual | Regla propuesta |
|---|---|
| `new` | El administrador puede cancelar directamente. |
| `preparing` | Puede cancelar el administrador, registrando el motivo. |
| `ready` | Puede cancelarse si aún no se entregó al repartidor. |
| `on_the_way` | Requiere acción administrativa especial, motivo y resolución operativa con el repartidor. |
| `delivered` | No se cancela; una incidencia posterior se registra aparte. |
| `cancelled` | Estado final; no se vuelve a cancelar. |

El cliente no tendrá inicialmente un botón de cancelación automática. Puede contactar al negocio por WhatsApp y el personal registrará la resolución en Comal.

Motivos iniciales sugeridos: solicitud del cliente, producto agotado, negocio sin capacidad para preparar, dirección incorrecta u otro motivo.

---

## 5. Entrega y código de verificación

Se deben distinguir dos conceptos:

- **Folio del pedido:** identificador legible para operación, por ejemplo `NX-1042`.
- **Código secreto de entrega:** valor independiente usado para verificar que la persona en el lugar de entrega conoce el código, por ejemplo `583194`.

El folio no debe funcionar como secreto de seguridad.

### 5.1 Flujo de verificación recomendado

La propuesta funcional más robusta es:

1. El servidor genera un código aleatorio de seis dígitos.
2. El cliente ve el código al confirmar el pedido.
3. El repartidor solicita el código al cliente en el momento de la entrega.
4. El repartidor introduce el código.
5. El servidor valida el código, el pedido, la asignación, el estado y los intentos permitidos.
6. Si todo es válido, registra la entrega y consume el código en una sola operación atómica.

Seguridad:

- No almacenar el código en texto plano; almacenar un hash adecuado.
- Limitar intentos.
- Usar respuestas que no revelen el código correcto.
- No permitir que un repartidor verifique entregas ajenas.
- No exponer el código secreto al repartidor antes de la comprobación, pues eso anula buena parte de su propósito.
- No considerar el código una autenticación fuerte de identidad: comprueba conocimiento del código, no identidad legal.

Existe una decisión pendiente que cambia la UX: la documentación propone una pantalla del repartidor con botón **«Marcar como entregado»** sin introducir código para reducir pasos, pero también recomienda la verificación real mediante código por el objetivo original de evitar entregas equivocadas. Estas opciones no son equivalentes:

- **Solo botón:** simple, pero registra únicamente la declaración del repartidor.
- **Código introducido por el repartidor:** verificación más significativa.
- **Comparación visual:** reduce errores operativos, pero la protección depende de cómo se revele el código y es más débil.

Hasta que se confirme la elección, la recomendación es conservar el código en la pantalla del cliente y no mostrarlo al repartidor antes de verificar la entrega.

### 5.2 Recuperación del código

Si el cliente cierra la página y no recibe un mensaje, necesitará una forma de consultar el pedido. Una opción para el MVP es un enlace privado con token aleatorio, no un ID secuencial predecible.

---

## 6. Roles, autenticación y autorización

Roles definidos en `profiles`:

- `admin`: administra negocio, productos, pedidos y repartidores.
- `kitchen`: accede al tablero de cocina y actualiza estados de preparación permitidos.
- `courier`: consulta sus entregas asignadas y confirma las entregas.

El cliente no necesita crear una cuenta para realizar un pedido.

Las invitaciones de repartidores deben separar **código de invitación** y **credenciales de acceso**:

1. El administrador genera una invitación aleatoria, de un solo uso y con vencimiento.
2. El repartidor introduce el código en una página de activación.
3. Configura sus datos y método de autenticación.
4. Su cuenta queda activada con acceso limitado a sus entregas.

No se recomienda una contraseña compartida o un código permanente que dé acceso amplio a los pedidos.

### Reglas de seguridad

- Supabase Auth para autenticación de administradores y repartidores.
- RLS en PostgreSQL para proteger filas y datos.
- Validación de permisos en el servidor; proteger solo un layout no es suficiente.
- La clave `service_role` o cualquier secreto nunca debe tener prefijo `NEXT_PUBLIC_` ni exponerse al navegador.
- Separar clientes de Supabase para navegador y servidor; las operaciones privilegiadas deben mantenerse aisladas.
- El menú público no debe dar acceso a información privada de pedidos.
- Un rol guardado en `profiles` no implementa permisos por sí mismo.
- Probar explícitamente acceso permitido y denegado para cada rol.

---

## 7. Modelo de datos inicial

Supabase/PostgreSQL será la fuente de verdad.

Entidades/tablas consideradas:

| Tabla | Responsabilidad |
|---|---|
| `businesses` o equivalente | Datos de cada negocio. |
| `profiles` | Datos adicionales del usuario, rol y relación con negocio. |
| `categories` | Categorías del menú. |
| `products` | Productos, precios, imágenes y disponibilidad. |
| `orders` | Datos principales del pedido, cliente, modalidad, horario, total y estado. |
| `order_items` | Artículos, cantidades y fotografía histórica de nombre/precio al comprar. |
| `courier_invitations` | Invitaciones de un solo uso para activar repartidores. |
| `courier_deliveries` | Asignación y seguimiento de entregas, si se separa del pedido. |

El esquema debe permitir que cada negocio tenga sus propias categorías, productos y pedidos, aunque el primer despliegue solo use un negocio. Esto evita diseñar el sistema de forma que después sea difícil ampliarlo a varios clientes.

### Principios de persistencia

- Mantener referencias y restricciones de integridad.
- Usar migraciones SQL versionadas en Git.
- Los importes definitivos se calculan en servidor a partir de los precios persistidos.
- Guardar en `order_items` el nombre y precio histórico; no recalcular pedidos antiguos usando el precio actual.
- Crear el pedido y sus artículos de forma consistente, idealmente en una transacción o función de base de datos apropiada.
- Definir índices y restricciones junto con el esquema, no después de acumular lógica en la aplicación.
- Mantener historial de cancelaciones y operaciones importantes.

### Orden de migraciones propuesto

1. Negocios, perfiles, categorías y productos.
2. Pedidos y artículos.
3. Invitaciones, asignaciones de repartidores y verificación de entregas.
4. Políticas RLS, permisos y pruebas de acceso.

No se debe modificar una migración que ya se aplicó en un entorno compartido. En ese caso, crear una migración nueva que altere el esquema. Si la migración inicial aún no se ha ejecutado, puede actualizarse antes de aplicarla.

---

## 8. Arquitectura técnica vigente

### 8.1 Stack del proyecto

El contexto más reciente del repositorio reportado indica:

- **Next.js 16**
- **React 19**
- **TypeScript**, con `strict: true` y `noEmit: true`
- **Tailwind CSS 4**
- **pnpm**
- **Supabase** (`@supabase/supabase-js` y `@supabase/ssr` propuestos para conexión)
- **PostgreSQL**, Supabase Auth, RLS y Realtime

La propuesta inicial usaba Astro + React + TypeScript + Tailwind y Vercel. Esa propuesta fue reemplazada en conversaciones posteriores por Next.js, en parte porque el proyecto también sirve para aprender Next.js y construir una aplicación full-stack con interfaces autenticadas y operaciones de servidor.

### 8.2 Despliegue: decisión pendiente de validación

En documentos previos aparece Vercel como despliegue inicial. La propuesta técnica posterior menciona Cloudflare Workers y la necesidad de validar el adaptador y la compatibilidad con Next.js antes de depender de funcionalidades concretas.

Por tanto, el destino de despliegue debe considerarse **pendiente de confirmación técnica**, no una decisión cerrada. Primero conviene conseguir una aplicación local estable y después validar el despliegue elegido con la versión concreta de Next.js y las funciones utilizadas.

### 8.3 Arquitectura: monolito modular

La recomendación arquitectónica vigente es un **monolito modular**, organizado por funcionalidades y con capas inspiradas en Clean Architecture cuando aporten valor.

Capas conceptuales:

1. **Presentación:** rutas, layouts, páginas y componentes Next.js.
2. **Aplicación:** casos de uso y orquestación de acciones.
3. **Dominio:** entidades, reglas de negocio, estados, transiciones e invariantes.
4. **Infraestructura:** Supabase, PostgreSQL, autenticación y servicios externos.

La dirección de dependencias debe apuntar hacia el dominio. Las reglas centrales no deberían importar React, Next.js ni un cliente concreto de Supabase.

No introducir microservicios ni abstracciones por rutina. Las interfaces y repositorios se crean donde exista una frontera real, una necesidad de prueba o una dependencia que convenga desacoplar.

### 8.4 Organización de carpetas objetivo

La estructura propuesta para Next.js App Router es una guía, no una obligación de crear todo desde el primer día:

```text
Comal/
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── menu/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── order/[token]/page.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── products/page.tsx
│   │   │       └── couriers/page.tsx
│   │   ├── (courier)/
│   │   │   └── courier/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── orders/[id]/page.tsx
│   │   ├── api/
│   │   │   └── health/route.ts
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── modules/
│   │   ├── products/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── orders/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── cart/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── presentation/
│   │   ├── delivery/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── couriers/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   └── auth/
│   │       ├── application/
│   │       └── infrastructure/
│   ├── shared/
│   │   ├── ui/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── errors/
│   │   └── types/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── env/
│   │   └── logging/
│   └── config/
│       ├── app.ts
│       └── navigation.ts
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

**Nota:** las rutas de ejemplo deben ajustarse al repositorio real. En Next.js, los grupos entre paréntesis organizan rutas sin añadir ese nombre a la URL. La ausencia de `src/app/page.tsx` no es necesariamente un error si `src/app/(public)/page.tsx` resuelve la ruta `/`.

### 8.5 Responsabilidades de las capas

- `app/`: composición de páginas, layouts, rutas y entrada de solicitudes; no debe concentrar toda la lógica de negocio.
- `modules/`: funcionalidades de negocio con responsabilidades claras.
- `domain/`: entidades, estados, reglas de transición y errores del dominio.
- `application/`: casos de uso, por ejemplo `CreateOrder`, `CancelOrder` y `VerifyDelivery`.
- `infrastructure/`: implementación de persistencia y conexiones externas.
- `presentation/`: componentes y validaciones específicas de la interfaz.
- `shared/`: elementos realmente compartidos, no un cajón para código sin ubicación clara.
- `supabase/migrations/`: esquema versionado y reproducible.
- `tests/`: pruebas unitarias, de integración y de extremo a extremo.

### 8.6 SOLID de forma pragmática

- **Responsabilidad única:** el caso de uso coordina; el repositorio persiste; el componente representa.
- **Abierto/cerrado:** permitir nuevas implementaciones donde sea útil sin modificar reglas centrales.
- **Sustitución de Liskov:** respetar los contratos de repositorios.
- **Segregación de interfaces:** preferir contratos pequeños y específicos.
- **Inversión de dependencias:** los casos de uso dependen de contratos, no de un cliente concreto de Supabase.

No crear interfaces para cada función automáticamente. Separar capas tampoco sustituye la necesidad de transacciones para operaciones que deben ser atómicas.

---

## 9. Supabase y sincronización en tiempo real

Supabase se encarga de:

- PostgreSQL como persistencia.
- Auth para identidad y sesiones.
- RLS para autorización a nivel de fila.
- Realtime para notificar cambios autorizados.
- Storage si se necesita guardar imágenes de productos.

### Estrategia de conexión

Se propusieron los paquetes `@supabase/supabase-js` y `@supabase/ssr`, además de separar:

- Cliente para navegador: `src/lib/supabase/client.ts` o su ubicación equivalente en la arquitectura adoptada.
- Cliente para servidor: `src/lib/supabase/server.ts`.
- Cliente privilegiado, si realmente se necesita: aislado y nunca importado por código cliente.

Las variables de entorno deben configurarse en `.env.local`. El nombre de la clave pública puede ser `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, según la que proporcione el proyecto. Los secretos no deben exponerse al navegador ni guardarse en el repositorio.

### Realtime e integridad

La estrategia recomendada es híbrida:

1. Cargar los datos iniciales mediante una consulta normal.
2. Suscribirse a los cambios pertinentes mientras la pantalla está abierta.
3. Si se pierde la conexión, reconectar y volver a consultar el estado completo.
4. Mantener PostgreSQL como fuente de verdad.

Realtime notifica cambios; un evento recibido en el navegador no demuestra por sí solo que una operación se haya guardado correctamente. La interfaz debe manejar reconexiones y resincronización.

Para un piloto pequeño se puede empezar con Postgres Changes si resulta suficiente. La elección entre Postgres Changes y Broadcast debe basarse en las necesidades reales de escala, seguridad y complejidad, no en añadir tecnología sin necesidad.

---

## 10. Flujo de creación de pedido y otras operaciones críticas

Flujo conceptual de `CreateOrder`:

1. El checkout envía los datos.
2. El servidor valida el formato y el contexto.
3. El caso de uso aplica reglas de negocio.
4. Se vuelven a obtener los precios y la disponibilidad desde datos confiables.
5. Se calcula el total en el servidor.
6. Se crea el pedido y sus artículos de forma consistente.
7. Solo si la operación tiene éxito se devuelve la confirmación, el folio y la información que corresponda.

Los componentes de React no deben decidir importes definitivos ni permisos. Los datos de entrada deben validarse en el límite del sistema, y las operaciones sensibles deben volver a comprobar estado y autorización en el servidor o base de datos.

Otros casos de uso que probablemente se implementarán:

- `CreateOrder`
- `GetOrder`
- `ChangeOrderStatus`
- `CancelOrder`
- `AssignCourier`
- `CreateCourierInvitation`
- `ActivateCourierInvitation`
- `StartDelivery`
- `VerifyDelivery`

Los nombres son una propuesta de organización; no se afirma que estos archivos ya existan.

---

## 11. Estado conocido del desarrollo

Esta sección distingue lo que las fuentes reportan de lo que todavía no se ha confirmado. No debe interpretarse como una inspección en vivo del repositorio actual.

### 11.1 Lo que se ha reportado

- El proyecto declara **Next.js 16, React 19, TypeScript, Tailwind CSS 4 y pnpm**.
- TypeScript tiene `strict: true` y `noEmit: true`.
- La página pública inicial todavía contenía el contenido de ejemplo de Next.js.
- La ruta raíz podría estar implementada con `src/app/(public)/page.tsx`; no se debe crear una segunda página raíz sin revisar primero la estructura.
- Se reportó que Windows no reconocía el comando `node` en la terminal.
- Se recomendó diagnosticar el entorno antes de cambiar código.
- Se propuso instalar `@supabase/supabase-js` y `@supabase/ssr`.
- Se comenzó a definir el esquema de Supabase y la carpeta de migraciones.
- Se añadieron conceptualmente tres roles: `admin`, `kitchen` y `courier`.

### 11.2 Lo que sigue sin confirmación en las fuentes disponibles

- Si Node.js ya se instaló o se corrigió el `PATH`.
- Si `pnpm` funciona correctamente en la terminal actual.
- Si se ejecutaron las comprobaciones de TypeScript y ESLint.
- Si el proyecto de Supabase ya existe y está conectado mediante variables de entorno.
- Si las dependencias de Supabase ya están instaladas.
- Si existe una migración inicial, si fue aplicada o si ya hay tablas reales.
- Si las políticas RLS están implementadas y probadas.
- Si la pantalla inicial ya fue reemplazada por la interfaz de Comal.
- Si se ha decidido y probado el destino final de despliegue.
- Si se confirmó el flujo final de entrega con código o solo botón.

No afirmar que estas tareas están terminadas hasta revisar el repositorio o recibir evidencia actual.

---

## 12. Próximos pasos recomendados

Seguir este orden, evitando avanzar sobre problemas no resueltos.

### Fase 1 — Entorno reproducible

1. Abrir PowerShell en la raíz del proyecto.
2. Ejecutar:
   ```powershell
   node -v
   where.exe node
   pnpm -v
   Get-Command pnpm
   ```
3. Revisar las salidas y resolver la disponibilidad de Node.js antes de reinstalar herramientas sin diagnóstico.
4. Confirmar las versiones declaradas en `package.json` y el estado del lockfile.
5. Ejecutar la comprobación de TypeScript y ESLint cuando el entorno funcione.
6. Revisar nombres de archivos especiales de Next.js (`page.tsx`, `layout.tsx`, etc.) y rutas actuales.

### Fase 2 — Conexión de Supabase

1. Confirmar que el proyecto Supabase existe.
2. Configurar variables en `.env.local` sin exponer secretos.
3. Instalar las dependencias necesarias si no están instaladas.
4. Implementar los clientes de navegador y servidor con `@supabase/ssr`.
5. Probar la conexión con una comprobación mínima, sin comenzar todavía por toda la lógica de pedidos.

### Fase 3 — Modelo y migraciones

1. Confirmar las entidades y relaciones.
2. Diseñar migraciones versionadas en `supabase/migrations/`.
3. Crear negocios, perfiles, categorías y productos.
4. Crear pedidos y artículos históricos.
5. Crear invitaciones, asignaciones y verificación de entrega.
6. Definir RLS y permisos de cada rol.
7. Probar tanto los accesos válidos como los que deben rechazarse.

### Fase 4 — Primer flujo vertical

Implementar un flujo pequeño de extremo a extremo, antes de crear todos los módulos:

1. Mostrar productos reales desde Supabase.
2. Añadir productos al carrito.
3. Validar checkout.
4. Crear un pedido de forma confiable.
5. Mostrar confirmación solo tras el éxito real.
6. Ver el pedido en administración/cocina.

Después ampliar hacia cambios de estado, asignación de repartidor y entrega.

### Fase 5 — Operación y robustez

- Kanban y actualización en tiempo real.
- Gestión de disponibilidad y pausa de pedidos.
- Cancelaciones con motivo e historial.
- Activación segura de repartidores.
- Entrega con el mecanismo de confirmación elegido.
- Pruebas unitarias, de integración y E2E.
- Despliegue y configuración de entorno de producción.

---

## 13. Forma de trabajo y expectativas de asistencia

La forma de colaboración acordada es:

- **El usuario implementa; el asistente guía.**
- Explicar qué hacer, por qué y qué responsabilidad tendrá cada parte.
- No entregar bloques completos de código por defecto; hacerlo cuando el usuario lo pida o cuando sea necesario para desbloquear una tarea.
- Tomar decisiones importantes antes de codificar.
- Validar cada etapa antes de seguir.
- Cuando haya un error, diagnosticarlo con evidencia en vez de adivinar.
- Hacer un cambio a la vez y ejecutar una comprobación después de cada cambio.
- Aplicar SOLID, Clean Architecture y patrones de diseño de manera pragmática, sin sobrearquitectura.
- Priorizar seguridad y consistencia de datos desde el inicio.

La respuesta ideal para una nueva tarea de Comal debería incluir, cuando corresponda:

1. Objetivo del paso.
2. Archivos o áreas que se tocarán.
3. Instrucciones concretas.
4. Explicación de las decisiones.
5. Comando o prueba para validar.
6. Criterio claro para saber si se puede continuar.

---

## 14. Decisiones cerradas, recomendaciones y pendientes

### Decisiones suficientemente establecidas

- Nombre del proyecto: **Comal**.
- Aplicación web responsive para gestión de pedidos de comida.
- Cliente puede pedir sin registrarse.
- Modalidades: domicilio y recogida.
- Pedidos inmediatos y programados.
- Estados oficiales: `new`, `preparing`, `ready`, `on_the_way`, `delivered`, `cancelled`.
- Roles de aplicación: `admin`, `kitchen`, `courier`.
- Supabase/PostgreSQL como backend de datos y autenticación.
- Next.js App Router como framework actual del proyecto reportado.
- Monolito modular con separación por funcionalidades.
- Seguridad en servidor y RLS; no confiar en el cliente.
- Migraciones SQL versionadas.
- Trabajo incremental y validación continua.

### Recomendaciones vigentes

- Aceptación automática con controles de disponibilidad y pausa.
- Cargar datos inicialmente y usar Realtime con resincronización.
- Códigos de invitación de un solo uso y con caducidad.
- No mostrar al repartidor el código secreto antes de la verificación.
- Cancelaciones con motivo e historial.
- Mantener fotografías históricas de los artículos en los pedidos.
- Empezar con un flujo vertical pequeño y ampliar después.

### Pendientes que requieren confirmación

1. **Entrega:** ¿introducción real del código, comparación visual o botón «Entregado» sin código?
2. **Despliegue:** ¿Vercel o Cloudflare Workers? Validar la compatibilidad de la solución elegida con Next.js 16 y las funcionalidades utilizadas.
3. **Estado del entorno:** confirmar Node.js, pnpm, TypeScript y ESLint.
4. **Estado de Supabase:** confirmar proyecto, credenciales, dependencias y migraciones aplicadas.
5. **Estructura real:** comparar la estructura propuesta con el repositorio existente antes de crear o mover archivos.
6. **Detalles operativos aún no especificados:** horarios, anticipación mínima de pedidos programados, límites de cantidades e intentos de código, política de asignación y recuperación del pedido.

---

## 15. Instrucción para futuras conversaciones

Al retomar Comal:

1. Usa este documento como contexto de alto nivel, pero verifica el estado real del código antes de afirmar que una tarea está completada.
2. Respeta las decisiones y nombres ya definidos, especialmente los estados de pedido y los roles.
3. Si una nueva decisión contradice una anterior, señala el conflicto y solicita o registra una decisión explícita; no mezcles silenciosamente las dos.
4. No trates las estructuras de carpetas o nombres de casos de uso propuestos como si ya existieran.
5. No expongas secretos de Supabase ni recomiendes poner claves privadas en variables `NEXT_PUBLIC_*`.
6. Mantén las reglas críticas en servidor/base de datos y utiliza el cliente solo para presentar y recoger datos.
7. Trabaja de forma incremental: un objetivo concreto, un cambio, una validación.

**Principio rector:** Comal debe ser suficientemente sencillo para terminar el MVP y suficientemente bien diseñado para mantenerlo, demostrarlo y ampliarlo sin reescribirlo por completo.
