import { type FormEvent, useState } from "react";

import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { useProtectedRoute } from "~/hooks/useProtectedRoute";
import { useResumeUpload } from "~/hooks/useResumeUpload";

export const meta = () => [
    { title: "Resumind | Analyze resume" },
    { name: "description", content: "Match a PDF resume to your target role." },
];

const Upload = () => {
    const { user } = useProtectedRoute();
    const { submit, isProcessing, status, error } = useResumeUpload(user?.uuid);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) return;
        const form = new FormData(event.currentTarget);
        void submit({
            company: String(form.get("company") ?? ""),
            jobTitle: String(form.get("jobTitle") ?? ""),
            jobDescription: String(form.get("jobDescription") ?? ""),
            requiredExperience: Number(form.get("requiredExperience") ?? 0),
            pdfFile: file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <header className="page-heading py-12">
                    <h1>Smart feedback for your dream job</h1>
                    <h2>Drop your resume for an ATS score and practical improvement tips.</h2>
                </header>

                {isProcessing ? (
                    <section className="w-full max-w-3xl rounded-3xl bg-white p-8 text-center shadow-lg" aria-live="polite">
                        <h2 className="text-2xl font-semibold text-gray-900">{status}</h2>
                        <img src="/images/resume-scan.gif" alt="" className="mt-6 w-full" />
                        <p className="mt-4 text-gray-600">Keep this tab open while the analysis completes.</p>
                    </section>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="mb-16 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-lg md:p-10"
                    >
                        <div className="grid w-full gap-6 md:grid-cols-2">
                            <div className="form-div">
                                <label htmlFor="company">Company</label>
                                <input id="company" name="company" required placeholder="e.g. Acme" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="jobTitle">Job title</label>
                                <input id="jobTitle" name="jobTitle" required placeholder="e.g. Frontend Engineer" />
                            </div>
                        </div>
                        <div className="form-div">
                            <label htmlFor="requiredExperience">Required experience (years)</label>
                            <input
                                id="requiredExperience"
                                name="requiredExperience"
                                type="number"
                                min="0"
                                max="50"
                                step="1"
                                required
                                placeholder="3"
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="jobDescription">Job description</label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                rows={8}
                                minLength={40}
                                required
                                placeholder="Paste the complete role description…"
                            />
                        </div>
                        <div className="form-div">
                            <span className="text-dark-200">Resume PDF</span>
                            <FileUploader file={file} onFileSelect={setFile} />
                        </div>
                        {error && <p className="text-sm font-medium text-red-700" role="alert">{error}</p>}
                        <button
                            className="primary-button py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                            disabled={!file}
                        >
                            Analyze Resume
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
};

export default Upload;

