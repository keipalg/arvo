const Navigation = () => {
    type Tab = {
        name: string;
        path: string;
        children?: Tab[];
    };

    const tabs: Tab[] = [
        { name: "Business Dashboard", path: "/dashboard" },
        { name: "My Products", path: "/goods" },
        { name: "Materials", path: "/materials" },
        { name: "Sales", path: "/sales" },
        {
            name: "Expenses",
            path: "/expenses",
            children: [
                { name: "Business Expenses", path: "/expenses/business" },
            ],
        },
    ];

    const renderTabs = (tabs: Tab[]) => {
        return (
            <ul className="flex flex-col gap-1">
                {tabs.map((tab) => (
                    <li key={tab.name}>
                        <a
                            href={tab.path}
                            className="block px-3 py-3 hover:bg-arvo-blue-80 hover:text-arvo-white-0 hover:rounded-xl"
                        >
                            {tab.name}
                        </a>
                        {tab.children && (
                            <ul className="flex flex-col gap-1 ml-4">
                                {renderTabs(tab.children)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return <nav>{renderTabs(tabs)}</nav>;
};

export default Navigation;
