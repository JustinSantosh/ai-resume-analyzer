export type ApplicationErrorCode =
    | "AUTH_REQUIRED"
    | "UPLOAD_FAILED"
    | "INVALID_FILE"
    | "INVALID_ANALYSIS"
    | "PDF_PARSE_FAILED"
    | "AI_TIMEOUT"
    | "KV_WRITE_FAILED"
    | "NOT_FOUND"
    | "UNKNOWN_ERROR";

export class ApplicationError extends Error {
    constructor(
        public readonly code: ApplicationErrorCode,
        message: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = "ApplicationError";
    }
}

export const toApplicationError = (
    error: unknown,
    code: ApplicationErrorCode,
    fallbackMessage: string,
): ApplicationError => {
    if (error instanceof ApplicationError) {
        return error;
    }

    return new ApplicationError(
        code,
        error instanceof Error ? error.message : fallbackMessage,
        error,
    );
};

