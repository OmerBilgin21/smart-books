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
