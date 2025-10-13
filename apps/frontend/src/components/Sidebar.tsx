const Sidebar = () => {
    const tabs = [
        { name: "Business Dashboard", path: "/dashboard" },
        { name: "Finished Products", path: "/products" },
        { name: "Materials", path: "/materials" },
        { name: "Sales", path: "/sales" },
    ];

    return (
        <aside className="min-w-64 min-h-screen w-64 bg-gray-300">
            <nav>
                <ul className="flex flex-col">
                    {tabs.map((tab) => (
                        <li key={tab.name}>
                            <a
                                href={tab.path}
                                className="block px-4 py-2 hover:bg-gray-400"
                            >
                                {tab.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
