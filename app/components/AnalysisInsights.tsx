interface InsightListProps {
    title: string;
    items: string[];
    tone: "positive" | "negative" | "neutral";
}

const toneClasses = {
    positive: "border-emerald-200 bg-emerald-50",
    negative: "border-amber-200 bg-amber-50",
    neutral: "border-indigo-200 bg-indigo-50",
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

const AnalysisInsights = ({ analysis }: AnalysisInsightsProps) => (
    <div className="space-y-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">AI summary</h3>
            <p className="mt-3 leading-7 text-gray-700">{analysis.summary}</p>
        </section>
        <div className="grid gap-5 md:grid-cols-2">
            <InsightList title="Strengths" items={analysis.strengths} tone="positive" />
            <InsightList title="Weaknesses" items={analysis.weaknesses} tone="negative" />
            <InsightList title="Matched keywords" items={analysis.matchedKeywords} tone="positive" />
            <InsightList title="Missing keywords" items={analysis.missingKeywords} tone="negative" />
        </div>
        <InsightList title="Priority suggestions" items={analysis.suggestions} tone="neutral" />
    </div>
);

export default AnalysisInsights;

