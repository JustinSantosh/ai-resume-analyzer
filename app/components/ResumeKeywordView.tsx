import { useMemo, useState } from "react";

import { getKeywordAnalysis } from "~/lib/keyword-analysis";

interface ResumeKeywordViewProps {
    analysis: Analysis;
    previewUrl?: string;
    resumeText: string;
    resumeUrl?: string;
}

type PreviewMode = "annotated" | "pdf";
type HighlightTone = "matched" | "unnecessary";

const escapeRegularExpression = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const AnnotatedText = ({
    analysis,
    resumeText,
}: Pick<ResumeKeywordViewProps, "analysis" | "resumeText">) => {
    const keywordAnalysis = getKeywordAnalysis(analysis);
    const highlightedText = useMemo(() => {
        const terms = [
            ...keywordAnalysis.matched.map(({ keyword }) => ({
                keyword: keyword.trim(),
                tone: "matched" as const,
            })),
            ...keywordAnalysis.unnecessary.map(({ keyword }) => ({
                keyword: keyword.trim(),
                tone: "unnecessary" as const,
            })),
        ]
            .filter(({ keyword }) => keyword.length > 1)
            .sort((left, right) => right.keyword.length - left.keyword.length);

        const toneByKeyword = new Map<string, HighlightTone>();
        terms.forEach(({ keyword, tone }) => {
            const normalizedKeyword = keyword.toLocaleLowerCase();
            if (!toneByKeyword.has(normalizedKeyword)) {
                toneByKeyword.set(normalizedKeyword, tone);
            }
        });

        const uniqueTerms = [...toneByKeyword.keys()];
        if (uniqueTerms.length === 0) return [resumeText];

        const pattern = new RegExp(
            `(?<![\\p{L}\\p{N}_])(${uniqueTerms.map(escapeRegularExpression).join("|")})(?![\\p{L}\\p{N}_])`,
            "giu",
        );
        return resumeText.split(pattern);
    }, [keywordAnalysis.matched, keywordAnalysis.unnecessary, resumeText]);

    const toneByKeyword = useMemo(() => {
        const tones = new Map<string, HighlightTone>();
        keywordAnalysis.matched.forEach(({ keyword }) => {
            tones.set(keyword.trim().toLocaleLowerCase(), "matched");
        });
        keywordAnalysis.unnecessary.forEach(({ keyword }) => {
            tones.set(keyword.trim().toLocaleLowerCase(), "unnecessary");
        });
        return tones;
    }, [keywordAnalysis.matched, keywordAnalysis.unnecessary]);

    return (
        <div className="h-full overflow-y-auto rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-blue-900">
                    Blue: matched keyword
                </span>
                <span className="rounded-full bg-brand-red/15 px-3 py-1 text-red-900">
                    Red: unnecessary term
                </span>
            </div>
            {keywordAnalysis.missing.length > 0 && (
                <aside className="mb-5 rounded-xl border border-brand-red/25 bg-brand-red-soft p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-900">
                        Missing from this resume
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {keywordAnalysis.missing.map(({ keyword, explanation }) => (
                            <span
                                key={`missing-${keyword}`}
                                title={explanation}
                                className="rounded-full bg-brand-red/15 px-2.5 py-1 text-xs font-semibold text-red-900"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </aside>
            )}
            <p className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-gray-700">
                {highlightedText.map((part, index) => {
                    const tone = toneByKeyword.get(part.toLocaleLowerCase());
                    if (!tone) return <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>;

                    return (
                        <mark
                            key={`${index}-${part}`}
                            className={
                                tone === "matched"
                                    ? "rounded bg-brand-blue/20 px-0.5 text-blue-950"
                                    : "rounded bg-brand-red/20 px-0.5 text-red-950"
                            }
                        >
                            {part}
                        </mark>
                    );
                })}
            </p>
        </div>
    );
};

const ResumeKeywordView = ({
    analysis,
    previewUrl,
    resumeText,
    resumeUrl,
}: ResumeKeywordViewProps) => {
    const [mode, setMode] = useState<PreviewMode>("annotated");

    return (
        <div className="flex h-[90%] w-full max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-brand-blue/15 bg-white/90 p-1.5 shadow-sm">
                <button
                    type="button"
                    aria-pressed={mode === "annotated"}
                    onClick={() => setMode("annotated")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        mode === "annotated"
                            ? "bg-brand-blue text-white"
                            : "text-gray-600 hover:bg-brand-blue-soft"
                    }`}
                >
                    Annotated text
                </button>
                <button
                    type="button"
                    aria-pressed={mode === "pdf"}
                    onClick={() => setMode("pdf")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        mode === "pdf"
                            ? "bg-brand-blue text-white"
                            : "text-gray-600 hover:bg-brand-blue-soft"
                    }`}
                >
                    PDF preview
                </button>
                {resumeUrl && (
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto rounded-full px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red-soft"
                    >
                        Open original
                    </a>
                )}
            </div>

            <div className="min-h-0 flex-1">
                {mode === "annotated" ? (
                    <AnnotatedText analysis={analysis} resumeText={resumeText} />
                ) : (
                    <div className="gradient-border h-full w-full">
                        <img
                            src={previewUrl}
                            className="h-full w-full rounded-2xl object-contain"
                            alt="Original resume preview"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeKeywordView;
