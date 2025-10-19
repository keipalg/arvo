import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
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
            <div className="min-h-screen flex flex-row relative overflow-x-hidden">
                <Sidebar />
                <main>{children}</main>
            </div>
            <Footer />
        </>
    );
};

export default BaseLayout;
