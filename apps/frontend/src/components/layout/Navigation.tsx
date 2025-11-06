import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

type Tab = {
    name: string;
    path: string;
    icon: string;
    children?: Tab[];
};

const tabs: Tab[] = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "/icon/dashboard.svg",
    },
    {
        name: "My Materials",
        path: "/materials",
        icon: "/icon/my-materials.svg",
    },
    {
        name: "My Products",
        path: "/goods",
        icon: "/icon/my-products.svg",
        children: [
            {
                name: "Product List",
                path: "/goods",
                icon: "/icon/product-list.svg",
            },
            {
                name: "Batch Production",
                path: "/goods/productionBatch",
                icon: "/icon/batch-production.svg",
            },
        ],
    },
    { name: "Sales", path: "/sales", icon: "/icon/sales.svg" },
    {
        name: "Expenses",
        path: "/expenses/usedMaterials",
        icon: "/icon/expenses.svg",
        children: [
            {
                name: "Material Expenses",
                path: "/expenses/usedMaterials",
                icon: "/icon/material-expenses.svg",
            },
            {
                name: "Business Expenses",
                path: "/expenses/business",
                icon: "/icon/business-expenses.svg",
            },
        ],
    },
];

const Navigation = () => {
    const [expandedParentTabName, setExpandedParentTabName] = useState<
        string | null
    >(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const autoExpandParentOfActivePage = () => {
            const activeParentTab = tabs.find((parentTab) => {
                if (parentTab.children) {
                    return parentTab.children.some(
                        (childTab) => childTab.path === location.pathname,
                    );
                }
                return false;
            });

            const newParentTab = activeParentTab ? activeParentTab.name : null;

            setExpandedParentTabName((prevParentTab) => {
                if (prevParentTab === newParentTab) {
                    return prevParentTab;
                }
                return newParentTab;
            });
        };

        autoExpandParentOfActivePage();
    }, [location.pathname]);

    const isTabActive = (tabToCheck: Tab): boolean => {
        // If tab is a parent, it is not never going to be active
        if (tabToCheck.children && tabToCheck.children.length > 0) {
            return false;
        }

        // For non-parent & all children ttabs, it will be active
        return location.pathname === tabToCheck.path;
    };

    const handleTabClick = (clickedTab: Tab) => {
        const hasChildren =
            clickedTab.children && clickedTab.children.length > 0;

        if (hasChildren) {
            const isCurrentlyExpanded =
                expandedParentTabName === clickedTab.name;

            if (isCurrentlyExpanded) {
                setExpandedParentTabName(null);
            } else {
                const firstChildPath = clickedTab.children![0].path;
                setExpandedParentTabName(clickedTab.name);
                void navigate({ to: firstChildPath });
            }
        } else {
            void navigate({ to: clickedTab.path });
        }
    };

    return (
        <nav>
            <ul className="flex flex-col gap-0.5">
                {tabs.map((menuTab) => {
                    const hasChildren =
                        menuTab.children && menuTab.children.length > 0;
                    const isExpanded = expandedParentTabName === menuTab.name;
                    const isActive = isTabActive(menuTab);

                    return (
                        <li key={menuTab.name}>
                            <div
                                className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer ${
                                    isActive
                                        ? "bg-arvo-blue-100 text-white"
                                        : "hover:bg-arvo-blue-50 hover:text-arvo-black-100"
                                }`}
                                onClick={() => handleTabClick(menuTab)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={menuTab.icon}
                                        alt={menuTab.name}
                                        className={`w-8 h-8 max-sm:w-10 max-sm:h-10 ${
                                            isActive
                                                ? "brightness-0 invert"
                                                : "group-hover:brightness-0"
                                        }`}
                                    />
                                    <span>{menuTab.name}</span>
                                </div>

                                {hasChildren && (
                                    <img
                                        src={
                                            isExpanded
                                                ? "/icon/arrow-alt-down.svg"
                                                : "/icon/arrow-alt-right.svg"
                                        }
                                        alt={isExpanded ? "Collapse" : "Expand"}
                                        className="w-8 h-8"
                                    />
                                )}
                            </div>

                            {hasChildren && isExpanded && (
                                <ul className="flex flex-col gap-1 mt-1">
                                    {menuTab.children!.map((childTab) => {
                                        const isChildActive =
                                            location.pathname === childTab.path;
                                        return (
                                            <li
                                                key={childTab.name}
                                                className={`group flex items-center gap-3 px-3 py-3 pl-8 rounded-xl cursor-pointer ${
                                                    isChildActive
                                                        ? "bg-arvo-blue-100 text-white"
                                                        : "hover:bg-arvo-blue-50 hover:text-arvo-black-100"
                                                }`}
                                                onClick={() =>
                                                    void navigate({
                                                        to: childTab.path,
                                                    })
                                                }
                                            >
                                                <img
                                                    src={childTab.icon}
                                                    alt={childTab.name}
                                                    className={`w-8 h-8 max-sm:w-10 max-sm:h-10 ${
                                                        isChildActive
                                                            ? "brightness-0 invert"
                                                            : "group-hover:brightness-0"
                                                    }`}
                                                />
                                                <span className="max-sm:text-lg">
                                                    {childTab.name}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Navigation;
