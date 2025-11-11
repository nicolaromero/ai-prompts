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
  });

  return result.text;
}
