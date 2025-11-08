import ToolTip from "../toolTip/ToolTip.tsx";

type FormLabelProps = {
    label?: string;
    required?: boolean;
    info?: string;
};

const FormLabel = ({ label, required, info }: FormLabelProps) => {
    return (
        <div className="flex">
            {label && (
                <label className="font-semibold pt-3 pb-1.5">
                    {label}
                    {required && <span>*</span>}
                </label>
            )}
            {info && <ToolTip info={info} iconStyle="w-[11px] pt-3.5 mx-2" />}
        </div>
    );
};

export default FormLabel;
