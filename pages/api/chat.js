import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const requestBody = req.body;

      const response = await axios.post('https://api.coze.cn/v3/chat', requestBody, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'An error occurred' });
    }
  } else if (req.method === 'GET') {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ error: 'Missing chatId parameter' });
    }
    try {
      const response = await axios.get(`https://api.coze.cn/v3/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'An error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
