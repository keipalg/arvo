import Logo from "../logo/Logo";
import SetupButtonGroup from "./SetupButtonGroup";

type SetupLayoutProps = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onBack?: () => void;
    onContinue: () => void;
    caption?: string;
    continueButtonText?: string;
};

const SetupLayout = ({
    title,
    subtitle,
    children,
    onBack,
    onContinue,
    caption,
    continueButtonText = "Save & Continue",
}: SetupLayoutProps) => {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <header className="w-full flex justify-start items-center px-6 py-4">
                <Logo />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl lg:max-w-5xl mx-auto w-full gap-6">
                <h1 className="text-center font-bold text-4xl">{title}</h1>

                <p className="text-center text-xl">{subtitle}</p>

                <div className="w-full">{children}</div>

                {caption && <p className="text-center">{caption}</p>}

                <SetupButtonGroup
                    onBack={onBack}
                    onContinue={onContinue}
                    continueButtonText={continueButtonText}
                />
            </div>
        </div>
    );
};

export default SetupLayout;
