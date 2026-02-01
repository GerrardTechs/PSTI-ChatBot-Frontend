import React, { useState, useRef, useEffect } from 'react';

const InputArea = ({ onSendMessage, disabled }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleSubmit = () => {
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-area">
      <div className="input-wrapper">
        {/* Action Buttons */}
        <div className="input-actions">
          <button 
            className="action-btn" 
            title="Attach file"
            disabled={disabled}
          >
            📎
          </button>
          <button 
            className="action-btn" 
            title="Voice input"
            disabled={disabled}
          >
            🎤
          </button>
        </div>

        {/* Input Container */}
        <div className="input-container">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ketik pesan Anda..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={handleSubmit}
            disabled={disabled || !inputText.trim()}
            title="Send message"
          >
            ➤
          </button>
        </div>
      </div>
      
      <div className="input-hint">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  );
};

export default InputArea;