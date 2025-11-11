"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkle,
  Trash,
  PencilSimple,
  Copy,
  MagnifyingGlass,
  FileText
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

// Mock data for demonstration
const mockPrompts = [
  {
    id: "1",
    name: "Asistente de Código Python",
    role: "Experto desarrollador Python",
    created_at: "2025-11-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Revisor de Documentación",
    role: "Technical writer especializado",
    created_at: "2025-11-09T15:30:00Z",
  },
];

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts] = useState(mockPrompts);

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
            />
          </div>
        </CardContent>
      </Card>

      {filteredPrompts.length === 0 ? (
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
                  onClick={() => {
                    // TODO: Copy XML to clipboard
                    console.log("Copy prompt:", prompt.id);
                  }}
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Delete prompt
                    console.log("Delete prompt:", prompt.id);
                  }}
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
