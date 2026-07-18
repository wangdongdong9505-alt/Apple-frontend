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

  // 真正的前后端联网连接
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    try {
      // 呼叫你的 Render 后端骨架接口
      const response = await fetch('https://apple-backend-ndbv.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
      
      const data = await response.json();
      
      // 把后端的回复放进聊天气泡里
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } catch (error) {
      console.error('联网失败啦:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '😭 汽水机好像断网了，检查一下后端网址有没有填对，或者 Render 是不是在打瞌睡呀？',
        time: '刚刚'
      }]);
    }
  };
