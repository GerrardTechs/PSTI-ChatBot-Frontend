import React from 'react';
import ChatInterface from './components/ChatInterface';
import './styles/main.css';

const App = () => {
  return (
    <div className="app">
      {/* Header dari main.css */}
      <div className="header">
        <h1>🤖 Chatbot PSTI</h1>
        <div className="status">Online</div>
      </div>

      {/* Chat Container dari main.css */}
      <div className="chat-container">
        {/* ChatInterface component */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default App;