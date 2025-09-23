import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "../../auth/auth-client";
import { useState } from "react";

export const Route = createFileRoute("/_public/login")({
    component: Login,
});

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: async ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => {
            return await authClient.signIn.email({ email, password });
        },
        onError: (err: unknown) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Login failed");
            }
        },
        onSettled: (result) => {
            if (result && result.error) {
                setError(result.error.message || "Login failed");
            } else {
                setError(null);
                window.location.href = "/";
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ email, password });
    };

    return (
        <div>
            <h3>Login Page</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label htmlFor="">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loginMutation.isPending}>
                    Login
                </button>
            </form>
            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}
