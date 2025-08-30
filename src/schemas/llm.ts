export type LLMModelDetails = {
  parent_model: string;
  format: string;
  family: string;
  families: Array<string>;
  parameter_size: string;
  quantization_level: string;
};

export type LLMModel = {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: LLMModelDetails;
};

export type LLMModelsResponse = {
  models: Array<LLMModel>;
};

export enum LLMChatRoles {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export type StructuredResponseRequestMessage = {
  role: LLMChatRoles;
  content: string;
};

export type StructuredResponseRequestFormat = {
  type: string;
  properties: Record<string, unknown>;
  required?: Array<string>;
};

export type StructuredResponseRequestOptions = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stop?: Array<string>;
  seed?: number;
  repetition_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  best_of?: number;
  logit_bias?: Record<string, number>;
};

export type StructuredResponseRequest = {
  model: string;
  messages: Array<StructuredResponseRequestMessage>;
  stream?: boolean;
  format: StructuredResponseRequestFormat;
  options?: StructuredResponseRequestOptions;
};

export type StructuredResponseMessage = {
  role: string;
  content: string;
};

export type StructuredResponse = {
  model: string;
  created_at: string;
  message: StructuredResponseMessage;
  done_reason: string;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: 47;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
};

export type BookRecommendationContent = {
  name: string;
  description: string;
};

export type BookRecommendationResponse = {
  recommendations: Array<BookRecommendationContent>;
};
