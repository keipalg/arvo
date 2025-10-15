const Sidebar = () => {
    type Tab = {
        name: string;
        path: string;
        children?: Tab[];
    };

    const tabs: Tab[] = [
        { name: "Business Dashboard", path: "/dashboard" },
        { name: "Finished Products", path: "/products" },
        { name: "Materials", path: "/materials" },
        { name: "Sales", path: "/sales" },
        {
            name: "Expenses",
            path: "/expenses",
            children: [
                { name: "Operational Expenses", path: "/expenses/operational" },
                { name: "Studio Overhead", path: "/expenses/studio-overhead" },
            ],
        },
    ];

    const renderTabs = (tabs: Tab[]) => {
        return (
            <ul className="flex flex-col">
                {tabs.map((tab) => (
                    <li key={tab.name}>
                        <a
                            href={tab.path}
                            className="block px-4 py-2 hover:bg-gray-400"
                        >
                            {tab.name}
                        </a>
                        {tab.children && (
                            <ul className="ml-4 mt-1 border-l border-gray-400">
                                {renderTabs(tab.children)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <aside className="min-w-64 min-h-screen w-64 bg-gray-300">
            <nav>{renderTabs(tabs)}</nav>
        </aside>
    );
};

export default Sidebar;
