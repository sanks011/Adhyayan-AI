import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button1'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import {
  Matrix,
  loader,
  wave,
  snake,
  pulse,
} from "@/components/unlumen-ui/matrix"

const transitionVariants: any = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

// Interactive Matrix Showcase Component
const MatrixShowcase = () => {
    const [activeModeIndex, setActiveModeIndex] = useState(0);
    const [vuLevels, setVuLevels] = useState([0.2, 0.4, 0.6, 0.8, 0.6, 0.4, 0.2, 0.1]);

    const modes = [
        {
            id: "pathway",
            name: "Pathway Map",
            desc: "Adaptive learning pathways updating dynamically in real time.",
            animation: snake,
            mode: "default" as const,
            colors: { on: "#06b6d4", off: "#111827" }, // Cyan / Dark Grey
            status: "GENERATING VECTOR ROUTES",
            fps: 15
        },
        {
            id: "cognitive",
            name: "Cognitive Wave",
            desc: "Mapping curriculum graphs & semantic associations.",
            animation: wave,
            mode: "default" as const,
            colors: { on: "#8b5cf6", off: "#111827" }, // Purple / Dark Grey
            status: "RETRIEVING EMBEDDINGS",
            fps: 20
        },
        {
            id: "synaptic",
            name: "Synaptic Pulse",
            desc: "Simulating neural synapse activation during recall.",
            animation: pulse,
            mode: "default" as const,
            colors: { on: "#ec4899", off: "#111827" }, // Pink / Dark Grey
            status: "CALCULATING RETRIEVAL STRENGTH",
            fps: 12
        },
        {
            id: "voice",
            name: "Voice Tutor Synthesis",
            desc: "Real-time conversational voice synthesis and tutoring.",
            animation: undefined,
            mode: "vu" as const,
            colors: { on: "#10b981", off: "#111827" }, // Emerald / Dark Grey
            status: "STREAMING SYNTHETIC AUDIO",
            fps: 12
        }
    ];

    const activeMode = modes[activeModeIndex];

    // Auto-cycle through modes
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveModeIndex((prev) => (prev + 1) % modes.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [modes.length]);

    // Animate VU levels for the voice tutor mode
    useEffect(() => {
        if (activeMode.id !== "voice") return;
        
        let frameId: number;
        let timeoutId: NodeJS.Timeout;

        const updateLevels = () => {
            setVuLevels(prev => 
                prev.map(val => {
                    const change = (Math.random() - 0.5) * 0.4;
                    return Math.max(0.1, Math.min(0.95, val + change));
                })
            );
            timeoutId = setTimeout(() => {
                frameId = requestAnimationFrame(updateLevels);
            }, 80);
        };

        frameId = requestAnimationFrame(updateLevels);
        return () => {
            cancelAnimationFrame(frameId);
            clearTimeout(timeoutId);
        };
    }, [activeMode.id]);

    return (
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
            
            <div className="flex flex-col gap-3 w-full md:w-3/5 z-10 text-left">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3 text-[10px] font-mono text-zinc-400 tracking-wider">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SYSTEM: ADHYAYAN NEURAL CORE</span>
                    </div>
                    <span className="text-zinc-500">MODE: {activeMode.status}</span>
                </div>

                <div className="flex flex-col gap-2">
                    {modes.map((mode, idx) => (
                        <button
                            key={mode.id}
                            onClick={() => setActiveModeIndex(idx)}
                            className={cn(
                                "text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-1",
                                idx === activeModeIndex
                                    ? "bg-zinc-900/50 border-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                                    : "bg-transparent border-transparent hover:bg-zinc-900/20 hover:border-zinc-900"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "font-mono text-xs font-bold tracking-wider uppercase",
                                    idx === activeModeIndex ? "text-zinc-100" : "text-zinc-500"
                                )}>
                                    {mode.name}
                                </span>
                                {idx === activeModeIndex && (
                                    <span 
                                        className="w-1.5 h-1.5 rounded-full" 
                                        style={{ 
                                            backgroundColor: mode.colors.on,
                                            boxShadow: `0 0 10px 2px ${mode.colors.on}`
                                        }}
                                    />
                                )}
                            </div>
                            <span className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                                {mode.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-2/5 flex flex-col items-center justify-center z-10">
                <div className="relative p-6 rounded-2xl bg-zinc-950/90 border border-zinc-900/80 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] flex items-center justify-center aspect-square w-full max-w-[240px]">
                    {/* Glow backdrop matching current color */}
                    <div 
                        className="absolute inset-0 rounded-2xl blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
                        style={{ 
                            backgroundColor: activeMode.colors.on,
                            boxShadow: `0 0 80px 20px ${activeMode.colors.on}`
                        }}
                    />

                    {activeMode.id === "voice" ? (
                        <Matrix
                            rows={7}
                            cols={8}
                            mode="vu"
                            levels={vuLevels}
                            size={16}
                            gap={4}
                            palette={activeMode.colors}
                            ariaLabel="ADHYAYAN VU Level Meter"
                        />
                    ) : (
                        <Matrix
                            rows={7}
                            cols={7}
                            frames={activeMode.animation}
                            fps={activeMode.fps}
                            size={18}
                            gap={5}
                            palette={activeMode.colors}
                            ariaLabel={`ADHYAYAN Matrix ${activeMode.name}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export function HeroSection() {
    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Eczar:wght@400..800&display=swap');
                .eczar-regular {
                    font-family: "Eczar", serif;
                    font-optical-sizing: auto;
                    font-weight: 400;
                    font-style: normal;
                }
                .eczar-semibold {
                    font-family: "Eczar", serif;
                    font-optical-sizing: auto;
                    font-weight: 600;
                    font-style: normal;
                }
                .eczar-bold {
                    font-family: "Eczar", serif;
                    font-optical-sizing: auto;
                    font-weight: 700;
                    font-style: normal;
                }

                .eczar-heading {
                    font-family: "Eczar", serif;
                    font-optical-sizing: auto;
                    font-weight: 500;
                    font-style: normal;
                }
                .eczar-paragraph {
                    font-family: "Eczar", serif;
                    font-optical-sizing: auto;
                    font-weight: 400;
                    font-style: normal;
                }
            `}</style>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            } as any}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6 relative">
                            
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>

                        
                                    <h1 className="eczar-heading mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        अध्ययन
                                    </h1>
                                    <p className="eczar-paragraph mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        ज्ञान • प्रगति • सफलता
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            googleSignIn
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-black text-white hover:bg-gray-800">
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="/learn-more">
                                            <span className="text-nowrap">Learn More</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mx-auto mt-8 max-w-4xl px-4 sm:mt-12 md:mt-20">
                                <MatrixShowcase />
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: 'contact' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    googleSignIn
                                    size="sm"
                                    className="bg-black text-white hover:bg-gray-800">
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <span className={cn('eczar-bold text-xl font-bold', className)}>
            अध्ययन
        </span>
    )
}