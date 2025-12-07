// Упрощенная версия без Blobs - работает сразу без настройки
// Для постоянного хранения используйте версию messages-blobs.js

// Временное хранилище в памяти
// Внимание: данные не сохраняются между перезапусками serverless функций
// Для production рекомендуется использовать версию с Netlify Blobs
let messagesCache = [];

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // GET - получить все сообщения
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messagesCache),
      };
    }

    // POST - создать новое сообщение
    if (event.httpMethod === 'POST') {
      const { text, author } = JSON.parse(event.body || '{}');

      if (!text || text.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message text is required' }),
        };
      }

      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        author: author || 'Anonymous',
        timestamp: new Date().toISOString(),
      };

      messagesCache.push(message);
      
      // Ограничиваем размер кэша (последние 100 сообщений)
      if (messagesCache.length > 100) {
        messagesCache = messagesCache.slice(-100);
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(message),
      };
    }

    // DELETE - удалить сообщение
    if (event.httpMethod === 'DELETE') {
      // Получаем ID из query параметров или path параметров
      const id = event.queryStringParameters?.id || event.pathParameters?.id;
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message ID is required' }),
        };
      }

      const index = messagesCache.findIndex((msg) => msg.id === id);

      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Message not found' }),
        };
      }

      messagesCache.splice(index, 1);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

