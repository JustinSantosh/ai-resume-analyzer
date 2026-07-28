import { AI_MODEL } from "~/constants";
import { ApplicationError, toApplicationError } from "~/lib/errors";

const getPuter = (): typeof window.puter => {
    if (typeof window === "undefined" || !window.puter) {
        throw new ApplicationError(
            "UNKNOWN_ERROR",
            "Puter.js is not available. Refresh the page and try again.",
        );
    }

    return window.puter;
};

const upload = async (files: Array<File | Blob>): Promise<FSItem> => {
    try {
        const result = await getPuter().fs.upload(files);
        if (!result?.path) {
            throw new ApplicationError("UPLOAD_FAILED", "The file upload failed.");
        }
        return result;
    } catch (error) {
        throw toApplicationError(error, "UPLOAD_FAILED", "The file upload failed.");
    }
};

const feedback = async (path: string, prompt: string): Promise<AIResponse> => {
    try {
        const response = await getPuter().ai.chat(
            [
                {
                    role: "user",
                    content: [
                        { type: "file", puter_path: path },
                        { type: "text", text: prompt },
                    ],
                },
            ],
            { model: AI_MODEL },
        );
        return response as AIResponse;
    } catch (error) {
        throw toApplicationError(
            error,
            "AI_TIMEOUT",
            "The AI analysis did not complete.",
        );
    }
};

export const puterService = {
    auth: {
        getCurrentUser: () => getPuter().auth.getUser(),
        isAuthenticated: () => getPuter().auth.isSignedIn(),
        login: () => getPuter().auth.signIn(),
        logout: () => getPuter().auth.signOut(),
    },
    files: {
        upload,
        read: (path: string) => getPuter().fs.read(path),
        delete: (path: string) => getPuter().fs.delete(path),
    },
    ai: {
        feedback,
    },
    kv: {
        get: (key: string) => getPuter().kv.get(key),
        set: (key: string, value: string) => getPuter().kv.set(key, value),
        delete: (key: string) => getPuter().kv.del(key),
    },
};
