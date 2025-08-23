import { AxiosInstance } from 'axios';
import {
  BookRecommendationResponse,
  LLMModel,
  LLMModelsResponse,
  StructuredResponse,
  StructuredResponseRequest,
} from '../schemas/llm';
import { gracefullyStringfy } from '../utils/general';
import { getApi } from '../infrastructure/api/api.base';
import envs from '../infrastructure/envs';
import { logger } from '../utils/logger';

export class LLMService {
  private readonly basePath = envs.LLM_URL;
  private readonly chatEndpoint = '/chat';
  private readonly modelsEndpoint = '/tags';
  private readonly modelChoice = 'llama3.2:latest';
  private readonly basePrompt =
    'User wants to find some new books to read. \
    You will assist them with this. \
    You will be given some categories or books to base your suggestions off of.\
    Always recommend only real, existing books from your knowledge-base.';
  private readonly maxRetry = 5;
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

  async composeSuggestionStructuredResponseRequest(
    suggestionList: { id: string; name: string }[],
  ): Promise<StructuredResponseRequest> {
    const modelErr = 'Error while finding models';
    const modelsResponse = await this.getModels().catch((err): void => {
      throw new Error(`${modelErr}: ${err}`);
    });

    if (!modelsResponse || !modelsResponse?.models?.length) {
      throw new Error(modelErr);
    }

    const model =
      modelsResponse.models.find((model): LLMModel | undefined => {
        if (model.name === this.modelChoice) {
          return model;
        }
        return undefined;
      }) ?? modelsResponse.models[0];

    return {
      model: model.name,
      messages: [
        {
          role: 'system',
          content: this.basePrompt,
        },
        {
          role: 'system',
          content: `The following list of books were gathered as possible matches for user (in stringified JSON structure): \
          ${gracefullyStringfy(suggestionList)}. If asked, you can use these books as a base to generate your own suggestions.`,
        },
        {
          role: 'user',
          content: 'Please give me 5 books to read.',
        },
      ],
      stream: false,
      format: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
            },
            required: ['id', 'name', 'description'],
          },
        },
        required: ['recommendations'],
      },
      options: {
        temperature: 0,
      },
    };
  }

  async getModels(): Promise<LLMModelsResponse> {
    return (await this.client.get<LLMModelsResponse>(this.modelsEndpoint)).data;
  }

  async structuredChat(
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

      return JSON.parse(res.data.message.content);
    } catch (err) {
      if (err instanceof SyntaxError && retryCount < this.maxRetry) {
        const newPrompt: StructuredResponseRequest = {
          ...prompt,
          messages: [
            ...prompt.messages,
            {
              role: 'system',
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
}
