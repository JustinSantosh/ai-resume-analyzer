const createFallbackInsights = (
    keywords: string[],
    explanation: string,
): KeywordInsight[] =>
    keywords.map((keyword) => ({ keyword, explanation }));

export const getKeywordAnalysis = (analysis: Analysis): KeywordAnalysis => {
    if (analysis.feedback.keywordAnalysis) {
        return analysis.feedback.keywordAnalysis;
    }

    return {
        matched: createFallbackInsights(
            analysis.matchedKeywords,
            "This term appears in your resume and supports the target role.",
        ),
        missing: createFallbackInsights(
            analysis.missingKeywords,
            "The job description uses this term, but it was not found in your resume.",
        ),
        unnecessary: createFallbackInsights(
            analysis.unnecessaryKeywords ?? [],
            "This term may not strengthen your fit for the target role.",
        ),
    };
};
