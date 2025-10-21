const Header = () => {
    return (
        <>
            <header className="flex justify-end min-h-14 h-14 min-w-full w-full">
                <div className="flex px-2 my-auto gap-4">
                    <a href="#">
                        <img src="/icon/search.svg" alt="Search" />
                    </a>
                    <a href="#">
                        <img src="/icon/notification.svg" alt="Notification" />
                    </a>
                </div>
            </header>
        </>
    );
};

export default Header;
