import { Link, useParams } from "react-router";

import AnalysisInsights from "~/components/AnalysisInsights";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import LoadingScreen from "~/components/LoadingScreen";
import Summary from "~/components/Summary";
import { useProtectedRoute } from "~/hooks/useProtectedRoute";
import { useResumeReview } from "~/hooks/useResumeReview";

export const meta = () => [
    { title: "Unemployed ki lathi | Resume review" },
    { name: "description", content: "Detailed AI-powered resume feedback." },
];

const Resume = () => {
    const { id } = useParams();
    const { user } = useProtectedRoute();
    const { data, isLoading, error, retry } = useResumeReview(id, user?.uuid);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="" className="h-2.5 w-2.5" />
                    <span className="text-sm font-semibold text-gray-800">Back to dashboard</span>
                </Link>
            </nav>
            {isLoading && <LoadingScreen message="Loading your resume review…" />}
            {error && (
                <section className="mx-auto mt-20 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
                    <h1 className="text-3xl font-semibold text-gray-900">Review unavailable</h1>
                    <p className="mt-3 text-gray-700">{error}</p>
                    <button type="button" onClick={retry} className="primary-button mt-5 w-fit">Try again</button>
                </section>
            )}
            {data && (
                <div className="flex w-full flex-row max-lg:flex-col-reverse">
                    <section className="feedback-section sticky top-0 h-screen items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover max-lg:static max-lg:h-auto">
                        <div className="gradient-border h-[90%] w-fit max-w-full">
                            <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the original resume PDF">
                                <img
                                    src={data.previewUrl}
                                    className="h-full w-full rounded-2xl object-contain"
                                    alt={`Resume preview for ${data.resume.jobTitle}`}
                                />
                            </a>
                        </div>
                    </section>
                    <section className="feedback-section">
                        <header>
                            <p className="font-medium text-brand-red">{data.resume.company}</p>
                            <h1 className="!text-black text-4xl font-bold">Resume Review</h1>
                            <p className="mt-2 text-gray-600">{data.resume.jobTitle}</p>
                        </header>
                        <div className="flex flex-col gap-8">
                            <Summary feedback={data.analysis.feedback} />
                            <ATS
                                score={data.analysis.feedback.ATS.score}
                                suggestions={data.analysis.feedback.ATS.tips}
                            />
                            <Details feedback={data.analysis.feedback} />
                            <AnalysisInsights analysis={data.analysis} />
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
};

export default Resume;
