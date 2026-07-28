import { ApplicationError } from "~/lib/errors";
import { withRetry } from "~/lib/retry";
import { puterService } from "~/lib/services/puter.service";

interface AnalysisInput {
    resumeId: string;
    resumePath: string;
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
    requiredExperience: number;
}

const clampScore = (value: unknown): number => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new ApplicationError("INVALID_ANALYSIS", "AI returned an invalid score.");
    }
    return Math.round(Math.min(100, Math.max(0, value)));
};

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");

const isTip = (value: unknown): value is FeedbackTip => {
    if (!value || typeof value !== "object") return false;
    const tip = value as Partial<FeedbackTip>;
    return (
        (tip.type === "good" || tip.type === "improve") &&
        typeof tip.tip === "string" &&
        typeof tip.explanation === "string"
    );
};

const parseCategory = (value: unknown): FeedbackCategory => {
    if (!value || typeof value !== "object") {
        throw new ApplicationError("INVALID_ANALYSIS", "AI omitted a feedback category.");
    }
    const category = value as Partial<FeedbackCategory>;
    if (!Array.isArray(category.tips) || !category.tips.every(isTip)) {
        throw new ApplicationError("INVALID_ANALYSIS", "AI returned malformed feedback tips.");
    }
    return { score: clampScore(category.score), tips: category.tips };
};

const parseFeedback = (raw: unknown): Feedback => {
    if (!raw || typeof raw !== "object") {
        throw new ApplicationError("INVALID_ANALYSIS", "AI returned an invalid response.");
    }
    const value = raw as Partial<Feedback>;
    if (
        typeof value.summary !== "string" ||
        !isStringArray(value.matchedKeywords) ||
        !isStringArray(value.missingKeywords) ||
        !isStringArray(value.strengths) ||
        !isStringArray(value.weaknesses) ||
        !isStringArray(value.suggestions)
    ) {
        throw new ApplicationError(
            "INVALID_ANALYSIS",
            "AI response is missing required feedback.",
        );
    }
    return {
        overallScore: clampScore(value.overallScore),
        summary: value.summary,
        ATS: parseCategory(value.ATS),
        toneAndStyle: parseCategory(value.toneAndStyle),
        content: parseCategory(value.content),
        structure: parseCategory(value.structure),
        skills: parseCategory(value.skills),
        matchedKeywords: value.matchedKeywords,
        missingKeywords: value.missingKeywords,
        strengths: value.strengths,
        weaknesses: value.weaknesses,
        suggestions: value.suggestions,
    };
};

const buildPrompt = (input: AnalysisInput): string => `You are an expert ATS and resume reviewer.
Evaluate the attached resume for the target role using the supplied context.

Target role: ${input.jobTitle}
Required experience: ${input.requiredExperience} years
Job description:
${input.jobDescription}

Extracted resume text:
${input.resumeText}

Return only valid JSON with this exact shape:
{
  "overallScore": 0,
  "summary": "string",
  "ATS": {"score": 0, "tips": [{"type": "good|improve", "tip": "string", "explanation": "string"}]},
  "toneAndStyle": {"score": 0, "tips": [{"type": "good|improve", "tip": "string", "explanation": "string"}]},
  "content": {"score": 0, "tips": [{"type": "good|improve", "tip": "string", "explanation": "string"}]},
  "structure": {"score": 0, "tips": [{"type": "good|improve", "tip": "string", "explanation": "string"}]},
  "skills": {"score": 0, "tips": [{"type": "good|improve", "tip": "string", "explanation": "string"}]},
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}
All scores must be integers from 0 to 100. Be specific, candid, and actionable.`;

const extractResponseText = (response: AIResponse): string => {
    if (typeof response.message.content === "string") {
        return response.message.content;
    }
    const text = response.message.content.find((item) => item.type === "text")?.text;
    if (!text) {
        throw new ApplicationError("INVALID_ANALYSIS", "AI returned no readable feedback.");
    }
    return text;
};

const analyzeResume = async (input: AnalysisInput): Promise<Analysis> => {
    const response = await withRetry(() =>
        puterService.ai.feedback(input.resumePath, buildPrompt(input)),
    );
    const text = extractResponseText(response)
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch (error) {
        throw new ApplicationError(
            "INVALID_ANALYSIS",
            "AI returned malformed JSON. Please try again.",
            error,
        );
    }
    const feedback = parseFeedback(raw);
    return {
        id: crypto.randomUUID(),
        resumeId: input.resumeId,
        overallScore: feedback.overallScore,
        summary: feedback.summary,
        skillsScore: feedback.skills.score,
        contentScore: feedback.content.score,
        toneScore: feedback.toneAndStyle.score,
        structureScore: feedback.structure.score,
        keywordScore: feedback.ATS.score,
        matchedKeywords: feedback.matchedKeywords,
        missingKeywords: feedback.missingKeywords,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        suggestions: feedback.suggestions,
        feedback,
        rawResponse: raw,
        generatedAt: new Date().toISOString(),
    };
};

export const analysisService = { buildPrompt, parseAnalysis: parseFeedback, analyzeResume };
