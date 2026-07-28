import { useEffect, useState } from "react";

import { resumeService } from "~/lib/services/resume.service";

export const useResumeHistory = (userId?: string) => {
    const [resumes, setResumes] = useState<ResumeCardView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!userId) return;
        let active = true;
        let loadedResumes: ResumeCardView[] = [];
        setIsLoading(true);
        setError(null);

        resumeService
            .listResumes(userId)
            .then((items) => {
                loadedResumes = items;
                if (active) setResumes(items);
            })
            .catch((reason: unknown) => {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "History could not be loaded.");
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
            loadedResumes.forEach((resume) => URL.revokeObjectURL(resume.imageUrl));
        };
    }, [userId, reloadKey]);

    return {
        resumes,
        isLoading,
        error,
        retry: () => setReloadKey((value) => value + 1),
    };
};
