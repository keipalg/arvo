import Navigation from "./Navigation";
import Logo from "../logo/Logo";
import { LogoutButton } from "./Logout";
import Profile from "./Profile";

const Sidebar = () => {
    return (
        <aside className="flex flex-col justify-between min-w-64 min-h-screen w-64 bg-arvo-blue-20 p-4">
            <div>
                <Logo />
                <div className="mt-4">
                    <Navigation />
                </div>
            </div>
            <div className="flex flex-col border-t border-gray-200">
                <Profile />
                <LogoutButton />
            </div>
        </aside>
    );
};

export default Sidebar;
