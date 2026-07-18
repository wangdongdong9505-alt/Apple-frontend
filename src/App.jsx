function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🍎 Apple's Home</h1>
      <p>部署成功！接下来去连后端。</p>
      <input 
        type="text" 
        placeholder="输入消息..." 
        style={{ padding: '10px', width: '200px', marginRight: '10px' }}
      />
      <button style={{ padding: '10px 20px' }}>发送</button>
    </div>
  );
}
export default App;