export interface IApiResponse<T> {
  data?: T;
  messages?: string[];
}
export function apiResponse<T>(api: IApiResponse<T>) {
  return {
      ...(api.data && { data: api.data }),
      meta: {
          ...(api.messages && { messages: api.messages}),
          date: new Date()
      }
  }
}