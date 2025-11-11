# AI Prompts Platform - Documentación del Proyecto

## 📋 Descripción General

Plataforma web para crear, gestionar y compartir prompts profesionales para modelos de IA (Claude, OpenAI, etc.). Incluye sistema de autenticación multi-tenant con organizaciones, permitiendo equipos colaborativos.

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** (App Router) - Framework React con SSR
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos utility-first
- **shadcn/ui** - Componentes UI accesibles
- **Phosphor Icons** - Iconografía moderna
- **Geist Font** - Tipografía

### Backend & Base de Datos
- **Better Auth v1.3.34** - Sistema de autenticación completo
  - Email/Password authentication
  - Organization plugin (multi-tenant)
  - Session management
- **PostgreSQL 17.6** (Supabase) - Base de datos relacional
- **pg** - Cliente PostgreSQL para Node.js
- **Kysely 0.28.8** - Query builder type-safe

### Infraestructura
- **Supabase** - Backend as a Service
  - PostgreSQL managed database
  - Connection pooling (pgbouncer)
  - Direct connections para migraciones

## 📁 Estructura del Proyecto

```
ai-prompts/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Grupo de rutas de autenticación
│   │   │   ├── login/           # Página de login
│   │   │   ├── signup/          # Página de registro
│   │   │   └── layout.tsx       # Layout para auth
│   │   ├── (dashboard)/         # Grupo de rutas protegidas
│   │   │   ├── page.tsx         # Dashboard principal (/)
│   │   │   ├── prompts/         # Gestión de prompts
│   │   │   │   ├── page.tsx     # Lista de prompts
│   │   │   │   └── new/         # Crear nuevo prompt
│   │   │   ├── settings/        # Configuración
│   │   │   └── layout.tsx       # Layout con sidebar
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...all]/route.ts  # Better Auth handler
│   │   │   └── prompts/         # API de prompts
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Redirect a /
│   │   ├── globals.css
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── app-sidebar.tsx      # Sidebar de navegación
│   │   └── user-menu.tsx        # Menú de usuario con logout
│   └── lib/
│       ├── auth.ts              # Configuración Better Auth (servidor)
│       ├── auth-client.ts       # Cliente Better Auth (frontend)
│       └── db.ts                # Pool de PostgreSQL singleton
├── supabase/
│   ├── better-auth-schema.sql   # Esquema base de Better Auth
│   └── organization-migration.sql # Esquema de organizaciones
├── better-auth_migrations/      # Migraciones generadas por CLI
├── .env                         # Variables de entorno
└── package.json
```

## 🗄️ Esquema de Base de Datos

### Tablas de Better Auth (Core)

#### `user`
```sql
- id: TEXT (PK)
- email: TEXT (UNIQUE, NOT NULL)
- emailVerified: BOOLEAN (DEFAULT false)
- name: TEXT
- image: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### `session`
```sql
- id: TEXT (PK)
- userId: TEXT (FK -> user.id)
- expiresAt: TIMESTAMP
- token: TEXT (UNIQUE)
- ipAddress: TEXT
- userAgent: TEXT
- activeOrganizationId: TEXT (FK -> organization.id)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### `account`
```sql
- id: TEXT (PK)
- userId: TEXT (FK -> user.id)
- accountId: TEXT
- providerId: TEXT
- accessToken: TEXT
- refreshToken: TEXT
- accessTokenExpiresAt: TIMESTAMP
- refreshTokenExpiresAt: TIMESTAMP
- scope: TEXT
- idToken: TEXT
- password: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
- UNIQUE(userId, providerId)
```

#### `verification`
```sql
- id: TEXT (PK)
- identifier: TEXT
- value: TEXT
- expiresAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Tablas de Organizaciones (Multi-Tenant)

#### `organization`
```sql
- id: TEXT (PK)
- name: TEXT (NOT NULL)
- slug: TEXT (UNIQUE)
- logo: TEXT
- metadata: TEXT
- createdAt: TIMESTAMPTZ
- updatedAt: TIMESTAMPTZ
```

#### `member`
```sql
- id: TEXT (PK)
- organizationId: TEXT (FK -> organization.id, CASCADE)
- userId: TEXT (FK -> user.id, CASCADE)
- role: TEXT (DEFAULT 'member')
- createdAt: TIMESTAMPTZ
- UNIQUE(userId, organizationId)
```

#### `invitation`
```sql
- id: TEXT (PK)
- organizationId: TEXT (FK -> organization.id, CASCADE)
- email: TEXT
- role: TEXT
- status: TEXT (DEFAULT 'pending')
- expiresAt: TIMESTAMPTZ
- inviterId: TEXT (FK -> user.id, CASCADE)
- createdAt: TIMESTAMPTZ
```

## 🔐 Sistema de Autenticación

### Configuración Better Auth

**Servidor** (`src/lib/auth.ts`):
```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { getPool } from "./db";

export const auth = betterAuth({
  database: getPool(),
  emailAndPassword: { enabled: true },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: "owner",
      membershipLimit: 100,
    }),
  ],
});
```

**Cliente** (`src/lib/auth-client.ts`):
```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [organizationClient()],
});
```

### Flujos de Autenticación

#### Registro (Signup)
1. Usuario completa formulario en `/signup`
2. Se crea usuario con `authClient.signUp.email()`
3. Opcionalmente crea organización con `authClient.organization.create()`
4. Se establece organización activa
5. Redirect a `/`

#### Login
1. Usuario ingresa credenciales en `/login`
2. Se valida con `authClient.signIn.email()`
3. Se crea sesión automáticamente
4. Redirect a `/`

#### Logout
1. Usuario click en "Sign out" en UserMenu
2. Se ejecuta `authClient.signOut()`
3. Redirect a `/login`

### Roles de Organización

- **owner**: Control total (creador de la organización)
- **admin**: Control total excepto eliminar organización o cambiar owner
- **member**: Acceso limitado según permisos configurados

## 🔧 Configuración del Entorno

### Variables de Entorno (`.env`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Connections
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Configuración de Pool PostgreSQL

```typescript
// src/lib/db.ts
import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", (err) => console.error("Unexpected error on idle client", err));
  }
  return pool;
}
```

## 🚀 Instalación y Setup

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env` y completa las variables.

### 3. Aplicar Migraciones de Base de Datos

**Opción A: Usando el CLI de Better Auth**
```bash
cd ai-prompts
DIRECT_URL=$(grep DIRECT_URL .env | cut -d '=' -f2- | tr -d '"') npx @better-auth/cli@latest generate
DIRECT_URL=$(grep DIRECT_URL .env | cut -d '=' -f2- | tr -d '"') npx @better-auth/cli@latest migrate
```

**Opción B: Manualmente desde Supabase SQL Editor**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el contenido de `supabase/better-auth-schema.sql`
3. Ejecuta el contenido de la migración generada en `better-auth_migrations/`

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## 📱 Rutas de la Aplicación

### Públicas
- `/login` - Página de inicio de sesión
- `/signup` - Página de registro

### Protegidas (Requieren autenticación)
- `/` - Dashboard principal con estadísticas
- `/prompts` - Lista de prompts guardados
- `/prompts/new` - Crear nuevo prompt
- `/settings` - Configuración de usuario/organización
- `/dashboard` - Redirect a `/`

### API
- `/api/auth/*` - Endpoints de Better Auth (generados automáticamente)
- `/api/prompts` - CRUD de prompts
- `/api/prompts/stats` - Estadísticas de prompts
- `/api/prompts/[id]` - Operaciones por ID

## 🎨 Componentes Principales

### UserMenu
Muestra información del usuario logueado y controles de sesión.

**Features:**
- Nombre/email del usuario
- Badge de organización activa
- Botón de logout
- Tooltips informativos

**Ubicación:** `src/components/user-menu.tsx`

### AppSidebar
Navegación lateral de la aplicación.

**Features:**
- Links a secciones principales
- Iconos con Phosphor Icons
- Integrado con shadcn/ui sidebar

**Ubicación:** `src/components/app-sidebar.tsx`

## 🔄 Flujo de Datos

### Autenticación
```
Usuario → Formulario → authClient → Better Auth API → PostgreSQL
         ↓
      Sesión → Cookies → authClient.useSession() → React
```

### Gestión de Prompts
```
Usuario → Formulario → API Route → Supabase Client → PostgreSQL
         ↓
      Response → React State → UI Update
```

## 🧪 Testing y Desarrollo

### Verificar Conexión a Base de Datos
```bash
node test-connection.js
```

### Probar Autenticación
1. Ir a `/signup`
2. Crear cuenta con email y contraseña
3. Opcional: crear organización
4. Verificar en Supabase Table Editor:
   - Tabla `user` debe tener nuevo registro
   - Tabla `session` debe tener sesión activa
   - Tabla `organization` debe tener org (si se creó)
   - Tabla `member` debe tener membresía con role="owner"

### Logs Útiles
```bash
# Ver logs de Better Auth
# Los warnings de "Social provider google is missing..." son normales
# Solo significan que Google OAuth no está configurado

# Verificar sesión activa
console.log(session.user.email)
console.log(session.session.activeOrganizationId)
```

## 📚 Recursos y Documentación

### Better Auth
- [Documentación oficial](https://www.better-auth.com)
- [Installation Guide](https://www.better-auth.com/docs/installation)
- [Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [PostgreSQL Adapter](https://www.better-auth.com/docs/adapters/postgresql)

### Supabase
- [Dashboard](https://supabase.com/dashboard)
- [PostgreSQL Docs](https://supabase.com/docs/guides/database)
- [Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)

### Next.js
- [App Router Docs](https://nextjs.org/docs/app)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

## 🐛 Troubleshooting

### Error: "Connection terminated unexpectedly"
**Causa:** Pool de PostgreSQL cerrándose prematuramente
**Solución:** Usar Pool singleton en `src/lib/db.ts` y configurar SSL correctamente

### Error: "password authentication failed"
**Causa:** Contraseña incorrecta en DIRECT_URL
**Solución:** Obtener nueva connection string desde Supabase Dashboard

### Error: "Invalid API key"
**Causa:** Falta SUPABASE_SERVICE_ROLE_KEY
**Solución:** Obtener service_role key desde Supabase → Settings → API

### CLI de Better Auth no funciona
**Causa:** Variables de entorno no cargadas correctamente
**Solución:** Usar variables explícitas:
```bash
DIRECT_URL=$(grep DIRECT_URL .env | cut -d '=' -f2- | tr -d '"') npx @better-auth/cli@latest generate
```

## 🎯 Próximos Pasos / Roadmap

- [ ] Implementar verificación de email con servicio de correo (Resend/SendGrid)
- [ ] Página de gestión de organizaciones
- [ ] Sistema de invitaciones a organizaciones
- [ ] Middleware para proteger rutas automáticamente
- [ ] OAuth con Google
- [ ] Panel de administración de miembros
- [ ] Roles y permisos personalizados
- [ ] Exportación de prompts en múltiples formatos
- [ ] Versionado de prompts
- [ ] Compartir prompts entre organizaciones

## 👥 Equipo y Contribución

Proyecto desarrollado con **Claude Code** y **Claude Sonnet 4.5**.

---

**Última actualización:** 2025-11-11
**Versión:** 1.0.0
