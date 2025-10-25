import Navigation from "./Navigation";
import Logo from "../logo/Logo";
import { LogoutButton } from "./Logout";
import Profile from "./Profile";

type SideBarProps = {
    isOpen: boolean;
    onToggleSidebar: () => void;
};

const Sidebar = ({ isOpen, onToggleSidebar }: SideBarProps) => {
    return (
        <aside
            className={`flex flex-col justify-between min-h-screen max-sm:fixed max-sm:top-0 max-sm:left-0 min-w-full sm:min-w-64 z-10 bg-arvo-blue-20 p-4 transform transition-transform
            ${isOpen ? "max-sm:translate-0" : "max-sm:-translate-x-full"}`}
        >
            <div>
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="sm:hidden fixed right-4"
                >
                    <img src="/icon/close.svg" alt="Close" className="w-6" />
                </button>
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
