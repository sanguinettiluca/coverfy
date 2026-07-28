# Spanish → English identifier rename glossary

Single source of truth for the project-wide rename. Every backend, Prisma, and
frontend change must use these exact English names. Only code identifiers
(models, fields, enums, functions, classes, variables, DTOs, query-param
keys) are renamed. User-facing strings, comments, and HTTP route paths stay
in Spanish.

## Entities (Prisma models)

| Spanish | English |
|---|---|
| Cliente | Client |
| Poliza | Policy |
| CompaniaSeguros | Company |
| Cobertura | Coverage |
| Siniestro | Claim |
| Documento | Document |
| MensajeRapido | QuickMessage |
| DetalleVehiculo | VehicleDetails |
| DetalleViaje | TripDetails |
| DetalleAlquiler | RentalDetails |
| DetalleHogar | HomeDetails |
| DetalleComercio | BusinessDetails |
| DetalleResponsabilidadCivil | LiabilityDetails |
| DetalleFianza | BondDetails |
| DetalleVida | LifeDetails |
| DetalleOtros | OtherDetails |
| User, Role, TokenBlacklist | *(unchanged, already English)* |

## Relation names

| Spanish | English |
|---|---|
| BrokerClientes | BrokerClients |
| ClienteCreador | ClientCreator |
| PolizaCreador | PolicyCreator |
| SiniestroCreador | ClaimCreator |
| MensajesRapidosBroker | BrokerQuickMessages |
| BrokerSubBrokers | *(unchanged, already English)* |

## Enums + values

| Spanish | English |
|---|---|
| `enum TipoSeguro` | `InsuranceType` |
| VEHICULO | VEHICLE |
| VIAJE | TRIP |
| ALQUILER | RENTAL |
| HOGAR | HOME |
| COMERCIO | BUSINESS |
| RESPONSABILIDAD_CIVIL | LIABILITY |
| FIANZA | BOND |
| VIDA | LIFE |
| OTROS | OTHER |
| `enum EstadoPoliza` | `PolicyStatus` |
| ACTIVA | ACTIVE |
| VENCIDA | EXPIRED |
| CANCELADA | CANCELLED |
| SUSPENDIDA | SUSPENDED |
| `enum MetodoPago` | `PaymentMethod` |
| Debito | Debit |
| Credito | Credit |
| Transferencia | Transfer |
| Efectivo | Cash |
| `enum EstadoSiniestro` | `ClaimStatus` |
| ABIERTO | OPEN |
| CERRADO | CLOSED |
| `enum Role` | *(unchanged, already English)* |

## Fields — User

| Spanish | English |
|---|---|
| nombre | name |
| brokerId, subBrokers, broker | *(unchanged)* |
| companias | companies |
| clientes | clients |
| polizasCreadas | createdPolicies |
| clientesCreados | createdClients |
| siniestrosCreados | createdClaims |
| mensajesRapidos | quickMessages |

## Fields — Client (ex Cliente)

| Spanish | English |
|---|---|
| nombres | firstName |
| apellidos | lastName |
| documento | documentNumber |
| fechaNacimiento | dateOfBirth |
| celular | phone |
| celularAlternativo | alternatePhone |
| direccion | address |
| notas | notes |
| creadoPorId | createdById |
| creadoPor | createdBy |
| brokerId, broker | *(unchanged)* |
| polizas | policies |

## Fields — Company (ex CompaniaSeguros)

| Spanish | English |
|---|---|
| nombre | name |
| porcentajeComision | commissionRate |
| brokerId, broker | *(unchanged)* |
| polizas | policies |
| coberturas | coverages |

## Fields — Policy (ex Poliza)

| Spanish | English |
|---|---|
| numeroPoliza | policyNumber |
| numeroReferencia | referenceNumber |
| tipoSeguro | insuranceType |
| estado | status |
| fechaInicio | startDate |
| fechaVencimiento | expirationDate |
| montoTotal | totalAmount |
| cuotas | installments |
| metodoPago | paymentMethod |
| clienteId | clientId |
| cliente | client |
| companiaId | companyId |
| compania | company |
| coberturaId | coverageId |
| cobertura | coverage |
| brokerId, broker | *(unchanged)* |
| siniestros | claims |
| detalleVehiculo | vehicleDetails |
| detalleViaje | tripDetails |
| detalleAlquiler | rentalDetails |
| detalleHogar | homeDetails |
| detalleComercio | businessDetails |
| detalleResponsabilidadCivil | liabilityDetails |
| detalleFianza | bondDetails |
| detalleVida | lifeDetails |
| detalleOtros | otherDetails |
| documentos | documents |

## Fields — Coverage (ex Cobertura)

| Spanish | English |
|---|---|
| nombre | name |
| companiaId | companyId |
| compania | company |
| tipoSeguro | insuranceType |
| polizas | policies |

## Fields — detail tables (per insurance type)

| Model | Spanish field | English field |
|---|---|---|
| VehicleDetails | marca | brand |
| VehicleDetails | modelo | model |
| VehicleDetails | anio | year |
| VehicleDetails | matricula | licensePlate |
| VehicleDetails | padron | registrationNumber |
| VehicleDetails | chasis | chassisNumber |
| VehicleDetails | motor | engineNumber |
| TripDetails | destino | destination |
| TripDetails | fechaSalida | departureDate |
| TripDetails | fechaRegreso | returnDate |
| TripDetails | pasajeros | passengers |
| RentalDetails | direccion | address |
| RentalDetails | tipoInmueble | propertyType |
| RentalDetails | valorAlquiler | rentAmount |
| HomeDetails | direccion | address |
| HomeDetails | tipoConstruccion | constructionType |
| HomeDetails | metrosCuadrados | squareMeters |
| HomeDetails | valorPropiedad | propertyValue |
| BusinessDetails | razonSocial | businessName |
| BusinessDetails | rubro | industry |
| BusinessDetails | direccion | address |
| LiabilityDetails | actividad | activity |
| LiabilityDetails | limiteCobertura | coverageLimit |
| BondDetails | tipoFianza | bondType |
| BondDetails | montoGarantizado | guaranteedAmount |
| BondDetails | beneficiario | beneficiary |
| LifeDetails | sumaAsegurada | insuredAmount |
| LifeDetails | beneficiario | beneficiary |
| OtherDetails | descripcion | description |
| (all detail tables) | polizaId / poliza | policyId / policy |

## Fields — Claim (ex Siniestro)

| Spanish | English |
|---|---|
| fechaSiniestro | incidentDate |
| fechaContacto | contactDate |
| notas | notes |
| estado | status |
| polizaId | policyId |
| poliza | policy |
| brokerId, broker | *(unchanged)* |

## Fields — Document (ex Documento)

| Spanish | English |
|---|---|
| nombre | name |
| tipo | type |
| url | *(unchanged)* |
| polizaId | policyId |
| poliza | policy |

## Fields — QuickMessage (ex MensajeRapido)

| Spanish | English |
|---|---|
| nombre | name |
| mensaje | message |
| brokerId, broker | *(unchanged)* |

## Pagination / filter / query-param keys

| Spanish | English |
|---|---|
| busqueda | search |
| pagina | page |
| porPagina | perPage |
| totalPaginas | totalPages |

## 2FA-related

| Spanish | English |
|---|---|
| codigo | code |
| generarSecret (local fn colliding w/ otplib import) | generateTotpSecret |
| generarQRCode | generateQRCode |
| verificarCodigo | verifyCode |
| generarBackupCodes | generateBackupCodes |
| verificarBackupCode | verifyBackupCode |
| codigosParaMostrar | codesToDisplay |
| codigosHasheados | hashedCodes |
| coincide | matches |
| NOMBRE_APP | APP_NAME |
| CANTIDAD_BACKUP_CODES | BACKUP_CODES_COUNT |
| TOLERANCIA_SEGUNDOS | TOLERANCE_SECONDS |
| generarSetup | generateSetup |
| confirmarSetup | confirmSetup |
| desactivar2FA | disable2FA |
| secretCifrado | encryptedSecret |
| passwordValida | isPasswordValid |

## OCR / Gemini

| Spanish | English |
|---|---|
| DatosCedula | IdCardData |
| extraerDatosCedula | extractIdCardData |
| reconocerCedula | recognizeIdCard |
| generarConFallback | generateWithFallback |
| capitalizar | capitalize |
| texto | text |
| resultado | result |
| lineas / linea | lines / line |
| valor | value |
| textoRespuesta | responseText |
| jsonLimpio | cleanJson |
| datos | data |
| PROMPT_CEDULA | ID_CARD_PROMPT |
| **Prompt JSON keys** `documento/nombres/apellidos/fechaNacimiento` | `documentNumber/firstName/lastName/dateOfBirth` (this is a data contract the code parses, not user-facing text — must change) |
| MODEL_PRINCIPAL / MODEL_FALLBACK | PRIMARY_MODEL / FALLBACK_MODEL |
| **NOT translated**: OCR label-matching literals `"NOMBRE"`, `"APELLIDO"`, `"NOME"`, `"SOBRENOME"` in `ocr.service.ts` | these match text printed on the physical ID card, unrelated to code identifiers |

## Crypto util

| Spanish | English |
|---|---|
| texto | text |
| cifrado | encrypted |
| textoCifrado | encryptedText |
| partes | parts |
| datos / datosHex | data / dataHex |
| descifrado | decrypted |

## CRUD verb prefixes

| Spanish | English |
|---|---|
| crear... | create... |
| listar... | list... |
| obtener...PorId | get...ById |
| actualizar... | update... |
| eliminar... | delete... |
| buscar...Por... | find...By... |

## Common local-variable patterns

| Spanish | English |
|---|---|
| clienteExistente | existingClient |
| polizaExistente | existingPolicy |
| companiaExistente | existingCompany |
| coberturaExistente | existingCoverage |
| mensajeExistente | existingMessage |
| polizaActualizada / clienteActualizado / etc. | updatedPolicy / updatedClient / etc. |
| resultado | result |
| datos | data |
| filtros | filters |
| soloOperadores / operadores | allowedRoles |
| detalleCreateMap | detailsCreateMap |
| buildDetalleCreate | buildDetailsCreate |
| claveDetalle | detailsKey |
| camposDetalle | detailsFields |
| camposPoliza / camposBase | policyFields / baseFields |
| detallesUpdate | detailsUpdate |
| conteoPorCompania | countByCompany |
| altasPorMes | signupsByMonth |
| polizasActivas | activePolicies |
| clientesAcumuladosPorMes | cumulativeClientsByMonth |
| indice | index |
| codigoValido | validCode |
| codigosRestantes | remainingCodes |

## Frontend-specific

| Spanish | English |
|---|---|
| mostrarForm | showForm |
| busqueda | search |
| clientes | clients |
| vista | view |
| editandoPct | isEditingRate |
| pctInput | rateInput |
| cargando* | isLoading* |
| detalle | details |
| tiposSeguro | insuranceTypes |
| campos | fields |
| editando | isEditing |
| archivo | file |
| onVerCliente | onViewClient |
| onVolver | onBack |
| onCreada | onCreated |
| onCancelar | onCancel |

## Explicit exceptions (stay in Spanish)

- User-facing strings: error messages, toasts, JSX labels (`"Nueva póliza"`, `"Marca"`, etc.)
- Comments
- HTTP route path strings (`/api/clientes`, `/api/polizas`, etc.)
- OCR label-matching literals (see OCR/Gemini section above)

## File rename map

**Backend** (`packages/backend/src/`), applied across `domain/`, `controllers/`, `services/`, `routes/`, `validators/`:

| Spanish file stem | English file stem |
|---|---|
| cliente | client |
| poliza | policy |
| cobertura | coverage |
| compania | company |
| mensajeRapido | quickMessage |
| siniestro | claim |
| reporte | report |

Unchanged (already English): `auth.*`, `ocr.*`, `gemini.*`, `twoFactorAuth.*`, `twoFactor.service.ts`, `password.validator.ts`, `crypto.util.ts`, `index.ts`.

**Frontend** (`packages/frontend/src/`):

| Spanish | English |
|---|---|
| services/clientes.service.ts | services/clients.service.ts |
| services/companias.service.ts | services/companies.service.ts |
| services/polizas.service.ts | services/policies.service.ts |
| services/siniestros.service.ts | services/claims.service.ts |
| services/reportes.service.ts | services/reports.service.ts |
| services/usuarios.service.ts | services/users.service.ts |
| features/broker/ClienteDetalle.tsx | features/broker/ClientDetail.tsx |
| features/broker/ClientesList.tsx | features/broker/ClientsList.tsx |
| features/broker/ComisionesPage.tsx | features/broker/CommissionsPage.tsx |
| features/broker/NuevaPolizaForm.tsx | features/broker/NewPolicyForm.tsx |
| features/broker/PolizaDetalle.tsx | features/broker/PolicyDetail.tsx |
| features/broker/ReportesPage.tsx | features/broker/ReportsPage.tsx |
