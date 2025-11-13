type TableSearchProps = {
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TableSearch = ({
    placeholder = "Search",
    onChange,
}: TableSearchProps) => {
    return (
        <div className="relative w-full">
            <input
                type="text"
                onChange={onChange}
                className="w-full border rounded-md focus:border-arvo-blue-100 px-2.5 py-2 bg-arvo-white-0 border-arvo-black-5"
                placeholder={placeholder}
            />
            <img
                src="/icon/search.svg"
                alt="Search"
                className="absolute w-6 end-2 top-1/2 -translate-y-1/2"
            />
        </div>
    );
};

export default TableSearch;
