import Button from "../button/Button";
import WhiteRoundButton from "../button/WhiteRoundButton";

type SetupButtonGroupProps = {
    onBack?: () => void;
    onContinue: () => void;
    continueButtonText?: string;
};

const SetupButtonGroup = ({
    onBack,
    onContinue,
    continueButtonText = "Save & Continue",
}: SetupButtonGroupProps) => {
    return (
        <div className="flex gap-4 w-full max-w-[300px] sm:max-w-2xl mx-auto justify-center text-sm sm:text-base">
            {onBack && (
                <WhiteRoundButton
                    value="Back"
                    onClick={onBack}
                    className="flex-1 px-2 py-3.5"
                />
            )}
            <Button
                value={continueButtonText}
                onClick={onContinue}
                className={onBack ? "flex-1" : "w-full sm:w-auto sm:px-20"}
            />
        </div>
    );
};

export default SetupButtonGroup;
