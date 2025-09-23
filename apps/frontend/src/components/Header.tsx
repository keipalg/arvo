type HeaderProps = {
    title: string;
};

const Header = ({ title }: HeaderProps) => {
    return (
        <header className="min-w-full min-h-14 w-full bg-gray-300">
            {title}
        </header>
    );
};

export default Header;
