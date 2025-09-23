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
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const result = await authClient.signUp.email({
                email,
                name,
                password,
            });
            if (result.error) {
                setError(result.error.message || "Sign up failed");
            } else {
                setSuccess(true);
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
        <div>
            <h3>Sign Up page</h3>
            <form
                onSubmit={(e) => {
                    void handleSubmit(e);
                }}
            >
                <input
                    type="email"
                    placeholder="test@mylangara.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">Sign up success</div>}
        </div>
    );
}
