"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkle,
  Trash,
  PencilSimple,
  Copy,
  MagnifyingGlass,
  FileText,
  Warning,
  CheckCircle
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { generateXML } from "@/lib/xml-generator";

type Prompt = {
  id: string;
  name: string;
  role: string;
  context: string;
  security: string;
  task: string;
  guidelines?: string;
  examples?: string;
  language?: string;
  language_enabled: boolean;
  response_format: string;
  created_at: string;
};

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/prompts');

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este prompt?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      // Remove from local state
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting prompt:', err);
      alert('Error al eliminar el prompt');
    }
  };

  const handleCopyXML = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch prompt');
      }

      const prompt = await response.json();
      const xml = generateXML({
        role: prompt.role,
        context: prompt.context,
        security: prompt.security,
        task: prompt.task,
        guidelines: prompt.guidelines,
        examples: prompt.examples,
        language: prompt.language,
        languageEnabled: prompt.language_enabled,
        responseFormat: prompt.response_format,
      });

      await navigator.clipboard.writeText(xml);
      setCopySuccess(id);

      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error copying XML:', err);
      alert('Error al copiar el XML');
    }
  };

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Prompts</h1>
          <p className="text-muted-foreground">
            Gestiona y organiza todos tus prompts
          </p>
        </div>
        <Button asChild>
          <Link href="/prompts/new">
            <Sparkle size={20} className="mr-2" />
            Crear Nuevo
          </Link>
        </Button>
      </div>

      {copySuccess && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5" weight="fill" />
              <div>
                <p className="font-semibold text-green-600">
                  XML copiado al portapapeles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">
                  Error al cargar prompts
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">Cargando prompts...</p>
          </CardContent>
        </Card>
      ) : filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No se encontraron prompts" : "Aún no tienes prompts"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Intenta con otra búsqueda"
                : "Comienza creando tu primer prompt profesional"}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/prompts/new">
                  <Sparkle size={20} className="mr-2" />
                  Crear Primer Prompt
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Sparkle size={24} weight="fill" className="text-primary shrink-0" />
                </div>
                <CardTitle className="line-clamp-2">{prompt.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {prompt.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Creado el {formatDate(prompt.created_at)}
                </p>
              </CardContent>
              <CardFooter className="gap-2 flex-wrap">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/prompts/${prompt.id}`}>
                    <PencilSimple size={16} className="mr-2" />
                    Editar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyXML(prompt.id)}
                  title="Copiar XML"
                >
                  {copySuccess === prompt.id ? (
                    <CheckCircle size={16} weight="fill" className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(prompt.id)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
