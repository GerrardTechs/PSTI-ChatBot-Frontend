import React from 'react';

const MessageBubble = ({ message }) => {
  const { sender, text, timestamp } = message;

  return (
    <div className={`message-wrapper ${sender}`}>
      {/* Avatar */}
      <div className="message-avatar">
        {sender === 'bot' ? '🤖' : '👤'}
      </div>

      {/* Message Content */}
      <div className="message-content">
        <div className="message">
          {text}
        </div>
        {timestamp && (
          <span className="timestamp">{timestamp}</span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;