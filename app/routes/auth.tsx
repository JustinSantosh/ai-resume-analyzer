import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const meta = () => ([
    { title: 'Berozgar ki lathi | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = new URLSearchParams(location.search).get("next") ?? "/";
    const navigate = useNavigate();

    useEffect(() => {
        if(auth.isAuthenticated) void navigate(next, { replace: true });
    }, [auth.isAuthenticated, navigate, next])

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log In to Continue Your Job Journey</h2>
                    </div>
                    <div>
                        {isLoading ? (
                            <button type="button" className="auth-button animate-pulse" disabled>
                                <p>Signing you in...</p>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <button type="button" className="auth-button" onClick={auth.signOut}>
                                        <p>Log Out</p>
                                    </button>
                                ) : (
                                    <button type="button" className="auth-button" onClick={auth.signIn}>
                                        <p>Log In</p>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Auth
