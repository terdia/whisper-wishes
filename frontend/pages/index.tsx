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

      <WishCreator />
    </div>
  )
}

export default Home