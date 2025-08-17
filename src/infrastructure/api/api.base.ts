import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { gracefullyStringfy } from '../../utils/general';
import { logger } from '../../utils/logger';

export const getApi = ({
  baseURL,
  timeout,
}: {
  baseURL: string;
  timeout: number;
}): AxiosInstance => {
  const axiosInstance = axios.create({
    timeout,
    baseURL,
    headers: {
      Accept: ['application/json', 'text/plain', 'image/*', '*/*'],
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  axiosInstance.interceptors.request.use(
    (config): InternalAxiosRequestConfig => {
      logger('Outgoing request:', {
        METHOD: config.method,
        BASE_PATH: config.baseURL,
        URL: config.url,
        BODY: gracefullyStringfy(config.data),
        QUERY_PARAMS: config.params,
      });

      return config;
    },
  );
  return axiosInstance;
};
