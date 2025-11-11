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
