import { createAnthropic } from '@ai-sdk/anthropic';

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo a usar - Claude 3.5 Haiku
export const MODEL = 'claude-3-5-haiku-20241022';
