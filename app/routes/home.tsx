import type { Route } from "./+types/home";

import EmptyState from "~/components/EmptyState";
import LoadingScreen from "~/components/LoadingScreen";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useProtectedRoute } from "~/hooks/useProtectedRoute";
import { useResumeHistory } from "~/hooks/useResumeHistory";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind | Resume dashboard" },
        { name: "description", content: "Review your AI-powered resume analyses." },
    ];
}

export default function Home() {
    const { user, isAuthLoading } = useProtectedRoute();
    const { resumes, isLoading, error, retry } = useResumeHistory(user?.uuid);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <header className="page-heading py-16">
                    <p className="font-semibold uppercase tracking-[0.2em] text-indigo-600">
                        Your application workspace
                    </p>
                    <h1>Track Your Applications & Resume Ratings</h1>
                    <h2>
                        {resumes.length === 0
                            ? "Upload your first resume to get role-specific feedback."
                            : "Review your submissions and improve every application."}
                    </h2>
                </header>

                {(isAuthLoading || isLoading) && <LoadingScreen message="Loading your analyses…" />}
                {error && (
                    <section className="rounded-2xl bg-white p-8 text-center shadow" role="alert">
                        <h2 className="text-2xl font-semibold text-gray-900">History unavailable</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <button type="button" onClick={retry} className="primary-button mt-5 w-fit">
                            Try again
                        </button>
                    </section>
                )}
                {!isLoading && !error && resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}
                {!isLoading && !error && resumes.length === 0 && <EmptyState />}
            </section>
        </main>
    );
}

