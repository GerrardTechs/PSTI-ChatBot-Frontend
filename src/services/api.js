// src/services/api.js
// API Service untuk PSTI ChatBot Backend

// ===== KONFIGURASI =====

// Deteksi apakah berjalan di localhost atau di Vercel/production
const isLocalhost = window.location.hostname === 'localhost';

// Jika di localhost → pakai backend lokal
// Jika di Vercel → WAJIB pakai env (jangan fallback ke localhost)
const API_BASE_URL = isLocalhost
  ? 'http://localhost:3000'
  : (process.env.REACT_APP_API_URL || 'https://pstichatbotbe.vercel.app');

// ===== HELPER FUNCTIONS =====

/**
 * Extract response text dari backend PSTI
 * Backend mengirim format: { response: "text", from: "knowledge|ml|memory", ... }
 */
const extractResponseText = (data) => {
  if (data.response) return data.response;
  if (data.text) return data.text;
  if (data.message) return data.message;
  if (data.reply) return data.reply;

  if (typeof data === 'string') return data;

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

    if (!response.ok) {
      const errorText = await response.text();
      debugLog('ERROR RESPONSE', errorText);

      if (response.status === 404) {
        throw new Error('Endpoint /chat tidak ditemukan. Pastikan backend berjalan di ' + API_BASE_URL);
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    debugLog('RESPONSE DATA', data);

    const responseText = extractResponseText(data);

    return {
      text: responseText,
      from: data.from || 'unknown',
      intent: data.intent || null,
      confidence: data.confidence || null,
      timestamp: new Date().toISOString(),
      success: true
    };

  } catch (error) {
    console.error('❌ Error calling chatbot API:', error);

    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed') ||
      error.message.includes('ECONNREFUSED')
    ) {
      throw new Error(
        'Tidak dapat terhubung ke backend. ' +
        'Pastikan server backend berjalan di ' + API_BASE_URL + '\n' +
        'Jalankan: npm start di folder backend'
      );
    }

    if (error.message.includes('CORS')) {
      throw new Error(
        'CORS error. Backend sudah menggunakan cors(), ' +
        'tapi pastikan tidak ada firewall/proxy yang memblokir.'
      );
    }

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

  console.log('\n1️⃣ Testing health endpoint...');
  const health = await checkBackendHealth();
  console.log('Health:', health);

  if (!health.available) {
    console.log('❌ Backend tidak tersedia!');
    return false;
  }

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
