import { MAX_RETRIES } from "~/constants";

export const withRetry = async <T>(
    operation: () => Promise<T>,
    attempts = MAX_RETRIES,
): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt < attempts - 1) {
                await new Promise((resolve) =>
                    window.setTimeout(resolve, 300 * 2 ** attempt),
                );
            }
        }
    }

    throw lastError;
};

