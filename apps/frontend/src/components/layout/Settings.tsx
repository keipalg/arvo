const Settings = () => {
    return (
        <a href="/settings">
            <div className="px-3 py-3 flex items-center gap-2 hover:bg-arvo-blue-50 hover:rounded-xl cursor-pointer">
                <img
                    src="/icon/settings.svg"
                    alt="Settings"
                    className="w-8 h-8 max-sm:w-10 max-sm:h-10"
                />
                <div>Settings</div>
            </div>
        </a>
    );
};

export default Settings;
