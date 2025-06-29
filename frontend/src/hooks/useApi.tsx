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
