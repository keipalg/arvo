import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../../auth/auth-client";
import { PasswordInput } from "../../components/input/PasswordInput";
import TextInput from "../../components/input/TextInput";
import Button from "../../components/button/Button";

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
        <div className="h-screen w-full flex items-center justify-center">
            <div className="basis-1/2 h-full md:block hidden">
                <img src="/login.jpg" className="object-cover w-full h-full" />
            </div>
            <div className="md:basis-1/2 basis-full h-full flex flex-col items-center justify-center p-3">
                <div className="w-1/3 mb-8">
                    <img src="/arvo-logo.svg" alt="Arvo Logo" />
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="w-2/3 flex flex-col items-stretch"
                >
                    <h3 className="text-2xl font-semibold">Sign In</h3>
                    <div className="flex gap-1 text-sm text-gray-500">
                        <p>Don&apos;t have an account?</p>
                        <Link
                            to="/signup"
                            className="text-arvo-blue-100 font-semibold"
                        >
                            Sign up
                        </Link>
                    </div>
                    <TextInput
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                    />
                    <PasswordInput
                        label="Password"
                        password={password}
                        handlePasswordChange={handlePasswordChange}
                    />
                    <div className="flex flex-col mt-6">
                        <Button type="submit" value="Sign In" />
                    </div>
                </form>
                {error && <div className="text-red-500">{error}</div>}
            </div>
        </div>
    );
}
