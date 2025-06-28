import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { gracefullyStringfy } from '../../utils/general.js';

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
  return axiosInstance;
};
