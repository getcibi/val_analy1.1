function getApiKey() {
  return typeof window !== 'undefined' ? process.env.API_KEY : process.env.SERVER_API_KEY;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`文件上传失败: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.fileId;
}

export async function submitData(data) {
  console.log('开始提交数据:', data);
  try {
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: process.env.WORKFLOW_ID,
        parameters: data,
      }),
    })

    console.log('工作流提交响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('工作流提交失败. 状态码:', response.status, '错误:', errorText);
      throw new Error(`工作流提交失败: ${response.status} ${errorText}`);
    }

    const result = await response.json()
    console.log('工作流提交成功. 返回数据:', result);
    return result
  } catch (error) {
    console.error('工作流提交过程中发生错误:', error);
    throw error;
  }
}

// 我们不需要 checkStatus 函数，因为 API 不提供状态检查的端点

export async function getFileUrl(fileId) {
  try {
    const response = await fetch(`https://api.coze.cn/v1/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取文件URL失败: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('获取文件URL时发生错误:', error);
    throw error;
  }
}

export async function analyzeData(formData) {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('API请求失败')
  }

  return await response.json()
}

export async function sendChatMessage(content) {
  console.log('准备发送聊天消息:', content);

  const parsedContent = JSON.parse(content);
  
  const formattedMessage = [
    {
      type: "text",
      text: `游戏名字: ${parsedContent.name}, 游戏时长: ${parsedContent.gameTime}`
    },
    {
      type: "image",
      file_id: parsedContent.input2
    },
    {
      type: "file",
      file_id: parsedContent.input1
    }
  ];

  const requestBody = {
    bot_id: process.env.NEXT_PUBLIC_BOT_ID,
    user_id: 'user123',
    additional_messages: [
      {
        role: 'user',
        content: JSON.stringify(formattedMessage),
        content_type: "object_string"
      }
    ],
    stream: false,
  };

  console.log('发送聊天消息请求体:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('聊天消息响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('聊天消息发送失败. 状态码:', response.status, '错误:', errorText);
    throw new Error(`聊天消息发送失败: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('聊天消息发送成功. 返回数据:', JSON.stringify(result, null, 2));
  return result;
}

export async function pollForResult(conversationId, chatId) {
  console.log('开始轮询结果. 会话ID:', conversationId, '聊天ID:', chatId);
  let attempts = 0;
  const maxAttempts = 60;
  const delay = 3000;

  while (attempts < maxAttempts) {
    console.log(`轮询尝试 ${attempts + 1}/${maxAttempts}`);
    const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}&chat_id=${chatId}`);

    console.log('轮询响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('获取消息失败. 状态码:', response.status, '错误:', errorText);
      if (response.status === 404 || errorText.includes("Invalid chat")) {
        console.log('聊天还未准备好，继续轮询...');
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        continue;
      }
      throw new Error(`获取消息失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('轮询返回数据:', JSON.stringify(result, null, 2));

    if (result.data && result.data.length > 0) {
      for (let message of result.data) {
        if (message.type === 'tool_response' && message.content) {
          try {
            const contentObj = JSON.parse(message.content);
            if (contentObj.output) {
              console.log('聊天已完成，返回结果');
              return contentObj.output;
            }
          } catch (error) {
            console.error('解析消息内容时出错:', error);
          }
        }
      }
    }

    console.log(`等待 ${delay}ms 后进行下一次轮询`);
    await new Promise(resolve => setTimeout(resolve, delay));
    attempts++;
  }

  console.error('获取结果超时');
  throw new Error('获取结果超时');
}

export async function getChatMessages(conversationId, chatId) {
  console.log('获取聊天消息. 会话ID:', conversationId, '聊天ID:', chatId);

  const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}&chat_id=${chatId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('获取聊天消息响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取聊天消息失败. 状态码:', response.status, '错误:', errorText);
    throw new Error(`获取聊天消息失败: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('获取聊天消息成功. 返回数据:', JSON.stringify(result, null, 2));
  return result;
}
