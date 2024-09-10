import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { Switch } from '@headlessui/react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: any;
  stripe_price_id: string;
}

const Subscription: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans(data);
      }

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('user_subscriptions')
          .select('subscription_plans(*)')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user plan:', userError);
        } else if (userData) {
          setCurrentPlan(userData.subscription_plans);
        }
      }

      setIsLoading(false);
    };

    fetchPlans();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    // Implement upgrade logic here
    console.log('Upgrading to plan:', planId);
  };

  const formatFeature = (feature: string, value: any) => {
    switch (feature) {
      case 'matching_priority':
        return `${value === 'high' ? 'Priority' : 'Standard'} matching`;
      case 'messages_per_wish':
        return `${value === 'unlimited' ? 'Unlimited' : value} messages per wish`;
      case 'progress_tracking':
        return `${value === 'advanced' ? 'Advanced' : 'Basic'} progress tracking`;
      case 'amplifications_per_month':
        return `${value === 'unlimited' ? 'Unlimited' : value} amplifications per month`;
      case 'ad_free':
        return value ? 'Ad-free experience' : '';
      default:
        return `${feature.replace(/_/g, ' ')}: ${value}`;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const freePlan = plans.find(plan => plan.name === 'Free Tier');
  const monthlyPremiumPlan = plans.find(plan => plan.name === 'Premium Tier' && plan.interval === 'monthly');
  const yearlyPremiumPlan = plans.find(plan => plan.name === 'Premium Tier (Annual)' && plan.interval === 'yearly');

  const savings = yearlyPremiumPlan && monthlyPremiumPlan
    ? ((monthlyPremiumPlan.price * 12 - yearlyPremiumPlan.price) / (monthlyPremiumPlan.price * 12) * 100).toFixed(0)
    : '0';

  const activePremiumPlan = isYearly ? yearlyPremiumPlan : monthlyPremiumPlan;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-800">Choose Your Plan</h1>
      
      <div className="flex justify-center items-center mb-8">
        <span className={`mr-3 ${!isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Monthly</span>
        <Switch
          checked={isYearly}
          onChange={setIsYearly}
          className={`${isYearly ? 'bg-purple-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
        >
          <span className={`${isYearly ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </Switch>
        <span className={`ml-3 ${isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Yearly (Save {savings}%)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {freePlan && (
          <div className="border rounded-lg p-6 flex flex-col bg-white shadow-md">
            <h2 className="text-2xl font-bold mb-2">{freePlan.name}</h2>
            <p className="text-gray-600 mb-4">{freePlan.description}</p>
            <p className="text-3xl font-bold mb-4">$0/month</p>
            <ul className="mb-6 flex-grow">
              {Object.entries(freePlan.features).map(([feature, value]) => (
                <li key={feature} className="mb-2 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {formatFeature(feature, value)}
                </li>
              ))}
            </ul>
            <button
              className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-300 text-gray-700 cursor-not-allowed"
              disabled={true}
            >
              Current Plan
            </button>
          </div>
        )}
        {activePremiumPlan && (
          <div className="border rounded-lg p-6 flex flex-col bg-white shadow-md ring-2 ring-purple-500">
            <div className="bg-purple-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full self-start mb-2">
              Recommended
            </div>
            <h2 className="text-2xl font-bold mb-2">{activePremiumPlan.name}</h2>
            <p className="text-gray-600 mb-4">{activePremiumPlan.description}</p>
            <p className="text-3xl font-bold mb-4">
              ${activePremiumPlan.price.toFixed(2)}/{activePremiumPlan.interval}
            </p>
            {isYearly && (
              <p className="text-sm text-green-600 mb-4">Save {savings}% with yearly billing</p>
            )}
            <ul className="mb-6 flex-grow">
              {Object.entries(activePremiumPlan.features).map(([feature, value]) => (
                <li key={feature} className="mb-2 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {formatFeature(feature, value)}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(activePremiumPlan.id)}
              className={`w-full py-2 px-4 rounded-lg font-semibold ${
                currentPlan && currentPlan.id === activePremiumPlan.id
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={currentPlan && currentPlan.id === activePremiumPlan.id}
            >
              {currentPlan && currentPlan.id === activePremiumPlan.id ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;