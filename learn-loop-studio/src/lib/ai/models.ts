import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

/** サポートするモデル定義 */
export const MODEL_OPTIONS = {
  'gpt-5-nano': { label: 'GPT-5 nano (Cheapest)', create: () => openai('gpt-5-nano') },
  'gpt-5-mini': { label: 'GPT-5 mini', create: () => openai('gpt-5-mini') },
  'gpt-5.2': { label: 'GPT-5.2 (Latest)', create: () => openai('gpt-5.2') },
  'claude-sonnet-4-5': { label: 'Claude Sonnet 4.5', create: () => anthropic('claude-sonnet-4-5-20250929') },
} as const;

export type ModelId = keyof typeof MODEL_OPTIONS;
export const DEFAULT_MODEL: ModelId = 'gpt-5-nano';

export function getModel(modelId?: string): LanguageModel {
  const id = (modelId && modelId in MODEL_OPTIONS) ? modelId as ModelId : DEFAULT_MODEL;
  return MODEL_OPTIONS[id].create();
}
