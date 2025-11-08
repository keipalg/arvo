import ToolTip from "../toolTip/ToolTip";

type PageTitleProps = {
    title: string;
    info?: string;
};

const PageTitle = ({ title, info }: PageTitleProps) => {
    return (
        <div className="flex items-center gap-2">
            <h1 className="font-bold md:text-4xl text-2xl ">{title}</h1>
            {info && <ToolTip info={info} />}
        </div>
    );
};

export default PageTitle;
