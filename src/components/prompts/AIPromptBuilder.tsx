'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkle, Warning, CheckCircle } from '@phosphor-icons/react/dist/ssr';

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
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);
    setError(null);

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkle size={32} weight="fill" className="text-purple-500" />
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
          <Sparkle size={20} className="mr-2" />
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
              <Button onClick={handleSave} size="lg" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Prompt'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedPrompt(null);
                }}
                size="lg"
                disabled={isSaving}
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
