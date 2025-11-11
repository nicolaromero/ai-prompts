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
  const sectionInstructions: Record<string, string> = {
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

Instrucciones: ${sectionInstructions[section]}

Genera contenido profesional y específico para esta sección. Responde SOLO con el contenido, sin explicaciones adicionales.`;
};
