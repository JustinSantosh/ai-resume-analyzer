import { Link, useNavigate } from "react-router";

import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        await navigate("/auth", { replace: true });
    };

    return (
        <nav className="navbar" aria-label="Primary navigation">
            <Link to="/" aria-label="Resumind home">
                <span className="text-gradient text-2xl font-bold">RESUMIND</span>
            </Link>
            <div className="flex items-center gap-2">
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full px-4 py-2 font-medium text-gray-700 hover:bg-brand-red-soft focus-visible:outline-2 focus-visible:outline-brand-blue"
                >
                    Log out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
