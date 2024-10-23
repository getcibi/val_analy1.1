import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { conversation_id, chat_id } = req.query;

    if (!conversation_id || !chat_id) {
      return res.status(400).json({ error: 'Missing conversation_id or chat_id' });
    }

    try {
      const response = await axios.get(`https://api.coze.cn/v3/chat/message/list`, {
        params: {
          conversation_id,
          chat_id,
        },
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'An error occurred' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
