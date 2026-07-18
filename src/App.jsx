import React, { useState } from 'react';

// ✅ 把下面这行换成你的公网地址
const API_URL = 'apple-backend-production-36f1.up.railway.app';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: 'test-session'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMsg = { role: 'assistant', content: '❌ ' + error.message };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h1 style={{ textAlign: 'center' }}>🍎 Apple's Home</h1>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        minHeight: '300px',
        maxHeight: '400px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>开始对话吧</p>
        )}
        {messages.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            marginBottom: '8px'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? '#007AFF' : '#E5E5EA',
              color: msg.role === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: '#E5E5EA',
              color: '#999'
            }}>
              思考中...
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}

export default App;