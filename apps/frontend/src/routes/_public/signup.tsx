import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../../auth/auth-client";

export const Route = createFileRoute("/_public/signup")({
    component: SignUp,
});

function SignUp() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<
        "initial" | "submitting" | "success"
    >("initial");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess("submitting");

        try {
            const result = await authClient.signUp.email({
                email,
                name,
                password,
            });
            if (result.error) {
                setError(result.error.message || "Sign up failed");
            } else {
                setSuccess("success");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Sign up failed");
            }
        }
    };

    return (
        <div className="flex justify-center">
            <div className="shadow-2xl max-w-100 text-center rounded-2xl p-5 flex flex-col gap-5">
                <h3 className="text-2xl">Sign Up</h3>
                <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <input
                        type="email"
                        className="border border-gray-300 rounded px-2"
                        placeholder="test@mylangara.ca"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="border border-gray-300 rounded px-2"
                        placeholder="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div className="flex items-center justify-between border border-gray-300 rounded px-2 has-focus:border-blue-500">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="focus:outline-none"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {showPassword ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                                onClick={() => setShowPassword(false)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                                onClick={() => setShowPassword(true)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                />
                            </svg>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-black text-white rounded py-1"
                        disabled={success == "submitting"}
                    >
                        {success == "submitting" ? "Submitting" : "Sign Up"}
                    </button>
                </form>
                {error && <div className="text-red-500">{error}</div>}
                {success == "success" && (
                    <div className="text-green-500">Sign up success</div>
                )}
            </div>
        </div>
    );
}
