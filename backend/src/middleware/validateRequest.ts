import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain, ContextRunner } from 'express-validator';
import { ValidationError } from '../utils/errors';

// Type that accepts both ValidationChain and oneOf/anyOf results
type ValidationMiddleware = ValidationChain | ContextRunner;

/**
 * Middleware to run express-validator validations and handle errors
 */
export function validateRequest(validations: ValidationMiddleware[]): RequestHandler[] {
    return [
        // Run all validations
        ...(validations as unknown as RequestHandler[]),
        // Check for errors
        (req: Request, _res: Response, next: NextFunction): void => {
            const errors = validationResult(req);

            if (errors.isEmpty()) {
                return next();
            }

            // Transform errors into a structured format
            const formattedErrors: Record<string, string[]> = {};

            for (const error of errors.array()) {
                const field = 'path' in error ? error.path : 'unknown';
                if (!formattedErrors[field]) {
                    formattedErrors[field] = [];
                }
                formattedErrors[field].push(error.msg);
            }

            next(new ValidationError(formattedErrors));
        },
    ];
}

export default validateRequest;

