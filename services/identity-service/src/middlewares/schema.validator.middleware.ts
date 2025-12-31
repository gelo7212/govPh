import { ValidationError } from "../errors";

// JOI validation middleware
export const valiateSchema = (schema: any) => {
    return (req: any, res: any, next: any) => {
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                next(new ValidationError(`Schema validation error: ${error.message}`));
                return;
            }
        } catch (error) {
            next(error);
            return;
        }
        next();
        return;
    }
};