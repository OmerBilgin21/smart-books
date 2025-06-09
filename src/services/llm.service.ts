import { LLM_URL } from '../infrastructure/envs.js';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  BookRecommendationResponse,
  LLMModel,
  LLMModelsResponse,
  StructuredResponse,
  StructuredResponseRequest,
  StructuredResponseRequestFormat,
} from '../schemas/llm';
import { gracefullyStringfy } from '../utils/general.js';

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

    const axiosInstance = axios.create({
      baseURL: this.basePath,
      timeout: 60000,
    });

    axiosInstance.interceptors.request.use(
      (config): InternalAxiosRequestConfig => {
        console.info(`
METHOD: ${config.method}
BASE PATH: ${config.baseURL}
URL: ${config.url}
BODY: ${gracefullyStringfy(config.data)}
QUERY PARAMS: ${config.params}
`);

        return config;
      },
    );

    this.client = axiosInstance;
  }

  async composeSuggestionStructuredResponseRequest(
    suggestionList: string[],
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
          content: `You are a helpful book assistant. User wants to find some new books to read. According to their read list, likes and dislikes, we have gathered some possible matches: ${suggestionList.join(', ')}. Sort these books by popularity DESC. If: * you think you have a better match for the user than most popular 5 books in the list by evaluating the list, * there are not enough (less than 5) suggestions found by us, * one of the suggestions could be considered redundant or duplicate, * a number of suggested books are completely irrelevant to the others, come up with your own (real, existing) book suggestions by checking your knowledge-base and put them in the appropriate location at the popularity sorted list. If a name is incomplete or you can enrich it to a more acceptable state, do so. Return a JSON object array of 5 length with name and description fields description field must contains a brief summary of the book topic/description.`,
        },
      ],
      stream: false,
      format: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
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
