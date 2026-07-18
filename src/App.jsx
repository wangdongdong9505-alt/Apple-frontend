import React, { useState, useEffect } from 'react';

export default function App() {
  const [sessions, setSessions] = useState([
    { id: 1, name: '向阳处的秘密基地' }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 【一定要改这里！】你的后端 Render 地址
  const BACKEND_URL = 'https://apple-backend-ndbv.onrender.com';

  // 1. 每次切换聊天节点，自动从数据库读取历史消息
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/messages/${activeSession}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMessages(data);
          } else {
            setMessages([{ id: 0, role: 'assistant', content: '今天的天气刚刚好，要不要分你一半橘子冰汽水？饼干我也烤好了。🌤️', time: '刚刚' }]);
          }
        }
      } catch (err) {
        console.error('读取历史消息失败:', err);
      }
    };
    fetchMessages();
  }, [activeSession]);

  // 2. 新建聊天节点
  const handleCreateSession = () => {
    const newId = Date.now();
    const newSession = { id: newId, name: `新夏日回忆 ${sessions.length + 1}` };
    setSessions([newSession, ...sessions]);
    setActiveSession(newId);
    setMessages([{ id: 0, role: 'assistant', content: '新的一天，今天想和我聊点什么？🍏', time: '刚刚' }]);
  };

  // 3. 发送消息到后端并请求 DeepSeek 回复
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: inputText, time: '刚刚' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, sessionId: activeSession }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply, time: '刚刚' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '😭 汽水机好像断网了，检查一下后端吧。', time: '刚刚' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>
      <div style={styles.mainBox}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.avatarPlaceholder}>🧡</span>
            <div style={styles.sidebarTitle}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#2c5282' }}>夏以昼的家</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>拥闪烁夏 ✨</p>
            </div>
          </div>
          <button onClick={handleCreateSession} style={styles.addBtn}>➕ 新建聊天节点</button>
          <div style={styles.sessionList}>
            {sessions.map(session => (
              <div key={session.id} onClick={() => setActiveSession(session.id)} style={{...styles.sessionItem, ...(activeSession === session.id ? styles.sessionItemActive : {})}}>
                <span style={{ marginRight: '8px' }}>🍏</span>
                <span style={styles.sessionName}>{session.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chatArea}>
          <div style={styles.chatHeader}>
            <div style={{ fontWeight: '600', color: '#2c5282' }}>{sessions.find(s => s.id === activeSession)?.name || '甜蜜对话'}</div>
            <div style={styles.modelTag}>模型: DeepSeek 🫧</div>
          </div>

          <div style={styles.messageList}>
            {messages.map(msg => {
              const isMe = msg.role === 'user';
              return (
                <div key={msg.id} style={{...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
                  {!isMe && <div style={{...styles.avatar, backgroundColor: '#bee3f8'}}>🌤️</div>}
                  <div style={{...styles.msgBubble, backgroundColor: isMe ? '#feebc8' : '#ebf8ff', color: isMe ? '#c05621' : '#2b6cb0', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',}}>
                    <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                  {isMe && <div style={{...styles.avatar, backgroundColor: '#fbd38d'}}>🐱</div>}
                </div>
              );
            })}
            {isLoading && (
              <div style={{...styles.msgRow, justifyContent: 'flex-start'}}>
                <div style={{...styles.avatar, backgroundColor: '#bee3f8'}}>🌤️</div>
                <div style={{...styles.msgBubble, backgroundColor: '#ebf8ff', color: '#718096', borderRadius: '4px 16px 16px 16px'}}>夏以昼正在思考中... 🫧</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={styles.inputArea}>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isLoading ? "夏以昼正在打字..." : "给夏以昼发消息..."} disabled={isLoading} style={styles.inputField} />
            <button type="submit" disabled={isLoading} style={styles.sendBtn}>发送 🍊</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #fffbeb 50%, #f0fdf4 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden', position: 'relative' },
  bgGlow1: { position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(251,211,141,0.4) 0%, rgba(255,255,255,0) 70%)', top: '10%', left: '15%', zIndex: 1 },
  bgGlow2: { position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(190,227,248,0.5) 0%, rgba(255,255,255,0) 70%)', bottom: '5%', right: '10%', zIndex: 1 },
  mainBox: { width: '900px', height: '650px', backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(16px)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(44, 82, 130, 0.08)', display: 'flex', overflow: 'hidden', zIndex: 10 },
  sidebar: { width: '260px', borderRight: '1px solid rgba(190,227,248,0.5)', backgroundColor: 'rgba(255, 255, 255, 0.4)', display: 'flex', flexDirection: 'column', padding: '20px 12px' },
  sidebarHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '0 8px' },
  avatarPlaceholder: { fontSize: '28px', marginRight: '10px' },
  sidebarTitle: { display: 'flex', flexDirection: 'column' },
  addBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' },
  sessionList: { flex: 1, overflowY: 'auto' },
  sessionItem: { padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#4a5568' },
  sessionItemActive: { backgroundColor: '#ebf8ff', color: '#2b6cb0', fontWeight: '500' },
  sessionName: { fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  chatHeader: { height: '60px', padding: '0 24px', borderBottom: '1px solid rgba(190,227,248,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)' },
  modelTag: { fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '20px', color: '#2b6cb0', border: '1px solid #ebf8ff' },
  messageList: { flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  msgRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '85%' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' },
  msgBubble: { padding: '12px 16px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', maxWidth: '70%' },
  inputArea: { padding: '16px 24px', display: 'flex', gap: '12px', backgroundColor: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(190,227,248,0.5)' },
  inputField: { flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(190,227,248,0.8)', outline: 'none', fontSize: '14px' },
  sendBtn: { padding: '0 20px', borderRadius: '14px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer' }
};
