import React, { useEffect } from "react";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

type BaseLayoutProps = {
    title: string;
    children: React.ReactNode;
};

const BaseLayout = ({ title, children }: BaseLayoutProps) => {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <>
            <Sidebar />
            <div className="h-screen min-h-screen flex flex-col w-full relative overflow-x-hidden">
                <main className="flex-1 overflow-auto py-4 pl-4 pr-4 md:pr-12">
                    <Header />
                    {children}
                </main>
            </div>
        </>
    );
};

export default BaseLayout;
