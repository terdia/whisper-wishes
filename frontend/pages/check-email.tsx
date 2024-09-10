import Link from 'next/link';

export default function CheckEmail() {
  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">Check Your Email</h1>
      <p className="mb-4 text-gray-700">
        We've sent you an email with a link to confirm your account. Please check your inbox and click the link to complete your signup.
      </p>
      <p className="text-sm text-gray-600">
        Didn't receive an email? <Link href="/signup"><a className="text-purple-600 hover:underline">Try signing up again</a></Link>
      </p>
    </div>
  );
}