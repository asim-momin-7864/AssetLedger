//* App Error

export class AppError extends Error {
  // public
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  // constructour
  constructor(message: string, statusCode: number) {
    super(message);

    // code 4XX - failures
    //code 5XX - server error
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // predicted does it is unknown crash - out of our consideration
    // beacuse all our predicated errors uses AppError class that have this field "true"
    // if it is unknown that means not using AppError class, it if from built-in Error class and obiously that dont have this property
    // so we can identify
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
