import TypeSelector from "./TypeSelector";
import { useTypeManager } from "../../utils/useTypeManager";
import { productTypeConfig } from "../../utils/typeConfigs";
import type { BaseInputProps } from "./BaseInputProps";

interface ProductTypeSelectorProps extends BaseInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const ProductTypeSelector = (props: ProductTypeSelectorProps) => {
    const { items, addItem, deleteItem } = useTypeManager(productTypeConfig);

    const handleAdd = async (data: { name: string }) => {
        const newItem = (await addItem(data)) as { id: string };
        if (newItem?.id) {
            props.onChange(newItem.id);
        }
    };

    return (
        <TypeSelector
            {...props}
            items={items}
            onAdd={handleAdd}
            onDelete={deleteItem}
            placeholder="Select or type product type..."
        />
    );
};

export default ProductTypeSelector;
