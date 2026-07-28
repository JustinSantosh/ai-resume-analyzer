import { storageKeys } from "~/constants";
import { ApplicationError } from "~/lib/errors";
import { puterService } from "~/lib/services/puter.service";

const parseRecord = <T>(value: string | null, name: string): T | null => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch (error) {
        throw new ApplicationError(
            "UNKNOWN_ERROR",
            `The stored ${name} record is corrupted.`,
            error,
        );
    }
};

export const resumeRepository = {
    async saveResume(resume: Resume): Promise<void> {
        await puterService.kv.set(
            storageKeys.resume(resume.id),
            JSON.stringify(resume),
        );
    },

    async saveAnalysis(analysis: Analysis): Promise<void> {
        await puterService.kv.set(
            storageKeys.analysis(analysis.id),
            JSON.stringify(analysis),
        );
    },

    async getResume(id: string): Promise<Resume | null> {
        const value = await puterService.kv.get(storageKeys.resume(id));
        return parseRecord<Resume>(value, "resume");
    },

    async getAnalysis(id: string): Promise<Analysis | null> {
        const value = await puterService.kv.get(storageKeys.analysis(id));
        return parseRecord<Analysis>(value, "analysis");
    },

    async getHistory(userId: string): Promise<string[]> {
        const value = await puterService.kv.get(storageKeys.history(userId));
        return parseRecord<string[]>(value, "history") ?? [];
    },

    async saveHistory(userId: string, resumeIds: string[]): Promise<void> {
        await puterService.kv.set(
            storageKeys.history(userId),
            JSON.stringify(resumeIds),
        );
    },

    deleteResume(id: string): Promise<boolean> {
        return puterService.kv.delete(storageKeys.resume(id));
    },

    deleteAnalysis(id: string): Promise<boolean> {
        return puterService.kv.delete(storageKeys.analysis(id));
    },
};
