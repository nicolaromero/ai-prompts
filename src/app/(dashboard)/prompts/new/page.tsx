'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkle, PencilSimple } from '@phosphor-icons/react/dist/ssr';
import AIPromptBuilder from '@/components/prompts/AIPromptBuilder';
import ManualPromptBuilder from '@/components/prompts/ManualPromptBuilder';

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
            <Sparkle size={48} weight="fill" className="text-purple-500 mb-4" />
            <CardTitle>Crear con IA</CardTitle>
            <CardDescription>
              La IA te ayudará a generar un prompt profesional basado en tu descripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setMode('ai')}>
              <Sparkle size={20} className="mr-2" />
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
