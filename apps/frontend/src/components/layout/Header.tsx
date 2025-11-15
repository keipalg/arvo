import { useRef, useState } from "react";
import { NotificationBadge } from "../notification/NotificationBadge";
import { NotificationTray } from "../notification/NotificationTray";

type HeaderProps = {
    onToggleSidebar: () => void;
};

const Header = ({ onToggleSidebar }: HeaderProps) => {
    const [isTrayOpen, setIsTrayOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleTray = () => {
        setIsTrayOpen(!isTrayOpen);
    };

    const closeTray = () => {
        setIsTrayOpen(false);
    };

    return (
        <>
            <header className="flex justify-between min-h-14 h-14 min-w-full w-full">
                <div className="flex px-2 my-auto">
                    <button
                        type="button"
                        className="cursor-pointer sm:hidden"
                        onClick={onToggleSidebar}
                    >
                        <img
                            src="/icon/menu.svg"
                            alt="Menu"
                            className="w-6 h-6"
                        />
                    </button>
                </div>
                <div className="flex px-2 my-auto gap-4 mt-3">
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            type="button"
                            className="cursor-pointer"
                            onClick={toggleTray}
                        >
                            <NotificationBadge isActive={isTrayOpen} />
                        </button>
                        {isTrayOpen && (
                            <NotificationTray
                                onClose={closeTray}
                                buttonRef={buttonRef}
                            />
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
