const Sidebar = () => {
    const tabs = [
        { name: "Business Dashboard" },
        { name: "Finished Products" },
        { name: "Supplies" },
        { name: "Sales" },
    ];

    return (
        <aside className="min-w-64 min-h-screen w-64 bg-gray-300">
            <nav>
                <ul className="flex flex-col">
                    {tabs.map((tab) => (
                        <li key={tab.name}>
                            <a
                                href="#"
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
