import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router";

import { usePuterStore } from "~/lib/puter";

export const useProtectedRoute = () => {
    const { auth, isLoading } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            const next = encodeURIComponent(`${location.pathname}${location.search}`);
            void navigate(`/auth?next=${next}`, { replace: true });
        }
    }, [auth.isAuthenticated, isLoading, location.pathname, location.search, navigate]);

    return { user: auth.user, isAuthLoading: isLoading };
};

