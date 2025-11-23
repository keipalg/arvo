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
            className={`flex flex-col justify-between min-h-screen text-lg max-sm:text-xl max-sm:fixed max-sm:top-0 max-sm:left-0 min-w-full sm:min-w-78 z-[10000] bg-arvo-blue-20 p-4 transform transition-transform
            ${isOpen ? "max-sm:translate-0" : "max-sm:-translate-x-full"}`}
        >
            <div>
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="sm:hidden fixed left-2 top-2 max-sm:mt-6 max-sm:ml-4"
                >
                    <img
                        src="/icon/close.svg"
                        alt="Close"
                        className="w-6 h-6"
                    />
                </button>
                <div className="max-sm:hidden">
                    <Logo />
                </div>
                <div className="mt-16">
                    <Navigation />
                </div>
            </div>
            <div className="flex flex-col gap-0.5">
                <div className="mb-8">
                    <LogoutButton />
                </div>
                <div className="mb-8 border-t-2 border-arvo-black-5">
                    <Profile />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
