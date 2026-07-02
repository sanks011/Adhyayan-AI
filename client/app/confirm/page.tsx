'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { CustomNavbar } from "@/components/custom/CustomNavbar";
import { CustomStickyBanner } from "@/components/custom/CustomStickyBanner";
import { 
  IconCheck, 
  IconArrowLeft,
  IconCurrencyRupee,
  IconCurrencyDollar,
  IconSparkles,
  IconCreditCard,
  IconCalendar,
  IconShield
} from '@tabler/icons-react';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import { getGyanPointsForPlan } from '@/lib/gyan-points-utils';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const StyledWrapper = styled.div`
  .confirmation-container {
    background: linear-gradient(135deg, #1a1e24 0%, #2a2e34 100%);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .plan-header {
    background: linear-gradient(135deg, #975af4, #2f7cf8 40%, #78aafa 65%, #934cff);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }

  .plan-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }

  .price-display {
    font-size: 48px;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .features-grid {
    display: grid;
    gap: 12px;
    margin: 24px 0;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .feature-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .billing-toggle {
    background: #2a2e34;
    border-radius: 12px;
    padding: 4px;
    display: inline-flex;
    margin: 16px 0;
  }

  .billing-option {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #bab9b9;
  }

  .billing-option.active {
    background: linear-gradient(135deg, #975af4, #2f7cf8);
    color: white;
    box-shadow: 0 4px 12px rgba(151, 90, 244, 0.3);
  }

  .currency-toggle {
    background: #2a2e34;
    border-radius: 12px;
    padding: 4px;
    display: inline-flex;
    margin: 16px 0;
  }

  .currency-option {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #bab9b9;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .currency-option.active {
    background: linear-gradient(135deg, #975af4, #2f7cf8);
    color: white;
    box-shadow: 0 4px 12px rgba(151, 90, 244, 0.3);
  }

  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
    width: 100%;
  }

  .back-button {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px 24px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .summary-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .savings-badge {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .gyan-points-display {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

interface PlanData {
  name: string;
  priceINR: { monthly: number; annual: number };
  priceUSD: { monthly: number; annual: number };
  period: string | { monthly: string; annual: string };
  description: string;
  gyanPoints: number;
  features: string[];
  currency: 'INR' | 'USD';
  billingCycle: 'monthly' | 'annual';
  type: 'subscription';
}

interface PackData {
  name: string;
  points: number;
  priceINR: number;
  priceUSD: number;
  description: string;
  currency: 'INR' | 'USD';
  type: 'topup';
}

function ConfirmPageLoading(): React.ReactElement {
  return (
    <StyledWrapper>
      <CustomNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading payment details...</p>
        </div>
      </div>
      <CustomStickyBanner />
    </StyledWrapper>
  );
}

function ConfirmPageContent(): React.ReactElement {
  const params = useSearchParams();
  const router = useRouter();
  
  const searchParams = useMemo(() => params, [params]);
  
  const [planData, setPlanData] = useState<PlanData | PackData | null>(null);
  const [currentCurrency, setCurrentCurrency] = useState<'INR' | 'USD'>('INR');
  const [currentBillingCycle, setCurrentBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const parsedData = JSON.parse(dataParam);
        setPlanData(parsedData);
        setCurrentCurrency(parsedData.currency || 'INR');
        if (parsedData.type === 'subscription') {
          setCurrentBillingCycle(parsedData.billingCycle || 'monthly');
        }
      } catch (error) {
        console.error('Error parsing plan data:', error);
        router.push('/pricing');
      }
    } else {
      router.push('/pricing');
    }
  }, [searchParams, router]);

  const formatPrice = (amount: number, currency: 'INR' | 'USD') => {
    return `${currency === 'INR' ? '₹' : '$'}${amount.toLocaleString()}`;
  };

  const getCurrentPrice = () => {
    if (!planData) return 0;
    
    try {
      if (planData.type === 'subscription') {
        const subscriptionData = planData as PlanData;
        const priceData = currentCurrency === 'INR' ? 
          (subscriptionData.priceINR || { monthly: 999, annual: 9990 }) : 
          (subscriptionData.priceUSD || { monthly: 12, annual: 120 });
        
        return priceData[currentBillingCycle] || priceData.monthly || 0;
      } else {
        const topupData = planData as PackData;
        return currentCurrency === 'INR' ? 
          (topupData.priceINR || 999) : 
          (topupData.priceUSD || 12);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      return currentCurrency === 'INR' ? 999 : 12;
    }
  };

  const getAnnualSavings = () => {
    if (!planData || planData.type !== 'subscription') return 0;
    
    try {
      const subscriptionData = planData as PlanData;
      const priceData = currentCurrency === 'INR' 
        ? (subscriptionData.priceINR || { monthly: 999, annual: 9990 }) 
        : (subscriptionData.priceUSD || { monthly: 12, annual: 120 });
      
      const monthlyCost = (priceData.monthly || 0) * 12;
      const annualCost = priceData.annual || 0;
      return monthlyCost - annualCost;
    } catch (error) {
      console.error("Error calculating annual savings:", error);
      return 0;
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentPrice = getCurrentPrice();
      const planName = planData?.name || 'Default Plan';
      const planId = planData?.name?.toLowerCase().replace(/\s+/g, '_') || 'default_plan';
      
      const firebaseUserId = localStorage.getItem('firebaseUserId');
      if (!firebaseUserId) {
        throw new Error('Please log in to continue with payment');
      }
      
      const gyanPoints = getGyanPointsForPlan(planId);
      
      console.log('Creating Razorpay order:', { amount: currentPrice, currency: currentCurrency, planId });
      
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: currentPrice,
          currency: currentCurrency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            planId,
            planName,
            userId: firebaseUserId,
            gyanPoints,
          },
        }),
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const orderData = await orderResponse.json();
      console.log('Razorpay order created:', orderData.orderId);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Adhyayan AI',
        description: `${planName} - ${gyanPoints} Gyan Points`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying...', response);
            
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: firebaseUserId,
                planId,
                amount: currentPrice,
                currency: currentCurrency,
              }),
            });
            
            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }
            
            const verifyData = await verifyResponse.json();
            console.log('Payment verified successfully:', verifyData);
            
            toast.success(`Payment successful! ${gyanPoints} Gyan Points added to your account.`);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('paymentSuccess', { 
                detail: { txnHash: response.razorpay_payment_id } 
              }));
            }
            
            setTimeout(() => {
              router.push(`/payment-success?txn=${response.razorpay_payment_id}&plan=${encodeURIComponent(planName)}&amount=${currentPrice}&currency=${currentCurrency}&points=${gyanPoints}&method=razorpay`);
            }, 1500);
            
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
            setError(error instanceof Error ? error.message : 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#975af4',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };
      
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          setLoading(false);
          toast.error('Failed to load Razorpay. Please try again.');
        };
        document.body.appendChild(script);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
      
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setError(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  if (!planData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  const isSubscription = planData.type === 'subscription';
  const subscriptionData = isSubscription ? planData as PlanData : null;
  const topupData = !isSubscription ? planData as PackData : null;

  return (
    <StyledWrapper>
      <div className="min-h-screen bg-black text-white">
        <div className="relative z-50">
          <CustomStickyBanner />
          <CustomNavbar />
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => router.back()}
                className="back-button"
              >
                <IconArrowLeft className="h-4 w-4" />
                Back to Pricing
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Confirm Your Purchase</h1>
                <p className="text-white/60 mt-2">Review your selection and complete your purchase</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Plan Details */}
              <div className="lg:col-span-2">
                <div className="confirmation-container">
                  <div className="plan-header">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {planData.name}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {planData.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="price-display">
                          {formatPrice(getCurrentPrice(), currentCurrency)}
                        </div>
                        <div className="text-white/60 text-sm">
                          {isSubscription 
                            ? (typeof subscriptionData?.period === 'string' 
                                ? subscriptionData.period 
                                : (subscriptionData?.period && 
                                   typeof subscriptionData.period === 'object' && 
                                   subscriptionData.period[currentBillingCycle] !== undefined)
                                  ? subscriptionData.period[currentBillingCycle]
                                  : currentBillingCycle === 'monthly' ? 'Monthly' : 'Annual')
                            : 'One-time purchase'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gyan Points Display */}
                  <div className="gyan-points-display">
                    <IconSparkles className="h-6 w-6 text-white" />
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {isSubscription ? subscriptionData!.gyanPoints : topupData!.points} Gyan Points
                      </div>
                      <div className="text-white/70 text-sm">
                        {isSubscription ? 'Renewed every billing cycle' : 'Added to your account immediately'}
                      </div>
                    </div>
                  </div>

                  {/* Currency Toggle */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white/60 text-sm">Currency:</span>
                    <div className="currency-toggle">
                      <button
                        onClick={() => setCurrentCurrency('INR')}
                        className={clsx("currency-option", { active: currentCurrency === 'INR' })}
                      >
                        <IconCurrencyRupee className="h-4 w-4" />
                        INR
                      </button>
                      <button
                        onClick={() => setCurrentCurrency('USD')}
                        className={clsx("currency-option", { active: currentCurrency === 'USD' })}
                      >
                        <IconCurrencyDollar className="h-4 w-4" />
                        USD
                      </button>
                    </div>
                  </div>

                  {/* Billing Cycle Toggle (only for subscriptions) */}
                  {isSubscription && (
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-white/60 text-sm">Billing Cycle:</span>
                      <div className="billing-toggle">
                        <button
                          onClick={() => setCurrentBillingCycle('monthly')}
                          className={clsx("billing-option", { active: currentBillingCycle === 'monthly' })}
                        >
                          <IconCalendar className="h-4 w-4 mr-2" />
                          Monthly
                        </button>
                        <button
                          onClick={() => setCurrentBillingCycle('annual')}
                          className={clsx("billing-option", { active: currentBillingCycle === 'annual' })}
                        >
                          <IconCalendar className="h-4 w-4 mr-2" />
                          Annual
                        </button>
                      </div>
                      {currentBillingCycle === 'annual' && getAnnualSavings() > 0 && (
                        <div className="savings-badge">
                          <IconSparkles className="h-3 w-3" />
                          Save {formatPrice(getAnnualSavings(), currentCurrency)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features List (only for subscriptions) */}
                  {isSubscription && subscriptionData?.features && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-white">
                        What's Included
                      </h3>
                      <div className="features-grid">
                        {subscriptionData.features.map((feature, index) => (
                          <div key={index} className="feature-item">
                            <div className="flex-shrink-0">
                              <IconCheck className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-white/90 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="lg:col-span-1">
                <div className="confirmation-container">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Purchase Summary
                  </h3>
                
                  <div className="summary-section">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/70">Plan</span>
                      <span className="text-white font-medium">{planData.name}</span>
                    </div>
                    
                    {isSubscription && (
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/70">Billing</span>
                        <span className="text-white font-medium capitalize">{currentBillingCycle}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/70">Currency</span>
                      <span className="text-white font-medium">{currentCurrency}</span>
                    </div>
                    
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-white font-bold text-lg">
                          {formatPrice(getCurrentPrice(), currentCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
                    <IconShield className="h-4 w-4" />
                    <span>Secure & encrypted payment</span>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-6 w-full flex flex-col gap-4">
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <IconCreditCard className="h-5 w-5" />
                          Continue with Razorpay
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-white/60 text-xs">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #374151',
          }
        }}
      />
    </StyledWrapper>
  );
}

export default function ConfirmPage(): React.ReactElement {
  return (
    <Suspense fallback={<ConfirmPageLoading />}>
      <ConfirmPageContent />
    </Suspense>
  );
}
