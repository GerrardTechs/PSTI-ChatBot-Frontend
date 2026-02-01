// src/services/api.js
// API Service untuk PSTI ChatBot Backend

// ===== KONFIGURASI =====
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ===== HELPER FUNCTIONS =====

/**
 * Extract response text dari backend PSTI
 * Backend mengirim format: { response: "text", from: "knowledge|ml|memory", ... }
 */
const extractResponseText = (data) => {
  // Format utama dari backend PSTI
  if (data.response) {
    return data.response;
  }
  
  // Fallback formats (jika ada perubahan)
  if (data.text) return data.text;
  if (data.message) return data.message;
  if (data.reply) return data.reply;
  
  // Jika berupa string langsung
  if (typeof data === 'string') {
    return data;
  }
  
  // Default fallback
  return 'Maaf, tidak ada respons dari server.';
};

/**
 * Debug logging (hanya di development)
 */
const debugLog = (type, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API ${type}]`, data);
  }
};

// ===== MAIN API FUNCTIONS =====

/**
 * Send message to PSTI ChatBot backend
 * @param {string} message - User message
 * @param {string} userId - User ID (optional, default: 'web-user')
 * @returns {Promise<Object>} - Bot response
 */
export const sendMessageToBot = async (message, userId = 'web-user') => {
  debugLog('REQUEST', { 
    message, 
    userId,
    url: `${API_BASE_URL}/chat` 
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        message: message,
        userId: userId
      }),
    });

    debugLog('HTTP STATUS', response.status);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      debugLog('ERROR RESPONSE', errorText);
      
      if (response.status === 404) {
        throw new Error('Endpoint /chat tidak ditemukan. Pastikan backend berjalan di ' + API_BASE_URL);
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    debugLog('RESPONSE DATA', data);
    
    // Extract response text
    const responseText = extractResponseText(data);
    
    // Return dengan format yang konsisten untuk frontend
    return {
      text: responseText,
      from: data.from || 'unknown', // knowledge, ml, atau memory
      intent: data.intent || null,
      confidence: data.confidence || null,
      timestamp: new Date().toISOString(),
      success: true
    };
    
  } catch (error) {
    console.error('❌ Error calling chatbot API:', error);
    
    // Network error - Backend tidak jalan
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed') ||
        error.message.includes('ECONNREFUSED')) {
      throw new Error(
        'Tidak dapat terhubung ke backend. ' +
        'Pastikan server backend berjalan di ' + API_BASE_URL + '\n' +
        'Jalankan: npm start di folder backend'
      );
    }
    
    // CORS error
    if (error.message.includes('CORS')) {
      throw new Error(
        'CORS error. Backend sudah menggunakan cors(), ' +
        'tapi pastikan tidak ada firewall/proxy yang memblokir.'
      );
    }
    
    // Rethrow error lainnya
    throw error;
  }
};

/**
 * Check if backend is available (health check)
 * @returns {Promise<Object>} - Health status
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      debugLog('HEALTH CHECK', data);
      
      return {
        available: true,
        status: data.status,
        model: data.model,
        timestamp: data.time
      };
    }
    
    return { available: false };
    
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      available: false,
      error: error.message 
    };
  }
};

/**
 * Get API configuration info
 * @returns {Object}
 */
export const getApiInfo = () => {
  return {
    baseUrl: API_BASE_URL,
    chatEndpoint: '/chat',
    healthEndpoint: '/health',
    fullChatUrl: `${API_BASE_URL}/chat`,
    fullHealthUrl: `${API_BASE_URL}/health`,
    environment: process.env.NODE_ENV
  };
};

/**
 * Test connection to backend
 * Useful untuk debugging
 */
export const testConnection = async () => {
  console.log('🧪 Testing connection to backend...\n');
  
  const info = getApiInfo();
  console.log('📡 API Info:', info);
  
  // Test 1: Health Check
  console.log('\n1️⃣ Testing health endpoint...');
  const health = await checkBackendHealth();
  console.log('Health:', health);
  
  if (!health.available) {
    console.log('❌ Backend tidak tersedia!');
    return false;
  }
  
  // Test 2: Send test message
  console.log('\n2️⃣ Testing chat endpoint...');
  try {
    const response = await sendMessageToBot('halo');
    console.log('✅ Chat response:', response);
    return true;
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
    return false;
  }
};

// ===== EXPORT =====
export default {
  sendMessageToBot,
  checkBackendHealth,
  getApiInfo,
  testConnection
};