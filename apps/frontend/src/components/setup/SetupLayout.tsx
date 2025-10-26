import Button from "../button/Button";
import Logo from "../logo/Logo";

type SetupLayoutProps = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onBack?: () => void;
    onContinue: () => void;
    caption?: string;
};

const SetupLayout = ({
    title,
    subtitle,
    children,
    onBack,
    onContinue,
    caption,
}: SetupLayoutProps) => {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <header className="w-full flex justify-start items-center px-6 py-4">
                <Logo />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full gap-6">
                <h1 className="text-center font-bold text-4xl">{title}</h1>

                <p className="text-center text-xl">{subtitle}</p>

                <div className="w-full">{children}</div>

                {caption && <p className="text-center">{caption}</p>}

                <div className="flex gap-4 w-full justify-center">
                    {onBack && <Button value="Back" onClick={onBack} />}
                    <Button value="Save & Continue" onClick={onContinue} />
                </div>
            </div>
        </div>
    );
};

export default SetupLayout;
