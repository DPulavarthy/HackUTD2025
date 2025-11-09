import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List available models
async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    for await (const model of models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
    
    // Try with a common model name
    console.log('\nTrying gemini-pro...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hello');
      console.log('✓ gemini-pro works!');
    } catch (e) {
      console.log('✗ gemini-pro failed');
    }
  }
}

listModels();
