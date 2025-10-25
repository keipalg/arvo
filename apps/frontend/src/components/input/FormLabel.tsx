type FormLabelProps = {
    label?: string;
    required?: boolean;
};

const FormLabel = ({ label, required }: FormLabelProps) => {
    return (
        <>
            {label && (
                <label className="font-semibold">
                    {label}
                    {required && <span>*</span>}
                </label>
            )}
        </>
    );
};

export default FormLabel;
