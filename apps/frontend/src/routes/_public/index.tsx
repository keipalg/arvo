import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";

import { EffectCoverflow, EffectCreative, Pagination } from "swiper/modules";
import { useIsSmUp } from "../../utils/screenWidth";

import {
    easeOut,
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";

export const Route = createFileRoute("/_public/")({
    component: Index,
});

function Index() {
    const isSmUp = useIsSmUp();

    const tabs = [
        "Inventory Management",
        "Cost & Revenue Management",
        "Business Health Dashboard",
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

    /* ************************** */
    /* Entire Scroll Container  */
    /* ************************** */
    const scrollContainerRef = useRef(null);

    /* ************************** */
    /* Hero Animation */
    /* ************************** */
    const heroRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: heroScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: heroRef,
        offset: ["start", "end start"],
    });
    const heroY = useTransform(heroScrollProgress, [0, 1], [0, 500]);
    const heroScale = useTransform(heroScrollProgress, [0, 1], [1, 2]);
    const heroOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
    const heroBlur = useTransform(heroScrollProgress, [0, 1], [0, 10]);

    const hero_h1 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.75,
                ease: easeOut,
                delay: 0.25,
            },
        },
    };

    const hero_p = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.75,
                ease: easeOut,
                delay: 0.5,
            },
        },
    };

    const hero_btns = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.75,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };

    const hero_img = {
        hidden: {
            opacity: 0,
            scale: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            scale: [0, 1.25, 1],
            y: 0,
            transition: {
                duration: 2,
                ease: easeOut,
                delay: 1,
            },
        },
    };

    /* ************************** */
    /* Voice Animation */
    /* ************************** */
    const voiceRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: voiceScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: voiceRef,
        offset: ["start center", "end center"],
    });
    const voiceOpacity = useTransform(voiceScrollProgress, [0, 0.5], [0, 1]);

    /* ************************** */
    /* Feature Animation */
    /* ************************** */
    const featureRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: featureScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: featureRef,
        offset: ["start center", "end center"],
    });
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    useMotionValueEvent(featureScrollProgress, "change", (latest) => {
        if (latest >= 0.33 && latest < 1) {
            setActiveIndex(activeIndex == null ? 0 : activeIndex);
        } else {
            setActiveIndex(null);
            setSelectedFeature(0);
            swiperRef?.current?.slideTo(0);
        }
    });

    /* ************************** */
    /* Why It Matters Animation */
    /* ************************** */
    const whyItMattersRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: whyItMattersScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: whyItMattersRef,
        offset: ["start start", "end start"],
    });
    const [hasAnimated, setHasAnimated] = useState(false);
    useMotionValueEvent(whyItMattersScrollProgress, "change", (v) => {
        setHasAnimated(v > 0 && v < 1);
    });

    const whyItMattersTextRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: whyItMattersScrollProgressText } = useScroll({
        container: scrollContainerRef,
        target: whyItMattersTextRef,
        offset: ["start center", "end start"],
    });
    const [hasAnimatedForText, setHasAnimatedForText] = useState(false);
    useMotionValueEvent(whyItMattersScrollProgressText, "change", (v) => {
        setHasAnimatedForText(v > 0 && v < 1);
    });

    const whyItMatters_img = {
        hidden: {
            opacity: 0,
            scale: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            scale: [1.2, 1],
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
            },
        },
    };
    const whyItMatters_h2 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.25,
            },
        },
    };
    const whyItMatters_p = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.5,
            },
        },
    };
    const whyItMatters_div = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };

    /* ************************** */
    /* Pricing Animation */
    /* ************************** */
    const pricingRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: pricingScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: pricingRef,
        offset: ["start center", "end start"],
    });
    const [hasAnimatedForPricing, setHasAnimatedForPricing] = useState(false);
    useMotionValueEvent(pricingScrollProgress, "change", (latest) => {
        console.log("latest:", latest);
        if (latest > 0 && latest < 1) {
            setHasAnimatedForPricing(true);
        } else {
            setHasAnimatedForPricing(false);
        }
    });
    const pricing_h2 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.25,
            },
        },
    };
    const pricing_p1 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.5,
            },
        },
    };
    const pricing_p2 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };
    const pricing_div = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };

    /* ************************** */
    /* Team Animation */
    /* ************************** */
    const teamRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: teamScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: teamRef,
        offset: ["start center", "end start"],
    });
    const [hasAnimatedForTeam, setHasAnimatedForTeam] = useState(false);
    useMotionValueEvent(teamScrollProgress, "change", (latest) => {
        console.log("latest:", latest);
        if (latest > 0 && latest < 1) {
            setHasAnimatedForTeam(true);
        } else {
            setHasAnimatedForTeam(false);
        }
    });
    const team_h2 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.25,
            },
        },
    };
    const team_parent = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.25,
            },
        },
    };
    const team_card = {
        hidden: { opacity: 0, scale: 1.2 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1,
                ease: easeOut,
            },
        },
    };

    /* ************************** */
    /* Behind Scene Animation */
    /* ************************** */
    const behindSceneRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: behindSceneScrollProgress } = useScroll({
        container: scrollContainerRef,
        target: behindSceneRef,
        offset: ["start center", "end start"],
    });
    const [hasAnimatedForBehindScene, setHasAnimatedForBehindScene] =
        useState(false);
    useMotionValueEvent(behindSceneScrollProgress, "change", (latest) => {
        console.log("latest:", latest);
        if (latest > 0 && latest < 1) {
            setHasAnimatedForBehindScene(true);
        } else {
            setHasAnimatedForBehindScene(false);
        }
    });
    const behind_scene_h2 = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.25,
            },
        },
    };
    const behind_scene_p = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.5,
            },
        },
    };
    const behind_scene_buttons = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };
    const behind_scene_img = {
        hidden: {
            opacity: 0,
            scale: 1.2,
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1,
                ease: easeOut,
                delay: 0.75,
            },
        },
    };

    return (
        <div
            className="relative h-screen w-full overflow-x-hidden"
            ref={scrollContainerRef}
        >
            {/* header */}
            <div className="fixed w-full bg-arvo-white-0 flex justify-between items-center gap-6 lg:px-10 p-5 py-5 z-100">
                <div className="lg:w-44 w-24">
                    <a href="">
                        <img
                            src="/landing-page/arvo-logo.png"
                            className="md:hidden block"
                            alt=""
                        />
                        <img
                            src="/arvo-logo.svg"
                            className="md:block hidden"
                            alt=""
                        />
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
                            <button className="font-semibold text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-40 h-12 cursor-pointer">
                                Log in
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-40 h-12 cursor-pointer cursor-pointer">
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
                    className={`fixed top-17 bottom-0 right-0 bg-arvo-white-0 w-full py-6 pl-6 transition-transform duration-300 ${openSidebar ? "translate-x-0" : "translate-x-full"}`}
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
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <Link to="/login">Log in</Link>
                            </li>
                            <li className="py-3 pl-3 border-b-2 border-arvo-blue-100">
                                <Link to="/signup">Sign up</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* hero */}
            <div
                className="relative pt-17 lg:pt-30 px-4 pb-5 lg:px-10 h-[100dvh]"
                ref={heroRef}
            >
                <motion.div
                    className="flex md:flex-row flex-col bg-arvo-blue-20 rounded-2xl h-full lg:pl-10 lg:py-5"
                    style={{
                        scale: heroScale,
                        opacity: heroOpacity,
                        filter: heroBlur,
                        y: heroY,
                    }}
                >
                    <div className="lg:basis-1/2 md:basis-1/3 flex flex-col justify-baseline md:mt-20 md:gap-14 gap-5 p-5">
                        <div>
                            <motion.h1
                                className="font-bold text-3xl md:text-3xl lg:text-4xl xl:text-6xl text-center lg:text-left overflow-hidden"
                                variants={hero_h1}
                                initial="hidden"
                                animate="visible"
                            >
                                Made for makers
                                <br />
                                who want to create,
                                <br />
                                not calculate.
                            </motion.h1>
                            <motion.p
                                className="font-semibold lg:text-md xl:text-xl text-center lg:text-left md:mt-6 mt-4"
                                variants={hero_p}
                                initial="hidden"
                                animate="visible"
                            >
                                <Link to="/">
                                    <span className="text-arvo-blue-100">
                                        Arvo{" "}
                                    </span>
                                </Link>
                                gives you an easier way to handle the business
                                side, so you can spend more time creating.
                            </motion.p>
                        </div>
                        <motion.div
                            className="flex flex-col lg:flex-row items-center gap-4"
                            variants={hero_btns}
                            initial="hidden"
                            animate="visible"
                        >
                            <Link to="/signup">
                                <button className="font-semibold text-sm lg:text-base text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 lg:w-50 w-50 lg:h-12 h-10 cursor-pointer">
                                    Get Started
                                </button>
                            </Link>
                            <Link
                                to="https://drive.google.com/file/d/1tiNOqH6p8EOOA5wllfdb1mBgMzu4Ic1I/view"
                                target="_blank"
                            >
                                <button className="font-semibold text-sm lg:text-base text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 lg:w-50 w-50 lg:h-12 h-10 cursor-pointer">
                                    View Project Proposal
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                    <motion.div
                        className="lg:basis-1/2 md:basis-2/3 basis-full 
									md:bg-right bg-center mb-5 bg-no-repeat bg-contain
									bg-[url('/landing-page/Hero-page.png')] 
									md:bg-[url('/landing-page/Hero-section-desktop.svg')]
								"
                        initial="hidden"
                        animate="visible"
                        variants={hero_img}
                    />
                </motion.div>
            </div>

            {/* voice */}
            <motion.div
                className="py-10 lg:pt-30 px-4 lg:px-10 max-w-5xl mx-auto"
                ref={voiceRef}
                initial="hidden"
                animate="visible"
                style={{
                    opacity: voiceOpacity,
                }}
            >
                <div className="md:px-10 h-full flex flex-col justify-center items-center">
                    {isSmUp ? (
                        <img
                            src="/landing-page/Audience-story-desktop.svg"
                            alt="Hero Image"
                            className="rounded-2xl w-full h-full object-cover object-top"
                        />
                    ) : (
                        <img
                            src="/landing-page/Audience-story.png"
                            alt="Hero Image"
                            className="rounded-2xl w-full h-full object-contain object-top"
                        />
                    )}
                </div>
            </motion.div>

            {/* main feature */}
            <div
                id="features"
                className="pt-26 lg:pt-30 px-5 pb-4 lg:px-10"
                ref={featureRef}
            >
                <div className="">
                    <h2 className="font-bold text-3xl text-center md:mb-5 mb-5">
                        Main Feature
                    </h2>
                    {/* tabs */}
                    <div className="relative md:w-fit w-full mx-auto border md:rounded-full rounded-2xl flex md:flex-row flex-col py-1 px-3 gap-2 bg-arvo-white-100 z-50">
                        <div
                            className={`
								absolute top-1 h-8 bg-arvo-blue-100 rounded-full transition-all duration-800
								${selectedFeature === 0 ? "bg-arvo-blue-100" : ""}
								${selectedFeature === 1 ? "bg-arvo-orange-100" : ""}
								${selectedFeature === 2 ? "bg-arvo-green-100" : ""}
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
                                className={`relative flex-1 cursor-pointer px-4 py-2 text-center font-semibold whitespace-nowrap transition-all duration-800 ${selectedFeature === i ? "text-arvo-white-100" : "text-arvo-black-50"}`}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                    {/* swiper */}
                    <div className="md:mt-6 xl:px-40">
                        <Swiper
                            speed={800}
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
                            onSlideChange={(swiper) =>
                                setActiveIndex(swiper.activeIndex)
                            }
                        >
                            {/* Inventory Management */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-blue-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <motion.h3
                                            className="lg:text-4xl md:text-2xl text-xl font-bold md:mt-10"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            Keep Your Inventory Organized
                                        </motion.h3>
                                        <motion.p
                                            className="mt-4"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            No more guessing what’s in stock.
                                            Arvo updates your material and
                                            product inventory as you work and
                                            alerts you when you’re running low,
                                            helping you stay prepared and avoid
                                            missed sales.
                                        </motion.p>
                                        <motion.div
                                            className="absolute -right-20 w-40 bottom-40 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Negative.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute right-30 bottom-30 w-40 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute w-40 right-0 bottom-10 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Inventory-Management-Descktop-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute w-50 left-10 bottom-10 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 0
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Semantics.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        className="basis-6/10 md:pt-20 pb-20"
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={
                                            activeIndex === 0
                                                ? {
                                                      y: 0,
                                                      opacity: 1,
                                                  }
                                                : {
                                                      y: 30,
                                                      opacity: 0,
                                                  }
                                        }
                                        transition={{
                                            delay: 0.75,
                                            duration: 0.5,
                                            ease: easeOut,
                                        }}
                                    >
                                        <div className="">
                                            <img
                                                src="/landing-page/Inventory-management.png"
                                                className="w-full "
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </SwiperSlide>
                            {/* Cost & Revenue Management */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-orange-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <motion.h3
                                            className="lg:text-4xl md:text-2xl text-xl font-bold md:mt-10"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            Know Your Cost,
                                            <br />
                                            Price with Confidence
                                        </motion.h3>
                                        <motion.p
                                            className="mt-4"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            Arvo helps you see what your work is
                                            truly worth. It connects your costs
                                            and sales, guides your pricing, and
                                            gives you more time for your craft.
                                        </motion.p>
                                        <motion.div
                                            className="absolute -right-20 w-40 bottom-40 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Metric-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute left-30 bottom-30 w-40 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Metric-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute w-40 right-0 bottom-10 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-negative.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute w-50 left-10 bottom-10 md:block hidden"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                activeIndex === 1
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.75,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Smart-Cost-Revenue-Management-Desktop-Semantics.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        className="basis-6/10 md:pt-20 pb-20"
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={
                                            activeIndex === 1
                                                ? {
                                                      y: 0,
                                                      opacity: 1,
                                                  }
                                                : {
                                                      y: 30,
                                                      opacity: 0,
                                                  }
                                        }
                                        transition={{
                                            delay: 0.75,
                                            duration: 0.5,
                                            ease: easeOut,
                                        }}
                                    >
                                        <div className="">
                                            <img
                                                src="/landing-page/cost-management.png"
                                                className="w-full"
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </SwiperSlide>
                            {/* Business Health Dashboard */}
                            <SwiperSlide>
                                <div className="rounded-2xl md:bg-arvo-green-100 bg-arvo-white-0 md:text-arvo-white-100 text-arvo-black-100 flex md:flex-row flex-col">
                                    <div className="relative basis-4/10 md:py-10 md:pl-14 p-5 md:text-left text-center">
                                        <motion.h3
                                            className="lg:text-4xl md:text-2xl text-xl font-bold md:mt-10"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 2
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            Visualize Growth, <br />
                                            Not Just Numbers
                                        </motion.h3>
                                        <motion.p
                                            className="mt-4"
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={
                                                activeIndex === 2
                                                    ? {
                                                          y: 0,
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          y: 30,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 0.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            Arvo turns your data into clear
                                            visuals of sales, costs, profits,
                                            and product performance
                                            <br className="md:hidden block" /> —
                                            making progress easy to see.
                                        </motion.p>
                                        <motion.div
                                            className="absolute -right-20 w-40 bottom-40 md:block hidden"
                                            animate={
                                                activeIndex === 2
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-1.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute left-30 bottom-35 w-40 md:block hidden"
                                            animate={
                                                activeIndex === 2
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.25,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-2.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="absolute w-40 right-5 bottom-10 md:block hidden"
                                            animate={
                                                activeIndex === 2
                                                    ? {
                                                          scale: [0, 1.25, 1],
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          scale: 0,
                                                          opacity: 0,
                                                      }
                                            }
                                            transition={{
                                                delay: 1.5,
                                                duration: 0.5,
                                                ease: easeOut,
                                            }}
                                        >
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop-Metric-Positive-3.svg"
                                                className="w-full"
                                            />
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        className="basis-6/10 md:pt-20 pb-20"
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={
                                            activeIndex === 2
                                                ? {
                                                      y: 0,
                                                      opacity: 1,
                                                  }
                                                : {
                                                      y: 30,
                                                      opacity: 0,
                                                  }
                                        }
                                        transition={{
                                            delay: 0.75,
                                            duration: 0.5,
                                            ease: easeOut,
                                        }}
                                    >
                                        <div className="">
                                            <img
                                                src="/landing-page/Business-Dashboard-Desktop.png"
                                                className="w-full"
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* Why It Matters */}
            <div
                className="pt-10 lg:pt-30 px-4 pb-5 lg:px-10"
                ref={whyItMattersRef}
            >
                <div
                    className="flex justify-between gap-5 items-center md:flex-row flex-col bg-arvo-orange-50 rounded-2xl py-10 px-5"
                    ref={whyItMattersTextRef}
                >
                    <div className="md:basis-1/2 md:flex md:flex-col justify-center md:p-20">
                        <motion.h2
                            className="font-bold text-3xl md:text-4xl text-center md:mb-5 mb-2 md:text-left"
                            variants={whyItMatters_h2}
                            initial={hasAnimatedForText ? "visible" : "hidden"}
                            animate={hasAnimatedForText ? "visible" : "hidden"}
                        >
                            Why It Matters
                        </motion.h2>
                        <motion.p
                            className="text-center md:text-left md:mt-4 mt-2 md:font-semibold md:text-2xl"
                            variants={whyItMatters_p}
                            initial={hasAnimatedForText ? "visible" : "hidden"}
                            animate={hasAnimatedForText ? "visible" : "hidden"}
                        >
                            You juggle it all: artist, marketer, accountant, and
                            more. Arvo helps you reclaim your time, so you can
                            focus on creating instead of managing.
                        </motion.p>
                        <motion.div
                            className="flex md:flex-row flex-col md:gap-5 gap-2 md:mt-5 mt-4"
                            variants={whyItMatters_div}
                            initial={hasAnimatedForText ? "visible" : "hidden"}
                            animate={hasAnimatedForText ? "visible" : "hidden"}
                        >
                            <Link to="/signup">
                                <div className="text-center md:text-left">
                                    <button className="font-semibold text-arvo-white-0 rounded-2xl border-2 border-arvo-blue-100 bg-arvo-blue-100 w-40 h-12 cursor-pointer">
                                        Get Started
                                    </button>
                                </div>
                            </Link>
                            <Link
                                to="https://github.com/keipalg/arvo"
                                target="_blank"
                            >
                                <div className="text-center md:text-left">
                                    <button className="font-semibold text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 bg-arvo-white-100 w-40 h-12 cursor-pointer">
                                        View on Github
                                    </button>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                    <motion.div
                        className="xl:max-w-2xl max-w-3xs"
                        variants={whyItMatters_img}
                        initial={hasAnimated ? "visible" : "hidden"}
                        animate={hasAnimated ? "visible" : "hidden"}
                    >
                        <img
                            src="/landing-page/Why-it-matters-mobile.svg"
                            className="object-contain h-full w-auto md:block hidden"
                        />
                        <img
                            src="/landing-page/Why-it-matters-mobile.png"
                            className="object-contain w-auto md:hidden block"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Pricing Plan */}
            <div
                id="pricing"
                className="pt-26 lg:pt-30 px-4 pb-5 lg:px-10"
                ref={pricingRef}
            >
                <div className="flex flex-col justify-center items-center gap-2">
                    <motion.h2
                        className="font-bold text-3xl text-center"
                        variants={pricing_h2}
                        initial={hasAnimatedForPricing ? "visible" : "hidden"}
                        animate={hasAnimatedForPricing ? "visible" : "hidden"}
                    >
                        Pricing Plan
                    </motion.h2>
                    <motion.p
                        className="text-lg font-semibold text-center"
                        variants={pricing_p1}
                        initial={hasAnimatedForPricing ? "visible" : "hidden"}
                        animate={hasAnimatedForPricing ? "visible" : "hidden"}
                    >
                        Made to grow with your craft
                    </motion.p>
                    <motion.p
                        className="text-center"
                        variants={pricing_p2}
                        initial={hasAnimatedForPricing ? "visible" : "hidden"}
                        animate={hasAnimatedForPricing ? "visible" : "hidden"}
                    >
                        Start small, stay organized, and scale at your own pace.
                        Choose a plan that fits your making journey.
                    </motion.p>
                </div>
                {/* Laptop */}
                <motion.div
                    className="mt-10 md:flex md:gap-5 hidden md:flex-row md:justify-center md:px-10 md:bg-arvo-blue-20 md:rounded-2xl md:max-w-5xl md:mx-auto"
                    variants={pricing_div}
                    initial={hasAnimatedForPricing ? "visible" : "hidden"}
                    animate={hasAnimatedForPricing ? "visible" : "hidden"}
                >
                    {/* Maker Start */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-100 text-arvo-white-0 rounded-2xl p-6 shadow-arvo-blue-100 shadow-2xl w-full md:scale-105">
                        <div className="text-right">
                            <span className="text-xs font-bold rounded-full bg-arvo-white-0 py-1.5 px-5 text-arvo-black-100">
                                Recommended
                            </span>
                        </div>
                        <div className="flex items-center">
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
                                        src="/icon/check-circle-2.png"
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
                                        src="/icon/check-circle-2.png"
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
                                        src="/icon/check-circle-2.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    Basic dashboard
                                </span>
                            </li>
                        </ul>
                        <Link to="/signup">
                            <button className="mt-10 font-semibold text-arvo-blue-100 rounded-2xl border-2 bg-arvo-white-0 w-full h-12 cursor-pointer">
                                Choose Plan
                            </button>
                        </Link>
                    </div>
                    {/* Maker Pro */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-8">
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
                        <Link to="/signup" className="mt-auto">
                            <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12 cursor-pointer">
                                Choose Plan
                            </button>
                        </Link>
                    </div>
                    {/* Maker Studio */}
                    <div className="basis-1/3 flex-1 min-h-0 flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-8">
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
                                        src="/icon/check-circle-1.png"
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
                                        src="/icon/check-circle-1.png"
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
                                        src="/icon/check-circle-1.png"
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
                                        src="/icon/check-circle-1.png"
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
                                        src="/icon/check-circle-1.png"
                                        className="w-auto h-full"
                                    />
                                </div>
                                <span className="flex-1 breack-words">
                                    All Pro features
                                </span>
                            </li>
                        </ul>
                        <Link to="/signup" className="mt-auto">
                            <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12 cursor-pointer">
                                Choose Plan
                            </button>
                        </Link>
                    </div>
                </motion.div>
                {/* Mobile */}
                <motion.div
                    className="md:hidden mt-10"
                    variants={pricing_div}
                    initial={hasAnimatedForPricing ? "visible" : "hidden"}
                    animate={hasAnimatedForPricing ? "visible" : "hidden"}
                >
                    <Swiper
                        effect={"coverflow"}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={"auto"}
                        coverflowEffect={{
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        pagination={true}
                        modules={[EffectCoverflow, Pagination]}
                        className="mySwiper relative"
                    >
                        {/* Maker Start */}
                        <SwiperSlide className="h-full">
                            <div className="flex flex-col gap-3 bg-arvo-blue-100 text-arvo-white-0 rounded-2xl p-6 shadow-arvo-blue-100 w-full md:scale-105">
                                <div className="text-right">
                                    <span className="text-xs font-bold rounded-full bg-arvo-white-0 py-1.5 px-5 text-arvo-black-100">
                                        Recommended
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold">
                                        $0
                                    </span>
                                    <span>/month</span>
                                </div>
                                <h3 className="text-2xl font-semibold">
                                    Maker Start
                                </h3>
                                <p className="font-semibold">
                                    A basic plan for beginners and new
                                    businesses testing the platform
                                </p>
                                <ul className="flex flex-col gap-2">
                                    <li className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-5 h-5">
                                            <img
                                                src="/icon/check-circle-2.png"
                                                className="object-contain h-full w-auto"
                                            />
                                        </div>
                                        <span className="flex-1 breack-words">
                                            Limited product and material entries
                                            (e.g., 30 items each)
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
                                            Manual expense and inventory
                                            tracking
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
                                            Basic dashboard
                                        </span>
                                    </li>
                                </ul>
                                <Link to="/signup">
                                    <button className="mt-10 font-semibold text-arvo-blue-100 rounded-2xl border-2 bg-arvo-white-0 w-full h-12 cursor-pointer">
                                        Choose Plan
                                    </button>
                                </Link>
                            </div>
                        </SwiperSlide>
                        {/* Maker Pro */}
                        <SwiperSlide className="h-full">
                            <div className="flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-8">
                                <div>
                                    <span className="text-3xl font-bold">
                                        $14.99
                                    </span>
                                    <span>/month</span>
                                </div>
                                <h3 className="text-2xl font-semibold">
                                    Maker Pro
                                </h3>
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
                                            Unlimited product and material
                                            entries
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
                                            Data CSV imports and exports for tax
                                            purpose
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
                                            Integrations with Etsy, Shopify, and
                                            any additional marketplaces
                                        </span>
                                    </li>
                                </ul>
                                <Link to="/signup" className="mt-auto">
                                    <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12 cursor-pointer">
                                        Choose Plan
                                    </button>
                                </Link>
                            </div>
                        </SwiperSlide>
                        {/* Maker Studio */}
                        <SwiperSlide className="h-full">
                            <div className="flex flex-col gap-3 bg-arvo-blue-20 rounded-2xl p-8">
                                <div>
                                    <span className="text-3xl font-bold">
                                        $29.99
                                    </span>
                                    <span>/month</span>
                                </div>
                                <h3 className="text-2xl font-semibold">
                                    Maker Studio
                                </h3>
                                <p className="font-semibold">
                                    For Small Studios and teams
                                </p>
                                <ul className="flex flex-col gap-2">
                                    <li className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-5 h-5">
                                            <img
                                                src="/icon/check-circle-1.png"
                                                className="w-auto h-full"
                                            />
                                        </div>
                                        <div className="flex-1 breack-words">
                                            Customizable dashboard
                                            <br /> (rearrange insights, custom
                                            data filters)
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-5 h-5">
                                            <img
                                                src="/icon/check-circle-1.png"
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
                                                src="/icon/check-circle-1.png"
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
                                                src="/icon/check-circle-1.png"
                                                className="w-auto h-full"
                                            />
                                        </div>
                                        <span className="flex-1 breack-words">
                                            Upload image or PDF receipts to sync
                                            to database
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
                                            All Pro features
                                        </span>
                                    </li>
                                </ul>
                                <Link to="/signup" className="mt-auto">
                                    <button className="mt-auto font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12 cursor-pointer">
                                        Choose Plan
                                    </button>
                                </Link>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </motion.div>
            </div>

            {/* Team */}
            <div
                id="team"
                className="pt-26 lg:pt-30 px-4 pb-5 lg:px-10"
                ref={teamRef}
            >
                <div className="bg-arvo-blue-20 rounded-2xl md:p-10 px-3 py-6">
                    <div className="flex flex-col justify-center items-center gap-2">
                        <motion.h2
                            className="font-bold text-3xl text-center"
                            variants={team_h2}
                            initial={hasAnimatedForTeam ? "visible" : "hidden"}
                            animate={hasAnimatedForTeam ? "visible" : "hidden"}
                        >
                            The People <br className="md:hidden block" />
                            Behind Arvo
                        </motion.h2>
                    </div>
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-20 mt-10 rounded-2xl xl:px-30 md:gap-y-0 gap-y-10"
                        variants={team_parent}
                        initial={hasAnimatedForTeam ? "visible" : "hidden"}
                        animate={hasAnimatedForTeam ? "visible" : "hidden"}
                    >
                        {/* Anne */}
                        <motion.div
                            className="relative text-center grid gap-1 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/annecalija/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/anne.webp"
                                    className="w-full h-auto"
                                />
                                <span className="absolute xl:right-7 right-2 md:top-23 top-18 bg-arvo-white-100 px-2 rounded-full font-bold text-xs text-arvo-blue-100 border border-arvo-blue-100">
                                    Co-PM
                                </span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Anne Calija
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                Full-stack Developer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/annecalija</span>
                            </div>
                        </motion.div>
                        {/* Kana */}
                        <motion.div
                            className="relative text-center grid gap-1 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/kanako-taga/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/kana.webp"
                                    className="w-full h-auto"
                                />
                                <span className="absolute xl:right-7 right-2 md:top-23 top-18 bg-arvo-white-100 px-2 rounded-full font-bold text-xs text-arvo-blue-100 border border-arvo-blue-100">
                                    Co-PM
                                </span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Kanako Taga
                            </h3>
                            <div className="flex items-center justify-center  gap-2 text-xs md:text-sm font-semibold">
                                Full-stack Developer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/kanako-taga</span>
                            </div>
                        </motion.div>
                        {/* Keita Otsuka */}
                        <motion.div
                            className="relative text-center grid gap-1 row-span-4 md:row-start-1 md:col-start-3 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/keita-otsuka/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/keita.webp"
                                    className="w-full h-auto"
                                />
                                <span className="absolute xl:right-7 right-2 md:top-23 top-18 bg-arvo-white-100 px-2 rounded-full font-bold text-xs text-arvo-blue-100 border border-arvo-blue-100">
                                    Lead
                                </span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Keita Otsuka
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold whitespace-nowrap">
                                Full-stack Developer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/keita-otsuka</span>
                            </div>
                        </motion.div>
                        {/* Kanta Nagai */}
                        <motion.div
                            className="text-center grid gap-1 row-span-4 md:row-start-1 md:col-start-15 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/kanta-nagai/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/kanta.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Kanta Nagai
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                Full-stack Developer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/kanta-nagai</span>
                            </div>
                        </motion.div>
                        {/* Unna Regino */}
                        <motion.div
                            className="relative md:mt-20 text-center grid gap-1 md:row-start-5 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/unna-regino/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/unna.webp"
                                    className="w-full h-auto"
                                />
                                <span className="absolute xl:right-7 right-2 md:top-23 top-18 bg-arvo-white-100 px-2 rounded-full font-bold text-xs text-arvo-blue-100 border border-arvo-blue-100">
                                    Co-Lead
                                </span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Unna Regino
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                UX/UI Designer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/unna-regino</span>
                            </div>
                        </motion.div>
                        {/* Jan Oducayen */}
                        <motion.div
                            className="relative md:mt-20 text-center grid gap-1 md:row-start-5 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/jankristine/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/jan.webp"
                                    className="w-full h-auto"
                                />
                                <span className="absolute xl:right-7 right-2 md:top-23 top-18 bg-arvo-white-100 px-2 rounded-full font-bold text-xs text-arvo-blue-100 border border-arvo-blue-100">
                                    Co-Lead
                                </span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Jan Oducayen
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                UX/UI Designer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/jankristine</span>
                            </div>
                        </motion.div>
                        {/* Kausalya Parahitha */}
                        <motion.div
                            className="md:mt-20 text-center grid gap-1 md:row-start-5 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/kausalya-narendraswari/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/lya.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Kausalya Narendraswari
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                UX/UI Designer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">
                                    in/kausalya-narendraswari
                                </span>
                            </div>
                        </motion.div>
                        {/* Pinkaew Nawanukool */}
                        <motion.div
                            className="md:mt-20 text-center grid gap-1 md:row-start-5 row-span-4 md:col-span-4 cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/pinkaewn/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/mink.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Pinkaew Nawanukool
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                UX/UI Designer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">in/pinkaewn</span>
                            </div>
                        </motion.div>
                        {/* Vaishanvi Yelai */}
                        <motion.div
                            className="md:mt-20 text-center grid gap-1 md:row-start-5 row-span-4 md:col-span-4 col-span-full cursor-pointer hover:scale-105 transition-transform duration-300 grid-rows-[auto_auto_auto_auto]d"
                            variants={team_card}
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/vaishnavi-yelai-5b60a7270/",
                                    "_blank",
                                )
                            }
                        >
                            <div className="md:w-32 md:h-32 w-24 h-24 rounded-2xl border-2 border-arvo-blue-100 object-cover overflow-hidden mx-auto">
                                <img
                                    src="/landing-page/vaish.webp"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="font-bold text-sm md:text-base flex items-center justify-center mb-1">
                                Vaishnavi Yelai
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                                UX/UI Designer
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <img src="/icon/LinkedIn.svg" alt="" />
                                </div>
                                <span className="text-xs">
                                    in/vaishnavi-yelai
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Arvo behind the scenes */}
            <div
                className="pt-10 lg:pt-30 px-4 pb-5 lg:px-10 h-screen"
                ref={behindSceneRef}
            >
                <div className="flex justify-between items-center md:flex-row flex-col rounded-2xl py-10 px-5 gap-5">
                    <div className="md:basis-1/2 md:flex md:flex-col justify-center md:p-20">
                        <motion.h2
                            className="font-bold text-3xl md:text-4xl text-center md:mb-5 mb-2 md:text-left"
                            variants={behind_scene_h2}
                            initial={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                            animate={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                        >
                            Arvo Behind the Scenes
                        </motion.h2>
                        <motion.p
                            className="text-center md:text-left md:mt-4 mt-2 md:font-semibold md:text-2xl"
                            variants={behind_scene_p}
                            initial={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                            animate={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                        >
                            Step into Arvo’s design and development flow.
                            Designed for ceramic artists, and browse the GitHub
                            repository to see the code.
                        </motion.p>
                        <motion.div
                            className="md:flex md:flex-row flex-col gap-5"
                            variants={behind_scene_buttons}
                            initial={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                            animate={
                                hasAnimatedForBehindScene ? "visible" : "hidden"
                            }
                        >
                            <Link
                                to="https://www.figma.com/design/ol2HPsXQEoK1o4USlTVdiY/Arvo-Design-Process-2025?node-id=0-1&t=yILwfkkzohSsnfv7-1"
                                target="_blank"
                            >
                                <div className="mt-6 text-center md:text-left">
                                    <button className="font-semibold text-arvo-white-0 rounded-2xl border-2 border-arvo-blue-100 bg-arvo-blue-100 w-40 h-12 cursor-pointer">
                                        Figma Project
                                    </button>
                                </div>
                            </Link>
                            <Link to="https://github.com/keipalg/arvo">
                                <div className="mt-6 text-center md:text-left">
                                    <button className="font-semibold text-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 bg-arvo-white-100 w-40 h-12 cursor-pointer">
                                        View on Github
                                    </button>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                    <motion.div
                        className="md:basis-1/2 flex justify-center md:right-0 md:top-0 xl:max-w-3xl max-w-lg"
                        variants={behind_scene_img}
                        initial={
                            hasAnimatedForBehindScene ? "visible" : "hidden"
                        }
                        animate={
                            hasAnimatedForBehindScene ? "visible" : "hidden"
                        }
                    >
                        <img
                            src="/landing-page/behind-scene.png"
                            className="object-contain h-full w-auto"
                        />
                    </motion.div>
                </div>
            </div>

            {/* contact */}
            <div id="contact" className="pt-26 lg:pt-30 px-4 pb-5 lg:px-10">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 h-full md:px-20 py-10 bg-arvo-blue-20 rounded-2xl">
                    <div className="md:basis-1/2 flex flex-col md:gap-10 gap-5 md:items-start items-center">
                        <div className="w-30">
                            <a href="">
                                <img src="/arvo-logo.svg" alt="" />
                            </a>
                        </div>
                        <h2 className="font-semibold md:text-4xl text-xl md:text-left text-center">
                            Ready to run your craft <br />
                            with more clarity and <br />
                            less chaos?
                        </h2>
                        <div className="text-center md:text-left md:font-semibold">
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
                                className="font-semibold md:text-lg text-base"
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
                                className="font-semibold md:text-lg text-base"
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
                                className="font-semibold md:text-lg text-base"
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
                                className="font-semibold md:text-lg text-base"
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
                            className="mt-4 font-semibold text-arvo-white-0 bg-arvo-blue-100 rounded-2xl border-2 border-arvo-blue-100 w-full h-12 cursor-pointer"
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
