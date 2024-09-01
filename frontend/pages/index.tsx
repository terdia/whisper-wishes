import type { NextPage } from 'next'
import Head from 'next/head'
import WishCreator from '../components/WishCreator'

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <Head>
        <title>Whisper Wishes</title>
        <meta name="description" content="Make your wishes come true" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="text-center py-8 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Whisper. Wish. Wonder.</h1>
        <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto">
          Plant your wishes in our digital dandelion field and let your dreams take flight. 
          Share your aspirations, support others, and watch as the community grows together.
        </p>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <WishCreator />
      </main>

      <footer className="bg-purple-800 text-white py-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Whisper Wishes. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Home