import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize OpenAI with the environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "guest";
    const userIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const trackingId = userEmail !== "guest" ? userEmail : userIp;

    if (!text) {
      return NextResponse.json({ error: 'Missing Text', details: 'Input text is required' }, { status: 400 });
    }

    // Check Usage Limits for Guests
    if (userEmail === "guest") {
      const usageCount = await prisma.usage.aggregate({
        where: { email: trackingId },
        _sum: { count: true }
      });
      const totalUsed = usageCount._sum.count || 0;
      if (totalUsed >= 3) {
        return NextResponse.json({ 
          error: 'Limit Reached', 
          details: 'Guest limit reached (3 briefs). Please create a free account to unlock unlimited briefs.' 
        }, { status: 403 });
      }
    }

    const prompt = `You are an expert Ad Operations specialist. Parse the following raw campaign instructions into a clean, structured JSON format.
    
    Required JSON Structure:
    {
      "campaign_name": "string",
      "geo": "string (e.g. US, UK, Global)",
      "mmp": "string (e.g. AppsFlyer, Adjust)",
      "model": "string (e.g. CPI, CPA)",
      "preview_links": { "android": "url", "ios": "url" },
      "payable_event": "string",
      "payout": "string or array of tiers",
      "kpis": ["string"],
      "validation_rules": ["string"],
      "feedback": ["string"],
      "notes": ["string"],
      "af_prt": "string (Extract the af_prt value if present in the text, otherwise null)"
    }

    Rules:
    1. If a field is missing, return null for it.
    2. Extract only what is present.
    3. Keep descriptions professional and concise.

    Raw Input:
    ${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a specialized parser for mobile advertising campaign briefs. Always return strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content || '{}');

    // Track Usage
    const today = new Date().toISOString().split('T')[0];
    await prisma.usage.upsert({
      where: {
        email_date: {
          email: trackingId,
          date: today,
        },
      },
      update: {
        count: { increment: 1 },
        promptTokens: { increment: completion.usage?.prompt_tokens || 0 },
        completionTokens: { increment: completion.usage?.completion_tokens || 0 },
      },
      create: {
        email: trackingId,
        date: today,
        count: 1,
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
      },
    });

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ 
      error: 'Processing Failed', 
      details: error.message 
    }, { status: 500 });
  }
}
