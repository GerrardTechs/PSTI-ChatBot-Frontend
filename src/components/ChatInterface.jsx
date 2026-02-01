import React, { useState, useEffect, useRef } from 'react';
import InputArea from './InputArea';
import MessageBubble from './MessageBubble';
import { sendMessageToBot } from '../services/api';
import '../styles/main.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Halo! Saya Chatbot PSTI 👋 Silakan tanyakan apa saja tentang Lab PSTI!',
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef();
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    // Add user message with timestamp
    const userMessage = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Get bot reply
      const reply = await sendMessageToBot(text.trim());

      // Hide typing indicator
      setIsTyping(false);
      
      // Add bot response with timestamp
      const botMessage = {
        sender: 'bot',
        text: reply.text || reply.message || 'Maaf, saya tidak mengerti.',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator on error
      setIsTyping(false);
      
      // Add error message
      const errorMessage = {
        sender: 'bot',
        text: 'Maaf, terjadi kesalahan saat menghubungi server. Pastikan backend berjalan di port 3000.',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Quick reply handler - Fixed version
  const handleQuickReply = (text) => {
    // Langsung panggil handleSendMessage dengan teks dari quick reply
    handleSendMessage(text);
  };

  return (
    <div className="chat-wrapper">
      {/* Messages Container */}
      <div className="messages-container">
        {/* Welcome Message - Show only on first load */}
        {messages.length === 1 && !isTyping && (
          <div className="welcome-message">
            <div className="welcome-icon">🤖</div>
            <div className="welcome-title">Selamat Datang di Chatbot PSTI!</div>
            <div className="welcome-subtitle">
              Halo! Saya siap membantu menjawab pertanyaan seputar Lab PSTI, project, fasilitas, dan informasi lainnya. Silakan pilih topik di bawah atau ketik pertanyaan Anda.
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="typing-wrapper">
            <div className="typing-avatar">🤖</div>
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="quick-replies">
        <button 
          className="quick-reply-btn" 
          onClick={() => handleQuickReply('Tentang Lab PSTI')}
          disabled={isTyping}
        >
          📚 Tentang Lab
        </button>
        <button 
          className="quick-reply-btn" 
          onClick={() => handleQuickReply('Project PSTI')}
          disabled={isTyping}
        >
          🚀 Project
        </button>
        <button 
          className="quick-reply-btn" 
          onClick={() => handleQuickReply('Fasilitas Lab')}
          disabled={isTyping}
        >
          🔧 Fasilitas
        </button>
        <button 
          className="quick-reply-btn" 
          onClick={() => handleQuickReply('Jam Operasional')}
          disabled={isTyping}
        >
          ⏰ Jam Buka
        </button>
      </div>

      {/* Input Area */}
      <InputArea onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatInterface;