import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../../auth/auth-client";
import { PasswordInput } from "../../components/input/PasswordInput";
import TextInput from "../../components/input/TextInput";
import Button from "../../components/button/Button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";

export const Route = createFileRoute("/_public/signup")({
    component: SignUp,
});

function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsError, setPasswordsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<
        "initial" | "submitting" | "success"
    >("initial");

    const updateUserMutation = useMutation(
        trpc.user.update.mutationOptions({
            onError: () => {
                setError("Failed to Sign Up. Please try again.");
            },
        }),
    );

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setEmailError(undefined);
        setNameError(undefined);
        setPasswordsError(false);

        let error = false;

        if (email.trim() === "") {
            error = true;
            setEmailError("Email is required");
        }

        if (password !== confirmPassword) {
            setPasswordsError(true);
            error = true;
        }

        if (name.trim() === "") {
            error = true;
            setNameError("Name is required");
        }

        if (error) {
            return;
        }

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
                setSuccess("initial");
            } else {
                setSuccess("success");
                // automatically log in the user after successful signup
                const loginResult = await authClient.signIn.email({
                    email,
                    password,
                });
                if (loginResult.error) {
                    setError(
                        "Signup successful, but login failed. Please login manually.",
                    );
                    await navigate({ to: "/login" });
                } else {
                    // navigate to home page after successful login
                    updateUserMutation.mutate({ name });
                    await navigate({ to: "/dashboard" });
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Sign up failed");
            }
            setSuccess("initial");
        }
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
                    className="w-2/3 flex flex-col items-stretch"
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <h3 className="text-2xl font-semibold">Sign Up</h3>
                    <div className="flex gap-1 text-sm text-gray-500">
                        <p>Already have an account?</p>
                        <Link
                            to="/login"
                            className="text-arvo-blue-100 font-semibold"
                        >
                            Log in
                        </Link>
                    </div>
                    <TextInput
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        error={emailError}
                    />
                    <TextInput
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        type="text"
                        error={nameError}
                    />
                    <PasswordInput
                        label="Password"
                        password={password}
                        handlePasswordChange={handlePasswordChange}
                    />
                    <PasswordInput
                        label="Confirm Password"
                        password={confirmPassword}
                        handlePasswordChange={handleConfirmPasswordChange}
                        error={passwordsError}
                    />
                    <div className="flex flex-col mt-6">
                        <Button type="submit" value="Sign Up" />
                    </div>
                </form>
                {error && <div className="text-red-500">{error}</div>}
                {success == "success" && (
                    <div className="text-green-500">Sign up success</div>
                )}
            </div>
        </div>
    );
}
