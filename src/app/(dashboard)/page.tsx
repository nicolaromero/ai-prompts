import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkle, BookBookmark, Lightning } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenido a AI Prompts</h1>
        <p className="text-muted-foreground">
          La mejor plataforma para crear y gestionar prompts profesionales
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Prompts
            </CardTitle>
            <BookBookmark size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Tus prompts guardados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Creados este mes
            </CardTitle>
            <Sparkle size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nuevos prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mejores Prácticas
            </CardTitle>
            <Lightning size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Basado en Claude & OpenAI
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comienza a crear prompts profesionales</CardTitle>
          <CardDescription>
            Nuestra plataforma te guía para crear prompts siguiendo las mejores prácticas
            de Claude y OpenAI. Cada prompt incluye campos estructurados que aseguran
            calidad y efectividad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkle size={18} weight="fill" />
                Estructura Profesional
              </h3>
              <p className="text-sm text-muted-foreground">
                Campos obligatorios: Role, Context, Security, Task y Response Format.
                Campos opcionales: Guidelines, Examples y Language.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightning size={18} weight="fill" />
                Mejores Prácticas
              </h3>
              <p className="text-sm text-muted-foreground">
                Basado en las guías oficiales de Claude y OpenAI. Exporta tus prompts
                en formato XML optimizado.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/prompts/new">
                <Sparkle size={18} className="mr-2" />
                Crear Nuevo Prompt
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/prompts">
                <BookBookmark size={18} className="mr-2" />
                Ver Mis Prompts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
