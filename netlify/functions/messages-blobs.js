const { getStore } = require('@netlify/blobs');

// Инициализация хранилища
let messagesStore = null;

async function getMessagesStore() {
  if (!messagesStore) {
    messagesStore = getStore('messages');
  }
  return messagesStore;
}

// Загрузка сообщений из хранилища
async function loadMessages() {
  try {
    const store = await getMessagesStore();
    const data = await store.get('messages', { type: 'json' });
    return data || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

// Сохранение сообщений в хранилище
async function saveMessages(messages) {
  try {
    const store = await getMessagesStore();
    await store.set('messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
    throw error;
  }
}

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
      const messages = await loadMessages();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messages),
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

      const messages = await loadMessages();
      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        author: author || 'Anonymous',
        timestamp: new Date().toISOString(),
      };

      messages.push(message);
      await saveMessages(messages);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(message),
      };
    }

    // DELETE - удалить сообщение
    if (event.httpMethod === 'DELETE') {
      const { id } = event.pathParameters || {};
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message ID is required' }),
        };
      }

      const messages = await loadMessages();
      const index = messages.findIndex((msg) => msg.id === id);

      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Message not found' }),
        };
      }

      messages.splice(index, 1);
      await saveMessages(messages);

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

