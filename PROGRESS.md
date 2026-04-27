# TaskFlow - Progress Tracker

## ✅ Completado (Fase 1: Setup Inicial)

### Frontend
- [x] Inicializar React Native + Expo
- [x] Instalar dependencias base (React Navigation, Supabase, Zustand)
- [x] Crear estructura de carpetas (`src/screens`, `src/components`, etc.)
- [x] Configurar TypeScript + tsconfig.json
- [x] Crear tipos base (`Task`, `User`, `Category`, `Subtask`)
- [x] Crear cliente Supabase (`src/services/supabase.ts`)
- [x] Crear auth store con Zustand (sign up, sign in, sign out, getCurrentUser)
- [x] Crear App.tsx con navegación base (Auth Stack + Tabs)
- [x] Crear README con instrucciones de setup

### Backend (Infraestructura)
- [x] Crear schema SQL completo (`supabase_schema.sql`)
  - Tablas: users, tasks, subtasks, categories, task_history
  - Índices para performance
  - Triggers para auto-update timestamps
- [x] Configurar RLS (Row Level Security) en todas las tablas
- [x] Crear guía de setup Supabase (`SETUP_SUPABASE.md`)

### DevOps
- [x] .gitignore setup
- [x] .env.example setup
- [ ] Git commit inicial (pendiente)

---

## 🔄 En Progreso: Fase 2 (Backend Setup)

**Acción requerida del usuario:**
1. Crear cuenta Supabase (si no la tiene)
2. Crear proyecto "TaskFlow"
3. Ejecutar `supabase_schema.sql` en SQL Editor
4. Configurar email provider en Auth
5. Copiar URL y Anon Key a `.env`

**Tiempo estimado:** 15 minutos

Ver: `SETUP_SUPABASE.md` para instrucciones paso a paso.

---

## 📋 Próximos Pasos (Orden)

### Fase 2b: Pantalla de Autenticación (3 días)
1. Crear UI de Login (email, password, login button)
2. Crear UI de Signup (email, password, nombre, signup button)
3. Integrar con authStore (sign up, sign in)
4. Validación básica (email format, password strength)
5. Error handling (mostrar errores)
6. Success flow (redirigir a home después de login)

### Fase 3: Pantalla de Tareas (4-5 días)
1. Crear store Zustand para tareas (fetchTasks, createTask, updateTask, deleteTask)
2. UI: Lista de tareas (FlatList, cada item muestra título, categoría, prioridad, estado)
3. UI: Crear tarea (formulario: título, descripción, fecha, prioridad, categoría)
4. UI: Detallar tarea (mostrar todo, botones para editar/eliminar/completar)
5. Completar/Incompleta tarea (toggle checkbox)
6. Eliminar tarea
7. Real-time sync (polling cada 10s)

### Fase 4: Subtareas y Progreso (2-3 días)
1. UI: Agregar subtarea (en detalles de tarea)
2. UI: Marcar subtarea como completa
3. Lógica: Auto-completar tarea cuando todas sus subtareas están completas
4. UI: Mostrar progreso ("2/4 subtareas")
5. Eliminar subtarea

### Fase 5: Categorías (2 días)
1. Crear store para categorías
2. UI: Panel de categorías (crear, editar color/icono, eliminar)
3. Limit 5 categorías en Free plan
4. Filtrar tareas por categoría

### Fase 6: Colaboración (5-6 días) — Premium Feature
1. Buscar usuario por email (para asignar)
2. UI: Botón "Asignar a" en detalle de tarea
3. Flujo de asignación: enviar, notificar
4. UI: Tab "Asignaciones a mí" (tareas pendientes de respuesta)
5. Flujo de aceptación (botón Aceptar)
6. Flujo de rechazo (botón Rechazar + motivo)
7. UI: Ver motivo de rechazo
8. UI: Reasignar después de rechazo
9. Real-time: Ver cambios de estado en vivo
10. Paywall: Mostrar "Upgrade to Pro" cuando intenta asignar

### Fase 7: Notificaciones (2-3 días)
1. Push notifications (FCM + APNs) - Cuando le asignan una tarea
2. Local notifications - Recordatorio X horas antes de deadline
3. Badging - Mostrar # de asignaciones pendientes

### Fase 8: Perfil y Ajustes (1-2 días)
1. Pantalla de perfil (mostrar nombre, email, avatar)
2. Cambiar contraseña
3. Logout
4. Ver plan actual (Free/Pro)

### Fase 9: Monetización (2 días)
1. Setup Stripe
2. Paywall elegante (modal/screen)
3. Checkout via Stripe
4. Webhook para actualizar plan en BD

### Fase 10: Testing & QA (3-4 días)
1. Tests unitarios (utils, helpers)
2. Tests E2E (crear → completar tarea)
3. Testing manual en iOS
4. Testing manual en Android
5. Performance check (crash rate <0.5%)

### Fase 11: Documentación & Deploy (2-3 días)
1. Privacy Policy + Terms of Service
2. API documentation
3. Build iOS → TestFlight
4. Build Android → Google Play Console

---

## 📊 Timeline Estimado

| Fase | Duración | Semanas |
|------|----------|---------|
| 1. Setup Inicial | 1 día | 0.2 |
| 2. Backend Infrastructure | 1 día | 0.2 |
| 2b. Auth UI | 3 días | 0.4 |
| 3. Tareas (CRUD) | 4 días | 0.6 |
| 4. Subtareas | 2 días | 0.3 |
| 5. Categorías | 2 días | 0.3 |
| 6. Colaboración | 5 días | 0.7 |
| 7. Notificaciones | 3 días | 0.4 |
| 8. Perfil/Ajustes | 2 días | 0.3 |
| 9. Monetización | 2 días | 0.3 |
| 10. Testing | 3 días | 0.4 |
| 11. Docs & Deploy | 3 días | 0.4 |
| **TOTAL** | **31 días** | **~4.5 semanas** |

*Nota: Esto asume trabajo full-time sin blockers. Ajustar según disponibilidad.*

---

## 🎯 Hitos Clave

- **Semana 1:** Auth + Tareas básicas (CRUD)
- **Semana 2:** Subtareas + Categorías + Notificaciones
- **Semana 3:** Colaboración completa
- **Semana 4:** Testing + Deploy (Beta)

---

## 🚀 Commits Recomendados

```bash
# Fase 1 - Setup
git add .
git commit -m "chore: initial React Native + Expo setup with Supabase schema"

# Fase 2b - Auth
git commit -m "feat: auth login/signup screens"

# Fase 3 - Tareas
git commit -m "feat: task CRUD operations"

# etc...
```

---

## 📝 Nota Importante

Este documento es vivo. Actualizar conforme avances.
Si encuentras blockers, documentar en issue/PR para futuro.

---

**Última actualización:** 27 de abril de 2026  
**Estado:** Esperando setup Supabase por usuario
