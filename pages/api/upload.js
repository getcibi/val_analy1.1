import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: '文件解析失败' });
      }

      const file = files.file;
      if (!file || !file[0]) {
        console.error('No file received');
        return res.status(400).json({ error: '没有收到文件' });
      }

      const uploadedFile = file[0];
      console.log('File received:', uploadedFile.originalFilename);

      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(uploadedFile.filepath), {
          filename: uploadedFile.originalFilename,
          contentType: uploadedFile.mimetype,
        });

        console.log('Sending request to Coze API...');
        const response = await axios.post('https://api.coze.cn/v1/files/upload', formData, {
          headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            ...formData.getHeaders(),
          },
          timeout: serverRuntimeConfig.apiTimeout,
        });

        console.log('Coze API response:', response.data);
        res.status(200).json({ fileId: response.data.data.id });
      } catch (error) {
        console.error('File upload error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: '文件上传失败', details: error.message });
      } finally {
        // 清理临时文件
        fs.unlink(uploadedFile.filepath, (err) => {
          if (err) console.error('临时文件删除失败:', err);
        });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
