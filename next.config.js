/** @type {import('next').NextConfig} */
const withImages = require('next-images')
module.exports = withImages({
  reactStrictMode: true,
  images: {
    disableStaticImages: true
  },
  env: {
    NEXT_PUBLIC_API_KEY: process.env.API_KEY,
    NEXT_PUBLIC_BOT_ID: process.env.BOT_ID,
  },
  serverRuntimeConfig: {
    // 将超时时间设置为 2 分钟
    apiTimeout: 120000,
  },
})
