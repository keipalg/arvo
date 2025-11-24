import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";

import { EffectCreative } from "swiper/modules";
import { useIsSmUp } from "../../utils/screenWidth";

export const Route = createFileRoute("/_public/")({
    component: Index,
});

function Index() {
    const isSmUp = useIsSmUp();

    const tabs = [
        "Business Health Dashboard",
        "Smart Cost & Revenue Management",
        "Inventory Management",
    ];
    const swiperRef = useRef<SwiperType | null>(null);

    const [openSidebar, setOpenSidebar] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(0);
    const tabRefs = useRef<HTMLDivElement[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({
        width: 0,
        left: 0,
        height: 0,
        top: 0,
    });

    useEffect(() => {
        if (tabRefs.current[selectedFeature]) {
            const node = tabRefs.current[selectedFeature];
            setIndicatorStyle({
                width: node.offsetWidth,
                left: node.offsetLeft,
                height: node.offsetHeight,
                top: node.offsetTop,
            });
        }
    }, [selectedFeature]);

    const handleSlide = (index: number) => {
        setSelectedFeature(index);
        if (swiperRef.current) {
            swiperRef.current.slideTo(index);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-x-hidden">
            {/* header */}
            <div className="fixed w-full bg-arvo-white-0 flex justify-between items-center gap-6 lg:px-10 p-5 py-8 z-100">
                <div className="lg:w-44 w-24">
                    <a href="">
                        <img src="/arvo-logo.svg" alt="" />
                    </a>
                </div>
                <div className="lg:flex flex-1 items-center justify-between hidden">
                    <div className="mr-auto">
                        <ul className="flex font-semibold">
                            <li className="px-5 py-1 border-b-2 border-transparent hover:border-arvo-blue-100">
                                <a href="#features">Features</a>
                            </li>
                            <li className="px-5 py-1 border-b-2 border-transparent hover:border-arvo-blue-100">
                                <a href="#pricing">Pricing</a>
                            </li>
                            <li className="px-5 py-1 border-b-2 border-transparent hover:border-arvo-blue-100">
                                <a href="#team">Team</a>
                            </li>
                            <li className="px-5 py-1 border-b-2 border-transparent hover:border-arvo-blue-100">
                                <a href="#contact">Contact</a>
                            </li>
                        </ul>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login">
                            <button className="font-semibold text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-40 h-12">
                                Log in
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-40 h-12">
                                Sign up
                            </button>
                        </Link>
                    </div>
                </div>
                <div
                    className="lg:hidden w-7 h-7"
                    onClick={() => setOpenSidebar(!openSidebar)}
                >
                    {openSidebar ? (
                        <img src="/icon/cross.svg" alt="" />
                    ) : (
                        <img src="/icon/menu.svg" alt="" />
                    )}
                </div>
                <div
                    className={`fixed top-20 bottom-0 right-0 bg-arvo-white-0 w-full py-6 pl-6 transition-transform duration-300 ${openSidebar ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="mr-auto">
                        <ul className="flex flex-col gap-2 font-semibold">
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <a
                                    href="#features"
                                    onClick={() => setOpenSidebar(false)}
                                >
                                    Features
                                </a>
                            </li>
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <a
                                    href="#pricing"
                                    onClick={() => setOpenSidebar(false)}
                                >
                                    Pricing
                                </a>
                            </li>
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <a
                                    href="#team"
                                    onClick={() => setOpenSidebar(false)}
                                >
                                    Team
                                </a>
                            </li>
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <a
                                    href="#contact"
                                    onClick={() => setOpenSidebar(false)}
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* hero */}
            <div className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10 h-screen">
                <div className="flex md:flex-row flex-col bg-arvo-blue-20 rounded-2xl h-full lg:pl-10 lg:py-5">
                    <div className="lg:basis-1/2 md:basis-1/3 flex flex-col justify-baseline md:mt-20 md:gap-14 gap-5 p-5">
                        <div>
                            <h1 className="font-bold text-4xl md:text-3xl lg:text-4xl xl:text-6xl text-center lg:text-left ">
                                Made for makers
                                <br />
                                who want to create,
                                <br />
                                not calculate.
                            </h1>
                            <p className="font-semibold lg:text-md xl:text-xl text-center lg:text-left md:mt-6 mt-4">
                                Arvo gives you an easier way to handle the
                                business side, so you can spend more time
                                creating.
                            </p>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <Link to="/signup">
                                <button className="font-semibold text-sm lg:text-base text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 lg:w-50 w-50 lg:h-12 h-10">
                                    Get Started
                                </button>
                            </Link>
                            <button className="font-semibold text-sm lg:text-base text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 lg:w-50 w-50 lg:h-12 h-10">
                                View Project Proposal
                            </button>
                        </div>
                    </div>
                    <div
                        className="lg:basis-1/2 md:basis-2/3 basis-full 
									md:bg-right bg-center mb-5 bg-no-repeat bg-contain
									bg-[url('/landing-page/Hero-section-mobile.svg')] 
									md:bg-[url('/landing-page/Hero-section-desktop.svg')]
								"
                    ></div>
                </div>
            </div>

            {/* voice */}
            <div className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10 md:h-screen">
                <div className="md:px-40 px-5 h-full flex flex-col justify-center items-center">
                    {isSmUp ? (
                        <img
                            src="/landing-page/Audience-story-desktop.svg"
                            alt="Hero Image"
                            className="rounded-2xl w-full h-full object-cover object-top"
                        />
                    ) : (
                        <img
                            src="/landing-page/Audience-story-mobile.svg"
                            alt="Hero Image"
                            className="rounded-2xl w-full h-full object-contain object-top"
                        />
                    )}
                </div>
            </div>

            {/* main feature */}
            <div id="features" className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10">
                <div className="">
                    <h2 className="font-bold text-3xl text-center md:mb-5 mb-2">
                        Main Feature
                    </h2>
                    {/* tabs */}
                    <div className="relative md:w-fit w-full mx-auto border md:rounded-full rounded-2xl flex md:flex-row flex-col py-1 px-3 gap-2 bg-arvo-white-100 z-50">
                        <div
                            className={`
								absolute top-1 h-8 bg-arvo-blue-100 rounded-full transition-all duration-300
								${selectedFeature === 0 ? "bg-arvo-blue-100" : ""}
								${selectedFeature === 1 ? "bg-arvo-orange-100" : ""}
								${selectedFeature === 2 ? "bg-arvo-purple-100" : ""}
								`}
                            style={{
                                width: indicatorStyle.width,
                                left: indicatorStyle.left,
                                height: indicatorStyle.height,
                                top: indicatorStyle.top,
                            }}
                        />
                        {tabs.map((tab, i) => (
                            <div
                                key={i}
                                onClick={() => handleSlide(i)}
                                ref={(el: HTMLDivElement | null) => {
                                    tabRefs.current[i] = el!;
                                }}
                                className={`relative flex-1 cursor-pointer px-4 py-2 text-center font-semibold whitespace-nowrap transition-all duration-300 ${selectedFeature === i ? "text-arvo-white-100" : "text-arvo-black-50"}`}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                    {/* swiper */}
                    <div className="md:mt-6 xl:px-40">
                        <Swiper
                            grabCursor={true}
                            effect={"creative"}
                            creativeEffect={{
                                prev: {
                                    shadow: true,
                                    translate: [0, 0, -400],
                                },
                                next: {
                                    translate: ["100%", 0, 0],
                                },
                            }}
                            modules={[EffectCreative]}
                            className="mySwiper"
                            onSwiper={(swiper) => (swiperRef.current = swiper)}
                        >
                            {/* Business Health Dashboard */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-blue-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <h3 className="lg:text-4xl md:text-2xl text-xl font-bold md:mt-10">
                                            Visualize Growth, <br />
                                            Not Just Numbers
                                        </h3>
                                        <p className="mt-4">
                                            Arvo turns your data into clear
                                            visuals of sales, costs, profits,
                                            and product performance
                                            <br className="md:hidden block" /> —
                                            making progress easy to see.
                                        </p>
                                        <div className="absolute -right-20 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute left-30 bottom-30 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute w-40 right-5 bottom-10 md:block hidden">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-3.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="basis-6/10 md:pt-10 pb-10">
                                        <div className="">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            {/* Smart Cost & Revenue Management */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-orange-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <h3 className="md:text-4xl text-2xl font-bold xl:mt-20">
                                            Know Your Cost,
                                            <br />
                                            Price with Confidence
                                        </h3>
                                        <p className="mt-4">
                                            Arvo helps you see what your work is
                                            truly worth. It connects your costs
                                            and sales, guides your pricing, and
                                            gives you more time for your craft.
                                        </p>
                                        <div className="absolute -right-20 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Metric-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute left-30 bottom-30 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Metric-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute w-40 right-0 bottom-10 md:block hidden">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-negative.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute w-50 left-10 bottom-10 md:block hidden">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Semantics.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="basis-6/10 md:pt-10 pb-10">
                                        <div className="">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            {/* Inventory Management */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-purple-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <h3 className="md:text-4xl text-2xl font-bold md:mt-20">
                                            Visualize Growth, <br />
                                            Not Just Numbers
                                        </h3>
                                        <p className="mt-4">
                                            Arvo turns your data into clear
                                            visuals of sales, costs, profits,
                                            and product performance{" "}
                                            <br className="md:hidden block" />—
                                            making progress easy to see.
                                        </p>
                                        <div className="absolute -right-20 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Negative.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute right-30 bottom-30 w-40 md:block hidden">
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute w-40 right-0 bottom-10 md:block hidden">
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="absolute w-50 left-10 bottom-10 md:block hidden">
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Semantics.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="basis-6/10 md:pt-10 pb-10">
                                        <div className="">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop.svg"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* Why It Matters */}
            <div className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10 h-screen">
                <div className="relative flex justify-between items-center md:flex-row flex-col bg-arvo-orange-50 rounded-2xl py-8 px-5 h-[calc(100%-3rem)]">
                    <div className="md:basis-1/2 md:flex md:flex-col justify-center md:p-20">
                        <h2 className="font-bold text-3xl md:text-4xl text-center md:mb-5 mb-2 md:text-left">
                            Why It Matters
                        </h2>
                        <p className="text-center md:text-left md:mt-4 mt-2 md:font-semibold md:text-2xl">
                            You juggle it all: artist, marketer, accountant, and
                            more. Arvo helps you reclaim your time, so you can
                            focus on creating instead of managing.
                        </p>
                        <div className="mt-6 text-center md:text-left">
                            <button className="font-semibold text-arvo-white-0 rounded-2xl border-2 border-arvo-blue-100 bg-arvo-blue-100 w-40 h-12">
                                Get Started
                            </button>
                        </div>
                    </div>
                    <div className="absolute -bottom-30 md:basis-1/2 flex justify-center md:right-0 md:top-0 xl:max-w-3xl max-w-lg">
                        <img
                            src="/landing-page/Why-it-matters-mobile.svg"
                            className="object-contain h-full w-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Plan */}
            <div
                id="pricing"
                className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10 md:h-screen"
            >
                <div className="flex flex-col justify-center items-center gap-2">
                    <h2 className="font-bold text-3xl text-center">
                        Pricing Plan
                    </h2>
                    <p className="text-lg font-semibold text-center">
                        Made to grow with your craft
                    </p>
                    <p className="text-center">
                        Start small, stay organized, and scale at your own pace.
                        Choose a plan that fits your making journey.
                    </p>
                </div>
                <div className="mt-10 flex flex-col md:flex-row md:items-stretch md:gap-1 gap-6 justify-center items-center px-5 md:px-10 md:bg-arvo-blue-20 md:rounded-2xl md:max-w-5xl md:mx-auto">
                    {/* Maker Start */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-10">
                        <div>
                            <span className="text-3xl font-bold">$0</span>
                            <span>/month</span>
                        </div>
                        <h3 className="text-2xl font-semibold">Maker Start</h3>
                        <p className="font-semibold">
                            A basic plan for beginners and new businesses
                            testing the platform
                        </p>
                        <ul className="flex flex-col gap-2">
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="object-contain h-full w-auto"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Limited product and material entries (e.g.,
                                    30 items each)
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Manual expense and inventory tracking
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Basic dashboard
                                </span>
                            </li>
                        </ul>
                        <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12">
                            Choose Plan
                        </button>
                    </div>
                    {/* Maker Pro */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-10">
                        <div>
                            <span className="text-3xl font-bold">$14.99</span>
                            <span>/month</span>
                        </div>
                        <h3 className="text-2xl font-semibold">Maker Pro</h3>
                        <p className="font-semibold">
                            For Independent makers with consistent sales
                        </p>
                        <ul className="flex flex-col gap-2">
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Unlimited product and material entries
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Data CSV imports and exports for tax purpose
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Integrations with Etsy, Shopify, and any
                                    additional marketplaces
                                </span>
                            </li>
                        </ul>
                        <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12">
                            Choose Plan
                        </button>
                    </div>
                    {/* Maker Studio */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-100 text-arvo-white-0 rounded-2xl p-10 shadow-arvo-blue-100 shadow-2xl w-full md:scale-105">
                        <div>
                            <span className="text-3xl font-bold">$29.99</span>
                            <span>/month</span>
                        </div>
                        <h3 className="text-2xl font-semibold">Maker Studio</h3>
                        <p className="font-semibold">
                            For Small Studios and teams
                        </p>
                        <ul className="flex flex-col gap-2">
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <div className="flex-1 breack-words">
                                    Customizable dashboard
                                    <br /> (rearrange insights, custom data
                                    filters)
                                </div>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Free AI forecasting
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Multi-user collaboration and role
                                    permissions
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Upload image or PDF receipts to sync to
                                    database
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-5 h-5">
                                    <img
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    All Pro features
                                </span>
                            </li>
                        </ul>
                        <button className="mt-10 font-semibold text-arvo-blue-100 rounded-2xl border-2 bg-arvo-white-0 w-full h-12">
                            Choose Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Team */}
            <div id="team" className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10">
                <div className="bg-arvo-blue-20 rounded-2xl p-10">
                    <div className="flex flex-col justify-center items-center gap-2">
                        <h2 className="font-bold text-3xl text-center">
                            The People Behind Arvo
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-20 mt-10 rounded-2xl gap-y-10 xl:px-30">
                        {/* Anne */}
                        <div className="md:row-1 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/anne.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Anne Calija</h3>
                            </div>
                            <div>
                                Co-Project Manager/
                                <br />
                                Full-stack Developer
                            </div>
                        </div>
                        {/* Kana */}
                        <div className="md:row-1 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/kana.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Kanako Taga</h3>
                            </div>
                            <div>
                                Co-Project Manager/
                                <br />
                                Full-stack Developer
                            </div>
                        </div>
                        {/* Keita Otsuka */}
                        <div className="md:row-1 md:col-start-3 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/keita.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Keita Otsuka</h3>
                            </div>
                            <div>Lead Full-stack Developer</div>
                        </div>
                        {/* Kanta Nagai */}
                        <div className="md:row-1 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/kanta.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Kanta Nagai</h3>
                            </div>
                            <div>Full-stack Developer</div>
                        </div>
                        {/* Unna Regino */}
                        <div className="md:row-2 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/unna.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Unna Regino</h3>
                            </div>
                            <div>Co-Lead UX/UI Designer</div>
                        </div>
                        {/* Jan Oducayen */}
                        <div className="md:row-2 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/jan.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">Jan Oducayen</h3>
                            </div>
                            <div>Co-Lead UX/UI Designer</div>
                        </div>
                        {/* Kausalya Parahitha */}
                        <div className="md:row-2 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/lya.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">
                                    Kausalya
                                    <br />
                                    Parahitha
                                </h3>
                            </div>
                            <div>UX/UI Designer</div>
                        </div>
                        {/* Pinkaew Nawanukool */}
                        <div className="md:row-2 md:col-span-4 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/mink.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">
                                    Pinkaew
                                    <br />
                                    Nawanukool
                                </h3>
                            </div>
                            <div>UX/UI Designer</div>
                        </div>
                        {/* Vaishanvi Yelai */}
                        <div className="md:row-2 md:col-span-4 col-span-2 flex flex-col justify-start items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden">
                                <img
                                    src="/landing-page/vaish.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div>
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <h3 className="font-semibold">
                                    Vaishanvi Yelai
                                </h3>
                            </div>
                            <div>UX/UI Designer</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* contact */}
            <div
                id="contact"
                className="pt-26 lg:pt-30 px-5 pb-5 lg:px-10 md:h-screen"
            >
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 h-full md:px-20">
                    <div className="md:basis-1/2 flex flex-col md:gap-10 gap-5 md:items-start items-center">
                        <div className="w-30">
                            <a href="">
                                <img src="/arvo-logo.svg" alt="" />
                            </a>
                        </div>
                        <h2 className="font-semibold md:text-4xl text-2xl md:text-left text-center">
                            Ready to run your craft <br />
                            with more clarity and <br />
                            less chaos?
                        </h2>
                        <div className="text-center md:text-left md:font-semibold text-lg">
                            <p>Have questions or want to talk? </p>
                            <p>We&#39;d love to hear from you.</p>
                        </div>
                    </div>
                    <form
                        action=""
                        className="md:basis-1/2 w-full mt-5 px-5 flex flex-col gap-5"
                    >
                        <div className="w-full flex flex-col items-start gap-2">
                            <label
                                htmlFor="name"
                                className="font-semibold text-lg"
                            >
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full border-0 border-b-2 border-gray-300 focus:border-arvo-blue-100 focus:ring-0 outline-none px-1 py-1"
                            />
                        </div>
                        <div className="w-full flex flex-col items-start gap-2">
                            <label
                                htmlFor="email"
                                className="font-semibold text-lg"
                            >
                                Email Address
                            </label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                className="w-full border-0 border-b-2 border-gray-300 focus:border-arvo-blue-100 focus:ring-0 outline-none px-1 py-1"
                            />
                        </div>
                        <div className="w-full flex flex-col items-start gap-2">
                            <label
                                htmlFor="phone"
                                className="font-semibold text-lg"
                            >
                                Phone Number (Optional)
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                className="w-full border-0 border-b-2 border-gray-300 focus:border-arvo-blue-100 focus:ring-0 outline-none px-1 py-1"
                            />
                        </div>
                        <div className="w-full flex flex-col items-start gap-2">
                            <label
                                htmlFor="message"
                                className="font-semibold text-lg"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                className="w-full border-0 border-b-2 border-gray-300 focus:border-arvo-blue-100 focus:ring-0 outline-none px-1 py-1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12"
                        >
                            Leave us a Message
                        </button>
                    </form>
                </div>
            </div>

            {/* footer */}
            <div className="bg-arvo-blue-100 text-arvo-white-0 py-6 text-center border-t-2 rounded-t-2xl mt-10">
                <div>Arvo 2025 &copy; All rights reserved.</div>
            </div>
        </div>
    );
}
