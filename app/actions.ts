// app/actions.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface MessageRequest {
  message: string;
  imageData: string | null;
  history: Array<{ type: string; content: string }>;
  tone: string;
}

export async function processMessage(request: MessageRequest) {
  const { message, imageData, history, tone } = request;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let result;

    if (imageData) {
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      };
      const prompt = message.trim() || "What's in this image?";
      result = await model.generateContent([prompt, imagePart]);
    } else {
      const context = history
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `Previous conversation:\n${context}\n\nPlease respond in a ${tone} tone to the following message: ${message}`;
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Server action error:', error);
    throw new Error('Failed to process message');
  }
}