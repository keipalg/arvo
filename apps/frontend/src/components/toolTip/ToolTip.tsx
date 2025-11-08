import { useState, useEffect, useRef } from "react";

type ToolTipProps = {
    info: string;
    iconStyle?: string;
    boxStyle?: string;
};

const ToolTip = ({ info, iconStyle, boxStyle }: ToolTipProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (
                tooltipRef.current &&
                event.target &&
                !tooltipRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="group relative" ref={tooltipRef}>
            <img
                src="../../../public/icon/info.svg"
                alt="Info"
                className={`min-w-5 cursor-help p-0 ${iconStyle ? iconStyle : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            />
            <div
                className={`
             ${isOpen ? "visible opacity-100" : "invisible opacity-0"}
            invisible  group-hover:visible absolute ml-2 w-72  bg-arvo-blue-20 border border-arvo-blue-80 rounded-2xl text font-semibold text-base p-4 z-10 shadow-lg opacity-0  group-hover:opacity-100 transition-all duration-300 ease-in-out${!boxStyle ? "top-full left-1/2 -translate-x-1/2 mt-2 " : boxStyle}
             `}
            >
                {info}
            </div>
        </div>
    );
};

export default ToolTip;
