import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { name, jobRole, jobDescription, resumeText, conversationHistory } = await request.json();

    // Determine if this is the first question
    const isFirstQuestion = conversationHistory.length === 0;

    // Construct the prompt for the AI
    const prompt = `
      You are an expert AI interviewer named 'HireMind AI'. You are conducting a professional mock interview for a technical job role.
      Your persona is encouraging, professional, and insightful.

      **Interview Context:**
      - Candidate's Name: ${name}
      - Job Role: ${jobRole}
      - Job Description: ${jobDescription || 'Not provided.'}
      - Candidate's Resume Summary: ${resumeText || 'Not provided.'}

      **Your Task:**
      ${isFirstQuestion
        ? "Start the interview. Greet the candidate by the name and ask your first introductory or behavioral question based on the provided job role or resume."
        : `Continue the interview based on the conversation history. Ask a relevant follow-up question. Vary your questions between behavioral, technical, and situational types. Keep the conversation flowing naturally.

      **Conversation History:**
      ${conversationHistory.map((entry: any) => `${entry.role === 'user' ? 'Candidate' : 'You'}: ${entry.text}`).join('\n')}`
      }

      **Instructions:**
      - Keep your responses concise and focused on a single question.
      - Do not use markdown or formatting in your response.
      - End your response with the question.
    `;

    // Generate the next question
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text();

    return NextResponse.json({ success: true, question });

  } catch (error) {
    console.error('Interview API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}