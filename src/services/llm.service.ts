import { AxiosInstance } from 'axios';
import {
  BookRecommendationResponse,
  LLMChatRoles,
  LLMModel,
  LLMModelsResponse,
  StructuredResponse,
  StructuredResponseRequest,
} from '../schemas/llm';
import { isEmpty, isNotEmpty, isNotNullish, isNullish } from '../utils/general';
import { getApi } from '../infrastructure/api/api.base';
import envs from '../infrastructure/envs';
import { logger } from '../utils/logger';

export class LLMService {
  private readonly basePath = envs.LLM_URL;
  private readonly maxRetries = 5;
  private readonly chatEndpoint = '/chat';
  private readonly modelsEndpoint = '/tags';
  private readonly modelChoice = 'llama3.2:latest';
  private readonly basePrompt =
    'User wants to find some new books to read. \
    You will assist them with this. \
    You may or may not be given some categories or books to base your suggestions off of.\
    Always recommend only real, existing books from your knowledge-base.';

  private suggestedDerivedSystemPrompt(suggestedBooks: string[]): string {
    return `The following list of books were gathered as possible matches for user; ${suggestedBooks.join(', ')} \
          If asked, you can use these books as a base to generate your own suggestions.`;
  }

  private favoriteCategorySystemPrompt(favoriteCategories: string[]): string {
    return `The following list of categories were given by user as their favorite book categories; ${favoriteCategories.join(', ')} \
          If asked, you use these categories as a base to generate your own book suggestions.`;
  }

  private client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    if (client) {
      this.client = client;
    }

    if (!this.basePath) {
      throw new Error('Base URL for LLM API not found!');
    }

    this.client = getApi({ baseURL: this.basePath, timeout: 60000 });
  }

  private async composeStructuredRequestPayload(
    systemPrompt?: string,
    negatives?: string[],
  ): Promise<StructuredResponseRequest> {
    const modelErr = 'Error while finding models';
    const modelsResponse = await this.getModels().catch((err): null => {
      logger(modelErr, err);
      return null;
    });

    if (isNullish(modelsResponse) || isEmpty(modelsResponse?.models?.length)) {
      throw new Error(modelErr);
    }

    const model =
      modelsResponse.models.find((model): LLMModel | undefined => {
        if (model.name === this.modelChoice) {
          return model;
        }
        return undefined;
      }) ?? modelsResponse.models[0];

    const payload = {
      model: model.name,
      messages: [
        {
          role: LLMChatRoles.SYSTEM,
          content: this.basePrompt,
        },
        {
          role: LLMChatRoles.USER,
          content: 'Please give me 5 books to read.',
        },
      ],
      stream: false,
      format: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
              required: ['name', 'description'],
            },
          },
        },
        required: ['recommendations'],
      },
      options: {
        temperature: 0,
      },
    };

    if (isNotNullish(systemPrompt)) {
      payload.messages.splice(1, 0, {
        role: LLMChatRoles.SYSTEM,
        content: systemPrompt,
      });
    }

    if (isNotNullish(negatives)) {
      payload.messages.splice(payload.messages.length - 2, 0, {
        role: LLMChatRoles.SYSTEM,
        content: `You are given the following: ${negatives.join(', ')} \
                    as either disliked books or disliked categories. Avoid these as much as possible.`,
      });
    }

    return payload;
  }

  private async getModels(): Promise<LLMModelsResponse> {
    return (await this.client.get<LLMModelsResponse>(this.modelsEndpoint)).data;
  }

  private async structuredChat(
    prompt: StructuredResponseRequest,
    retryCount = 0,
  ): Promise<BookRecommendationResponse> {
    try {
      const res = await this.client.post<StructuredResponse>(
        this.chatEndpoint,
        prompt,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const parsed = JSON.parse(res.data.message.content);

      return parsed;
    } catch (err) {
      if (err instanceof SyntaxError && retryCount < this.maxRetries) {
        logger('Retrying. Parse failed...', err);
        const newPrompt: StructuredResponseRequest = {
          ...prompt,
          messages: [
            ...prompt.messages,
            {
              role: LLMChatRoles.SYSTEM,
              content:
                'Your response must be valid JSON matching the expected schema. Retry.',
            },
          ],
        };
        return this.structuredChat(newPrompt, retryCount + 1);
      }
      logger('Error while generating a structured response', err);
      throw err;
    }
  }

  async getSuggestionDerivedSuggestions(
    suggestions: string[],
    dislikes: string[],
  ): Promise<BookRecommendationResponse> {
    try {
      const systemPrompt = this.suggestedDerivedSystemPrompt(suggestions);
      const structuredChatPayload = await this.composeStructuredRequestPayload(
        systemPrompt,
        isNotEmpty(dislikes) ? dislikes : undefined,
      );
      const llmSuggestions = await this.structuredChat(structuredChatPayload);
      return llmSuggestions;
    } catch (error) {
      logger(
        'Error while getting suggestions from the LLM via suggested books',
        error,
      );
      return { recommendations: [] };
    }
  }

  async getFavoriteCategoryDerivedSuggestions(
    categories: string[],
    dislikes: string[],
  ): Promise<BookRecommendationResponse> {
    try {
      const systemPrompt = this.favoriteCategorySystemPrompt(categories);
      const structuredChatPayload = await this.composeStructuredRequestPayload(
        systemPrompt,
        isNotEmpty(dislikes) ? dislikes : undefined,
      );
      const llmSuggestions = await this.structuredChat(structuredChatPayload);
      return llmSuggestions;
    } catch (error) {
      logger(
        'Error while getting suggestions from the LLM via favorite categories',
        error,
      );
      return { recommendations: [] };
    }
  }

  async getGenericSuggestions(
    dislikes: string[],
  ): Promise<BookRecommendationResponse> {
    try {
      const structuredChatPayload = await this.composeStructuredRequestPayload(
        undefined,
        isNotEmpty(dislikes) ? dislikes : undefined,
      );
      const llmSuggestions = await this.structuredChat(structuredChatPayload);
      return llmSuggestions;
    } catch (error) {
      logger('Error while getting suggestions from the LLM ', error);
      return { recommendations: [] };
    }
  }
}
