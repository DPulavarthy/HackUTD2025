import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error:', JSON.stringify(data, null, 2));
      return;
    }
    
    console.log('Available models:');
    data.models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log('  ✓ Supports generateContent');
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
