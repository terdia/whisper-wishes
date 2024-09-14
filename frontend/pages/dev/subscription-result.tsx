import { useState } from 'react';
import SubscriptionResult from '../subscription-result';

const DevSubscriptionResult = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('success');

  return (
    <div>
      <div className="fixed top-0 left-0 z-50 bg-white p-4 shadow-md">
        <button
          onClick={() => setStatus('loading')}
          className={`px-4 py-2 mr-2 rounded ${status === 'loading' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Loading
        </button>
        <button
          onClick={() => setStatus('success')}
          className={`px-4 py-2 mr-2 rounded ${status === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Success
        </button>
        <button
          onClick={() => setStatus('failed')}
          className={`px-4 py-2 rounded ${status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Failed
        </button>
      </div>
      <SubscriptionResult devMode={true} devStatus={status} />
    </div>
  );
};

export default DevSubscriptionResult;
