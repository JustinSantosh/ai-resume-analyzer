interface FeedbackTip {
    type: "good" | "improve";
    tip: string;
    explanation: string;
}

interface FeedbackCategory {
    score: number;
    tips: FeedbackTip[];
}

interface KeywordInsight {
    keyword: string;
    explanation: string;
}

interface KeywordAnalysis {
    matched: KeywordInsight[];
    missing: KeywordInsight[];
}

interface Feedback {
    overallScore: number;
    summary: string;
    ATS: FeedbackCategory;
    toneAndStyle: FeedbackCategory;
    content: FeedbackCategory;
    structure: FeedbackCategory;
    skills: FeedbackCategory;
    matchedKeywords: string[];
    missingKeywords: string[];
    keywordAnalysis?: KeywordAnalysis;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

interface Analysis {
    id: string;
    resumeId: string;
    overallScore: number;
    summary: string;
    skillsScore: number;
    contentScore: number;
    toneScore: number;
    structureScore: number;
    keywordScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    feedback: Feedback;
    rawResponse: unknown;
    generatedAt: string;
}

interface Resume {
    id: string;
    userId: string;
    company: string;
    jobTitle: string;
    jobDescription: string;
    requiredExperience: number;
    resumeFilePath: string;
    previewImage: string;
    resumeText: string;
    analysisId: string;
    createdAt: string;
    updatedAt: string;
}

interface ResumeWithAnalysis {
    resume: Resume;
    analysis: Analysis;
    previewUrl?: string;
    resumeUrl?: string;
}

interface ResumeUploadRequest {
    company: string;
    jobTitle: string;
    jobDescription: string;
    requiredExperience: number;
    pdfFile: File;
}

interface ResumeCardView {
    id: string;
    company: string;
    jobTitle: string;
    createdAt: string;
    score: number;
    imageUrl: string;
}
