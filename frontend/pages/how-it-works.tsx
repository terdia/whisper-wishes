import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Heart, Globe, Star, Zap, Sun, Crown } from 'lucide-react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      title:"How Dandy Wishes Works | Your Guide to Wishing",
        description:"Learn how to create, share, and interact with wishes on Dandy Wishes. Discover our unique features and start your wishing journey today.",
        canonical: `https://www.dandywishes.app/how-it-works`
    },
  };
};

const HowItWorks: React.FC = () => {
  const steps = [
    { icon: Wind, title: "Create Your Wish", description: "Type your wish (up to 200 characters) and watch it become a glowing dandelion seed." },
    { icon: Heart, title: "Interact with Wishes", description: "Drag wishes around, blow them away, and watch them float across your screen." },
    { icon: Star, title: "Save and Manage", description: "Keep your favorite wishes in your personal collection and manage them easily." },
    { icon: Globe, title: "Share Globally", description: "Anonymously share wishes in the Global Wish Garden and support others' wishes." },
    { icon: Zap, title: "Track Progress", description: "View your wish-making stats and earn achievements based on your activity." },
    { icon: Sun, title: "Get Inspired", description: "Check out daily prompts and participate in themed wishing events." },
    { icon: Crown, title: "Go Premium", description: "Upgrade for boosted visibility and exclusive dandelion designs." },
  ];

  return (
    <>
      <div className="min-h-[calc(100vh-25rem)] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How Dandy Wishes Works
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white text-purple-600 rounded-full p-3 mr-4">
                    <step.icon size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                </div>
                <p className="text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p className="text-lg mb-4">Ready to make your wishes come true?</p>
            <Link href="/">
              <button className="bg-white text-purple-600 font-semibold py-2 px-6 rounded-full hover:bg-opacity-90 transition-colors duration-300">
                Start Wishing Now
              </button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-opacity-20 select-none"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                x: [null, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            >
              ❁
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HowItWorks;