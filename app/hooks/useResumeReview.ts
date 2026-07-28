import { useEffect, useState } from "react";

import { resumeService } from "~/lib/services/resume.service";

export const useResumeReview = (resumeId?: string, userId?: string) => {
    const [data, setData] = useState<ResumeWithAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!resumeId || !userId) return;
        let active = true;
        let loadedData: ResumeWithAnalysis | null = null;
        setIsLoading(true);
        setError(null);

        resumeService
            .loadResume(resumeId, userId)
            .then((result) => {
                loadedData = result;
                if (active) setData(result);
            })
            .catch((reason: unknown) => {
                if (active) setError(reason instanceof Error ? reason.message : "Review could not be loaded.");
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
            if (loadedData?.previewUrl) URL.revokeObjectURL(loadedData.previewUrl);
            if (loadedData?.resumeUrl) URL.revokeObjectURL(loadedData.resumeUrl);
        };
    }, [resumeId, userId, reloadKey]);

    return { data, isLoading, error, retry: () => setReloadKey((value) => value + 1) };
};
