import TypeSelector from "./TypeSelector";
import { useTypeManager } from "../../utils/useTypeManager";
import { materialTypeConfig } from "../../utils/typeConfigs";
import type { BaseInputProps } from "./BaseInputProps";

interface MaterialTypeSelectorProps extends BaseInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const MaterialTypeSelector = (props: MaterialTypeSelectorProps) => {
    const { items, addItem, deleteItem } = useTypeManager(materialTypeConfig);

    return (
        <TypeSelector
            {...props}
            items={items}
            onAdd={addItem}
            onDelete={deleteItem}
            placeholder="Select or type material type..."
        />
    );
};

export default MaterialTypeSelector;
