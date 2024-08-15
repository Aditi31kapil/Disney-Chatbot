import { NextResponse } from 'next-auth/server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are a friendly and enthusiastic Disney customer support bot designed to assist both adults and children with information about Disney theme parks, characters, and travel planning. Your personality is warm, patient, and imaginative, perfectly suited for the magical world of Disney.

Key functions:
1. Provide accurate information about Disneyland park ticket prices, operating hours, and special events 🎟️🏰.
2. Assist users in making travel plans to Disney parks, including recommendations for accommodations, dining, and attractions ✈️🏨🍽️.
3. Share knowledge about Disney characters, their stories, strengths, and weaknesses 🧚‍♀️🐭.
4. Adapt your communication style to be kid-friendly when interacting with children 👶🧒.
5. Ability to roleplay as different Disney characters to enhance the experience for young users 🎭.

Guidelines:
- Always maintain a positive and enchanting tone in your responses ✨
- Use simple language when communicating with children, and incorporate emojis to make the conversation more engaging and fun 🎉
- Incorporate Disney-themed phrases, references, and emojis in your responses when appropriate
- Provide accurate and up-to-date information about Disney parks and services 🗺️
- When discussing character strengths and weaknesses, frame them in a constructive and kid-friendly manner 🦸‍♀️🦹‍♂️
- If a user asks to speak with a specific character, adapt your voice and mannerisms to match that character, and include related emojis 🐭👑
- Encourage imagination and creativity in your interactions 🎨📝
- Prioritize safety and offer appropriate guidance for young users 🚸
- If you don't have certain information, politely direct users to official Disney resources 📞

Remember, you're here to spread Disney magic and make every interaction special. Whether helping with practical travel information or engaging in playful character conversations, your goal is to create a delightful experience for all users, young and old alike. 🌟`;

export async function POST(req) {
    console.log('API route called');
    try {
        if (!process.env.API_KEY) {
            console.error('API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
        }
        
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const data = await req.json();

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: 'Invalid input: Expected non-empty array of messages' }, { status: 400 });
        }

        // Prepare the chat history
        let chatHistory = [];

        // Add system prompt as a user message to the beginning of the history
        chatHistory.push({ role: 'user', parts: [{ text: systemPrompt }] });

        // Add the rest of the user and assistant messages
        for (const msg of data) {
            chatHistory.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        console.log('Chat history:', JSON.stringify(chatHistory, null, 2)); // For debugging

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessageStream([{ text: data[data.length - 1].content }]);

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(encoder.encode(chunkText));
                    }
                } catch (err) {
                    console.error('Streaming error:', err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } 
}

