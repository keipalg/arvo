type PageTitleProps = {
    title: string;
    info?: string;
};

const PageTitle = ({ title, info }: PageTitleProps) => {
    return (
        <div className="flex items-center gap-2">
            <h1 className="font-bold text-4xl">{title}</h1>
            {info && (
                <div className="group relative">
                    <img
                        src="/icon/info.svg"
                        alt="Info"
                        className="w-6 h-6 cursor-help"
                    />
                    <div className="invisible group-hover:visible absolute left-full ml-2 top-0 w-64 bg-arvo-black-5 border border-arvo-black-100 rounded-lg px-3 py-2 z-10">
                        {info}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageTitle;
