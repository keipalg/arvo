import { useState, useEffect, useRef } from "react";
import FormLabel from "./FormLabel";
import TypeBadge from "../badge/TypeBadge";
import type { BaseInputProps } from "./BaseInputProps";
import type { TypeItem } from "../../utils/useTypeManager";

interface TypeSelectorProps extends BaseInputProps {
    items: TypeItem[];
    onAdd: (data: { name: string }) => Promise<{ id: string }> | void;
    onDelete: (data: { id: string }) => void;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    canDelete?: boolean;
    canAdd?: boolean;
    placeholder?: string;
    requireid?: boolean;
}

const TypeSelector = ({
    label,
    items,
    onAdd,
    onDelete,
    value,
    onChange,
    required,
    error,
    canDelete = true,
    canAdd = true,
    placeholder = "Select or type...",
}: TypeSelectorProps) => {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    const selectedType = items.find((item) => item.id === value);
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(inputValue.toLowerCase()),
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (selectedType && e.target.value !== selectedType.name) {
            onChange("");
        }
    };

    const handleInputKeyDown = async (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Enter" && inputValue.trim() && canAdd) {
            e.preventDefault();
            const existingItem = items.find(
                (item) => item.name.toLowerCase() === inputValue.toLowerCase(),
            );

            if (existingItem) {
                onChange(existingItem.id);
                setInputValue(existingItem.name);
                setIsOpen(false);
            } else {
                const result = await onAdd({ name: inputValue.trim() });
                if (result?.id) {
                    onChange(result.id);
                    setInputValue(inputValue.trim());
                    setIsOpen(false);
                }
            }
        }
    };

    const handleSelect = (itemId: string) => {
        const selectedItem = items.find((item) => item.id === itemId);
        onChange(itemId);
        setInputValue(selectedItem?.name || "");
        setIsOpen(false);
    };

    const handleDelete = (itemId: string) => {
        onDelete({ id: itemId });
        if (value === itemId) {
            onChange("");
        }
    };

    useEffect(() => {
        if (inputValue && !value && isOpen) {
            const matchingItem = items.find(
                (item) => item.name.toLowerCase() === inputValue.toLowerCase(),
            );
            if (matchingItem) {
                onChange(matchingItem.id);
            }
        }
    }, [items, inputValue, value, onChange, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectorRef.current &&
                !selectorRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen && selectedType && !inputValue) {
            setInputValue(selectedType.name);
        }
    }, [selectedType, isOpen, inputValue]);

    useEffect(() => {
        if (!value) {
            setInputValue("");
        }
    }, [value]);

    return (
        <div>
            <FormLabel label={label} required={required} />
            <div ref={selectorRef} className="relative">
                <input
                    type="text"
                    value={
                        isOpen
                            ? inputValue
                            : inputValue || selectedType?.name || ""
                    }
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        handleInputKeyDown(e).catch(console.error);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        if (selectedType && inputValue === selectedType.name) {
                            setInputValue("");
                        }
                    }}
                    placeholder={placeholder}
                    className="border rounded-xl focus:outline-2 outline-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 w-full"
                />

                {isOpen && (
                    <div className="absolute mt-1.5 z-10 bg-arvo-white-0 w-full rounded-xl outline-arvo-blue-100 outline-2 overflow-clip max-h-60 overflow-y-auto">
                        {filteredItems.map((item, i) => (
                            <TypeBadge
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                onSelect={handleSelect}
                                onDelete={handleDelete}
                                isSelected={item.id === value}
                                canDelete={canDelete}
                                index={i}
                                isUsed={Boolean(item.isUsed)}
                            />
                        ))}

                        {canAdd &&
                            inputValue &&
                            !filteredItems.some(
                                (item) =>
                                    item.name.toLowerCase() ===
                                    inputValue.toLowerCase(),
                            ) && (
                                <div className="p-2 text-arvo-blue-100 border-t border-arvo-black-5">
                                    Press Enter to add {'"'}
                                    {inputValue}
                                    {'"'}
                                </div>
                            )}

                        {filteredItems.length === 0 && !inputValue && (
                            <div className="p-2 text-gray-500">
                                No items found
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default TypeSelector;
