import React, { useState, useEffect } from 'react';

export default function App() {
  // 动态注入手机端视口 Meta 标签，防止手机浏览器把它当成电脑网页缩放
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  // 1. 从 LocalStorage 中读取历史会话列表
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('apple_chat_sessions');
    return saved ? JSON.parse(saved) : [{ id: 1, name: '向阳处的秘密基地' }];
  });

  // 2. 从 LocalStorage 读取上次活跃的会话ID
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('apple_active_session_id');
    return saved ? Number(saved) : 1;
  });

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const BACKEND_URL = 'https://apple-backend-ndbv.onrender.com';

  useEffect(() => {
    localStorage.setItem('apple_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('apple_active_session_id', activeSession);
  }, [activeSession]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/messages/${activeSession}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMessages(data);
          } else {
            setMessages([{ id: 0, role: 'assistant', content: '今天的天气刚刚好，要不要分你一半橘子冰汽水？饼干我也烤好了。🌤️' }]);
          }
        }
      } catch (err) {
        console.error('读取历史消息失败:', err);
      }
    };
    fetchMessages();
  }, [activeSession]);

  const handleCreateSession = () => {
    const newId = Date.now();
    const newSession = { id: newId, name: `新夏日回忆 ${sessions.length + 1}` };
    setSessions([newSession, ...sessions]);
    setActiveSession(newId);
    setMessages([{ id: 0, role: 'assistant', content: '新的一天，今天想和我聊点什么？🍏' }]);
    setIsSidebarOpen(false); 
  };

  const handleRenameSession = (id, e) => {
    e.stopPropagation(); 
    const currentName = sessions.find(s => s.id === id)?.name || '';
    const newName = prompt('想要给这段回忆换个什么名字？✨', currentName);
    if (newName && newName.trim() !== '') {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName.trim() } : s));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: inputText };
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
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '😭 汽水机好像断网了，检查一下后端吧。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {isSidebarOpen && <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />}

      {/* 抽屉侧边栏 */}
      <div style={{...styles.sidebar, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
        <div style={styles.sidebarHeader}>
          <span style={styles.avatarPlaceholder}>🧡</span>
          <div style={styles.sidebarTitle}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#2c5282' }}>夏以昼的家</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>拥闪烁夏 ✨</p>
          </div>
        </div>
        <button onClick={handleCreateSession} style={styles.addBtn}>➕ 新建聊天节点</button>
        <div style={styles.sessionList}>
          {sessions.map(session => (
            <div key={session.id} onClick={() => { setActiveSession(session.id); setIsSidebarOpen(false); }} style={{...styles.sessionItem, ...(activeSession === session.id ? styles.sessionItemActive : {})}}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>💭</span>
                <span style={styles.sessionName}>{session.name}</span>
              </div>
              <button onClick={(e) => handleRenameSession(session.id, e)} style={styles.renameBtn}>✏️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div style={styles.chatArea}>
        {/* 顶部导航栏 - 调大了高度和字体 */}
        <div style={styles.chatHeader}>
          <button onClick={() => setIsSidebarOpen(true)} style={styles.menuBtn}>☰ 列表</button>
          <div style={styles.headerTitle}>{sessions.find(s => s.id === activeSession)?.name || '甜蜜对话'}</div>
          <div style={styles.modelTag}>DeepSeek 🫧</div>
        </div>

        {/* 消息滚动区域 - 调整气泡比例类似微信 */}
        <div style={styles.messageList}>
          {messages.map(msg => {
            const isMe = msg.role === 'user';
            return (
              <div key={msg.id} style={{...styles.msgRow, alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row'}}>
                <div style={{...styles.avatar, backgroundColor: isMe ? '#fdf2f8' : '#fff5f5'}}>{isMe ? '🍏' : '🍎'}</div>
                <div style={{...styles.msgBubble, backgroundColor: isMe ? '#feebc8' : '#ebf8ff', color: isMe ? '#c05621' : '#2b6cb0', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px'}}>
                  <div style={styles.msgText}>{msg.content}</div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div style={{...styles.msgRow, alignSelf: 'flex-start'}}>
              <div style={{...styles.avatar, backgroundColor: '#fff5f5'}}>🍎</div>
              <div style={{...styles.msgBubble, backgroundColor: '#ebf8ff', color: '#718096', borderRadius: '4px 16px 16px 16px'}}>
                <div style={styles.msgText}>夏以昼正在思考中... 🫧</div>
              </div>
            </div>
          )}
        </div>

        {/* 底部输入框 - 调大了点击区域和大小 */}
        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isLoading ? "夏以昼正在打字..." : "给夏以昼发消息..."} disabled={isLoading} style={styles.inputField} />
          <button type="submit" disabled={isLoading} style={styles.sendBtn}>发送 🍊</button>
        </form>
      </div>
    </div>
  );
}

// 👑 专门针对手机屏幕设计的精致微信感样式
const styles = {
  container: { width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', overflow: 'hidden', position: 'relative' },
  sidebarOverlay: { position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 98 },
  sidebar: { position: 'absolute', top: 0, left: 0, width: '270px', height: '100vh', backgroundColor: '#ffffff', boxShadow: '4px 0 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 99, transition: 'transform 0.3s ease-in-out' },
  sidebarHeader: { display: 'flex', alignItems: 'center', marginBottom: '24px', padding: '0 4px' },
  avatarPlaceholder: { fontSize: '30px', marginRight: '12px' },
  sidebarTitle: { display: 'flex', flexDirection: 'column' },
  addBtn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer', marginBottom: '20px', fontSize: '15px' },
  sessionList: { flex: 1, overflowY: 'auto' },
  sessionItem: { padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: '#4a5568' },
  sessionItemActive: { backgroundColor: '#ebf8ff', color: '#2b6cb0', fontWeight: '600' },
  sessionName: { fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  renameBtn: { border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '14px', padding: '4px' },
  
  // 微信比例聊天主区
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f5f7' },
  chatHeader: { height: '64px', padding: '0 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', gap: '12px', flexShrink: 0 },
  menuBtn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#ffffff', color: '#4a5568', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  headerTitle: { flex: 1, fontWeight: '600', color: '#1a202c', fontSize: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' },
  modelTag: { fontSize: '12px', backgroundColor: '#ebf8ff', padding: '4px 10px', borderRadius: '12px', color: '#2b6cb0', flexShrink: 0 },
  
  messageList: { flex: 1, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' },
  msgRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '88%' },
  avatar: { width: '42px', height: '42px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  msgBubble: { padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '75%' },
  msgText: { fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }, // 调大到接近微信的 16px 舒适字号
  
  inputArea: { padding: '12px 16px', display: 'flex', gap: '10px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', alignItems: 'center', flexShrink: 0 },
  inputField: { flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '16px', backgroundColor: '#ffffff' },
  sendBtn: { padding: '11px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer', fontSize: '15px', flexShrink: 0 }
};
