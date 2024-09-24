import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { Star, Globe, TrendingUp, Zap, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import { usePageTracking } from '../hooks/usePageTracking';
import { supabase } from '../utils/supabaseClient';
import CookieConsent from '../components/CookieConsent'
import HeroSection from '../components/HeroSection';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: any;
  stripe_price_id: string;
}

export const getStaticProps: GetStaticProps = async () => {
  // Fetch subscription plans
  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return { props: { plans: [] } };
  }

  return {
    props: {
      title: "Dandy Wishes | Make Your Dreams Take Flight",
      description: "Plant your wishes in our digital dandelion field and watch them bloom. Join Dandy Wishes to create, share, and support wishes in a unique community.",
      canonical: "https://www.dandywishes.app/",
      ogImage: "https://www.dandywishes.app/og-home-image.jpg",
      plans: plans
    },
    revalidate: 3600 // Revalidate every hour
  };
};


const LandingPage: React.FC<{ plans: SubscriptionPlan[] }> = ({ plans }) => {
  usePageTracking();
  const [isYearly, setIsYearly] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const features = [
    { icon: Star, title: "Create Wishes", description: "Transform your dreams into digital dandelion seeds" },
    { icon: Globe, title: "Global Wish Garden", description: "Share and explore wishes from around the world" },
    { icon: TrendingUp, title: "Track Progress", description: "Monitor your wish journey and celebrate achievements" },
    { icon: Zap, title: "Wish Amplification", description: "Boost visibility and support for your most important wishes" },
  ];

  const howItWorks = [
    { step: 1, title: "Create a Wish", description: "Type your wish and watch it become a glowing dandelion seed" },
    { step: 2, title: "Share or Amplify", description: "Choose to share in the Global Garden or amplify for more visibility" },
    { step: 3, title: "Nurture and Grow", description: "Water wishes, track progress, and celebrate achievements" },
  ];

  const freePlan = plans.find(plan => plan.name === 'Free Tier');
  const monthlyPremiumPlan = plans.find(plan => plan.name === 'Premium Tier' && plan.interval === 'monthly');
  const yearlyPremiumPlan = plans.find(plan => plan.name === 'Premium Tier (Annual)' && plan.interval === 'yearly');

  const activePremiumPlan = isYearly ? yearlyPremiumPlan : monthlyPremiumPlan;

  const savings = yearlyPremiumPlan && monthlyPremiumPlan
    ? ((monthlyPremiumPlan.price * 12 - yearlyPremiumPlan.price) / (monthlyPremiumPlan.price * 12) * 100).toFixed(0)
    : '0';

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
        return value ? 'Priority customer support' : '';
      default:
        return `${feature.replace(/_/g, ' ')}: ${value}`;
    }
  };

  const testimonials = [
    { name: "Sarah M.", text: "Dandy Wishes helped me visualize and achieve my goals. It's like magic!" },
    { name: "John D.", text: "The community support on Dandy Wishes is incredible. My wishes are coming true!" },
    { name: "Emily R.", text: "I love how I can track my progress and celebrate small wins. Highly recommended!" },
  ];

  const faqs = [
    { 
      question: "What is Dandy Wishes?", 
      answer: "Dandy Wishes is a digital platform that helps you visualize, track, and achieve your goals and dreams. It uses a unique dandelion metaphor to represent your wishes and allows you to share and support others in a global community." 
    },
    { 
      question: "How does wish amplification work?", 
      answer: "Wish amplification is a feature that boosts the visibility of your wishes in the Global Wish Garden. It increases the chances of your wish being seen and supported by other users, potentially accelerating your progress towards achieving it." 
    },
    { 
      question: "Is my data private?", 
      answer: "Yes, we take your privacy seriously. You have full control over which wishes you want to keep private and which ones you want to share in the Global Wish Garden. Our robust security measures ensure your data is protected." 
    },
    {
      question: "How much does Dandy Wishes cost?",
      answer: "Dandy Wishes offers a free tier with basic features, and a premium tier with advanced features. The premium tier is available as a monthly or yearly subscription. Check our pricing section for current rates and features."
    },
    {
      question: "Can I use Dandy Wishes on my mobile device?",
      answer: "Yes, Dandy Wishes is fully responsive and works on all modern mobile devices. You can access it through your mobile browser or download our app from the App Store or Google Play Store."
    },
    {
      question: "How do I track progress on my wishes?",
      answer: "Dandy Wishes provides a progress tracking feature where you can update the status of your wishes, set milestones, and see your advancement visually represented on your personal dandelion."
    },
    {
      question: "What is the Global Wish Garden?",
      answer: "The Global Wish Garden is a shared space where users can view and support public wishes from the Dandy Wishes community. It's a place for inspiration, connection, and mutual encouragement."
    },
    {
      question: "How can I support other people's wishes?",
      answer: "There are several ways to support others in the Dandy Wishes community:<br><br>1. <strong>Watering:</strong> You can 'water' wishes in the Global Wish Garden. This sends encouragement to the wish creator and helps boost the visibility of their wish.<br><br>2. <strong>Offering Help:</strong> For amplified wishes, you can offer practical assistance or resources to help the wish creator achieve their goal. This could be anything from sharing knowledge to providing tangible support.<br><br>3. <strong>Mentorship:</strong> If you have expertise or experience relevant to someone's amplified wish, you can offer to mentor them. This creates a more personal connection and can significantly impact the wish's success.<br><br>4. <strong>Messaging:</strong> You can send supportive messages or advice directly to the wish creator through our messaging system.<br><br>Remember, the strength of Dandy Wishes lies in our supportive community. Your encouragement and assistance can make a real difference in helping others achieve their dreams!"
    },
    {
      question: "Can I edit or delete my wishes?",
      answer: "Yes, you have full control over your wishes. You can edit, update, or delete your wishes at any time from your personal dashboard."
    },
    {
      question: "Is there a limit to how many wishes I can create?",
      answer: "Free tier users can create up to 10 wishes. Premium users have unlimited wish creation."
    },
    {
      question: "What happens if I cancel my premium subscription?",
      answer: "If you cancel your premium subscription, you'll retain access to premium features until the end of your current billing period. After that, your account will revert to the free tier, but you won't lose any of your existing wishes."
    },
    {
      question: "Can I export my wish data?",
      answer: "Yes, premium users can export their wish data in various formats for personal record-keeping or analysis."
    },
    {
      question: "What's your refund policy?",
      answer: "Just like wishing on a dandelion, once you've blown on it, there's no taking it back! Similarly, when you subscribe to Dandy Wishes, you're investing in your dreams and our magical little community. While we don't offer refunds, we pour our hearts into making sure you have an amazing experience. Think of it like buying us a coffee to fuel the creation of more wish-granting features. If you ever feel your experience is less than stellar, please reach out to our support team – we're always here to make things right and ensure your time with us is nothing short of wonderful!"
    },
    {
      question: "Can I change or cancel my subscription?",
      answer: "Absolutely! While we don't offer refunds, you have full control over your subscription. You can upgrade, downgrade, or cancel at any time. If you cancel, you'll continue to have access to premium features until the end of your current billing period. After that, your account will simply revert to our free tier, but don't worry – you won't lose any of your precious wishes or data!"
    },
    {
      question: "How can I contact support if I have issues or questions?",
      answer: "You can reach our support team by emailing contact@dandywishes.app. Premium users also have access to priority support."
    }
  ];

  // Add this function to safely render HTML content
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <>
      <main className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen">
        <HeroSection />

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">Features That Make Wishes Come True</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-purple-100 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <feature.icon className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-2xl font-semibold mb-2 text-purple-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-20 text-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">How Dandy Wishes Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
              {howItWorks.map((step, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-lg p-6 text-center shadow-lg max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-purple-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">Choose Your Wishing Plan</h2>
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
                        <Wind className="h-5 w-5 text-green-500 mr-2" />
                        {formatFeature(feature, value)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <a className="w-full py-2 px-4 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 text-center">
                      Get Started
                    </a>
                  </Link>
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
                        <Wind className="h-5 w-5 text-green-500 mr-2" />
                        {formatFeature(feature, value)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?plan=premium">
                    <a className="w-full py-2 px-4 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 text-center">
                      Signup Now
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-purple-100 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    className="flex justify-between items-center w-full text-left p-4 bg-white rounded-lg focus:outline-none shadow-md hover:shadow-lg transition-shadow duration-300"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="font-semibold text-purple-800">{faq.question}</span>
                    {activeAccordion === index ? <ChevronUp className="text-purple-600" /> : <ChevronDown className="text-purple-600" />}
                  </button>
                  {activeAccordion === index && (
                    <div className="p-4 bg-white border border-purple-200 rounded-b-lg mt-2">
                      <div 
                        className="text-gray-700"
                        dangerouslySetInnerHTML={createMarkup(faq.answer)}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-8">Ready to Make Your Wishes Come True?</h2>
            <Link href="/signup">
              <a className="bg-white text-purple-800 px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-100 transition duration-300 shadow-lg">
                Join Dandy Wishes Today
              </a>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-purple-800 text-white py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm mb-4">
            &copy; {new Date().getFullYear()} Dandy Wishes. All rights reserved.
          </p>
          <nav className="flex justify-center space-x-4 text-sm">
            <Link href="/privacy-policy">
              <a className="hover:underline">Privacy Policy</a>
            </Link>
            <Link href="/terms-of-service">
              <a className="hover:underline">Terms of Service</a>
            </Link>
          </nav>
        </div>
      </footer>

      <CookieConsent />

      {/* Floating CTA Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/wishboard">
          <a className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition duration-300 shadow-lg">
            Start Wishing
          </a>
        </Link>
      </div>
    </>
  );
};

export default LandingPage;