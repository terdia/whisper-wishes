import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <section className="text-white py-20 bg-gradient-to-br from-purple-600 to-indigo-800">
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Make Your Dreams <span className="text-yellow-300">Take Flight</span>
          </motion.h1>
          <motion.p 
            className="text-xl mb-8 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Plant your wishes in our digital dandelion field and watch them bloom into reality
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/wishboard">
              <a className="bg-yellow-400 text-purple-800 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Wishing Now
              </a>
            </Link>
          </motion.div>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative z-10"
          >
            <Image
              src="/dandy-wishes-hero.jpeg"
              alt="Dandelion field under a starry night sky with floating wish symbols"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
          <div className="absolute top-0 left-0 w-full h-full bg-purple-400 rounded-lg transform rotate-3 -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;