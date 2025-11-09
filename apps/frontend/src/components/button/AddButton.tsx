type AddButtonProps = {
    value?: string;
    type?: "submit";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
};

const AddButton = ({
    value,
    type = "submit",
    onClick,
    icon,
}: AddButtonProps) => {
    return (
        <div className="max-[960px]:fixed max-[960px]:bottom-9 max-[960px]:left-2/3 max-[640px]:left-1/2 max-[640px]:-translate-x-1/2 max-[960px]:z-10 ">
            <button
                type={type}
                className={`group rounded-2xl px-6 py-3.5 max-[960px]:rounded-full max-[960px]:p-3 max-[960px]:w-12 max-[960px]:h-12 bg-arvo-blue-100 hover:bg-arvo-blue-50 text-arvo-white-0 hover:text-arvo-black-100 cursor-pointer flex items-center gap-2 max-[960px]:gap-0 justify-center`}
                onClick={onClick}
            >
                {icon && (
                    <img
                        src={icon}
                        alt=""
                        className="h-[1em] w-auto brightness-0 invert group-hover:brightness-100 group-hover:invert-0"
                    />
                )}
                {value && <span className="max-[960px]:hidden">{value}</span>}
            </button>
        </div>
    );
};

export default AddButton;
