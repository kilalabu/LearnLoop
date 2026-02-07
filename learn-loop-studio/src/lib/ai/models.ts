import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

/** サポートするモデル定義 */
export const MODEL_OPTIONS = {
  'gemini-2.0-flash': { label: 'Gemini 2.0 Flash', create: () => google('gemini-2.0-flash') },
  'gpt-4o-mini': { label: 'GPT-4o mini', create: () => openai('gpt-4o-mini') },
  'gpt-4o': { label: 'GPT-4o', create: () => openai('gpt-4o') },
  'claude-sonnet-4-5': { label: 'Claude Sonnet 4.5', create: () => anthropic('claude-sonnet-4-5-20250929') },
} as const;

export type ModelId = keyof typeof MODEL_OPTIONS;
export const DEFAULT_MODEL: ModelId = 'gemini-2.0-flash';

export function getModel(modelId?: string): LanguageModel {
  const id = (modelId && modelId in MODEL_OPTIONS) ? modelId as ModelId : DEFAULT_MODEL;
  return MODEL_OPTIONS[id].create();
}
