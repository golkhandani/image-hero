export interface IHttpError {
  status: number;
  message: string;
}
export class HttpError extends Error {
  public status: number;
  public message: string;
  constructor({status, message}:IHttpError){
      super()
      this.message = message;
      this.status = status;
  }
}