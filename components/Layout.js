import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Valorant 数据分析</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
