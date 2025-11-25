import { useState } from "react";
import { authClient } from "../../auth/auth-client";
import { useNavigate } from "@tanstack/react-router";

// Function for logout button
export const LogoutButton = () => {
    // Define login status
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // hook for navigate to different page
    const navigate = useNavigate();

    // Function for handle logout
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            // If it's successed, logout and move back to login screen
            await authClient.signOut();
            await navigate({ to: "/login" });
        } catch (error) {
            // If it's failed, return error
            console.error("Logout error", error);
            alert("Failed to log out. Please try again.");
        } finally {
            // Back to default value
            setIsLoggingOut(false);
        }
    };
    // Return React component for logout button.
    return (
        <>
            <button
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="group w-full px-3 py-3 gap-2 flex items-center hover:bg-arvo-blue-50
                hover:rounded-xl cursor-pointer text-left text-arvo-black-50 hover:text-black"
            >
                <img
                    src="/icon/logout.svg"
                    className="w-8 h-8 max-sm:w-10 max-sm:h-10 group-hover:brightness-0"
                ></img>
                <div>
                    {/*If expression for during logging out and before logging out*/}
                    {isLoggingOut ? "Logging Out..." : "Log Out"}
                </div>
            </button>
        </>
    );
};
