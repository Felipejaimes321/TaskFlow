# TaskFlow - Gestión de Tareas Colaborativas

App móvil de productividad con flujo de aceptación/rechazo de tareas asignadas.

## Setup Local

### Requisitos
- Node.js >= 18
- npm >= 9
- Expo CLI: `npm install -g expo-cli`
- Cuenta Supabase (https://supabase.com)

### Instalación

1. Clonar repo y entrar al directorio:
```bash
cd /Users/felipejaimes/Desktop/Productividad
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Llenar variables de entorno:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Ejecutar App

**Desarrollo (Expo):**
```bash
npm start
```

Luego:
- Presionar `i` para iOS
- Presionar `a` para Android
- Presionar `w` para web

**Compilar para release:**
```bash
eas build --platform ios
eas build --platform android
```

## Estructura del Proyecto

```
src/
├── screens/       # Pantallas principales
├── components/    # Componentes reutilizables
├── context/       # Estado global (Zustand)
├── services/      # Supabase, API calls
├── types/         # TypeScript types
├── utils/         # Helpers
└── App.tsx        # Punto de entrada
```

## Roadmap

- [ ] **V1:** Tareas solo, categorías, subtareas
- [ ] **V1.2:** Colaboración (asignar, aceptar/rechazar)
- [ ] **V1.5:** Notificaciones, historial
- [ ] **V2:** Equipos, reportes, recurrencia

## Notas de Desarrollo

### Base de Datos
- PostgreSQL via Supabase
- Tablas: users, tasks, subtasks, categories, task_history
- RLS (Row Level Security) obligatorio

### Autenticación
- Email/Password via Supabase Auth
- Tokens almacenados en SecureStore (iOS/Android)

### Estado
- Zustand para auth global
- Zustand para tareas/categorías (próximo)

## Contribuir

1. Crear rama: `git checkout -b feature/xxx`
2. Commitear: `git commit -m "feat: xxx"`
3. Push: `git push origin feature/xxx`
4. PR con descripción

## License

MIT
