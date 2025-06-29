import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { UpdateOptions } from "react-toastify/unstyled";

const API_URL = import.meta.env.VITE_API_URL;

export const gracefullyStringify = (input: unknown): string => {
  try {
    return JSON.stringify(input);
  } catch {
    return "[Unserializable]";
  }
};

const createApi = (basePath: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_URL}/${basePath}`,
    timeout: 5000,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    console.info(`
[API Request]
METHOD: ${config.method}
URL: ${config.baseURL}${config.url}
BODY: ${gracefullyStringify(config.data)}
QUERY: ${gracefullyStringify(config.params)}
`);
    return config;
  });

  return instance;
};

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    const ourServerError = (err.response?.data as { error?: string })?.error;
    const msg = `${Boolean(ourServerError) ? ourServerError : `Error during request: ${err.message}`}`;
    throw new Error(msg);
  }

  throw new Error(gracefullyStringify(error));
};
export const useApi = () => {
  async function request<T = unknown>(
    api: AxiosInstance,
    config: AxiosRequestConfig,
  ): Promise<T | undefined> {
    try {
      const response = await api.request<T>({
        ...config,
        url: config?.url ?? "",
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async function requestWithToast<T>(
    api: AxiosInstance,
    config: AxiosRequestConfig,
    messages: {
      pending: string;
      success: string;
      error?: string;
    },
  ): Promise<T> {
    const p = request<T>(api, config).catch((err: unknown) => {
      let msg = "Unknown error";
      if ((err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        msg =
          axiosErr.response?.data?.message ??
          axiosErr.response?.statusText ??
          axiosErr.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      return Promise.reject(msg);
    }) as Promise<T>;

    await toast.promise<T>(p, {
      pending: messages.pending,
      success: messages.success,
      error: {
        render({ data }): string {
          return messages?.error ?? String(data);
        },
      } as UpdateOptions<unknown>,
    });

    return p;
  }
