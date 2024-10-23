import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { uploadFile, sendChatMessage, pollForResult } from '../utils/api'
import html2canvas from 'html2canvas'
import Link from 'next/link'

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 秒

const uploadFileWithRetry = async (file, retries = 0) => {
  try {
    return await uploadFile(file);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Upload failed, retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return uploadFileWithRetry(file, retries + 1);
    }
    throw error;
  }
};

export default function Form() {
  const [name, setName] = useState('')
  const [gameTime, setGameTime] = useState('')
  const [image1, setImage1] = useState(null)
  const [image2, setImage2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [output, setOutput] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const handleImageUpload = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      if (imageNumber === 1) {
        setImage1({ file, preview: URL.createObjectURL(file) });
      } else {
        setImage2({ file, preview: URL.createObjectURL(file) });
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('正在处理您的请求...');
    setOutput('');
    setCountdown(60);

    try {
      // 上传图片
      console.log('开始上传图片');
      const file1Id = image1 ? await uploadFileWithRetry(image1.file) : null;
      const file2Id = image2 ? await uploadFileWithRetry(image2.file) : null;
      console.log('图片上传完成. 文件ID:', file1Id, file2Id);
      setStatus('图片上传完成，正在分析...');

      // 准备聊天消息
      const messageContent = {
        name,
        gameTime,
        input1: file1Id,
        input2: file2Id
      };
      console.log('准备发送的消息内容:', messageContent);

      // 发送聊天消息
      console.log('开始发送聊天消息');
      const chatResult = await sendChatMessage(JSON.stringify(messageContent));
      console.log('聊天消息发送完成. 结果:', chatResult);
      
      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      // 轮询获取结果
      console.log('开始轮询获取结果');
      const finalResult = await pollForResult(chatResult.data.conversation_id, chatResult.data.id);
      console.log('获取到最终结果:', finalResult);

      clearInterval(timer);
      setOutput(finalResult);
      setStatus('分析完成');
    } catch (error) {
      console.error('分析过程中出错:', error);
      setStatus('分析失败，请稍后重试');
      setOutput('');
    } finally {
      setLoading(false);
    }
  }

  const resultCardRef = useRef(null);

  const downloadResult = () => {
    if (resultCardRef.current) {
      html2canvas(resultCardRef.current, {
        backgroundColor: null,
        scale: 2, // 提高图片质量
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'valorant_analysis.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-valorant-blue ${isMobile ? 'bg-fixed' : ''}`}>
      <div className={`max-w-4xl mx-auto glassmorphism p-6 rounded-lg shadow-2xl ${isMobile ? 'w-full' : ''}`}>
        <h1 className={`text-center mb-6 text-valorant-red tracking-wider ${isMobile ? 'text-4xl' : 'text-6xl'} font-bold`}>
          VALORANT
          <br className={isMobile ? '' : 'hidden'} />
          <span className="text-valorant-white"> 数据分析</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label htmlFor="name" className="block text-lg font-medium mb-1">游戏名字</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-valorant-red bg-opacity-10 bg-valorant-white"
                required
              />
            </div>
            <div>
              <label htmlFor="gameTime" className="block text-lg font-medium mb-1">游戏总时长</label>
              <input
                type="text"
                id="gameTime"
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-valorant-red bg-opacity-10 bg-valorant-white"
                required
              />
            </div>
          </div>
          <div className={`grid gap-4 grid-cols-2`}>
            <div>
              <label htmlFor="image1" className="block text-lg font-medium mb-1">数据截图 1</label>
              <div className={`image-upload relative rounded-lg overflow-hidden group cursor-pointer ${isMobile ? 'h-36' : 'h-48'}`}>
                <input
                  type="file"
                  id="image1"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 1)}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                {image1 ? (
                  <Image src={image1.preview} layout="fill" objectFit="cover" alt="Uploaded image 1" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-6xl text-valorant-red hover:text-red-700">+</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="image2" className="block text-lg font-medium mb-1">数据截图 2</label>
              <div className={`image-upload relative rounded-lg overflow-hidden group cursor-pointer ${isMobile ? 'h-36' : 'h-48'}`}>
                <input
                  type="file"
                  id="image2"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 2)}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                {image2 ? (
                  <Image src={image2.preview} layout="fill" objectFit="cover" alt="Uploaded image 2" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-6xl text-valorant-red hover:text-red-700">+</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className={`w-full bg-valorant-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-valorant-red ${isMobile ? 'text-lg' : 'text-xl'} mb-4`}
              disabled={loading}
            >
              {loading ? '处理中...' : '提交分析'}
            </button>
            
            <Link href="/screenshot-guide" passHref>
              <button
                className={`w-full bg-valorant-white hover:bg-gray-200 text-valorant-blue font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-valorant-white ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                如何截图
              </button>
            </Link>
          </div>
          <div className="mt-4 text-center">
            {loading && (
              <div className="flex flex-col justify-center items-center mb-2">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-valorant-red mb-2"></div>
                <p className="text-lg font-medium">分析中，预计还需 {countdown} 秒</p>
              </div>
            )}
            <p className="text-lg font-medium">{status}</p>
          </div>
          {output && (
            <div className="mt-6">
              <div ref={resultCardRef} className="bg-white rounded-lg shadow-lg p-4">
                <h3 className={`font-bold mb-4 text-valorant-red ${isMobile ? 'text-2xl' : 'text-3xl'}`}>分析结果</h3>
                <div className="result-box p-4 rounded-lg bg-gray-100">
                  <pre className={`whitespace-pre-wrap ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>{output}</pre>
                </div>
              </div>
              <button
                onClick={downloadResult}
                className="mt-4 bg-valorant-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                下载分析结果
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
