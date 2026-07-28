import { ApplicationError, toApplicationError } from "~/lib/errors";
import { resumeRepository } from "~/lib/repositories/resume.repository";
import { withRetry } from "~/lib/retry";
import { analysisService } from "~/lib/services/analysis.service";
import { pdfService } from "~/lib/services/pdf.service";
import { puterService } from "~/lib/services/puter.service";

type UploadProgress = (message: string) => void;

const validateRequest = (request: ResumeUploadRequest): void => {
    if (!request.company.trim() || !request.jobTitle.trim()) {
        throw new ApplicationError("INVALID_FILE", "Company and job title are required.");
    }
    if (!request.jobDescription.trim() || request.requiredExperience < 0) {
        throw new ApplicationError(
            "INVALID_FILE",
            "Enter a job description and valid experience requirement.",
        );
    }
};

const createAnalysis = async (
    request: ResumeUploadRequest,
    userId: string,
    onProgress: UploadProgress,
): Promise<string> => {
    validateRequest(request);
    onProgress("Reading your resume...");
    const processed = await pdfService.processPdf(request.pdfFile);
    const resumeId = crypto.randomUUID();
    let resumePath: string | null = null;
    let previewPath: string | null = null;
    let analysisId: string | null = null;

    try {
        onProgress("Uploading files securely...");
        const resumeFile = await withRetry(() =>
            puterService.files.upload([request.pdfFile]),
        );
        resumePath = resumeFile.path;
        const previewFile = await withRetry(() =>
            puterService.files.upload([processed.previewFile]),
        );
        previewPath = previewFile.path;

        onProgress("Analyzing the resume against the role...");
        const analysis = await analysisService.analyzeResume({
            resumeId,
            resumePath,
            resumeText: processed.text,
            jobTitle: request.jobTitle.trim(),
            jobDescription: request.jobDescription.trim(),
            requiredExperience: request.requiredExperience,
        });
        analysisId = analysis.id;

        const now = new Date().toISOString();
        const resume: Resume = {
            id: resumeId,
            userId,
            company: request.company.trim(),
            jobTitle: request.jobTitle.trim(),
            jobDescription: request.jobDescription.trim(),
            requiredExperience: request.requiredExperience,
            resumeFilePath: resumePath,
            previewImage: previewPath,
            resumeText: processed.text,
            analysisId,
            createdAt: now,
            updatedAt: now,
        };

        onProgress("Saving your analysis...");
        const history = await resumeRepository.getHistory(userId);
        await resumeRepository.saveAnalysis(analysis);
        await resumeRepository.saveResume(resume);
        await resumeRepository.saveHistory(userId, [
            resume.id,
            ...history.filter((id) => id !== resume.id),
        ]);
        return resume.id;
    } catch (error) {
        await Promise.allSettled([
            ...(resumePath ? [puterService.files.delete(resumePath)] : []),
            ...(previewPath ? [puterService.files.delete(previewPath)] : []),
            resumeRepository.deleteResume(resumeId),
            ...(analysisId ? [resumeRepository.deleteAnalysis(analysisId)] : []),
        ]);
        throw toApplicationError(error, "UNKNOWN_ERROR", "The analysis could not be completed.");
    } finally {
        URL.revokeObjectURL(processed.previewUrl);
    }
};

const loadResume = async (id: string, userId: string): Promise<ResumeWithAnalysis> => {
    const resume = await resumeRepository.getResume(id);
    if (!resume || resume.userId !== userId) {
        throw new ApplicationError("NOT_FOUND", "Resume analysis not found.");
    }
    const analysis = await resumeRepository.getAnalysis(resume.analysisId);
    if (!analysis) {
        throw new ApplicationError("NOT_FOUND", "Resume feedback not found.");
    }
    const [resumeBlob, previewBlob] = await Promise.all([
        puterService.files.read(resume.resumeFilePath),
        puterService.files.read(resume.previewImage),
    ]);
    return {
        resume,
        analysis,
        resumeUrl: URL.createObjectURL(resumeBlob),
        previewUrl: URL.createObjectURL(previewBlob),
    };
};

const listResumes = async (userId: string): Promise<ResumeCardView[]> => {
    const ids = await resumeRepository.getHistory(userId);
    const records = await Promise.all(
        ids.map(async (id): Promise<ResumeCardView | null> => {
            const resume = await resumeRepository.getResume(id);
            if (!resume || resume.userId !== userId) return null;
            const analysis = await resumeRepository.getAnalysis(resume.analysisId);
            if (!analysis) return null;
            const image = await puterService.files.read(resume.previewImage);
            return {
                id: resume.id,
                company: resume.company,
                jobTitle: resume.jobTitle,
                createdAt: resume.createdAt,
                score: analysis.overallScore,
                imageUrl: URL.createObjectURL(image),
            };
        }),
    );
    return records.filter((record): record is ResumeCardView => record !== null);
};

export const resumeService = { createAnalysis, loadResume, listResumes };
