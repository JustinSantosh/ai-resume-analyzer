interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen = ({ message = "Loading…" }: LoadingScreenProps) => (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4" role="status">
        <img
            src="/images/resume-scan-2.gif"
            alt=""
            aria-hidden="true"
            className="w-48"
        />
        <p className="text-lg text-gray-600">{message}</p>
    </div>
);

export default LoadingScreen;

