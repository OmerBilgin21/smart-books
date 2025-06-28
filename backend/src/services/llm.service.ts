import { LLM_URL } from '../infrastructure/envs';
import { AxiosInstance } from 'axios';
import {
  BookRecommendationResponse,
  LLMModel,
  LLMModelsResponse,
  StructuredResponse,
  StructuredResponseRequest,
  StructuredResponseRequestFormat,
} from '../schemas/llm';
import { gracefullyStringfy } from '../utils/general';
import { getApi } from '../infrastructure/api/api.base';

export class LLMService {
  private readonly basePath = LLM_URL;
  private readonly chatEndpoint = '/chat';
  private readonly modelsEndpoint = '/tags';
  private readonly modelChoice = 'dolphin-llama3:latest';
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
      }) || modelsResponse.models[0];

    return {
      model: model.name,
      messages: [
        {
          role: 'user',
          content: `You are a helpful book assistant. User wants to find some new books to read. According to their read list, likes and dislikes, we have gathered some possible matches (in stringified JSON structure): ${gracefullyStringfy(suggestionList)}. Sort these books by popularity DESC. If: * you think you have a better match for the user than most popular 5 books in the list by evaluating the list, * there are not enough (less than 5) suggestions found by us, * one of the suggestions could be considered redundant or duplicate, * a number of suggested books are completely irrelevant to the others, come up with your own (real, existing) book suggestions by checking your knowledge-base and put them in the appropriate location at the popularity sorted list. If a name is incomplete or you can enrich it to a more acceptable state, do so. Return a JSON object array of 5 length with name and description fields description field must contains a brief summary of the book topic/description. Do not touch the ID you receive for each book. Return it as you received it.`,
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
      } as unknown as StructuredResponseRequestFormat,
      options: {
        temperature: 0,
      },
    };
  }

  async getModels(): Promise<LLMModelsResponse> {
    const res = await this.client.get<LLMModelsResponse>(this.modelsEndpoint);
    return res.data;
  }

  async structuredChat(
    prompt: StructuredResponseRequest,
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
      throw new Error(`Error while generating a structured response: ${err}`);
    }
  }
}
