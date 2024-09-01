import type { NextPage } from 'next'
import Head from 'next/head'
import WishCreator from '../components/WishCreator'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Whisper Wishes</title>
        <meta name="description" content="Make your wishes come true" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="text-center py-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <h1 className="text-4xl font-bold text-white mb-2">Whisper. Wish. Wonder.</h1>
        <p className="text-xl text-white">
          Plant your wishes in our digital dandelion field and let your dreams take flight.
        </p>
      </header>

      <WishCreator />
    </div>
  )
}

export default Home