# Reporte de Test Suite Masivo — Backend Coverfy

**Fecha:** 2026-07-31
**Alcance:** `packages/backend` (Node/Express/TypeScript/Prisma + PostgreSQL, entidades Client/Policy/Claim/Company/Coverage/QuickMessage/User con 2FA TOTP)
**Herramientas:** Vitest + Supertest + fast-check (property-based testing), contra la base de datos real de desarrollo (Supabase, sin datos reales).

---

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Casos automatizados (`it()`) | **796** |
| Archivos de test | 6 (+ 2 de infraestructura compartida) |
| Fallos en las 3 corridas finales consecutivas | **0 / 2,388** (796 × 3) |
| Corridas consecutivas completas exigidas / ejecutadas | 3 / 3 |
| Hallazgo de test intermitente | 1 (detectado, diagnosticado y corregido — ver sección de Hallazgos) |
| Bugs reales de la aplicación documentados | 2 (+ 3 observaciones menores) |
| Tiempo por corrida completa (suite entero) | 123.5s – 135.4s (ver Sección 7) |

Los 796 casos cubren las 7 secciones pedidas: fuzzing de validators, mass assignment,
aislamiento de cartera, RBAC, 2FA, volumen, y 3 corridas consecutivas de consistencia.
Ningún hallazgo de seguridad real sobrevivió la verificación: el aislamiento de cartera,
el whitelist de mass assignment y el RBAC se sostienen bajo las matrices combinatorias
completas, de forma consistente en las 3 corridas. Los hallazgos documentados son un bug
funcional real (coberturas sin `:id`), una inconsistencia de status codes, y dos
observaciones menores de validación (ver "Hallazgos").

### Decisiones de diseño relevantes (leer antes de interpretar los números)

1. **Fuzzing a nivel schema, no por HTTP.** La base de test es un Supabase remoto
   compartido con un límite duro de **15 conexiones concurrentes** (pooler en modo
   sesión — confirmado empíricamente, ver Hallazgos). Ejecutar 50+ valores × ~60
   campos × 7 schemas por HTTP real (miles de round-trips) habría sido inviable en
   tiempo y arriesgaba agotar el pool para cualquier otro proceso que use la misma
   base. En cambio, el fuzzing masivo llama directamente `schema.validate(value,
   {abortEarly:false, stripUnknown:true})` — las MISMAS opciones exactas que usa
   `validate.middleware.ts` — lo cual es fiel a producción y corre en memoria.
   Se complementa con un bloque de confirmación HTTP end-to-end (por endpoint, no
   por campo) que prueba que el cableado real (ruta → auth → validate → 400/201)
   funciona igual que el schema aislado.
2. **Fuzzing con seeds distintos en cada corrida.** No se fijó ningún seed de
   fast-check: cada corrida usa un seed aleatorio nuevo (comportamiento default),
   cumpliendo "repetido en cada corrida con seeds distintos". Si una propiedad
   fallara, fast-check reporta el seed y el contraejemplo exacto en el mensaje de
   error (ver ejemplo de reproducibilidad en Hallazgos).
3. **Mass assignment con 20 combinaciones de valores.** Por endpoint se arma un
   único payload que combina TODOS los campos prohibidos de esa entidad, y se
   repite 20 veces variando los valores inyectados (uuid random, string inventado,
   número, `null`, o el id real de una entidad de OTRO broker — para simular un
   intento de secuestro de datos). Se verifica en las 20 corridas que el registro
   original no cambia, tanto en la respuesta HTTP como consultando la base
   directamente.
4. **Volumen: 300 clientes con `createMany`, lecturas por HTTP real.** Insertar
   300 filas con 300 POST secuenciales no aporta nada que una sola query
   `createMany` no aporte para el objetivo real de esta sección (medir
   `buscarClientePorDocumento` y el listado paginado), y sí consume minutos extra
   en una corrida que se repite x3. Las lecturas que el enunciado pide medir SI se
   hacen 100% por HTTP real, con tiempos de respuesta registrados.
5. **OCR/Gemini (`/api/ocr/*`) en la matriz de RBAC.** Se prueban sin adjuntar
   archivo, de forma que el controller corte en el chequeo "no se recibió
   archivo" (400) ANTES de invocar Tesseract/Gemini real. Así se valida
   completamente el gate de auth/rol (que es lo que le compete a la sección de
   RBAC) sin depender de una llamada a una API externa ni de tiempos de OCR
   variables dentro de una matriz que se corre 3 veces seguidas.
6. **Limpieza de datos.** Cada archivo de test trackea explícitamente (por id)
   todo lo que crea y lo borra en `afterAll`, respetando el orden que exigen las
   FK (Client cascadea Policy/Claim/Documents/\*Details; Coverage y Company se
   borran después de que ya no haya Policy que los referencie). Las filas de
   `AuditLog` y `TokenBlacklist` —que no tienen FK hacia las entidades de
   negocio— se limpian por rango de tiempo (todo lo creado desde que arrancó ese
   archivo de test).

---

## Sección 1 — Fuzzing de validators

**Motor:** `tests/fuzz.helpers.ts` + fast-check. Por cada campo se generan ≥60
valores válidos (en los límites: min, min unicode, max, tipos unicode/emoji) y
≥60 valores inválidos (min-1, max+1, vacío, whitespace-que-trimea-a-vacío, y
type-confusion: número/null/undefined/array/objeto anidado/booleano), más un
caso de ausencia (requerido→rechaza, opcional→acepta).

| Caso | Cantidad de variaciones probadas | Resultado | Estado |
|---|---|---|---|
| `createClientSchema` / `updateClientSchema` (9 campos c/u) | 18 campos × ≥120 corridas fast-check | Todos los valores fuera de rango → error; todos los válidos → sin error | ✅ |
| `createPolicySchema` campos base (11 campos) | 11 campos × ≥120 corridas | ídem | ✅ |
| `createPolicySchema.otherDetails` (schema simple anidado) | 1 campo × ≥120 corridas | ídem | ✅ |
| `createPolicySchema.vehicleDetails` (schema complejo anidado, incl. `year` acotado 1900–2100) | 5 campos × ≥120 corridas | ídem | ✅ |
| `createPolicySchema` switching de `insuranceType` (9 tipos) | 9 combinaciones válidas + 72 combinaciones cruzadas (detalle equivocado) = 81 | Cada tipo acepta solo su propio detalle; cualquier otro detalle es `forbidden` | ✅ |
| `updatePolicySchema` (6 campos) | 6 campos × ≥120 corridas | ídem | ✅ |
| `createClaimSchema` / `updateClaimSchema` | 7 campos × ≥120 corridas | ídem | ✅ |
| `createCompanySchema` / `updateCompanySchema` | 4 campos × ≥120 corridas | ídem | ✅ |
| `createQuickMessageSchema` / `updateQuickMessageSchema` | 4 campos × ≥120 corridas | ídem | ✅ |
| `verifyTwoFactorLoginSchema` (`preAuthToken`, `code`) | 2 campos × ≥120 corridas | ídem | ✅ |
| `confirmSetupSchema` / `disable2FASchema` (`code` exactLength=6 + patrón `^\d+$`, `password`) | 3 campos × ≥120 corridas | ídem | ✅ |
| Descarte de campos desconocidos (`stripUnknown`) | 1 verificación por schema × 16 schemas | `brokerId`/campos inventados siempre descartados sin error | ✅ |
| Confirmación HTTP end-to-end (no por campo, por endpoint) | 8 endpoints, ~20 payloads representativos | Pipeline completo ruta→auth→validate→400/201 igual al schema aislado | ✅ |

**Total:** 60 pares (schema, campo) × ≥120 corridas fast-check ≈ **7,200+ valores
generados**, más 81 combinaciones de `insuranceType`, más ~20 llamadas HTTP de
confirmación. **286 casos `it()`**, 3/3 corridas consecutivas sin fallos, con
seed de fast-check distinto en cada corrida.

---

## Sección 2 — Mass assignment

Por cada endpoint `PUT` se arma un payload con TODOS los campos prohibidos del
modelo Prisma de esa entidad, combinados con valores inventados o con el id
real de una entidad de OTRO broker (para simular secuestro), en 20 corridas
con valores distintos. Se verifica en las 20 corridas que la respuesta HTTP y
el registro en base (consultado directo con Prisma) mantienen los valores
originales de esos campos, mientras que un campo legítimo del mismo payload
SÍ se actualiza (prueba de que el update ocurrió, no que fue un no-op).

| Caso | Campos prohibidos incluidos | Variaciones probadas | Resultado | Estado |
|---|---|---|---|---|
| `PUT /api/clientes/:id` | `id`, `brokerId`, `createdById` | 20 | Descartados en las 20; `address` sí se actualiza | ✅ |
| `PUT /api/companias/:id` | `id`, `brokerId` | 20 | Descartados en las 20; `name` sí se actualiza | ✅ |
| `PUT /api/mensajes-rapidos/:id` | `id`, `brokerId` | 20 | Descartados en las 20; `message` sí se actualiza | ✅ |
| `PUT /api/polizas/:id` | `id`, `brokerId`, `clientId`, `companyId`, `coverageId`, `insuranceType` | 20 | Descartados en las 20; `totalAmount` sí se actualiza | ✅ |
| `PUT /api/siniestros/:id` | `id`, `brokerId`, `policyId` | 20 | Descartados en las 20; `notes` sí se actualiza | ✅ |

**Total:** 5 endpoints × 20 combinaciones = **100 variaciones probadas**, verificadas
tanto en la respuesta HTTP como contra la base real. **5 casos `it()`** (cada uno
con las 20 combinaciones + verificación final embebidas). 3/3 corridas sin fallos.

---

## Sección 3 — Aislamiento de cartera

3 brokers de prueba, cada uno con su sub-broker y su propio set de datos
(cliente, póliza VEHICLE, siniestro, compañía, mensaje rápido). Generado
programáticamente con loops anidados: `owner × attacker × rol-atacante ×
entidad × acción`.

| Caso | Cantidad de variaciones probadas | Resultado | Estado |
|---|---|---|---|
| Controles positivos (broker/sub-broker accede a SUS propios datos) | 3 brokers × 2 roles × 5 entidades = 30 | 200 en las 30 (acceso permitido) | ✅ |
| `GET` cruzado (atacante de un broker contra dato de otro) | 3×2×2×5 = 60 | 404 en las 60 | ✅ |
| `PUT` cruzado | 60 | Rechazado (400, ver nota) en las 60; dato sin cambios verificado | ✅ |
| `DELETE` cruzado | 60 | Rechazado (400) en las 60; registro confirmado que sigue existiendo | ✅ |

**Nota de status code:** los controllers de esta app devuelven **400** (no 404)
cuando un `PUT`/`DELETE` no encuentra el recurso en el broker del actor (ver
"Hallazgos" — inconsistencia de status code, no una falla de seguridad: el
dato queda protegido en todos los casos).

**Total:** **210 casos `it()`** (30 controles positivos + 180 combinaciones de
ataque cruzado). 3/3 corridas sin fallos — ningún BROKER ni SUB_BROKER pudo
leer, editar ni borrar datos de otro broker, en ninguna de las 5 entidades.

---

## Sección 4 — RBAC

Se relevaron a mano los 40 endpoints montados en `src/app.ts` (recorriendo
cada `src/routes/*.routes.ts`). Por cada uno: sin token, token expirado,
token con firma de otro secreto, token válido pero manipulado (401 en los 4
casos), y los 3 roles (ADMIN/BROKER/SUB_BROKER: permitido → gate pasado,
no permitido → 403).

| Caso | Cantidad de variaciones probadas | Resultado | Estado |
|---|---|---|---|
| Endpoints relevados | 40 (auth: 7, clientes: 6, companias: 5, mensajes-rapidos: 5, coberturas: 4, polizas: 4, siniestros: 4, reportes: 1, auditoria: 1, ocr: 2, gemini incluido en ocr) | — | — |
| Sin token → 401 | 40 | 401 en los 40 | ✅ |
| Token expirado → 401 | 40 | 401 en los 40 | ✅ |
| Token con firma de otro secreto → 401 | 40 | 401 en los 40 | ✅ |
| Token válido pero manipulado → 401 | 40 | 401 en los 40 | ✅ |
| Rol permitido → gate pasado (200/201 o status de negocio, nunca 401/403) | 40 endpoints × roles permitidos | Correcto en los 40 | ✅ |
| Rol NO permitido → 403 | 40 endpoints × roles no permitidos | 403 en los 40 | ✅ |

**Total:** 40 endpoints × 7 verificaciones = **280 casos `it()`**. 3/3 corridas
sin fallos (tras corregir un falso positivo intermitente — ver Hallazgos).

---

## Sección 5 — 2FA

Ciclo completo (`setup` → `confirm` → `login` en dos pasos → `logout`)
repetido 10 veces con usuarios nuevos, generando el código TOTP esperado con
`otplib` (la misma librería que usa `src/services/twoFactor.service.ts`), sin
codigos hardcodeados. Además, agotamiento completo de los 8 backup codes de
un usuario.

| Caso | Cantidad de variaciones probadas | Resultado | Estado |
|---|---|---|---|
| Ciclo completo E2E (setup→confirm→login 2 pasos→logout) | 10 usuarios distintos | Los 10 completan el flujo; token final funciona y queda invalidado tras logout | ✅ |
| Backup codes: consumo 1 por 1 + invalidación inmediata | 8 códigos × 2 verificaciones (uso + reintento inmediato) = 16 | Cada código funciona una única vez; el reintento inmediato siempre falla (401) | ✅ |
| Backup codes: 9no intento (reusar cualquiera de los 8 ya usados) | 8 (uno por cada código ya usado) | 401 en los 8 | ✅ |

**Total:** **11 casos `it()`** (10 ciclos + 1 test de agotamiento de backup
codes, que internamente ejecuta 10 + 24 = 34 llamadas HTTP de login/2FA).
3/3 corridas sin fallos.

---

## Sección 6 — Volumen

300 registros de `Client` distribuidos de forma no uniforme entre 3 brokers
de prueba (150/100/50), insertados con `createMany` (ver nota de diseño #4).
Lecturas reales por HTTP contra ese volumen.

| Caso | Cantidad de variaciones probadas | Resultado | Tiempo de respuesta | Estado |
|---|---|---|---|---|
| Creación de 300 clientes distribuidos | 3 brokers (150/100/50) | Conteo exacto por broker verificado | 144ms (createMany) | ✅ |
| `GET /clientes/documento/:documentNumber` | 10 muestras sobre el broker de 150 | 200 + cliente correcto en las 10 | 74–395ms (prom. ~116ms) | ✅ |
| `GET /clientes` paginado (3 páginas × 50, broker de 150) | 3 páginas | Sin duplicados ni faltantes entre páginas; 150/150 cubiertos | 113–185ms | ✅ |
| `GET /clientes` con `perPage=200` (brokers de 100 y 50) | 2 | Total exacto y aislado por broker | 111–113ms | ✅ |
| `GET /clientes?search=...` sobre 150 registros | 1 | Coincidencia correcta | 145ms | ✅ |

**Total:** **4 casos `it()`**, 16 llamadas HTTP medidas individualmente. Todos
los tiempos de respuesta se mantuvieron muy por debajo del umbral de 5s
definido como "razonable" (máximo observado: 395ms, sobre una base remota en
`sa-east-1`). 3/3 corridas sin fallos.

---

## Sección 7 — Consistencia entre corridas (x3)

El suite completo (796 casos) se corrió 3 veces consecutivas de punta a
punta, limpiando todos los datos propios al final de cada archivo.

Primero se detectó un fallo intermitente (ver Hallazgo #1) en una corrida
completa previa al fix: 793/796, con los mismos 3 casos de RBAC fallando de
forma no reproducible en aislamiento — exactamente el patrón de un test
intermitente que el enunciado pide **no ignorar ni reintentar hasta que
pase**, sino diagnosticar. Se diagnosticó la causa raíz (colisión de tokens
JWT por segundo de reloj en el helper de test, no un bug de la app), se
corrigió, y se volvió a correr la tanda de 3 corridas consecutivas exigida
de punta a punta:

| Corrida | Resultado | Tests fallidos | Duración |
|---|---|---|---|
| 1 | ✅ 796/796 | 0 | 134.99s |
| 2 | ✅ 796/796 | 0 | 135.39s |
| 3 | ✅ 796/796 | 0 | 123.51s |

**2,388/2,388 casos pasaron** en las 3 corridas consecutivas post-fix (0
fallos, 0 intermitencias). Duración total de las 3 corridas: ~6m34s.

---

## Hallazgos

### 1. [Test intermitente, detectado y corregido] Colisión de tokens JWT por segundo de reloj en el helper de test

- **Síntoma:** al correr el suite completo, 3 de los 280 casos de RBAC
  (`POST /auth/2fa/setup` para los 3 roles) fallaron con 401 en vez de 200,
  pero pasaban siempre al correr `rbac.test.ts` en aislamiento.
- **Causa raíz (en el harness de test, NO en la app):** `tokenFor()` firmaba
  el JWT solo con `{userId, email, role, brokerId}`. `jsonwebtoken` trunca
  `iat` a segundos; si se firman dos tokens para el MISMO usuario dentro del
  mismo segundo de reloj, el string resultante es literalmente idéntico. El
  test de `POST /auth/logout` (que corre antes que `2fa/setup` en el archivo)
  blacklistea ese string exacto; si `2fa/setup` reutilizaba por coincidencia
  el mismo string (mismo usuario, mismo segundo), quedaba invalidado sin
  querer.
- **Reproducción exacta:** correr `npx vitest run` (suite completo) varias
  veces seguidas en una máquina bajo carga variable — la colisión depende del
  timing exacto entre los `it()` de `POST /auth/logout` y `POST
  /auth/2fa/setup` dentro de `tests/rbac.test.ts`.
- **Corrección aplicada:** se agregó un claim `jti` random a cada token
  firmado en `tests/helpers.ts` (`tokenFor`, `expiredToken`,
  `tokenWithWrongSecret`), garantizando un string único por llamada sin
  importar el segundo de reloj. **No se tocó código de producción** — el bug
  era exclusivamente del helper de test.
- **Verificación:** `rbac.test.ts` y el suite completo corrieron sin fallos
  en las corridas posteriores al fix (ver Sección 7).

### 2. [Bug funcional] `PUT`/`DELETE /api/coberturas` no puede apuntar a una cobertura específica

- **Archivo:** `src/routes/coverage.routes.ts` (rutas `router.put('/', ...)`
  y `router.delete('/', ...)`, sin segmento `:id`) + `src/controllers/
  coverage.controller.ts` (`updateCoverageController`/`deleteCoverageController`
  leen `req.params.id`, que siempre es `undefined` porque la ruta no declara
  ese parámetro).
- **Efecto:** `updateCoverage(undefined, brokerId, data)` /
  `deleteCoverage(undefined, brokerId)` nunca encuentran ninguna cobertura
  (`prisma.coverage.findFirst({where: {id: undefined, ...}})`) y siempre
  responden 400 "Cobertura no encontrada", sin importar el body enviado.
- **Reproducción exacta:** `PUT /api/coberturas` (o `DELETE`) con cualquier
  body, autenticado como BROKER o SUB_BROKER dueño de coberturas reales →
  siempre 400. Confirmado en `tests/rbac.test.ts` (casos "PUT /coberturas
  (sin :id, ver hallazgo)" y "DELETE /coberturas (sin :id, ver hallazgo)").
- **Impacto:** funcional, no de seguridad (no hay forma de que un
  usuario edite/borre la cobertura de otro tampoco, porque no puede editar/
  borrar NINGUNA). Es probable que falte el segmento `:id` en las rutas y
  que el controller debería leer `req.params.id`.

### 3. [Inconsistencia de API] `PUT`/`DELETE` devuelven 400 en vez de 404 para "no encontrado"

- **Archivos:** todos los controllers de Client/Policy/Claim/Company/
  QuickMessage (`update*Controller`/`delete*Controller`) capturan el error
  "no encontrado" del service con `res.status(400)`, mientras que los
  `get*ByIdController` correctamente usan `res.status(404)` para el mismo
  tipo de error.
- **Efecto:** un `PUT`/`DELETE` sobre un id inexistente (o de otro broker)
  responde 400 "Bad Request" en vez de 404 "Not Found", lo cual es
  semánticamente incorrecto (400 debería reservarse para errores de
  validación del payload, no de existencia del recurso).
- **Impacto:** cosmético/consistencia de API, NO es una falla de seguridad
  — en todos los casos verificados (sección de Aislamiento y Mass
  Assignment) el dato de otro broker queda protegido igual.

### 4. [Observación, no bug] `Joi.date().iso()` acepta fechas de calendario inválidas

- **Ejemplo:** `"2020-02-30"` es aceptada por `dateOfBirth`, `incidentDate`,
  etc. porque JavaScript hace *rollover* de fechas inválidas (`new
  Date("2020-02-30")` se interpreta como 2020-03-01) en vez de fallar el
  parseo, y Joi solo valida el formato + que `Date` no tire error.
- **Impacto:** ningún schema del proyecto restringe rangos de fecha de
  negocio (ni fechas de nacimiento ni vigencias de póliza tienen mín/máx). No
  es una falla de seguridad, pero puede permitir datos de negocio
  silenciosamente incorrectos (ej. una fecha de nacimiento mal tipeada que
  "rota" a otro día en vez de ser rechazada).

### 5. [Observación, no bug] Inconsistencias menores entre validators de creación/actualización

- `createClientSchema.email` NO valida formato de email (solo longitud
  3–200), mientras que `updateClientSchema.email` sí usa `.email()`. Un
  cliente puede crearse con un "email" que no lo es, pero no puede
  actualizarse a uno inválido.
- `updateClientSchema` es el único de los 5 schemas de actualización que NO
  tiene `.min(1)` — un `PUT /api/clientes/:id` con body `{}` responde 200
  (no-op), mientras que el mismo caso en Policy/Claim/Company/QuickMessage
  responde 400 "at least one field required" (por el `.min(1)` en esos
  schemas).

---

## Reproducibilidad

- **Seeds de fast-check:** no se fijaron (comportamiento default), por lo
  que cada corrida usa un seed distinto. Si una propiedad fallara, el mensaje
  de error de fast-check incluye el seed exacto y el contraejemplo
  (`{ seed: <n>, path: "<p>" }` + `Counterexample: [...]`), reproducible con
  `fc.assert(..., { seed: <n> })`.
- **Payloads de mass assignment:** generados con valores aleatorios en el
  momento (uuid random / string inventado / id real de otro broker); para
  reproducir un caso puntual alcanza con fijar `garbageValue()` a un valor
  concreto en `tests/massAssignment.test.ts`.
- **Datos de test:** todos identificables por convención de nombre (`qa-
  coverfy-test-*@coverfy-test.local` para usuarios; `RBAC-`, `ISO-`, `VOL-`,
  etc. como prefijo de `documentNumber`/`policyNumber`/nombres en las demás
  entidades).

---

## Cómo correr el suite

```bash
cd packages/backend
npx vitest run                     # todo el suite
npx vitest run tests/fuzzing.test.ts        # solo Sección 1
npx vitest run tests/massAssignment.test.ts # solo Sección 2
npx vitest run tests/isolation.test.ts      # solo Sección 3
npx vitest run tests/rbac.test.ts           # solo Sección 4
npx vitest run tests/twoFactor.test.ts      # solo Sección 5
npx vitest run tests/volume.test.ts         # solo Sección 6
```

**Prerrequisito de infraestructura:** la base de datos configurada en
`.env` (`DATABASE_URL`) es un Supabase remoto compartido con un límite duro
de **15 conexiones concurrentes** (pooler en modo sesión). `tests/setup.ts`
acota el `connection_limit` del cliente Prisma a 3 automáticamente y
`vitest.config.ts` ya tenía `fileParallelism: false` — no correr el suite en
paralelo con otro proceso que use la misma base.
