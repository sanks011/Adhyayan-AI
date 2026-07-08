'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeroHeader } from "@/components/hero-section-1";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { 
  IconCheck, 
  IconCrown, 
  IconBrain,
  IconUsers,
  IconBook,
  IconCurrencyDollar,
  IconCurrencyRupee,
  IconSparkles,
  IconBolt,
  IconRocket,
  IconTrophy
} from '@tabler/icons-react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const pricingPlans = [
  {
    name: "Free",
    priceINR: { monthly: 0, annual: 0 },
    priceUSD: { monthly: 0, annual: 0 },
    period: "/forever",
    description: "Your current plan - limited but functional",
    gyanPoints: 50,
    features: [
      "50 Gyan Points per month",
      "~3 Mind Maps only",
      "~10 Personal Quizzes only", 
      "AI Assistant: 10 responses/day limit",
      "Basic mind map templates only",
      "No PDF export",
      "No mobile app access",
      "Community support only"
    ],
    popular: false,
    icon: IconUsers,
    color: "from-gray-400 to-gray-600",
    savings: "Current Plan",
    buttonText: "Current Plan",
    disabled: true
  },
  {
    name: "Student",
    priceINR: { monthly: 499, annual: 4990 },
    priceUSD: { monthly: 6.99, annual: 69.90 },
    period: { monthly: "/month", annual: "/year" },
    description: "Perfect for individual students and casual learners",
    gyanPoints: 300,
    features: [
      "300 Gyan Points per month",
      "~20 Mind Maps (15 points each)",
      "~60 Personal Quizzes (5 points each)", 
      "AI Assistant: 10 free responses/day",
      "Basic mind map templates",
      "PDF export functionality",
      "Mobile app access",
      "Email support"
    ],
    popular: false,
    icon: IconBook,
    color: "from-blue-400 to-blue-600",
    savings: "6x More Points!"
  },
  {
    name: "Scholar",
    priceINR: { monthly: 999, annual: 9990 },
    priceUSD: { monthly: 13.99, annual: 139.90 },
    period: { monthly: "/month", annual: "/year" },
    description: "Ideal for serious learners and small study groups",
    gyanPoints: 750,
    features: [
      "750 Gyan Points per month",
      "~50 Mind Maps with podcasts & theory",
      "~150 Personal Quizzes",
      "AI Assistant: Unlimited responses",
      "Team quiz hosting (set custom stakes)",
      "Advanced mind map features",
      "Priority support",
      "Custom templates & themes",
      "Advanced analytics",
      "Collaboration tools"
    ],
    popular: true,
    icon: IconBrain,
    color: "from-purple-400 to-purple-600",
    savings: "Most Popular"
  },
  {
    name: "Institution",
    priceINR: { monthly: 1999, annual: 19990 },
    priceUSD: { monthly: 24.99, annual: 249.90 },
    period: { monthly: "/month", annual: "/year" },
    description: "For educators, teams, and educational institutions",
    gyanPoints: 2000,
    features: [
      "2,000 Gyan Points per month",
      "~133 Premium Mind Maps",
      "~400 Quizzes & Assessments",
      "Advanced AI Tutoring System",
      "Team management dashboard",
      "Custom quiz tournaments",
      "White-label options",
      "API access for integrations",
      "24/7 priority support",
      "Advanced reporting & analytics",
      "Custom branding",
      "SSO integration"
    ],
    popular: false,
    icon: IconCrown,
    color: "from-orange-400 to-orange-600",
    savings: "Best for Teams"
  }
];

const additionalPacks = [
  {
    name: "Quick Boost",
    points: 100,
    priceINR: 99,
    priceUSD: 1.49,
    description: "Perfect for 6 mind maps or 20 quizzes",
    icon: IconBolt,
    color: "from-green-400 to-green-600",
    value: "Great for weekend study sessions"
  },
  {
    name: "Power Pack", 
    points: 250,
    priceINR: 199,
    priceUSD: 2.99,
    description: "Ideal for 16 mind maps or 50 quizzes",
    icon: IconRocket,
    color: "from-yellow-400 to-yellow-600",
    value: "Most popular top-up"
  },
  {
    name: "Mega Bundle",
    points: 600,
    priceINR: 399,
    priceUSD: 5.99,
    description: "Ultimate value: 40 mind maps or 120 quizzes",
    icon: IconTrophy,
    color: "from-purple-400 to-purple-600",
    value: "Best value per point"
  }
];

const faqs = [
  {
    question: "What are Gyan Points?",
    answer: "Gyan Points are your learning currency on Adhyayan AI. Use them to access AI-powered features, create mind maps, get tutoring assistance, and unlock premium content."
  },
  {
    question: "Can I change my plan anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "Do unused Gyan Points carry over?",
    answer: "Unused Gyan Points from your monthly subscription expire at the end of each billing cycle. However, purchased top-up points never expire."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! New users get 100 free Gyan Points to explore our platform. No credit card required."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets popular in India."
  }
];

const StyledWrapper = styled.div`
  .card-container {
    width: 280px;
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease-in-out;
  }
  .card-container:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.3);
  }
  .card-container.popular {
    border-color: #ffffff;
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.08);
  }
  .card-container .title-card {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    justify-content: space-between;
    color: #000000;
    background: #ffffff;
    border-radius: 20px 20px 0 0;
  }
  .card-container .title-card p {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
  .card-container .card-content {
    background-color: #0a0a0a;
    border-radius: 22px;
    color: #bab9b9;
    font-size: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .card-container .card-content .title {
    font-weight: 600;
    color: #ffffff;
    font-size: 20px;
  }
  .card-container .card-content .plain {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .card-container .card-content .plain span:nth-child(1) {
    font-size: 28px;
    color: #fff;
    font-weight: 700;
  }
  .card-container .card-content .plain span:nth-child(2) {
    font-size: 12px;
    color: #838383;
  }
  .card-container .card-content .description {
    font-size: 12px;
    color: #838383;
    text-align: center;
  }
  .card-container .card-content .card-btn {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px;
    width: 100%;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
  }
  .card-container .card-content .card-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
  }
  .card-container.popular .card-content .card-btn {
    background: #ffffff;
    color: #000000;
    border: none;
  }
  .card-container.popular .card-content .card-btn:hover {
    background: #e2e8f0;
  }
  .card-container .card-content .card-btn:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
  }
  .card-container .card-content .card-separate {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    font-size: 10px;
    color: rgba(131, 131, 131, 0.5);
  }
  .card-container .card-content .card-separate .separate {
    width: 100%;
    height: 1px;
    background-color: rgba(131, 131, 131, 0.5);
  }
  .card-container .card-content .card-list-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .card-container .card-content .card-list-features .option {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: #bab9b9;
  }

  .tab-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    position: relative;
    padding: 2px;
    background-color: #1a1e24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9px;
    margin: 10px 20px 0px 20px;
  }
  .tab {
    width: 50%;
    height: 28px;
    position: relative;
    z-index: 99;
    background-color: transparent;
    border: 0;
    outline: none;
    flex: none;
    align-self: stretch;
    flex-grow: 1;
    cursor: pointer;
    font-weight: 500;
    color: #bab9b9;
    font-size: 14px;
  }
  .tab.active {
    color: #000000;
  }
  .indicator {
    width: 50%;
    height: 28px;
    background: #ffffff;
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 9;
    border-radius: 7px;
    transition: all 0.2s ease-out;
  }
  .tab--monthly:hover ~ .indicator,
  .tab--monthly.active ~ .indicator {
    left: 2px;
  }
  .tab--annual:hover ~ .indicator,
  .tab--annual.active ~ .indicator {
    left: calc(50% - 2px);
  }

  .faq-container {
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
  .faq-container:hover {
    background: #111111;
    border-color: rgba(255, 255, 255, 0.1);
  }
  .faq-container .faq-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .faq-container .faq-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }
  .faq-container .faq-content {
    margin-top: 12px;
    font-size: 14px;
    color: #bab9b9;
  }

  .cta-button {
    background: #ffffff;
    color: #000000 !important;
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease-in-out;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .cta-button svg,
  .cta-button * {
    color: #000000 !important;
  }
  .cta-button:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  }

  .currency-toggle {
    background: #1a1e24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 2px;
  }
  .currency-button {
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    transition: all 0.3s ease-in-out;
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .currency-button.active {
    background: #ffffff;
    color: #000000 !important;
    font-weight: 600;
  }
  .currency-button.active svg,
  .currency-button.active * {
    color: #000000 !important;
  }
`;

export default function PricingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<Set<number>>(new Set());
  const router = useRouter();

  const toggleFAQ = (index: number) => {
    const newOpen = new Set(openFAQ);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenFAQ(newOpen);
  };

  const formatPrice = (priceINR: { monthly: number; annual: number }, priceUSD: { monthly: number; annual: number }) => {
    const price = currency === 'INR' ? priceINR[billingCycle] : priceUSD[billingCycle];
    return price === 0 ? 'Free' : `${currency === 'INR' ? '₹' : '$'}${price}`;
  };
  const handlePlanSelect = (planName: string) => {
    if (planName === "Free") return;
    
    const selectedPlan = pricingPlans.find(plan => plan.name === planName);
    if (!selectedPlan) return;
    
    // Create URL search params with plan data
    const planData = {
      name: selectedPlan.name,
      priceINR: selectedPlan.priceINR,
      priceUSD: selectedPlan.priceUSD,
      period: selectedPlan.period,
      description: selectedPlan.description,
      gyanPoints: selectedPlan.gyanPoints,
      features: selectedPlan.features,
      currency: currency,
      billingCycle: billingCycle,
      type: 'subscription'
    };
    
    const searchParams = new URLSearchParams({
      data: JSON.stringify(planData)
    });
    
    router.push(`/confirm?${searchParams.toString()}`);
  };

  const handleTopUpPurchase = (packName: string, price: number) => {
    const selectedPack = additionalPacks.find(pack => pack.name === packName);
    if (!selectedPack) return;
    
    const packData = {
      name: selectedPack.name,
      points: selectedPack.points,
      priceINR: selectedPack.priceINR,
      priceUSD: selectedPack.priceUSD,
      description: selectedPack.description,
      currency: currency,
      type: 'topup'
    };
    
    const searchParams = new URLSearchParams({
      data: JSON.stringify(packData)
    });
    
    router.push(`/confirm?${searchParams.toString()}`);
  };
  return (
    <StyledWrapper>
      <div className="min-h-screen bg-black text-white">
        <HeroHeader />
        {/* Hero Section */}
        <div className="relative pt-44 pb-24 flex items-center justify-center overflow-hidden border-b border-white/10 bg-black">
          {/* Starry night sky background image */}
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <Image
              src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
              alt="background"
              fill
              className="object-cover opacity-60 pointer-events-none"
              priority
            />
          </div>
          {/* Radial gradient overlay */}
          <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
          {/* Bottom fade overlay */}
          <div aria-hidden className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />

          <div className="text-center max-w-4xl mx-auto z-10 px-4">
            <h1 className="eczar-heading font-serif text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Choose Your Learning Path
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Unlock your potential with AI-powered learning. Select the perfect plan to fuel your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 justify-center">
              <button className="cta-button">
                <IconSparkles className="h-5 w-5" />
                Start Free Trial
              </button>
              <button className="px-6 py-3 border border-white/10 hover:border-white/30 rounded-lg text-white/80 hover:text-white transition-all bg-white/5 backdrop-blur-sm">
                View Demo
              </button>
            </div>
            {/* Currency Toggle */}
            <div className="flex justify-center mt-8">
              <div className="currency-toggle flex items-center gap-2">
                <button
                  onClick={() => setCurrency('INR')}
                  className={clsx("currency-button", { active: currency === 'INR' })}
                >
                  <IconCurrencyRupee className="h-4 w-4 inline-block mr-1" />
                  INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={clsx("currency-button", { active: currency === 'USD' })}
                >
                  <IconCurrencyDollar className="h-4 w-4 inline-block mr-1" />
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Subscription Plans
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Choose a plan that fits your learning needs. All plans include access to our AI-powered features.
            </p>
            <div className="tab-container mx-auto max-w-xs mt-6">
              <button
                className={clsx("tab tab--monthly", { active: billingCycle === 'monthly' })}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={clsx("tab tab--annual", { active: billingCycle === 'annual' })}
                onClick={() => setBillingCycle('annual')}
              >
                Annual
              </button>
              <div className="indicator" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={index}
                  className={clsx("relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3", plan.popular ? "border-white/20" : "border-neutral-800")}
                >
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className={clsx(
                    "border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-[#0a0a0a]/80 backdrop-blur-sm border-neutral-800",
                    plan.popular ? "dark:shadow-[0px_0px_27px_0px_rgba(255,255,255,0.05)]" : "dark:shadow-[0px_0px_27px_0px_#2D2D2D]"
                  )}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 left-0 bg-white text-black text-[10px] font-bold py-1 px-3 text-center uppercase tracking-wider flex items-center justify-center gap-1 z-10">
                        <IconCrown className="h-3.5 w-3.5" />
                        Most Popular
                      </div>
                    )}
                    <div className={clsx("flex flex-col gap-4 flex-1", plan.popular && "pt-6")}>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="font-sans text-xl font-semibold text-white">{plan.name}</span>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed">{plan.description}</p>
                      
                      <div className="flex items-baseline gap-1 my-2">                      
                        <span className="text-3xl md:text-4xl font-bold text-white">
                          {formatPrice(plan.priceINR, plan.priceUSD)}
                        </span>
                        <span className="text-neutral-500 text-xs">
                          {typeof plan.period === 'string' ? plan.period : plan.period[billingCycle]}
                        </span>
                      </div>

                      <button
                        className={clsx(
                          "w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer",
                          plan.popular
                            ? "bg-white text-black hover:bg-neutral-200"
                            : "bg-transparent text-white border border-neutral-700 hover:border-neutral-500 hover:bg-white/5",
                          plan.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={plan.disabled}
                        onClick={() => handlePlanSelect(plan.name)}
                      >
                        {plan.buttonText || (plan.popular ? 'Get Started' : 'Get Started')}
                      </button>

                      <div className="w-full h-px bg-neutral-800 my-2" />

                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2 text-sm text-neutral-300">
                            <svg viewBox="0 0 24 24" height={14} width={14} className="mt-1 text-neutral-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <g strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" fill="none">
                                <rect rx={4} y={3} x={3} height={18} width={18} />
                                <path d="m9 12l2.25 2L15 10" />
                              </g>
                            </svg>
                            <span className="text-xs leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white text-xs font-medium mt-auto w-fit">
                        <IconSparkles className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{plan.gyanPoints} Gyan Points</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Gyan Points Packs */}
        <div className="container mx-auto px-4 py-16 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 czar-heading font-serif">
              Top-up Your Gyan Points
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Need more points? Purchase additional Gyan Points to supercharge your learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalPacks.map((pack, index) => {
              const IconComponent = pack.icon;
              return (
                <div
                  key={index}
                  className="relative rounded-2xl border border-neutral-800 p-2 md:rounded-3xl md:p-3"
                >
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-[#0a0a0a]/80 backdrop-blur-sm border-neutral-800 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="font-sans text-lg font-semibold text-white">{pack.name}</span>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">{pack.description}</p>
                      <div className="text-xs text-neutral-400 font-semibold">{pack.value}</div>
                      
                      <div className="flex items-baseline gap-1 my-2">                      
                        <span className="text-2xl md:text-3xl font-bold text-white">
                          {formatPrice({ monthly: pack.priceINR, annual: pack.priceINR }, { monthly: pack.priceUSD, annual: pack.priceUSD })}
                        </span>
                      </div>

                      <button
                        className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition duration-200 bg-transparent text-white border border-neutral-700 hover:border-neutral-500 hover:bg-white/5 cursor-pointer"
                        onClick={() => handleTopUpPurchase(pack.name, currency === 'INR' ? pack.priceINR : pack.priceUSD)}
                      >
                        Purchase Now
                      </button>

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white text-xs font-medium mt-auto w-fit">
                        <IconSparkles className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{pack.points} Points</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 py-16 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-container" onClick={() => toggleFAQ(index)}>
                <div className="faq-header">
                  <h3>{faq.question}</h3>
                  {openFAQ.has(index) ? (
                    <ChevronUpIcon className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-white/60" />
                  )}
                </div>
                {openFAQ.has(index) && (
                  <div className="faq-content">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who are already using Adhyayan AI to accelerate their learning journey.
          </p>
          <button className="cta-button">
            <IconRocket className="h-6 w-6" />
            Start Your Journey Today
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
}