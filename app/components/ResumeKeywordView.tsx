import { useEffect, useMemo, useRef, useState } from "react";

import { getKeywordAnalysis } from "~/lib/keyword-analysis";
import { pdfService } from "~/lib/services/pdf.service";

interface ResumeKeywordViewProps {
    analysis: Analysis;
    previewUrl?: string;
    resumeUrl?: string;
}

type RenderStatus = "loading" | "ready" | "error";

const ResumeKeywordView = ({
    analysis,
    previewUrl,
    resumeUrl,
}: ResumeKeywordViewProps) => {
    const keywordAnalysis = useMemo(() => getKeywordAnalysis(analysis), [analysis]);
    const viewportRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement>(null);
    const [renderWidth, setRenderWidth] = useState(0);
    const [status, setStatus] = useState<RenderStatus>("loading");
    const [error, setError] = useState("");
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const updateWidth = () => setRenderWidth(Math.round(viewport.clientWidth));
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const container = pagesRef.current;
        if (!container || !resumeUrl || renderWidth === 0) {
            if (!resumeUrl) {
                setStatus("error");
                setError("The original PDF is unavailable.");
            }
            return;
        }

        const controller = new AbortController();
        setStatus("loading");
        setError("");

        pdfService
            .renderHighlightedPdf({
                source: resumeUrl,
                container,
                keywords: keywordAnalysis.matched,
                width: renderWidth,
                signal: controller.signal,
            })
            .then(() => {
                if (!controller.signal.aborted) setStatus("ready");
            })
            .catch((renderError: unknown) => {
                if (controller.signal.aborted) return;
                setStatus("error");
                setError(
                    renderError instanceof Error
                        ? renderError.message
                        : "The highlighted PDF could not be rendered.",
                );
            });

        return () => controller.abort();
    }, [keywordAnalysis.matched, renderWidth, resumeUrl, retryKey]);

    return (
        <div className="flex h-[90%] w-full max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand-blue/15 bg-white/95 p-3 shadow-sm">
                <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-semibold text-blue-900">
                    Blue: matched in your PDF
                </span>
                {resumeUrl && (
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-brand-red hover:bg-brand-red-soft"
                    >
                        Open original
                    </a>
                )}
                {keywordAnalysis.missing.length > 0 && (
                    <aside className="w-full rounded-xl border border-brand-red/25 bg-brand-red-soft p-3">
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
            </div>

            <div
                ref={viewportRef}
                className="relative min-h-[420px] flex-1 overflow-auto rounded-2xl border border-brand-blue/15 bg-slate-100 p-3 shadow-inner"
            >
                {status !== "error" && (
                    <div
                        ref={pagesRef}
                        className="pdf-keyword-pages"
                        aria-label="Resume PDF with matched keywords highlighted in blue"
                    />
                )}

                {status === "loading" && (
                    <div
                        className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm"
                        role="status"
                    >
                        <p className="rounded-full bg-brand-blue-soft px-4 py-2 font-semibold text-blue-900">
                            Highlighting keywords in your PDF…
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex h-full min-h-[390px] flex-col items-center justify-center gap-4 text-center" role="alert">
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                className="max-h-[65vh] max-w-full rounded-xl object-contain opacity-80"
                                alt="Resume preview without keyword highlights"
                            />
                        )}
                        <div>
                            <p className="font-semibold text-gray-900">Highlights unavailable</p>
                            <p className="mt-1 text-sm text-gray-600">{error}</p>
                            {resumeUrl && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus("loading");
                                        setRetryKey((value) => value + 1);
                                    }}
                                    className="mt-3 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeKeywordView;
