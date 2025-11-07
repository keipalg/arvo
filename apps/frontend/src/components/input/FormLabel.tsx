type FormLabelProps = {
    label?: string;
    required?: boolean;
};

const FormLabel = ({ label, required }: FormLabelProps) => {
    return (
        <>
            {label && (
                <label className="font-semibold pt-3 pb-1.5">
                    {label}
                    {required && <span>*</span>}
                </label>
            )}
        </>
    );
};

export default FormLabel;
