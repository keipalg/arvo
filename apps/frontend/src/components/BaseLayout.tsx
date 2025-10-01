import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

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
            <Header title={title}></Header>
            <div className="min-h-screen flex flex-row">
                <Sidebar />
                {children}
            </div>
        </>
    );
};

export default BaseLayout;
