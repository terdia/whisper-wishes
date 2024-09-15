import React, { useState } from 'react';
import { Mail, XCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      title:"Magic Link Login",
      description:"Log in to Dandy Wishes using a magic link sent to your email.",
      canonical: `https://www.dandywishes.app/magic-link`
    },
  };
};

export default function MagicLinkLogin() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { sendMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMagicLink(email);
      setIsSuccess(true);
      setModalMessage('Magic link sent! Check your email to log in.');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setIsSuccess(false);
      setModalMessage('An error occurred. Please try again.');
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Login with Magic Link</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Send Magic Link
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login">
          <a className="font-medium text-blue-600 hover:text-blue-500">Log in</a>
        </Link>
      </p>

      {/* Modal for both error and success messages */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                {isSuccess ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{isSuccess ? 'Success' : 'Error'}</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {modalMessage}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className={`px-4 py-2 ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-${isSuccess ? 'green' : 'red'}-300`}
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}