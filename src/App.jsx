import React, { useState, useEffect } from 'react';

export default function App() {
  // 1. 初始化时优先从 LocalStorage 中读取历史会话列表，没有则提供一个默认的
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('apple_chat_sessions');
    return saved ? JSON.parse(saved) : [{ id: 1, name: '向阳处的秘密基地' }];
  });

  // 2. 初始化时优先读取上次活跃的会话ID
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('apple_active_session_id');
    return saved ? Number(saved) : 1;
  });

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制手机端侧边栏展开/收起

  // 你的后端 Render 地址
  const BACKEND_URL = 'https://apple-backend-ndbv.onrender.com';

  // 当会话列表发生变化时，实时保存到 LocalStorage
  useEffect(() => {
    localStorage.setItem('apple_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // 当活跃会话发生切换时，保存当前会话ID到 LocalStorage
  useEffect(() => {
    localStorage.setItem('apple_active_session_id', activeSession);
  }, [activeSession]);

  // 每次切换聊天节点，自动从数据库读取历史消息
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

  // 新建聊天节点
  const handleCreateSession = () => {
    const newId = Date.now();
    const newSession = { id: newId, name: `新夏日回忆 ${sessions.length + 1}` };
    setSessions([newSession, ...sessions]);
    setActiveSession(newId);
    setMessages([{ id: 0, role: 'assistant', content: '新的一天，今天想和我聊点什么？🍏' }]);
    setIsSidebarOpen(false); // 手机端选择完后自动收起菜单
  };

  // 修改对话节点的名字
  const handleRenameSession = (id, e) => {
    e.stopPropagation(); // 阻止触发切换会话
    const currentName = sessions.find(s => s.id === id)?.name || '';
    const newName = prompt('想要给这段回忆换个什么名字？✨', currentName);
    if (newName && newName.trim() !== '') {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName.trim() } : s));
    }
  };

  // 发送消息到后端并请求回复
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
      {/* 遮罩层：当手机端侧边栏展开时，点击空白处自动收起 */}
      {isSidebarOpen && <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />}

      {/* 侧边栏：自适应抽屉式设计 */}
      <div style={{...styles.sidebar, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
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
            <div key={session.id} onClick={() => { setActiveSession(session.id); setIsSidebarOpen(false); }} style={{...styles.sessionItem, ...(activeSession === session.id ? styles.sessionItemActive : {})}}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <span style={{ marginRight: '6px' }}>💭</span>
                <span style={styles.sessionName}>{session.name}</span>
              </div>
              <button onClick={(e) => handleRenameSession(session.id, e)} style={styles.renameBtn} title="改名">✏️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div style={styles.chatArea}>
        {/* 顶部导航栏 */}
        <div style={styles.chatHeader}>
          <button onClick={() => setIsSidebarOpen(true)} style={styles.menuBtn}>☰ 列表</button>
          <div style={styles.headerTitle}>{sessions.find(s => s.id === activeSession)?.name || '甜蜜对话'}</div>
          <div style={styles.modelTag}>DeepSeek 🫧</div>
        </div>

        {/* 消息滚动区域 */}
        <div style={styles.messageList}>
          {messages.map(msg => {
            const isMe = msg.role === 'user';
            return (
              <div key={msg.id} style={{...styles.msgRow, alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row'}}>
                {/* 夏以昼头像是红苹果，我的头像是青苹果 */}
                <div style={{...styles.avatar, backgroundColor: isMe ? '#fdf2f8' : '#fff5f5'}}>{isMe ? '🍏' : '🍎'}</div>
                <div style={{...styles.msgBubble, backgroundColor: isMe ? '#feebc8' : '#ebf8ff', color: isMe ? '#c05621' : '#2b6cb0', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px'}}>
                  <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div style={{...styles.msgRow, alignSelf: 'flex-start'}}>
              <div style={{...styles.avatar, backgroundColor: '#fff5f5'}}>🍎</div>
              <div style={{...styles.msgBubble, backgroundColor: '#ebf8ff', color: '#718096', borderRadius: '4px 16px 16px 16px'}}>
                夏以昼正在思考中... 🫧
              </div>
            </div>
          )}
        </div>

        {/* 底部输入框 */}
        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isLoading ? "夏以昼正在打字..." : "给夏以昼发消息..."} disabled={isLoading} style={styles.inputField} />
          <button type="submit" disabled={isLoading} style={styles.sendBtn}>发送 🍊</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#f7fafc', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden', position: 'relative' },
  sidebarOverlay: { position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 98 },
  sidebar: { position: 'absolute', top: 0, left: 0, width: '260px', height: '100vh', backgroundColor: '#ffffff', boxShadow: '4px 0 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', padding: '20px 14px', zIndex: 99, transition: 'transform 0.3s ease-in-out' },
  sidebarHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '0 4px' },
  avatarPlaceholder: { fontSize: '26px', marginRight: '10px' },
  sidebarTitle: { display: 'flex', flexDirection: 'column' },
  addBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' },
  sessionList: { flex: 1, overflowY: 'auto' },
  sessionItem: { padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', color: '#4a5568', transition: 'background-color 0.2s' },
  sessionItemActive: { backgroundColor: '#ebf8ff', color: '#2b6cb0', fontWeight: '500' },
  sessionName: { fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  renameBtn: { border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '12px', padding: '2px 4px' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f4f8' },
  chatHeader: { height: '56px', padding: '0 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', gap: '8px' },
  menuBtn: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#ffffff', color: '#4a5568', cursor: 'pointer', fontSize: '13px' },
  headerTitle: { flex: 1, fontWeight: '600', color: '#2c5282', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' },
  modelTag: { fontSize: '11px', backgroundColor: '#ebf8ff', padding: '4px 8px', borderRadius: '12px', color: '#2b6cb0' },
  messageList: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
  msgRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '88%' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.04)' },
  msgBubble: { padding: '10px 14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  inputArea: { padding: '12px 14px', display: 'flex', gap: '8px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' },
  inputField: { flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '14px' },
  sendBtn: { padding: '0 16px', borderRadius: '12px', border: 'none', backgroundColor: '#feebc8', color: '#c05621', fontWeight: '600', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }
};
