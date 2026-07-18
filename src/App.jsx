import React, { useState } from 'react';

export default function App() {
  // 模拟会话列表数据
  const [sessions, setSessions] = useState([
    { id: 1, name: '向阳处的秘密基地' },
    { id: 2, name: '夏日长街的冰汽水' }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const [inputText, setInputText] = useState('');
  
  // 模拟当前会话的聊天消息
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '今天的天气刚刚好，要不要分你一半橘子冰汽水？饼干我也烤好了。', time: '14:20' },
    { id: 2, role: 'user', content: '好呀！那我要加很多很多冰块！', time: '14:22' },
    { id: 3, role: 'assistant', content: '知道了，小贪心鬼，冰块早就帮你冻好了。', time: '14:23' }
  ]);

  // 新建聊天节点
  const handleCreateSession = () => {
    const newId = Date.now();
    const newSession = {
      id: newId,
      name: `新夏日回忆 ${sessions.length + 1}`
    };
    setSessions([newSession, ...sessions]);
    setActiveSession(newId);
    setMessages([{ id: 1, role: 'assistant', content: '新的一天，今天想和我聊点什么？', time: '刚刚' }]);
  };

  // 发送消息模拟
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputText,
      time: '刚刚'
    };
    setMessages([...messages, userMsg]);
    setInputText('');

    // 模拟AI 1秒后回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '收到啦，让我想想怎么回答你……（等我们接通后端后，这里就会是真正的夏以昼啦！）',
        time: '刚刚'
      }]);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      {/* 梦幻气泡背景光效 */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      {/* 主体大面板 */}
      <div style={styles.mainBox}>
        
        {/* 左侧边栏：会话管理 */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.avatarPlaceholder}>🧡</span>
            <div style={styles.sidebarTitle}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#2c5282' }}>夏以昼的家</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>拥闪烁夏 ✨</p>
            </div>
          </div>
          
          {/* 新建节点按钮 */}
          <button onClick={handleCreateSession} style={styles.addBtn}>
            ➕ 新建聊天节点
          </button>

          {/* 会话列表 */}
          <div style={styles.sessionList}>
            {sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => setActiveSession(session.id)}
                style={{
                  ...styles.sessionItem,
                  ...(activeSession === session.id ? styles.sessionItemActive : {})
                }}
              >
                <span style={{ marginRight: '8px' }}>🍏</span>
                <span style={styles.sessionName}>{session.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：类微信聊天主界面 */}
        <div style={styles.chatArea}>
          {/* 聊天顶部状态栏 */}
          <div style={styles.chatHeader}>
            <div style={{ fontWeight: '600', color: '#2c5282' }}>
              {sessions.find(s => s.id === activeSession)?.name || '甜蜜对话'}
            </div>
            <div style={styles.modelTag}>模型: DeepSeek-V3 🫧</div>
          </div>

          {/* 消息滚动区域 */}
          <div style={styles.messageList}>
            {messages.map(msg => {
              const isMe = msg.role === 'user';
              return (
                <div key={msg.id} style={{
                  ...styles.msgRow,
                  justifyContent: isMe ? 'flex-end' : 'flex-start'
                }}>
                  {/* 夏以昼的头像 */}
                  {!isMe && <div style={{...styles.avatar, backgroundColor: '#bee3f8'}}>🌤️</div>}
                  
                  {/* 消息气泡 */}
                  <div style={{
                    ...styles.msgBubble,
                    backgroundColor: isMe ? '#feebc8' : '#ebf8ff', /* 橘子黄 vs 汽水蓝 */
                    color: isMe ? '#c05621' : '#2b6cb0',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    <div style={{
                      ...styles.msgTime,
                      textAlign: isMe ? 'right' : 'left',
                      color: isMe ? '#dd6b20' : '#63b3ed'
                    }}>{msg.time}</div>
                  </div>

                  {/* 我的头像 */}
                  {isMe && <div style={{...styles.avatar, backgroundColor: '#fbd38d'}}>🐱</div>}
                </div>
              );
            })}
          </div>

          {/* 底部输入框区域 */}
          <form onSubmit={handleSendMessage} style={styles.inputArea}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="给夏以昼发消息..." 
              style={styles.inputField}
            />
            <button type="submit" style={styles.sendBtn}>发送 🍊</button>
          </form>

        </div>
      </div>
    </div>
  );
}

// 纯CSS-in-JS样式，确保复制即用，带亮晶晶夏日感
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #fffbeb 50%, #f0fdf4 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  bgGlow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(251,211,141,0.4) 0%, rgba(255,255,255,0) 70%)',
    top: '10%',
    left: '15%',
    zIndex: 1,
  },
  bgGlow2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(190,227,248,0.5) 0%, rgba(255,255,255,0) 70%)',
    bottom: '5%',
    right: '10%',
    zIndex: 1,
  },
  mainBox: {
    width: '900px',
    height: '650px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(44, 82, 130, 0.08), inset 0 0 0 1px rgba(255,255,255,0.6)',
    display: 'flex',
    overflow: 'hidden',
    zIndex: 10,
  },
  sidebar: {
    width: '260px',
    borderRight: '1px solid rgba(190,227,248,0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 8px',
  },
  avatarPlaceholder: {
    fontSize: '28px',
    marginRight: '10px',
  },
  sidebarTitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#feebc8',
    color: '#c05621',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(221,107,32,0.08)',
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
  },
  sessionItem: {
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    transition: 'all 0.2s',
    color: '#4a5568',
  },
  sessionItemActive: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(43,108,176,0.05)',
  },
  sessionName: {
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatHeader: {
    height: '60px',
    padding: '0 24px',
    borderBottom: '1px solid rgba(190,227,248,0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  modelTag: {
    fontSize: '12px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: '4px 10px',
    borderRadius: '20px',
    color: '#2b6cb0',
    border: '1px solid #ebf8ff',
  },
  messageList: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    maxWidth: '85%',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    fontSize: '18px',
  },
  msgBubble: {
    padding: '12px 16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
    maxWidth: '70%',
  },
  msgTime: {
    fontSize: '10px',
    marginTop: '4px',
  },
  inputArea: {
    padding: '16px 24px',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTop: '1px solid rgba(190,227,248,0.5)',
  },
  inputField: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(190,227,248,0.8)',
    outline: 'none',
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    color: '#2d3748',
    transition: 'all 0.2s',
  },
  sendBtn: {
    padding: '0 20px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#feebc8',
    color: '#c05621',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
