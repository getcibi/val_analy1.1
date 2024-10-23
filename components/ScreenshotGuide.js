import Image from 'next/image'
import Link from 'next/link'

export default function ScreenshotGuide() {
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-valorant-blue">
      <div className="max-w-4xl mx-auto glassmorphism p-6 rounded-lg shadow-2xl relative">
        <Link href="/" passHref>
          <button className="absolute top-4 right-4 bg-valorant-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-valorant-red">
            返回主页
          </button>
        </Link>

        <h1 className="text-4xl font-bold text-valorant-red mb-8">如何截图</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-valorant-white mb-4">1. 如何查看数据</h2>
            <div className="max-w-2xl mx-auto">
              <Image src="/imgs/1.jpg" alt="如何查看数据" width={600} height={338} layout="responsive" className="rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-valorant-white mb-4">2. 截图数据1</h2>
              <Image src="/imgs/2.jpg" alt="截图数据1" width={400} height={225} layout="responsive" className="rounded-lg" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-valorant-white mb-4">3. 截图数据2</h2>
              <Image src="/imgs/3.jpg" alt="截图数据2" width={400} height={225} layout="responsive" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
