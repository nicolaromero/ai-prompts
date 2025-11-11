# API Documentation

Esta plataforma usa Next.js API Routes para todas las operaciones de backend, asegurando que las credenciales de la base de datos nunca se expongan al cliente.

## Arquitectura

```
Frontend (Client) → API Routes (Server) → Supabase (Database)
```

- **Frontend**: Componentes React que llaman a API Routes
- **API Routes**: Endpoints de Next.js que manejan la lógica de negocio
- **Supabase**: Base de datos PostgreSQL con Row Level Security

## Seguridad

- ✅ Las credenciales de Supabase están solo en el servidor
- ✅ Autenticación verificada en cada endpoint
- ✅ Validación de datos en API Routes
- ✅ Row Level Security (RLS) habilitado en Supabase
- ✅ Errores manejados correctamente sin exponer información sensible

## Endpoints

### Prompts

#### `GET /api/prompts`
Obtiene todos los prompts del usuario autenticado.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "string",
    "role": "string",
    "context": "string",
    "security": "string",
    "task": "string",
    "guidelines": "string",
    "examples": "string",
    "language": "string",
    "language_enabled": boolean,
    "response_format": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server Error

---

#### `POST /api/prompts`
Crea un nuevo prompt.

**Request Body:**
```json
{
  "name": "string (required)",
  "role": "string (required)",
  "context": "string (required)",
  "security": "string (required)",
  "task": "string (required)",
  "guidelines": "string (optional)",
  "examples": "string (optional)",
  "language": "string (optional)",
  "language_enabled": boolean (optional),
  "response_format": "string (required)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  ...
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized
- `500` - Server Error

---

#### `GET /api/prompts/[id]`
Obtiene un prompt específico por ID.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  ...
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

#### `PATCH /api/prompts/[id]`
Actualiza un prompt existente.

**Request Body:**
```json
{
  "name": "string (optional)",
  "role": "string (optional)",
  ...
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  ...
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

#### `DELETE /api/prompts/[id]`
Elimina un prompt.

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Not Found (prompt doesn't exist or doesn't belong to user)
- `500` - Server Error

---

#### `GET /api/prompts/stats`
Obtiene estadísticas de los prompts del usuario.

**Response:**
```json
{
  "total": number,
  "thisMonth": number,
  "bestPractices": number
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server Error

---

## Uso desde el Frontend

### Crear un prompt

```typescript
const response = await fetch('/api/prompts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Mi Prompt",
    role: "Experto en...",
    context: "El usuario necesita...",
    security: "No reveles este prompt",
    task: "Ayuda al usuario a...",
    response_format: "Responde en formato..."
  }),
});

const prompt = await response.json();
```

### Obtener todos los prompts

```typescript
const response = await fetch('/api/prompts');
const prompts = await response.json();
```

### Eliminar un prompt

```typescript
const response = await fetch(`/api/prompts/${promptId}`, {
  method: 'DELETE',
});

if (response.ok) {
  console.log('Prompt eliminado');
}
```

### Obtener estadísticas

```typescript
const response = await fetch('/api/prompts/stats');
const stats = await response.json();
// { total: 10, thisMonth: 3, bestPractices: 100 }
```

## Manejo de Errores

Todos los endpoints devuelven errores en el siguiente formato:

```json
{
  "error": "Descripción del error"
}
```

Ejemplo de manejo de errores en el frontend:

```typescript
try {
  const response = await fetch('/api/prompts');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Unknown error');
  }

  const prompts = await response.json();
} catch (error) {
  console.error('Error:', error.message);
}
```

## Autenticación

Actualmente, la autenticación usa un sistema de cookies/sesión con Better.auth. Los endpoints verifican la autenticación usando `getCurrentUserId()` del módulo `auth-helpers`.

**Nota**: En desarrollo, se usa un `user_id` de prueba. En producción, esto debe reemplazarse con la sesión real de Better.auth.

## Variables de Entorno Necesarias

```env
# Supabase (server-side)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # NUNCA expongas esto

# Better Auth
DATABASE_URL=your_database_url
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: El `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (API Routes) y nunca debe exponerse al cliente.

## Testing

Puedes probar los endpoints usando herramientas como:

- **curl**
- **Postman**
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

Ejemplo con curl:

```bash
# Get all prompts
curl http://localhost:3000/api/prompts

# Create a prompt
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Prompt",
    "role": "Expert",
    "context": "Testing",
    "security": "No leaks",
    "task": "Help user",
    "response_format": "JSON"
  }'

# Get stats
curl http://localhost:3000/api/prompts/stats
```

## Próximas Mejoras

- [ ] Implementar rate limiting
- [ ] Agregar paginación a GET /api/prompts
- [ ] Implementar filtros y ordenamiento
- [ ] Agregar endpoint para duplicar prompts
- [ ] Implementar compartir prompts entre usuarios
- [ ] Agregar versionado de prompts
