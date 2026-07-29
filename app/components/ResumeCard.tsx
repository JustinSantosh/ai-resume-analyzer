import { Link } from "react-router";

import ScoreCircle from "~/components/ScoreCircle";

interface ResumeCardProps {
    resume: ResumeCardView;
}

const ResumeCard = ({ resume }: ResumeCardProps) => (
    <Link
        to={`/resume/${resume.id}`}
        className="resume-card group transition duration-200 hover:-translate-y-1 hover:border-brand-red/25 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
        aria-label={`Open ${resume.jobTitle} resume analysis for ${resume.company}`}
    >
        <div className="resume-card-header">
            <div className="min-w-0">
                <h2 className="break-words text-xl font-bold text-black">{resume.company}</h2>
                <p className="mt-1 text-gray-600">{resume.jobTitle}</p>
                <time className="mt-2 block text-sm text-gray-500" dateTime={resume.createdAt}>
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                        new Date(resume.createdAt),
                    )}
                </time>
            </div>
            <ScoreCircle score={resume.score} />
        </div>
        <div className="gradient-border h-[350px] overflow-hidden">
            <img
                src={resume.imageUrl}
                alt={`Preview of resume for ${resume.jobTitle}`}
                loading="lazy"
                className="h-full w-full rounded-xl object-cover object-top transition duration-300 group-hover:scale-[1.02]"
            />
        </div>
    </Link>
);

export default ResumeCard;
