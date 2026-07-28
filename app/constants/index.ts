export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const PDF_MIME_TYPE = "application/pdf";
export const AI_MODEL = "claude-sonnet-4-6";
export const MAX_RETRIES = 3;

export const storageKeys = {
    resume: (resumeId: string) => `resume:${resumeId}`,
    analysis: (analysisId: string) => `analysis:${analysisId}`,
    history: (userId: string) => `history:${userId}`,
} as const;
