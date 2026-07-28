import { Link } from "react-router";

const EmptyState = () => (
    <section className="flex flex-col items-center gap-5 py-12 text-center">
        <img src="/images/pdf.png" alt="" className="w-20 opacity-80" />
        <div>
            <h2 className="text-2xl font-semibold text-gray-900">Your first review starts here</h2>
            <p className="mt-2 text-gray-600">
                Upload a PDF resume and compare it with a role in a few minutes.
            </p>
        </div>
        <Link to="/upload" className="primary-button w-fit px-7 py-3 font-semibold">
            Analyze a resume
        </Link>
    </section>
);

export default EmptyState;

