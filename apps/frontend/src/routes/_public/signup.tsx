import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../../auth/auth-client";
import { PasswordInput } from "../../components/input/PasswordInput";

export const Route = createFileRoute("/_public/signup")({
    component: SignUp,
});

function SignUp() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
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
        <div className="fixed inset-0 flex justify-center items-center p-4">
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
                    <PasswordInput
                        password={password}
                        setPassword={setPassword}
                    />

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
