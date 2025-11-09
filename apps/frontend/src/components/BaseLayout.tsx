import React, { useEffect } from "react";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

type BaseLayoutProps = {
    title: string;
    children: React.ReactNode;
};

const BaseLayout = ({ title, children }: BaseLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    useEffect(() => {
        document.title = title;
    }, [title]);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="mx-auto max-w-[1920px] w-full flex">
            <Sidebar
                isOpen={isSidebarOpen}
                onToggleSidebar={() => handleToggleSidebar()}
            />
            <div className="h-screen min-h-screen flex flex-col flex-1 relative overflow-x-hidden">
                <main className="flex-1 overflow-auto py-4 pl-4 pr-4 md:pr-12">
                    <Header onToggleSidebar={() => handleToggleSidebar()} />
                    {children}
                </main>
            </div>
        </div>
    );
};

export default BaseLayout;
