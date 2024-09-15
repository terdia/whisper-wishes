import React from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Link from 'next/link';
import BackButton from '../components/BackButton';

const PrivacyPolicy: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Privacy Policy"
        description="Learn how Dandy Wishes protects your privacy and handles your personal data. Understand your rights and our commitment to data security."
        canonical={`https://dandywishes.app${router.asPath}`}
      />
      <BackButton className="mb-4" />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-purple-800">Privacy Policy</h1>
        <p className="mb-4 text-gray-600">Last updated: 2024-09-08</p>
        <p className="mb-6 text-gray-700">
          At Dandy Wishes, we believe in the magic of wishes and the importance of privacy. This policy outlines our commitment to protecting your personal data and your rights as a valued member of our wishing community.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">1. Information We Collect</h2>
        <p className="mb-4 text-gray-700">
          To make your wishing experience magical, we collect:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Your email address (for account management and communications)</li>
          <li>Your chosen username (for identification within the community)</li>
          <li>Your wishes and interactions (to provide and improve our services)</li>
          <li>Usage data (to enhance your experience and our platform)</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">2. How We Use Your Information</h2>
        <p className="mb-4 text-gray-700">
          Your information helps us:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Create and manage your Dandy Wishes account</li>
          <li>Provide and maintain our wishing services</li>
          <li>Notify you about changes and updates to our platform</li>
          <li>Allow you to participate in interactive features when you choose to</li>
          <li>Analyze usage patterns to improve our services</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">3. Data Security</h2>
        <p className="mb-4 text-gray-700">
          We implement strong security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">4. Your Rights</h2>
        <p className="mb-4 text-gray-700">
          You have the right to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Access and receive a copy of your personal data</li>
          <li>Rectify any inaccurate or incomplete personal data</li>
          <li>Request erasure of your personal data</li>
          <li>Object to or restrict the processing of your personal data</li>
          <li>Data portability (receive your data in a structured, commonly used format)</li>
        </ul>
        <p className="mb-4 text-gray-700">
          To exercise these rights, please contact us at{' '}
          <a href="mailto:contact@dandywishes.app" className="text-purple-600 hover:underline">contact@dandywishes.app</a>.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">5. Changes to This Policy</h2>
        <p className="mb-4 text-gray-700">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">6. Contact Us</h2>
        <p className="mb-4 text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:contact@dandywishes.app" className="text-purple-600 hover:underline">contact@dandywishes.app</a>.
        </p>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link href="/terms-of-service">
            <a className="text-purple-600 hover:underline">View our Terms of Service</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;