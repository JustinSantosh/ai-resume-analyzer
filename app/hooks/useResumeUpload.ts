import { useState } from "react";

import { useNavigate } from "react-router";

import { resumeService } from "~/lib/services/resume.service";

export const useResumeUpload = (userId?: string) => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = async (request: ResumeUploadRequest): Promise<void> => {
        if (!userId || isProcessing) return;
        setIsProcessing(true);
        setError(null);
        try {
            const id = await resumeService.createAnalysis(request, userId, setStatus);
            setStatus("Analysis complete. Opening your review…");
            await navigate(`/resume/${id}`);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Analysis failed. Please try again.");
            setIsProcessing(false);
        }
    };

    return { submit, isProcessing, status, error };
};

