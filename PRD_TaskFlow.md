# PRD: TaskFlow
## Plataforma de Gestión de Tareas Colaborativas

**Versión:** 1.0  
**Fecha:** 27 de abril de 2026  
**Estado:** Documento vivo — sujeto a validación con usuarios  
**Propietario del Producto:** [Nombre PM]

---

## 1. Resumen Ejecutivo

**TaskFlow** es una app móvil de gestión de tareas que combina la simplicidad de un gestor personal con el poder de la asignación colaborativa. A diferencia de Todoist o TickTick, TaskFlow introduce un flujo de aceptación/rechazo para tareas asignadas, fomentando la responsabilidad compartida y eliminando la fricción de "tareas asignadas no solicitadas".

**Modelo:** Freemium con monetización en colaboración Premium.  
**Plataforma:** iOS y Android (React Native + Supabase).  
**Objetivo V1:** MVP funcional en 12-16 semanas.

---

## 2. Problema Que Resuelve

### Problemas Identificados

1. **Tareas no negociadas en contextos compartidos:**
   - Parejas: una parte asigna tarea al otro sin consenso → resentimiento.
   - Padres-hijos: órdenes percibidas como impositivas → baja adopción.
   - Equipos pequeños: asignación unilateral sin contexto de capacidad.

2. **Falta de visibilidad colaborativa en herramientas simples:**
   - Aplicaciones personales (Apple Reminders, Google Tasks) no permiten colaboración.
   - Herramientas complejas (Jira, Asana) son overkill para uso personal o familiar.

3. **Desconexión entre quién crea y quién ejecuta:**
   - No hay espacio para negociar plazos o prioridades.
   - El ejecutor no puede comunicar imposibilidad sin cambiar plataforma.

### Propuesta de Valor

**Para usuarios individuales:**
- Gestor de tareas intuitivo, sin complejidad innecesaria.
- Categorización flexible (creada por el usuario).
- Progreso visual automático mediante subtareas.

**Para usuarios colaborativos (parejas, familias, equipos pequeños):**
- Asigna tareas pero respeta la autonomía del otro: él elige aceptar o rechazar.
- Motivos de rechazo: permite renegociar en lugar de imponer.
- Visibilidad en tiempo real: ambas partes saben qué pasó y por qué.
- Rompedor vs competencia: esto no existe en Todoist, TickTick o Asana en este formato.

---

## 3. Usuarios Objetivo (Personas)

### Persona 1: María (30 años) — Pareja/Familia
- **Rol:** Gestora de hogar y coordinadora familiar.
- **Contexto:** Vive con pareja e hijo de 8 años.
- **Dolor:** "Siempre termino repitiendo qué hay que hacer. Mi pareja olvida. Mi hijo se resiste."
- **Necesidad:** Delegar con claridad, pero que la tarea no se sienta como orden.
- **Métrica de éxito:** Si ambas partes ven la tarea y alguien la acepta sin "drama", ganamos.

### Persona 2: Carlos (45 años) — Emprendedor con equipo pequeño
- **Rol:** Dueño de consultora con 4 empleados.
- **Contexto:** Trabajo ágil, sin metodología formal. Algunas tareas urgentes se olvidan.
- **Dolor:** "No puedo justificar Jira para 4 personas, pero tampoco puedo trackear nada."
- **Necesidad:** Asignar tareas rápido, saber si se entendieron, ver avance sin reuniones.
- **Métrica de éxito:** Tareas asignadas → 90% aceptadas o rechazadas (no "olvidadas en el inbox").

### Persona 3: Lucía (22 años) — Usuario Solo
- **Rol:** Estudiante + freelancer.
- **Contexto:** Usa Apple Reminders pero necesita más. No colabora en tareas.
- **Dolor:** "Mis tareas están repartidas en la app de notas, calendario y reminders. Caótico."
- **Necesidad:** Reunir todo en un lugar elegante y gratis.
- **Métrica de éxito:** Usa la app >5 días/semana, 20+ tareas activas.

---

## 4. Diferenciadores vs Competencia

| Aspecto | TaskFlow | Todoist | TickTick | Any.do |
|--------|----------|---------|---------|--------|
| **Aceptación de tareas asignadas** | ✓ (core) | ✗ (asignación unilateral) | ✗ (idem) | ✗ (idem) |
| **Rechazo con motivo** | ✓ (feedback) | ✗ | ✗ | ✗ |
| **Categorías creadas por usuario** | ✓ | Etiquetas rígidas | Etiquetas rígidas | Etiquetas rígidas |
| **Uso solo (sin pagar por colab)** | ✓ (Free) | ✓ pero menos intuitivo | ✓ pero menos intuitivo | ✓ |
| **Progreso auto en subtareas** | ✓ (v1) | ✓ (pero en Premium) | ✓ | Limitado |
| **Precio entrada (Free forever)** | Gratis | Freemium | Freemium | Freemium |
| **Colaboración nativa** | ✓ (Flujo negoziado) | ✓ pero cara | ✓ pero cara | ✓ pero cara |

**Diferenciador clave:** "Tareas que se aceptan, no que se imponen."

---

## 5. Funcionalidades V1 Priorizadas (MoSCoW)

### MUST (Mínimo viable — Semanas 1-6)

#### Autenticación y Perfil
- [ ] Registro/Login vía email + contraseña (Supabase Auth).
- [ ] Perfil básico: nombre, avatar (URL o iniciales).
- [ ] Logout.

#### Gestión de Tareas
- [ ] Crear tarea: título, descripción (opcional), fecha límite (opcional), prioridad (Baja/Media/Alta).
- [ ] Listar tareas propias en vista de lista.
- [ ] Marcar tarea como completa/incompleta.
- [ ] Eliminar tarea.
- [ ] Vista de tareas por estado: Pendientes, Completadas, Rechazadas (si aplica).

#### Categorías
- [ ] Crear categoría: nombre, color (picker), ícono (icono lista predefinida de 30 iconos).
- [ ] Asignar categoría a tarea.
- [ ] Listar tareas por categoría.
- [ ] Editar/Eliminar categoría (propagación a tareas).
- [ ] Mínimo 5 categorías gratis, sin límite en Pro.

#### Subtareas
- [ ] Agregar subtarea a una tarea.
- [ ] Marcar subtarea como completa.
- [ ] Progreso visual: "2/4 subtareas" en la tarea padre.
- [ ] Si hay subtareas, la tarea padre no se marca manual como completa; se completa auto cuando todas las subtareas lo están.
- [ ] Eliminar subtarea.

#### Notificaciones Básicas
- [ ] Recordatorio local: "Tu tarea vence hoy" (configurable a qué hora).
- [ ] Push cuando otra persona asigna una tarea (solo en colaboración).

### SHOULD (Suma valor — Semanas 7-10)

#### Colaboración Completa (Feature Premium)
- [ ] Agregar colaborador: buscar por email registrado en TaskFlow.
- [ ] Asignar tarea a colaborador: el colaborador recibe notificación.
- [ ] Flujo de aceptación:
  - Colaborador ve tarea pendiente (estado "Esperando respuesta" en su vista).
  - Botones: **Aceptar** | **Rechazar**.
  - Si acepta: tarea entra a su lista como "Asignada por [nombre original]".
  - Si rechaza: permite escribir motivo (campo de texto), la tarea vuelve a "Rechazada" en la vista del creador.
- [ ] Visualizar motivo de rechazo al toque en tarea rechazada.
- [ ] Reasignar después de rechazo: el creador puede intentar de nuevo o modificar plazo.
- [ ] Historial de cambios en tarea: "María asignó a Carlos" → "Carlos rechazó: sin tiempo" → etc.

#### Visibilidad en Tiempo Real
- [ ] Progreso en vivo: si María ve que Carlos completó 2 de 4 subtareas, lo ve sin recargar.
- [ ] Refresco automático cada 10 segundos (MVP) o Realtime de Supabase (futuro).

#### Prioridad Visual
- [ ] Ordenar por prioridad (Alta → Media → Baja) en la lista.
- [ ] Ícono/color distintivo por prioridad.

#### Vistas Adicionales
- [ ] Vista "Mis asignaciones": tareas que le asignaron a mí.
- [ ] Vista "Asignadas por mí": tareas que asigné a otros.

### COULD (Bonus — Post-V1 o V1.1)

- [ ] Filtros avanzados: por prioridad, fecha, categoría, colaborador.
- [ ] Búsqueda de tareas por keyword.
- [ ] Estadísticas: tasa de aceptación de tareas, promedio de días para completar.
- [ ] Integración con calendario (ver tareas en vista semanal).
- [ ] Soporte para múltiples asignados en una tarea.
- [ ] Recurrencia: tareas que se repiten (diario, semanal, etc.).
- [ ] Archivos adjuntos: adjuntar fotos/documentos a tareas.
- [ ] Comentarios en tareas (discusión asincrónica).
- [ ] Sincronización offline: trabajar sin conexión, sync al volver online.
- [ ] Dark mode.
- [ ] Internacionalización (i18n): soporte para idiomas adicionales (v2).

---

## 6. Funcionalidades Explícitamente Excluidas de V1

| Funcionalidad | Razón |
|---------------|-------|
| Tareas recurrentes | Complejidad. Agregar en V1.1 si métricas lo justifican. |
| Equipos/Grupos de colaboradores | MVP es 1:1. Ampliar a N:N en V2. |
| Chatear dentro de la app | Riesgo de convertirse en Slack. Usar notificaciones + SMS/email para feedback. |
| Exportar tareas (CSV, PDF) | Nice-to-have, no crítico para V1. |
| Integración con Google Calendar, Outlook | Demasiado scope. V2 si traction lo amerita. |
| Tareas privadas dentro de grupo | Complejidad de permisos. V2. |
| SSO (Google, Apple Login) | Complejidad OAuth. Usar email/contraseña en V1. |
| Pago vía in-app (iOS/Android SDK) | Usar Stripe webhook en backend. Pago vía web primero. |
| Analytics dashboard para usuarios | V2: si tenemos usuarios Pro pagando. |

---

## 7. Flujos de Usuario Principales

### Flujo 1: Usuario Solo — Crear y Completar Tarea
1. Abre app → Tab "Mis Tareas".
2. Toca botón flotante "+".
3. Llena: Título ("Comprar leche"), Descripción (opcional), Fecha límite, Prioridad.
4. Selecciona categoría "Compras" (previamente creada).
5. Confirma "Crear".
6. Tarea aparece en lista bajo "Pendientes".
7. Usuario ve tarea, toca para expandir y agrega 2 subtareas: "Ir al supermercado", "Volver a casa".
8. Al entrar al supermercado, marca subtarea "Ir al supermercado" como completa.
9. Tarea padre ahora muestra "1/2 subtareas".
10. Al llegar a casa, marca "Volver a casa" como completa.
11. Tarea padre se completa automáticamente, se mueve a "Completadas".

### Flujo 2: Colaboración — Asignar y Aceptar Tarea
1. **María** (creadora) abre app.
2. Crea tarea: "Limpiar baño" con fecha límite mañana, prioridad Media.
3. En la pantalla de detalle de tarea, toca "Asignar a" (feature Pro).
4. Busca y selecciona "Carlos" (su pareja, ya registrada en TaskFlow).
5. Aparece diálogo: "¿Asignar a Carlos?" → Confirma.
6. Tarea sale de la lista de María y aparece en estado "Asignada a Carlos".

7. **Carlos** recibe push: "María te asignó una tarea".
8. Abre app → Tab "Asignaciones a mí".
9. Ve tarea "Limpiar baño" con badge "Esperando respuesta".
10. Toca para expandir, lee descripción/fecha.
11. Carlos piensa: "No tengo tiempo mañana, tengo reunión". Toca "Rechazar".
12. Campo de texto: "Por qué rechazas?" → Escribe "Tengo reunión mañana, ¿el viernes?".
13. Confirma rechazo.

14. **María** recibe push: "Carlos rechazó 'Limpiar baño'".
15. Ve tarea en estado "Rechazada" con motivo expandible.
16. Lee: "Tengo reunión mañana, ¿el viernes?".
17. Toca tarea, cambia fecha a viernes, toca "Reasignar a Carlos".
18. Carlos recibe segunda notificación: "María reasignó 'Limpiar baño' (fecha cambiada a viernes)".
19. Acepta esta vez → Tarea entra a su lista "Asignadas por mí" con estado "Aceptada".
20. Ambos ven progreso: si Carlos completa subtareas, María lo ve en tiempo real.

### Flujo 3: Flujo de Rechazo Alternativo (Aceptación)
- Pasos 1-9 como arriba.
- En paso 11: Carlos toca "Aceptar".
- Tarea desaparece de "Asignaciones a mí", entra a "Mis Tareas" con etiqueta "Asignada por María".
- Si tiene subtareas, Carlos puede comenzar a marcarlas.
- María ve tarea en estado "Aceptada por Carlos" con su progreso.

### Flujo 4: Gestión de Categorías
1. Usuario abre Tab "Ajustes".
2. Toca "Mis Categorías".
3. Ve lista: Personal, Trabajo, Hogar.
4. En Free: máximo 5 categorías; botón "+ Nueva" deshabilitado después del 5to.
5. Toca "+ Nueva Categoría":
   - Nombre: "Salud".
   - Toca picker de color → selecciona azul.
   - Toca picker de ícono → selecciona corazón.
   - Confirma "Crear".
6. Nueva categoría disponible al crear tareas.

---

## 8. Modelo de Datos Conceptual

### Entidades

#### users
```
id (UUID, PK)
email (text, unique)
password_hash (text)
full_name (text)
avatar_url (text, nullable)
created_at (timestamp)
updated_at (timestamp)
plan (enum: 'free', 'pro') — default: 'free'
stripe_customer_id (text, nullable)
```

#### tasks
```
id (UUID, PK)
creator_id (UUID, FK → users)
title (text)
description (text, nullable)
category_id (UUID, FK → categories, nullable)
priority (enum: 'low', 'medium', 'high') — default: 'low'
due_date (date, nullable)
status (enum: 'pending', 'completed', 'rejected') — default: 'pending'
assigned_to (UUID, FK → users, nullable)
assignment_status (enum: 'waiting', 'accepted', 'rejected') — default null si unassigned
rejection_reason (text, nullable)
created_at (timestamp)
updated_at (timestamp)
completed_at (timestamp, nullable)
```

#### subtasks
```
id (UUID, PK)
task_id (UUID, FK → tasks, cascade delete)
title (text)
completed (boolean) — default: false
order (int) — para ordenar subtareas
created_at (timestamp)
```

#### categories
```
id (UUID, PK)
user_id (UUID, FK → users)
name (text)
color (text) — formato hex: #FFFFFF
icon (text) — nombre del ícono (ej: 'shopping', 'work', 'heart')
created_at (timestamp)
updated_at (timestamp)
```

#### task_history (auditoría)
```
id (UUID, PK)
task_id (UUID, FK → tasks)
action (enum: 'created', 'assigned', 'accepted', 'rejected', 'completed', 'modified')
performed_by (UUID, FK → users)
details (jsonb) — payload de cambio
created_at (timestamp)
```

### Relaciones
```
users (1) ←→ (N) tasks [creator]
users (1) ←→ (N) tasks [assigned_to]
users (1) ←→ (N) categories
tasks (1) ←→ (N) subtasks
```

---

## 9. Modelo de Negocio y Estrategia Freemium

### Estructura de Precios

| Plan | Precio | Límites | Características |
|------|--------|---------|-----------------|
| **Free** | $0 (forever) | 5 categorías, 0 colaboradores | Gestor personal completo |
| **Pro** | $4.99 USD/mes | Ilimitado | Todo + Colaboración + Historial |

### Monetización

1. **Usuarios libres:** Retención (pueden usar solos indefinidamente).
2. **Usuarios Pro:** Conversión cuando quieren colaborar (flujo natural).
3. **Estrategia de conversión:**
   - Cuando usuario trata de asignar una tarea → paywall: "Función Pro. Actualiza por $4.99/mes".
   - Trial de 7 días al actualizar.
   - Recordatorio semanal a usuarios con >5 tareas asignadas sin Pro.

### Proyecciones Conservadoras (Año 1)

- **Target:** 50k usuarios activos mensuales.
- **Conversión a Pro:** 2% (1,000 usuarios pagos).
- **ARR:** $1,000 × $4.99 × 12 = ~$60k.
- **CAC (Customer Acquisition Cost):** Asumiendo $0 (growth orgánico + word-of-mouth).

---

## 10. Métricas de Éxito (KPIs)

### Métricas de Producto

| KPI | Target V1 | Descripción |
|-----|-----------|-------------|
| **MAU (Monthly Active Users)** | 5k en mes 3 | Usuarios que abren app ≥1 vez/mes |
| **DAU/MAU Ratio** | >25% | Retención = engagement diario |
| **Tareas creadas/usuario/mes** | >10 | Engagement profundo |
| **Tasa de aceptación de asignaciones** | >60% | Calidad del flujo de colaboración |
| **Tiempo para responder asignación** | <24h (mediana) | Fricción del flujo |
| **Tasa de completitud** | >40% de tareas creadas | Utilidad percibida |
| **Pro conversion (first 6 meses)** | >1% | Monetización inicial |

### Métricas de Negocio

| KPI | Target |
|-----|--------|
| **MRR (Monthly Recurring Revenue)** | $500 en mes 6 |
| **Churn rate (Pro)** | <5% mensual |
| **CAC** | $0 (bootstrap) |
| **LTV (Lifetime Value)** | >$100 @ 2% conversion |

### Métricas de Confiabilidad

| KPI | Target |
|-----|--------|
| **Uptime** | >99.5% |
| **Crash rate** | <0.5% |
| **Latencia P95** | <2s |

---

## 11. Riesgos y Supuestos

### Supuestos Críticos

| Supuesto | Validación Requerida | Plan B |
|----------|----------------------|--------|
| Usuarios preferirán "aceptar/rechazar" vs "asignar directo" | User testing con 20 parejas/familias | Hacer aceptación opcional (toggle) |
| Hay demanda para $4.99/mes en mercado Latam | Landing page + Google Ads testing | Revisar precio ($2.99 o modelo ad-supported) |
| React Native puede alcanzar 60 FPS en vistas grandes de tareas | Proof of concept 1-2 semanas | Usar React Native + TurboModules optimizado |
| Supabase escala a 50k usuarios sin throttling | Load test preliminar | Migrar a PostGIS + read replicas |
| Push notifications confiables vía FCM/APNs (>90% delivery) | Testing con partners de backend | Fallback vía in-app polling |

### Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Realtime de Supabase slow con tareas frecuentes | Moderate | Usar polling cada 10s en V1, Realtime en V1.1 |
| Sincronización offline compleja | Moderate | Excluir offline de V1 (requiere RFC separada) |
| Autenticación multidevice problemática (logout en un device) | Low | Usar session tokens con expiry corto |

### Riesgos de Producto

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Adoption baja en usuarios solo (no ven valor vs Apple Reminders) | High | Foco en UX elegante, categorías customizables, subtareas fluidas |
| Competencia copia el flujo de aceptación | Low | Primero a mercado, brand loyalty por comunidad |
| Abuse: spam de asignaciones | Moderate | Rate limiting, block colaboradores, reportar |

### Riesgos de Negocio

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Monetización $4.99 rechazada en mercados price-sensitive | High | A/B test precios, modelo ad-supported como fallback |
| Churn Pro >10% por falta de features | Moderate | Roadmap transparente, survey de cancelación |
| GDPR/privacidad en EU | Moderate | DPA con Supabase, Privacy Policy clara, user data export |

---

## 12. Roadmap (Fases Post-V1)

### V1.1 (Semanas 17-20)
- Realtime completo (Supabase Realtime en lugar de polling).
- Búsqueda y filtros avanzados.
- Historial visual (timeline de cambios en tarea).

### V1.5 (Semanas 21-26)
- Tareas recurrentes (diario, semanal, mensual).
- Sincronización offline.
- Dark mode.
- Integración con Google Calendar (lectura).

### V2.0 (Q3/Q4 2026)
- Soporte para equipos (asignar a grupos).
- Comentarios y @mentions en tareas.
- Reportes y dashboards (solo Pro).
- SSO (Google, Apple).
- Internacionalización (ES, PT, EN mínimo).

---

## 13. Criterios de Aceptación para V1 (Go/No-Go)

**Antes de lanzar a beta:**

- [ ] Pruebas E2E cubren todos los flujos MUST + SHOULD principales.
- [ ] Performance: app abre en <2s en dispositivo de gama media (Snapdragon 730, A13 Bionic).
- [ ] Push notifications llegan >95% de las veces.
- [ ] Cero crashes en testing manual (50+ casos).
- [ ] Flujo de aceptación testeable con >=10 parejas reales.
- [ ] Documentación API Supabase/Backend completa.
- [ ] Privacy Policy + Terms of Service (Latam-friendly).

**Go to market:**
- [ ] 500+ beta testers sin showstoppers críticos.
- [ ] NPS >30 (post-launch).
- [ ] <1% crash rate en wild.

---

## 14. Consideraciones Técnicas Iniciales

### Stack Sugerido
- **Frontend:** React Native (Expo si presupuesto ajustado, EAS si premium).
- **Backend:** Supabase (PostgreSQL + Auth + Realtime).
- **Push:** Firebase Cloud Messaging (FCM) + APNs.
- **Storage:** S3 (avatares, futuros archivos adjuntos).
- **Payments:** Stripe (PCI compliance delegado).
- **Monitoring:** Sentry (crashes), PostHog (analytics).

### Requisitos No-Funcionales
- **Auth:** Email/password + email verification.
- **Rate limiting:** 100 req/min por usuario (API).
- **Encryption:** TLS en tránsito, passwords hasheados (bcrypt).
- **Data retention:** Borrado lógico de usuarios (GDPR).
- **Backup:** Daily snapshots de PostgreSQL.

---

## 15. Glosario

| Término | Definición |
|---------|-----------|
| **Asignación** | Acto de crear una tarea y delegarla a otro usuario. |
| **Flujo de aceptación** | Proceso donde el asignado puede aceptar o rechazar la tarea. |
| **Subtarea** | Desglose de una tarea mayor. |
| **Categoría** | Agrupación creada por el usuario (ej: Trabajo, Personal). |
| **Progreso automático** | Cálculo de % de tarea basado en subtareas completadas. |
| **MAU** | Usuarios activos mensuales. |
| **Paywall** | Punto donde se solicita upgrading a Premium. |

---

## Anexo A: Referencias Competitivas

**Todoist**  
- Fortaleza: Productividad avanzada, templates, automatización.
- Debilidad: Asignación unilateral, UX compleja para usuarios solo.

**TickTick**  
- Fortaleza: Sincronización multi-dispositivo, habituales.
- Debilidad: Caro en colaboración, no tiene flujo de negociación.

**Any.do**  
- Fortaleza: Simple, integración con calendario.
- Debilidad: Menos adoptado, menos comunidad.

**Microsoft To Do**  
- Fortaleza: Integración Office, gratis.
- Debilidad: No tiene colaboración real, abandonado (roadmap slow).

---

## Anexo B: Supuestos Culturales / Contexto Latam

1. **Familias multigeneracionales:** Tareas a padres ancianos, hijos. La negociación es crucial (no imposición).
2. **SMEs (pequeños negocios):** Equipos <10 personas. Herramienta simple pero visible.
3. **Sensibilidad al precio:** Freemium must-have, conversión a <$5 USD.
4. **Conectividad variable:** Sincronización offline útil (backlog).

---

**Fin del documento**  
Para preguntas, contactar al PM o revisar changelog de updates.
