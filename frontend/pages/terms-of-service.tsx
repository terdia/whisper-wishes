import React from 'react';
import SEO from '../components/SEO';
import Link from 'next/link';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Terms of Service - Dandy Wishes"
        description="Understand the terms governing your use of Dandy Wishes."
      />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-purple-800">Terms of Service</h1>
        <p className="mb-4 text-gray-600">Last updated: 2024-09-08</p>
        <p className="mb-6 text-gray-700">
          Welcome to Dandy Wishes! These Terms of Service govern your use of our website and services. By accessing or using Dandy Wishes, you agree to be bound by these Terms.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">1. Acceptance of Terms</h2>
        <p className="mb-4 text-gray-700">
          By accessing or using our service, you agree to these Terms. If you disagree with any part of the terms, you may not access the service.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">2. Description of Service</h2>
        <p className="mb-4 text-gray-700">
          Dandy Wishes is a platform that allows users to create, share, and interact with wishes. We provide a space for personal growth, community support, and the pursuit of dreams.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">3. User Responsibilities</h2>
        <p className="mb-4 text-gray-700">
          As a Dandy Wishes user, you are responsible for:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Maintaining the confidentiality of your account</li>
          <li>All activities that occur under your account</li>
          <li>Ensuring that your use of the service does not violate any applicable laws or regulations</li>
          <li>The content you post, ensuring it does not infringe on the rights of others</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">4. Intellectual Property</h2>
        <p className="mb-4 text-gray-700">
          The Dandy Wishes service, including its original content, features, and functionality, is owned by Dandy Wishes and is protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">5. Your Content</h2>
        <p className="mb-4 text-gray-700">
          When you create and share wishes on Dandy Wishes, you retain full ownership of your content. To allow us to provide and improve our services, you grant us a limited license to use your content in the following ways:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Display your wishes within the Dandy Wishes platform</li>
          <li>Store and backup your content to ensure it's available when you need it</li>
          <li>Share your public wishes with other users as part of the Dandy Wishes community</li>
          <li>Analyze patterns in content to improve our services and user experience</li>
        </ul>
        <p className="mb-4 text-gray-700">
          We will never sell your content or use it for advertising purposes. Our use of your content is solely for providing and improving the Dandy Wishes service.
        </p>
        <p className="mb-4 text-gray-700">
          You can delete your wishes at any time, which will remove them from public view immediately. However, please note that deleted wishes may persist in our backups for a limited time to ensure data integrity and recovery in case of technical issues.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">6. Termination</h2>
        <p className="mb-4 text-gray-700">
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">7. Limitation of Liability</h2>
        <p className="mb-4 text-gray-700">
          In no event shall Dandy Wishes, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">8. Changes to Terms</h2>
        <p className="mb-4 text-gray-700">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700">9. Contact Us</h2>
        <p className="mb-4 text-gray-700">
          If you have any questions about these Terms, please contact us at{' '}
          <a href="mailto:contact@dandywishes.app" className="text-purple-600 hover:underline">contact@dandywishes.app</a>.
        </p>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link href="/privacy-policy">
            <a className="text-purple-600 hover:underline">View our Privacy Policy</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;