import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDateForInputField } from "../../utils/dateFormatter";
import FormLabel from "./FormLabel";

type DatePickerProps = {
    label?: string;
    name?: string;
    value: string; // ISO date string (YYYY-MM-DD)
    onChange: (value: string) => void; // Returns ISO date string
    error?: string;
    placeholder?: string;
    required?: boolean;
};

const DatePicker = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder = "Select date",
    required,
}: DatePickerProps) => {
    // Convert to Date object
    const selectedDate = value ? new Date(value) : null;

    const handleChange = (date: Date | null) => {
        if (date) {
            onChange(getDateForInputField(date));
        } else {
            onChange("");
        }
    };

    const handleClear = () => {
        onChange("");
    };

    const handleToday = () => {
        onChange(getDateForInputField(new Date()));
    };

    return (
        <div className="flex flex-col pb-2">
            <FormLabel label={label} required={required} />
            <div className="relative w-full">
                <ReactDatePicker
                    selected={selectedDate}
                    onChange={handleChange}
                    dateFormat="MMM. d, yyyy" // Display format: Oct. 28, 2025
                    placeholderText={placeholder}
                    name={name}
                    className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 pr-10 bg-arvo-white-0 border-arvo-black-5 w-full"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                >
                    <div className="flex justify-between items-center px-3 pb-2 border-t border-arvo-black-5 pt-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-sm sm:text-sm text-arvo-black-50 hover:text-arvo-black-100 cursor-pointer py-1 px-2 -ml-2 rounded hover:bg-arvo-black-5"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            className="text-sm sm:text-sm text-arvo-blue-100 hover:text-arvo-black-100 font-semibold cursor-pointer py-1 px-2 -mr-2 rounded hover:bg-arvo-blue-50"
                        >
                            Today
                        </button>
                    </div>
                </ReactDatePicker>
                <img
                    src="/icon/calendar.svg"
                    alt="Calendar"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />
            </div>
            {error && <div className="text-arvo-red-100 text-sm">{error}</div>}
        </div>
    );
};

export default DatePicker;
