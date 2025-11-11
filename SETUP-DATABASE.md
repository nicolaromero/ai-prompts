# Configuración de Base de Datos

Esta aplicación usa **Better Auth** para autenticación y **Supabase** solo como base de datos PostgreSQL.

## ⚠️ Importante

- **NO** usamos Supabase Auth
- **SÍ** usamos Better Auth (con la base de datos de Supabase)
- **NO** usamos Row Level Security (RLS)
- La seguridad se maneja en API Routes

## Pasos para configurar

### 1. Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Espera a que se complete la creación (toma unos 2 minutos)

### 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** > **API**
2. Copia las siguientes credenciales:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Ve a **Settings** > **Database**
4. Copia el **Connection String** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase (solo como base de datos)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Better Auth
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
BETTER_AUTH_SECRET=genera_un_secret_aleatorio_aqui
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

**Para generar BETTER_AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Ejecutar el Schema SQL

1. Ve a tu **Supabase Dashboard**
2. Navega a **SQL Editor**
3. Haz clic en **New Query**
4. Copia y pega el contenido de `/supabase/complete-schema.sql`
5. Haz clic en **Run**

Deberías ver: "Success. No rows returned"

### 5. Verificar las Tablas

1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `user` (Better Auth)
   - `session` (Better Auth)
   - `account` (Better Auth)
   - `verification` (Better Auth)
   - `prompts` (Aplicación)

## Estructura de las Tablas

### Better Auth Tables

**`user`** - Almacena los usuarios
- `id` (TEXT) - Primary Key
- `email` (TEXT) - Email único
- `emailVerified` (BOOLEAN)
- `name` (TEXT)
- `image` (TEXT)
- `createdAt`, `updatedAt`

**`session`** - Sesiones activas
- `id` (TEXT) - Primary Key
- `userId` (TEXT) - FK a `user`
- `expiresAt` (TIMESTAMP)
- `token` (TEXT) - Token de sesión
- `ipAddress`, `userAgent`

**`account`** - Cuentas OAuth
- `id` (TEXT) - Primary Key
- `userId` (TEXT) - FK a `user`
- `providerId` (TEXT) - "google", "github", etc.
- `accountId` (TEXT) - ID del proveedor
- `accessToken`, `refreshToken`
- `password` (TEXT) - Para email/password

**`verification`** - Tokens de verificación
- `id` (TEXT) - Primary Key
- `identifier` (TEXT) - Email o user ID
- `value` (TEXT) - Token
- `expiresAt` (TIMESTAMP)

### Application Tables

**`prompts`** - Prompts de usuarios
- `id` (UUID) - Primary Key
- `user_id` (TEXT) - FK a `user` de Better Auth
- `name` (VARCHAR) - Nombre del prompt
- `role`, `context`, `security`, `task` (TEXT) - Campos obligatorios
- `guidelines`, `examples`, `language` (TEXT) - Campos opcionales
- `language_enabled` (BOOLEAN)
- `response_format` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

## Arquitectura de Seguridad

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ HTTP Request
       ↓
┌──────────────┐
│  API Routes  │ ← Verifica sesión con Better Auth
└──────┬───────┘
       │
       │ user_id verificado
       ↓
┌──────────────┐
│   Supabase   │ ← Solo ejecuta queries SQL
└──────────────┘
```

**Flujo:**
1. Usuario hace login → Better Auth autentica
2. Better Auth crea sesión → Cookie enviada al navegador
3. Frontend hace request → API Route recibe cookie
4. API Route verifica sesión → Better Auth valida y devuelve user_id
5. API Route hace query → Filtra por user_id
6. Supabase devuelve datos → Solo del usuario autenticado

## Diferencias con Supabase Auth

| Concepto | Supabase Auth | Better Auth + Supabase |
|----------|--------------|------------------------|
| Tablas de usuarios | `auth.users` (protegido) | `public.user` (normal) |
| Sesiones | JWT tokens | Cookies + tabla `session` |
| RLS | Usa `auth.uid()` | No se usa (seguridad en API) |
| Providers | Configuración en dashboard | Configuración en código |
| Flexibilidad | Limitado a Supabase | Funciona con cualquier DB |

## Siguientes Pasos

Después de configurar la base de datos:

1. Instala dependencias: `npm install`
2. Ejecuta el servidor de desarrollo: `npm run dev`
3. Visita `http://localhost:3000`

## Troubleshooting

### Error: "Failed to initialize database adapter"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de reemplazar `[YOUR-PASSWORD]` con tu contraseña real
- La URL debe empezar con `postgresql://`

### Error: "relation 'user' does not exist"
- Ejecuta el schema SQL en Supabase SQL Editor
- Verifica que las tablas se crearon correctamente en Table Editor

### Error: "Unauthorized" en API Routes
- Verifica que `BETTER_AUTH_SECRET` esté configurado
- Revisa que las cookies estén habilitadas en tu navegador
- Intenta hacer logout y volver a hacer login

## Recursos

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
