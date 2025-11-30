type ProductImageProps = {
    imgSrc?: string;
};

const ProductImage = ({ imgSrc }: ProductImageProps) => {
    return (
        <div className="h-16 w-24 flex justify-center m-auto rounded">
            {imgSrc ? (
                <img
                    src={imgSrc}
                    alt="Product"
                    className="h-16 w-24 object-cover rounded"
                />
            ) : (
                <img
                    src="/icon/icon-photo.svg"
                    alt="No Image"
                    className="h-16 w-24 object-contain"
                />
            )}
        </div>
    );
};

export default ProductImage;
