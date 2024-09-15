import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import AmplifiedWishDetail from '../../components/AmplifiedWishDetail';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthenticatedUserPrompt from '../../components/UnauthenticatedUserPrompt';

const AmplifiedWishPage: React.FC = () => {
  const router = useRouter();
  const { wishId } = router.query;
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <>
        <UnauthenticatedUserPrompt />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <AmplifiedWishDetail wishId={wishId as string} />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { wishId } = context.params as { wishId: string };

  if (!wishId) {
    return {
      props: {
        title:"Amplified Wish",
          description:"View details and interact with an amplified wish on Dandy Wishes. Support dreams and connect with the wishing community.",
          canonical: `https://www.dandywishes.app/amplified-wish/${wishId}`
      },
    };
  }

  return {
    props: {
      title:"Amplified Wish",
        description:"View details and interact with an amplified wish on Dandy Wishes. Support dreams and connect with the wishing community.",
        canonical: `https://www.dandywishes.app/amplified-wish/${wishId}`
    },
  };
};

export default AmplifiedWishPage;