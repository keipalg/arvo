const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 sm:left-[240px] flex justify-center items-center">
            <div className="absolute top-1/3">
                <video autoPlay loop muted playsInline className="w-32 h-32">
                    <source src="/video/loading.webm" type="video/webm" />
                </video>
            </div>
        </div>
    );
};

export default LoadingSpinner;
