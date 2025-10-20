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
            <div className="px-3 py-3 gap-2 flex items-center hover:bg-arvo-blue-80 hover:text-arvo-white-0 hover:rounded-xl cursor-pointer">
                <img src="icon/logout.svg" className="w-6 h-6"></img>
                <button
                    // Event handler
                    onClick={() => void handleLogout()}
                    //  If logout is successed,button will be disabled
                    disabled={isLoggingOut}
                    className="text-left cursor-pointer"
                >
                    {/*If expression for during logging out and before logging out*/}
                    {isLoggingOut ? "Logging Out..." : "Logout"}
                </button>
            </div>
        </>
    );
};
