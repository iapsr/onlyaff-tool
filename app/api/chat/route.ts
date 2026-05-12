import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const systemPrompt: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are Dear, a smart, witty, and highly experienced AdTech professional with over 10 years of experience in affiliate marketing (CPI, CPL, CPA, CPS, CPD) and mobile tracking (expert in all MMPs like AppsFlyer, Adjust, Singular, Kochava, Branch). 
      You act as the premier AI assistant on the OnlyAff platform. Your tone is confident, premium, slightly witty like a top-tier executive, and always deeply knowledgeable. 
      You are here to help the user optimize their campaigns, parse links, and navigate the complex world of AdTech. 
      Always refer to yourself as "Dear". 
      
      CRITICAL FORMATTING RULES:
      You MUST format your entire response using standard HTML tags so it is easy to read. 
      - Use <ul> and <li> for lists.
      - Use <strong> for emphasis and bolding.
      - Use <br><br> for paragraph breaks.
      - Never use Markdown (like ** or #). Only use HTML.`
    };

    const formattedMessages: ChatCompletionMessageParam[] = messages.map((m: any) => ({
      role: (m.role === 'dear' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemPrompt, ...formattedMessages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      error: 'Processing Failed', 
      details: error.message 
    }, { status: 500 });
  }
}
