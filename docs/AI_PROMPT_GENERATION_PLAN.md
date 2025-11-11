# 📋 Guía de Implementación: Generación de Prompts con IA

## Objetivo
Transformar el flujo manual de creación de prompts a uno asistido por IA, donde el usuario proporciona inputs simples y la IA genera el contenido estructurado para cada sección del prompt.

---

## 🏗️ Arquitectura de la Solución

### 1. **Flujo de Usuario**
```
1. Usuario ingresa descripción general → Input con AI SDK
2. Usuario describe el rol → Input con AI SDK
3. Usuario describe el contexto → Input con AI SDK
4. Usuario describe requisitos de seguridad → Input con AI SDK
5. Usuario describe la tarea → Input con AI SDK
6. [Opcional] Usuario agrega guidelines/examples → Input con AI SDK
7. Usuario presiona "Generar Prompt" → Llama a API con Anthropic
8. La IA genera cada sección del prompt estructurado
9. Usuario ve vista previa y puede editar manualmente
10. Usuario guarda el prompt final
```

### 2. **Componentes a Crear**

#### **Frontend Components**
```
src/components/
├── ai/
│   ├── PromptInput.tsx          # Input inteligente (ai-sdk/elements)
│   ├── GenerationProgress.tsx   # Progreso de generación
│   └── PreviewSection.tsx       # Vista previa de cada sección
└── prompts/
    └── AIPromptBuilder.tsx      # Componente principal
```

#### **API Endpoints**
```
src/app/api/
├── ai/
│   ├── generate-prompt/
│   │   └── route.ts            # Genera prompt completo
│   └── refine-section/
│       └── route.ts            # Refina una sección específica
```

#### **Utilities & Configs**
```
src/lib/
├── ai/
│   ├── anthropic.ts            # Cliente Anthropic configurado
│   ├── prompts/
│   │   ├── system-prompts.ts   # Prompts del sistema
│   │   └── templates.ts        # Templates para generación
│   └── schemas.ts              # Zod schemas para validación
```

---

## 📦 Instalación de Dependencias

```bash
npm install ai @ai-sdk/anthropic zod
```

**Paquetes:**
- `ai`: AI SDK de Vercel para React/Next.js
- `@ai-sdk/anthropic`: Provider de Anthropic para AI SDK
- `zod`: Validación de schemas

---

## 🔧 Configuración

### 1. Variables de Entorno

Agregar a `.env`:
```bash
# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 2. Cliente de Anthropic

**Archivo:** `src/lib/ai/anthropic.ts`
```typescript
import { createAnthropic } from '@ai-sdk/anthropic';

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo a usar
export const MODEL = 'claude-3-5-haiku-20241022'; // Haiku 4.5
```

---

## 📝 Implementación Detallada

### Fase 1: Schemas y Types

**Archivo:** `src/lib/ai/schemas.ts`
```typescript
import { z } from 'zod';

export const PromptInputSchema = z.object({
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  roleInput: z.string().optional(),
  contextInput: z.string().optional(),
  securityInput: z.string().optional(),
  taskInput: z.string().optional(),
  guidelinesInput: z.string().optional(),
  examplesInput: z.string().optional(),
  languageInput: z.string().optional(),
});

export const GeneratedPromptSchema = z.object({
  name: z.string(),
  role: z.string(),
  context: z.string(),
  security: z.string(),
  task: z.string(),
  guidelines: z.string().optional(),
  examples: z.string().optional(),
  language: z.string().optional(),
  responseFormat: z.string(),
});

export type PromptInput = z.infer<typeof PromptInputSchema>;
export type GeneratedPrompt = z.infer<typeof GeneratedPromptSchema>;
```

### Fase 2: System Prompts

**Archivo:** `src/lib/ai/prompts/system-prompts.ts`
```typescript
export const PROMPT_GENERATOR_SYSTEM = `Eres un experto en ingeniería de prompts para LLMs como Claude y GPT.

Tu tarea es ayudar a crear prompts estructurados y efectivos siguiendo las mejores prácticas de Anthropic y OpenAI.

Estructura del prompt:
- **Role**: Define quién es el asistente y su expertise
- **Context**: Proporciona contexto relevante sobre la tarea
- **Security**: Instrucciones para prevenir prompt injection y proteger información sensible
- **Task**: Descripción clara y específica de lo que debe hacer
- **Guidelines**: Reglas y mejores prácticas (opcional)
- **Examples**: Ejemplos few-shot (opcional)
- **Language**: Idioma y tono de respuesta (opcional)
- **Response Format**: Formato esperado de la respuesta

Genera contenido profesional, específico y bien estructurado para cada sección.`;

export const generateSectionPrompt = (
  section: string,
  userInput: string,
  fullContext: string
) => {
  const sectionInstructions = {
    role: 'Define un rol profesional y específico para el asistente. Incluye expertise y experiencia relevante.',
    context: 'Proporciona contexto detallado sobre el problema, dominio o situación. Ayuda al asistente a entender el escenario.',
    security: 'Crea instrucciones de seguridad robustas: prevención de prompt injection, protección de datos sensibles, límites de comportamiento.',
    task: 'Describe la tarea de forma clara, específica y accionable. Incluye objetivos y entregables esperados.',
    guidelines: 'Lista reglas, restricciones y mejores prácticas que el asistente debe seguir.',
    examples: 'Proporciona 2-3 ejemplos de entrada/salida que demuestren el comportamiento esperado.',
    language: 'Define el idioma, tono y estilo de comunicación apropiado.',
    responseFormat: 'Especifica el formato de respuesta esperado (Markdown, JSON, lista, etc.).',
  };

  return `Contexto general del prompt: ${fullContext}

Input del usuario para la sección "${section}": ${userInput}

Instrucciones: ${sectionInstructions[section as keyof typeof sectionInstructions]}

Genera contenido profesional y específico para esta sección. Responde SOLO con el contenido, sin explicaciones adicionales.`;
};
```

### Fase 3: API Endpoint - Generación Completa

**Archivo:** `src/app/api/ai/generate-prompt/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic, MODEL } from '@/lib/ai/anthropic';
import { PromptInputSchema } from '@/lib/ai/schemas';
import { PROMPT_GENERATOR_SYSTEM, generateSectionPrompt } from '@/lib/ai/prompts/system-prompts';
import { getCurrentUserId } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = PromptInputSchema.parse(body);

    // Generar nombre automáticamente
    const nameResult = await generateText({
      model: anthropic(MODEL),
      system: 'Genera un nombre corto y descriptivo para este prompt.',
      prompt: `Basado en esta descripción, genera un nombre: ${input.description}`,
      maxTokens: 50,
    });

    // Generar cada sección en paralelo
    const [role, context, security, task, responseFormat] = await Promise.all([
      generateSection('role', input.roleInput || input.description, input.description),
      generateSection('context', input.contextInput || input.description, input.description),
      generateSection('security', input.securityInput || 'Seguridad estándar', input.description),
      generateSection('task', input.taskInput || input.description, input.description),
      generateSection('responseFormat', 'Formato de respuesta apropiado', input.description),
    ]);

    // Generar secciones opcionales
    const guidelines = input.guidelinesInput
      ? await generateSection('guidelines', input.guidelinesInput, input.description)
      : undefined;

    const examples = input.examplesInput
      ? await generateSection('examples', input.examplesInput, input.description)
      : undefined;

    const language = input.languageInput
      ? await generateSection('language', input.languageInput, input.description)
      : undefined;

    return NextResponse.json({
      name: nameResult.text.trim(),
      role: role.trim(),
      context: context.trim(),
      security: security.trim(),
      task: task.trim(),
      guidelines: guidelines?.trim(),
      examples: examples?.trim(),
      language: language?.trim(),
      responseFormat: responseFormat.trim(),
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

async function generateSection(
  section: string,
  userInput: string,
  fullContext: string
): Promise<string> {
  const result = await generateText({
    model: anthropic(MODEL),
    system: PROMPT_GENERATOR_SYSTEM,
    prompt: generateSectionPrompt(section, userInput, fullContext),
    maxTokens: 500,
  });

  return result.text;
}
```

### Fase 4: Componente Principal - AI Prompt Builder

**Archivo:** `src/components/prompts/AIPromptBuilder.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Warning, CheckCircle, Eye } from '@phosphor-icons/react/dist/ssr';

type FormState = {
  description: string;
  roleInput: string;
  contextInput: string;
  securityInput: string;
  taskInput: string;
  guidelinesInput: string;
  examplesInput: string;
  languageInput: string;
  enableGuidelines: boolean;
  enableExamples: boolean;
  enableLanguage: boolean;
};

type GeneratedPrompt = {
  name: string;
  role: string;
  context: string;
  security: string;
  task: string;
  guidelines?: string;
  examples?: string;
  language?: string;
  responseFormat: string;
};

export default function AIPromptBuilder() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    description: '',
    roleInput: '',
    contextInput: '',
    securityInput: '',
    taskInput: '',
    guidelinesInput: '',
    examplesInput: '',
    languageInput: '',
    enableGuidelines: false,
    enableExamples: false,
    enableLanguage: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!formState.description.trim()) {
      setError('La descripción general es obligatoria');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formState.description,
          roleInput: formState.roleInput || undefined,
          contextInput: formState.contextInput || undefined,
          securityInput: formState.securityInput || undefined,
          taskInput: formState.taskInput || undefined,
          guidelinesInput: formState.enableGuidelines ? formState.guidelinesInput : undefined,
          examplesInput: formState.enableExamples ? formState.examplesInput : undefined,
          languageInput: formState.enableLanguage ? formState.languageInput : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const generated = await response.json();
      setGeneratedPrompt(generated);
      setShowPreview(true);
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError('Error al generar el prompt. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt) return;

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedPrompt.name,
          role: generatedPrompt.role,
          context: generatedPrompt.context,
          security: generatedPrompt.security,
          task: generatedPrompt.task,
          guidelines: generatedPrompt.guidelines,
          examples: generatedPrompt.examples,
          language: generatedPrompt.language,
          language_enabled: !!generatedPrompt.language,
          response_format: generatedPrompt.responseFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }

      router.push('/prompts');
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Error al guardar el prompt');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles size={32} weight="fill" className="text-purple-500" />
          Crear Prompt con IA
        </h1>
        <p className="text-muted-foreground">
          Describe tu necesidad y la IA generará un prompt profesional estructurado
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-destructive mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descripción General */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción General *</CardTitle>
          <CardDescription>
            Describe brevemente qué quieres que haga tu prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ej: Necesito un asistente que me ayude a escribir código Python limpio y eficiente..."
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            rows={4}
            disabled={isGenerating}
          />
        </CardContent>
      </Card>

      {/* Inputs opcionales para cada sección */}
      <Card>
        <CardHeader>
          <CardTitle>Personalización (Opcional)</CardTitle>
          <CardDescription>
            Proporciona detalles específicos para cada sección o deja que la IA lo genere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Role - Rol del Asistente</Label>
            <Textarea
              placeholder="Describe el rol específico que quieres..."
              value={formState.roleInput}
              onChange={(e) => setFormState({ ...formState, roleInput: e.target.value })}
              rows={2}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label>Context - Contexto de la Tarea</Label>
            <Textarea
              placeholder="Proporciona contexto adicional..."
              value={formState.contextInput}
              onChange={(e) => setFormState({ ...formState, contextInput: e.target.value })}
              rows={2}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label>Security - Requisitos de Seguridad</Label>
            <Textarea
              placeholder="Instrucciones de seguridad específicas..."
              value={formState.securityInput}
              onChange={(e) => setFormState({ ...formState, securityInput: e.target.value })}
              rows={2}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label>Task - Descripción de la Tarea</Label>
            <Textarea
              placeholder="Detalles específicos de la tarea..."
              value={formState.taskInput}
              onChange={(e) => setFormState({ ...formState, taskInput: e.target.value })}
              rows={2}
              disabled={isGenerating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Secciones opcionales con toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones Avanzadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Agregar Guidelines</Label>
            <Switch
              checked={formState.enableGuidelines}
              onCheckedChange={(checked) => setFormState({ ...formState, enableGuidelines: checked })}
            />
          </div>
          {formState.enableGuidelines && (
            <Textarea
              placeholder="Reglas y mejores prácticas..."
              value={formState.guidelinesInput}
              onChange={(e) => setFormState({ ...formState, guidelinesInput: e.target.value })}
              rows={3}
              disabled={isGenerating}
            />
          )}

          <div className="flex items-center justify-between">
            <Label>Agregar Examples</Label>
            <Switch
              checked={formState.enableExamples}
              onCheckedChange={(checked) => setFormState({ ...formState, enableExamples: checked })}
            />
          </div>
          {formState.enableExamples && (
            <Textarea
              placeholder="Ejemplos de entrada/salida..."
              value={formState.examplesInput}
              onChange={(e) => setFormState({ ...formState, examplesInput: e.target.value })}
              rows={4}
              disabled={isGenerating}
            />
          )}

          <div className="flex items-center justify-between">
            <Label>Configurar Idioma/Tono</Label>
            <Switch
              checked={formState.enableLanguage}
              onCheckedChange={(checked) => setFormState({ ...formState, enableLanguage: checked })}
            />
          </div>
          {formState.enableLanguage && (
            <Textarea
              placeholder="Idioma y tono de respuesta..."
              value={formState.languageInput}
              onChange={(e) => setFormState({ ...formState, languageInput: e.target.value })}
              rows={2}
              disabled={isGenerating}
            />
          )}
        </CardContent>
      </Card>

      {/* Botón de generación */}
      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          size="lg"
          disabled={isGenerating || !formState.description.trim()}
        >
          <Sparkles size={20} className="mr-2" />
          {isGenerating ? 'Generando...' : 'Generar Prompt con IA'}
        </Button>
      </div>

      {/* Vista previa del prompt generado */}
      {generatedPrompt && showPreview && (
        <Card className="border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
              Prompt Generado: {generatedPrompt.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Role</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPrompt.role}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Context</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPrompt.context}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Security</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPrompt.security}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Task</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPrompt.task}
                </p>
              </div>

              {generatedPrompt.guidelines && (
                <div>
                  <Label className="text-sm font-semibold">Guidelines</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedPrompt.guidelines}
                  </p>
                </div>
              )}

              {generatedPrompt.examples && (
                <div>
                  <Label className="text-sm font-semibold">Examples</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedPrompt.examples}
                  </p>
                </div>
              )}

              {generatedPrompt.language && (
                <div>
                  <Label className="text-sm font-semibold">Language</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedPrompt.language}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Response Format</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPrompt.responseFormat}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} size="lg">
                Guardar Prompt
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                size="lg"
              >
                Generar Nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Fase 5: Ruta de Nueva Página

**Actualizar:** `src/app/(dashboard)/prompts/new/page.tsx`

Agregar opción para elegir entre creación manual o con IA:
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, PencilSimple } from '@phosphor-icons/react/dist/ssr';
import AIPromptBuilder from '@/components/prompts/AIPromptBuilder';
import ManualPromptBuilder from '@/components/prompts/ManualPromptBuilder'; // Componente existente refactorizado

export default function NewPromptPage() {
  const [mode, setMode] = useState<'select' | 'ai' | 'manual'>('select');

  if (mode === 'ai') {
    return <AIPromptBuilder />;
  }

  if (mode === 'manual') {
    return <ManualPromptBuilder />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Prompt</h1>
        <p className="text-muted-foreground">
          Elige cómo quieres crear tu prompt
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => setMode('ai')}
        >
          <CardHeader>
            <Sparkles size={48} weight="fill" className="text-purple-500 mb-4" />
            <CardTitle>Crear con IA</CardTitle>
            <CardDescription>
              La IA te ayudará a generar un prompt profesional basado en tu descripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setMode('ai')}>
              <Sparkles size={20} className="mr-2" />
              Usar IA
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => setMode('manual')}
        >
          <CardHeader>
            <PencilSimple size={48} weight="fill" className="text-blue-500 mb-4" />
            <CardTitle>Crear Manualmente</CardTitle>
            <CardDescription>
              Completa cada campo del prompt manualmente con control total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setMode('manual')}>
              <PencilSimple size={20} className="mr-2" />
              Crear Manual
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🎯 Plan de Implementación por Fases

### **Fase 1: Setup Básico** (30 min)
- [ ] Instalar dependencias (`ai`, `@ai-sdk/anthropic`, `zod`)
- [ ] Agregar `ANTHROPIC_API_KEY` al `.env`
- [ ] Crear estructura de carpetas
- [ ] Crear cliente Anthropic y configuración

### **Fase 2: Backend - API** (1 hora)
- [ ] Crear schemas de validación
- [ ] Crear system prompts
- [ ] Implementar endpoint `/api/ai/generate-prompt`
- [ ] Probar generación con Postman/Thunder Client

### **Fase 3: Frontend - Componentes** (2 horas)
- [ ] Refactorizar componente manual existente a `ManualPromptBuilder`
- [ ] Crear componente `AIPromptBuilder`
- [ ] Implementar inputs con estados
- [ ] Agregar estados de carga y error
- [ ] Implementar vista previa del prompt generado

### **Fase 4: Integración** (1 hora)
- [ ] Modificar página `/prompts/new` para ofrecer ambas opciones
- [ ] Conectar generación con guardado
- [ ] Testing end-to-end

### **Fase 5: Refinamiento** (Opcional)
- [ ] Agregar endpoint para refinar secciones individuales
- [ ] Agregar edición manual post-generación
- [ ] Mejorar UX con animaciones y transiciones
- [ ] Implementar `ai-sdk/elements` para inputs mejorados

---

## 📊 Costos Estimados

**Claude Haiku 3.5:**
- Input: $0.25 / 1M tokens
- Output: $1.25 / 1M tokens

**Generación promedio:**
- ~2,000 tokens de salida por prompt completo
- Costo: ~$0.0025 por generación
- 100 generaciones: ~$0.25

---

## ✅ Checklist Pre-Implementación

- [ ] Cuenta de Anthropic con API key
- [ ] API key agregada a `.env`
- [ ] Dependencias instaladas
- [ ] Estructura de proyecto clara
- [ ] Plan de testing definido

---

## 🔒 Consideraciones de Seguridad

1. **API Key**: Nunca exponer en el cliente, solo en server-side
2. **Rate Limiting**: Implementar límites de requests por usuario
3. **Validación**: Validar todos los inputs con Zod antes de enviar a la IA
4. **Costos**: Monitorear uso de API para prevenir abusos
5. **Error Handling**: Manejar errores de API gracefully

---

## 📚 Referencias

- [AI SDK Documentation](https://ai-sdk.dev/docs)
- [AI SDK Elements](https://ai-sdk.dev/elements)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude Haiku Pricing](https://www.anthropic.com/pricing)
- [Zod Documentation](https://zod.dev/)

---

## 🚀 Próximos Pasos

Después de completar la implementación básica, considerar:
- Agregar streaming para ver la generación en tiempo real
- Implementar historial de generaciones
- Agregar sistema de templates pre-configurados
- Crear marketplace de prompts generados por la comunidad
- Integrar feedback loop para mejorar la calidad de generación
