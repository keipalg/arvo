import TypeSelector from "./TypeSelector";
import { useTypeManager } from "../../utils/useTypeManager";
import { productTypeConfig } from "../../utils/typeConfigs";
import type { BaseInputProps } from "./BaseInputProps";

interface ProductTypeSelectorProps extends BaseInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const ProductTypeSelector = (props: ProductTypeSelectorProps) => {
    const { items, addItem, deleteItem } = useTypeManager(productTypeConfig);

    return (
        <TypeSelector
            {...props}
            items={items}
            onAdd={addItem}
            onDelete={deleteItem}
            placeholder="Select or type product type..."
        />
    );
};

export default ProductTypeSelector;
