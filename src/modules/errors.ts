type ErrorData = {
    [key: string]: string;
};

export abstract class HttpError extends Error {
    status?: number;
    data?: ErrorData;
}

export class BadRequest extends HttpError {
    constructor(message: string, data?: ErrorData) {
        super(message);

        this.status = 400;
        this.data = data;
    }
}

export class Unauthorized extends HttpError {
    constructor(message: string, data?: ErrorData) {
        super(message);

        this.status = 401;
        this.data = data;
    }
}

export class Forbidden extends HttpError {
    constructor(message: string, data?: ErrorData) {
        super(message);

        this.status = 403;
        this.data = data;
    }
}

export class TooManyRequests extends HttpError {
    constructor(message: string, data?: ErrorData) {
        super(message);

        this.status = 429;
        this.data = data;
    }
}
