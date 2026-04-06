require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY not found in .env file');
      return;
    }
    
    console.log('API Key found:', apiKey.substring(0, 10) + '...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list available models
    console.log('\nTesting available models...');
    
    const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-002'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        console.log(`✓ SUCCESS with ${modelName}!`);
        console.log('Response:', text.substring(0, 50));
        console.log('\nUse this model in your server.js:', modelName);
        return;
      } catch (err) {
        console.log(`✗ ${modelName} failed:`, err.message.substring(0, 100));
      }
    }
    
    console.log('\n❌ None of the models worked. Possible issues:');
    console.log('1. API key might not have access to Gemini models');
    console.log('2. Generative Language API might need to be enabled in Google Cloud Console');
    console.log('3. Check your Google AI Studio project settings');
    
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testGemini();
