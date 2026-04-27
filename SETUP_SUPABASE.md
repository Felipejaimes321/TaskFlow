# Setup de Supabase para TaskFlow

## Paso 1: Crear Proyecto Supabase

1. Ve a https://supabase.com y login
2. Haz clic en "New Project"
3. Llena los campos:
   - **Name:** TaskFlow
   - **Database Password:** [genera una contraseña fuerte]
   - **Region:** Selecciona la región más cercana (ej: us-east-1 o eu-west-1)
   - **Pricing:** Free tier está bien para MVP
4. Haz clic en "Create new project"
5. Espera ~2 minutos a que se cree la instancia

## Paso 2: Obtener Credenciales

1. Abre tu proyecto en Supabase
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** `eyJxxx...` (la llave pública)
4. Guarda en archivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Paso 3: Crear el Schema

1. En Supabase dashboard, ve a **SQL Editor** (icono de código)
2. Haz clic en "+ New Query"
3. Copia todo el contenido de `supabase_schema.sql` (en el repo)
4. Pégalo en el editor
5. Haz clic en "Run" (botón azul)
6. Espera a que ejecute (debería completarse sin errores)

## Paso 4: Verificar Tablas

1. Ve a **Table Editor** en el sidebar
2. Deberías ver estas tablas:
   - users
   - categories
   - tasks
   - subtasks
   - task_history

## Paso 5: Configurar Auth

### Email/Password (recomendado)

1. Ve a **Authentication** → **Providers**
2. Activa **Email** (está activo por defecto)
3. Ve a **Settings** (dentro de Auth):
   - **Site URL:** http://localhost:19000 (Expo dev)
   - **Redirect URLs:** http://localhost:19000/*, exp://* (para iOS/Android)
4. Guarda

### Opcional: Provider Social (Google, GitHub)
- Ve a cada provider en **Auth** → **Providers**
- Configura OAuth keys si lo necesitas
- Por ahora, skip (email es suficiente)

## Paso 6: Prueba de Conexión

En terminal, en la raíz del proyecto:

```bash
npm start
```

Cuando veas el menu de Expo, presiona `w` para web. Deberías ver:
- "Loading..." mientras se inicializa
- Si hay error de credenciales, revisar `.env`
- Si no hay error, la app debería estar lista

## Troubleshooting

### Error: "Missing Supabase credentials"
- Verificar que `.env` tiene URL y ANON_KEY correctos
- Reiniciar servidor: Ctrl+C y `npm start` de nuevo

### Error: "Row level security error"
- Las políticas de RLS no están creadas
- Revisar que todo el `supabase_schema.sql` ejecutó sin errores

### Error: "Auth connection refused"
- Supabase puede estar down (raro)
- Revisar https://status.supabase.com

## Próximos Pasos

Una vez verificada la conexión:
1. Implementar pantalla de Login/Register
2. Implementar gestión de tareas
3. Implementar categorías
4. Testing

---

**Duración esperada:** ~15 minutos
