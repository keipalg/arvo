export const formatPrice = (price: number) => {
    return Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
    }).format(price);
};
