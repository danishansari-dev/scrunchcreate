const axios = require('axios');

const API_URL = 'https://scrunchcreate.onrender.com/api';
let token;

async function run() {
  try {
    console.log('1. Logging in test user...');
    const { data } = await axios.post(`${API_URL}/auth/login`, {
      email: 'persist1@test.com',
      password: 'password123'
    });
    token = data.token;
    console.log('Logged in successfully.');

    console.log('2. Fetching cart...');
    const { data: cartData } = await axios.get(
      `${API_URL}/cart`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Cart contents:', JSON.stringify(cartData.data, null, 2));
    
    if (cartData.data.length > 0) {
      console.log('✅ SUCCESS: Cart items persisted!');
    } else {
      console.log('❌ FAILED: Cart is empty.');
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

run();
