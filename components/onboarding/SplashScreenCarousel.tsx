"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Target, Activity, Trophy, ArrowRight } from "lucide-react";

const SPLASH_SCREENS = [
    {
        id: "focus",
        title: "Master Your Focus",
        // description: "In the critical moments before a game, your mind is your greatest asset. Build bulletproof routines.",
        description: "Your mind is your greatest asset. Build bulletproof routines for the critical moments before a game.",
        icon: Brain,
        color: "text-indigo-400",
        bgGlow: "bg-indigo-600",
    },
    {
        id: "routine",
        title: "Tailored to You",
        description: "Custom routines based on your sport, available time, and personal anxiety profile.",
        icon: Target,
        color: "text-emerald-400",
        bgGlow: "bg-emerald-600",
    },
    {
        id: "performance",
        title: "Track & Adapt",
        description: "Log your pre-game mental state and post-game performance to see what truly works.",
        icon: Activity,
        color: "text-amber-400",
        bgGlow: "bg-amber-600",
    },
    {
        id: "win",
        title: "Own the Moment",
        description: "Step onto the field with clarity and confidence. The game is won before it begins.",
        icon: Trophy,
        color: "text-rose-400",
        bgGlow: "bg-rose-600",
    },
];

// Custom SVGs for Sports Background
const SoccerIcon = (props: React.ComponentProps<"svg">) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="12,5 16,8 14.5,13 9.5,13 8,8" />
        <line x1="12" y1="5" x2="12" y2="2" />
        <line x1="16" y1="8" x2="20.5" y2="7" />
        <line x1="14.5" y1="13" x2="18" y2="19" />
        <line x1="9.5" y1="13" x2="6" y2="19" />
        <line x1="8" y1="8" x2="3.5" y2="7" />
    </svg>
);

const RugbyIcon = (props: React.ComponentProps<"svg">) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)" />
        <line x1="7.5" y1="16.5" x2="16.5" y2="7.5" />
        <line x1="10" y1="12" x2="12" y2="14" />
        <line x1="12" y1="10" x2="14" y2="12" />
    </svg>
);

const BasketballIcon = (props: React.ComponentProps<"svg">) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <path d="M3.5 5.5a8.5 8.5 0 0 1 0 13" />
        <path d="M20.5 5.5a8.5 8.5 0 0 0 0 13" />
    </svg>
);

const BaseballIcon = (props: React.ComponentProps<"svg">) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M5 4c3.5 3 4.5 9 1 14" />
        <path d="M19 4c-3.5 3-4.5 9-1 14" />
    </svg>
);

const BACKGROUND_ICONS = [
    { Icon: SoccerIcon, size: 160, x: "5%", y: "15%", rotate: [-10, 20, -10], duration: 18 },
    { Icon: RugbyIcon, size: 240, x: "80%", y: "5%", rotate: [0, 45, 0], duration: 25 },
    { Icon: BasketballIcon, size: 180, x: "10%", y: "65%", rotate: [20, 100, 20], duration: 22 },
    { Icon: BaseballIcon, size: 140, x: "85%", y: "70%", rotate: [-45, 45, -45], duration: 15 },
];

function FloatingSportsBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {BACKGROUND_ICONS.map((item, idx) => (
                <motion.div
                    key={idx}
                    className="absolute text-slate-500/10"
                    style={{ left: item.x, top: item.y }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 30, 0],
                        rotate: item.rotate
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <item.Icon width={item.size} height={item.size} />
                </motion.div>
            ))}
        </div>
    );
}

export function SplashScreenCarousel() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const isLastSlide = currentIndex === SPLASH_SCREENS.length - 1;

    // Auto-advance logic
    useEffect(() => {
        if (!isAutoPlaying || isLastSlide) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 4000); // 4 seconds per slide

        return () => clearInterval(timer);
    }, [isAutoPlaying, isLastSlide]);

    const handleNext = () => {
        setIsAutoPlaying(false);
        if (!isLastSlide) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleDotClick = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden text-white selection:bg-indigo-500/30">
            <FloatingSportsBackground />

            {/* Top Bar: Logo & Skip */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        MindGame
                    </span>
                </div>
                {!isLastSlide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full px-6"
                            onClick={() => router.push('/login')}
                        >
                            Skip
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Main Carousel Area */}
            <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-center relative px-6 z-10 pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1] // Custom refined ease-out
                        }}
                        className="flex flex-col items-center text-center space-y-12"
                    >
                        {/* Dynamic Icon */}
                        <div className="relative">
                            <div className={`absolute inset-0 blur-[100px] opacity-30 w-full h-full rounded-full ${SPLASH_SCREENS[currentIndex].bgGlow}`} />
                            <div className={`p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl shadow-2xl ${SPLASH_SCREENS[currentIndex].color}`}>
                                {(() => {
                                    const IconInfo = SPLASH_SCREENS[currentIndex].icon;
                                    return <IconInfo className="w-24 h-24" strokeWidth={1.5} />;
                                })()}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-6 max-w-md">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                {SPLASH_SCREENS[currentIndex].title}
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed font-light">
                                {SPLASH_SCREENS[currentIndex].description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="w-full max-w-md mx-auto p-6 md:p-12 z-50 flex flex-col items-center gap-10">

                {/* Dot Pagination */}
                <div className="flex items-center gap-3">
                    {SPLASH_SCREENS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx
                                ? "w-8 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                : "w-2 bg-slate-700 hover:bg-slate-600"
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Primary Action Button */}
                <div className="w-full h-16 relative">
                    <AnimatePresence mode="wait">
                        {isLastSlide ? (
                            <motion.div
                                key="start-btn"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-full"
                            >
                                <Button
                                    size="lg"
                                    className="w-full h-full text-lg font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-xl shadow-white/10 rounded-2xl"
                                    onClick={() => router.push('/signup')}
                                >
                                    Get Started
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="next-btn"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-full"
                            >
                                <Button
                                    size="lg"
                                    onClick={handleNext}
                                    className="w-full h-full text-lg font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    Next <ArrowRight className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Login Link for final slide */}
                <div className="h-6">
                    {isLastSlide && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 font-medium"
                        >
                            Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        </div>
    );
}
