// Custom error classes for the application

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        code?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 - Bad Request
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', code?: string) {
        super(message, 400, true, code);
    }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', code?: string) {
        super(message, 401, true, code);
    }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden', code?: string) {
        super(message, 403, true, code);
    }
}

// 404 - Not Found
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', code?: string) {
        super(message, 404, true, code);
    }
}

// 409 - Conflict
export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict', code?: string) {
        super(message, 409, true, code);
    }
}

// 422 - Validation Error
export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]>, message: string = 'Validation failed') {
        super(message, 422, true, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

// 400 - Invalid State Transition
export class InvalidStateTransitionError extends AppError {
    public readonly currentState: string;
    public readonly targetState: string;

    constructor(currentState: string, targetState: string) {
        super(
            `Invalid state transition from ${currentState} to ${targetState}`,
            400,
            true,
            'INVALID_STATE_TRANSITION'
        );
        this.currentState = currentState;
        this.targetState = targetState;
    }
}

// Type guard to check if error is operational
export function isOperationalError(error: Error): error is AppError {
    return error instanceof AppError && error.isOperational;
}
