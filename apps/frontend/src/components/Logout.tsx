import { useState } from "react";
import { authClient } from "../auth/auth-client";
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
        <button
            // Event handler
            onClick={() => void handleLogout()}
            //  If logout is successed,button will be disabled
            disabled={isLoggingOut}
            className="bg-black text-white px-2 mx-2 rounded-xl"
        >
            {/*If expression for during logging out and before logging out*/}
            {isLoggingOut ? "Logging Out..." : "Logout"}
        </button>
    );
};
