import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../../auth/auth-client";
import { PasswordInput } from "../../components/input/PasswordInput";

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="shadow-2xl max-w-100 text-center rounded-2xl p-5 flex flex-col gap-5">
                <h3 className="text-2xl">Login</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="text-left" htmlFor="">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="email"
                        className="border border-gray-300 rounded px-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="text-left" htmlFor="">
                        Password
                    </label>
                    <PasswordInput
                        password={password}
                        handlePasswordChange={handlePasswordChange}
                    />
                    <button
                        className="bg-black text-white rounded py-1 hover:bg-gray-800"
                        type="submit"
                        disabled={loginMutation.isPending}
                    >
                        Login
                    </button>
                    <div className="flex gap-1 text-sm text-gray-500">
                        <p>Don&apos;t have an account?</p>
                        <Link to="/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </form>
                {error && <div className="text-red-500">{error}</div>}
            </div>
        </div>
    );
}
