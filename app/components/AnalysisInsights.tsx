import { getKeywordAnalysis } from "~/lib/keyword-analysis";

interface InsightListProps {
    title: string;
    items: string[];
    tone: "positive" | "negative" | "neutral";
}

const toneClasses = {
    positive: "border-emerald-200 bg-emerald-50",
    negative: "border-brand-red/25 bg-brand-red-soft",
    neutral: "border-brand-blue/25 bg-brand-blue-soft",
};

const InsightList = ({ title, items, tone }: InsightListProps) => (
    <section className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {items.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
        ) : (
            <p className="mt-3 text-gray-600">No items identified.</p>
        )}
    </section>
);

interface AnalysisInsightsProps {
    analysis: Analysis;
}

const KeywordList = ({
    title,
    description,
    items,
    tone,
}: {
    title: string;
    description: string;
    items: KeywordInsight[];
    tone: "matched" | "missing" | "unnecessary";
}) => {
    const matched = tone === "matched";

    return (
        <section
            className={`rounded-2xl border p-5 ${
                matched
                    ? "border-brand-blue/25 bg-brand-blue-soft"
                    : "border-brand-red/25 bg-brand-red-soft"
            }`}
        >
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
            {items.length > 0 ? (
                <dl className="mt-4 space-y-3">
                    {items.map(({ keyword, explanation }) => (
                        <div
                            key={`${tone}-${keyword}`}
                            className="rounded-xl border border-white/70 bg-white/75 p-3"
                        >
                            <dt
                                className={`font-semibold ${
                                    matched ? "text-blue-900" : "text-red-900"
                                }`}
                            >
                                {keyword}
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                                {explanation}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="mt-3 text-gray-600">No items identified.</p>
            )}
        </section>
    );
};

const AnalysisInsights = ({ analysis }: AnalysisInsightsProps) => {
    const keywordAnalysis = getKeywordAnalysis(analysis);

    return (
        <div className="space-y-5">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">AI summary</h3>
                <p className="mt-3 leading-7 text-gray-700">{analysis.summary}</p>
            </section>
            <div className="grid gap-5 md:grid-cols-2">
                <InsightList title="Strengths" items={analysis.strengths} tone="positive" />
                <InsightList title="Weaknesses" items={analysis.weaknesses} tone="negative" />
            </div>
            <section aria-labelledby="keyword-analysis-heading" className="space-y-4">
                <div>
                    <h2 id="keyword-analysis-heading" className="!text-2xl font-semibold text-gray-900">
                        Keyword explanations
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Add missing terms only when they truthfully describe your experience.
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    <KeywordList
                        title="Matched keywords"
                        description="Shown in blue in the annotated resume."
                        items={keywordAnalysis.matched}
                        tone="matched"
                    />
                    <KeywordList
                        title="Missing keywords"
                        description="Important role terms not found in your resume."
                        items={keywordAnalysis.missing}
                        tone="missing"
                    />
                    <KeywordList
                        title="Unnecessary terms"
                        description="Shown in red where they appear in the annotated resume."
                        items={keywordAnalysis.unnecessary}
                        tone="unnecessary"
                    />
                </div>
            </section>
            <InsightList title="Priority suggestions" items={analysis.suggestions} tone="neutral" />
        </div>
    );
};

export default AnalysisInsights;
