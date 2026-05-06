import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { text } = await request.json();

    // Check usage for LinkedIn users
    if (session?.user?.email && (session as any).user.provider === "linkedin") {
      const today = new Date().toISOString().split("T")[0];
      const usage = await prisma.usage.findUnique({
        where: {
          email_date: {
            email: session.user.email,
            date: today,
          },
        },
      });

      if (usage && usage.count >= 3) {
        return NextResponse.json(
          {
            error: "Daily limit reached",
            details: "LinkedIn users are limited to 3 campaign briefs per day. Please upgrade or try again tomorrow.",
          },
          { status: 429 }
        );
      }

      // Update usage
      await prisma.usage.upsert({
        where: {
          email_date: {
            email: session.user.email,
            date: today,
          },
        },
        update: { count: { increment: 1 } },
        create: {
          email: session.user.email,
          date: today,
          count: 1,
        },
      });
    }

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert affiliate campaign manager.

Your job is to extract and standardize campaign details from messy input text.

Return ONLY valid JSON. No explanation.

Follow these rules strictly:
1. Always normalize field names.
2. Extract maximum useful information even if text is unstructured.
3. If multiple values exist, pick the most relevant one.
4. Clean text (remove unnecessary words, keep it concise).
5. Convert KPIs, rules, and notes into clean bullet points.
6. If the payout is slab-based or has multiple tiers, return them all together as an array of strings in the 'payout' field.
7. DO NOT use the App Store or Play Store preview links as the Tracking Link. Search the raw text for any explicit parameter like 'af_prt=something' and extract it exactly as written into the 'af_prt' field.

JSON format:

{
  "campaign_name": "",
  "geo": "",
  "mmp": "",
  "model": "",
  "preview_links": {
    "android": "",
    "ios": ""
  },
  "tracking_link": "",
  "af_prt": "",
  "payable_event": "",
  "payout": "",
  "kpis": [],
  "validation_rules": [],
  "feedback": [],
  "notes": []
}

Important:
- KPIs = performance targets only
- Validation Rules = restrictions / conditions
- Notes = extra info

If a field is missing, return empty string or empty array.`
        },
        {
          role: "user",
          content: `Input: ${text}`
        }
      ],
    });

    const usageInfo = completion.usage;
    const extractedData = completion.choices[0].message.content;
    
    // Update usage with tokens
    if (session?.user?.email) {
      const today = new Date().toISOString().split("T")[0];
      await prisma.usage.upsert({
        where: {
          email_date: {
            email: session.user.email,
            date: today,
          },
        },
        update: { 
          count: { increment: 1 },
          promptTokens: { increment: usageInfo?.prompt_tokens || 0 },
          completionTokens: { increment: usageInfo?.completion_tokens || 0 },
        },
        create: {
          email: session.user.email,
          date: today,
          count: 1,
          promptTokens: usageInfo?.prompt_tokens || 0,
          completionTokens: usageInfo?.completion_tokens || 0,
        },
      });
    }

    // Parse the JSON string from OpenAI back to an object to return cleanly
    let parsedData = {};
    if (extractedData) {
      parsedData = JSON.parse(extractedData);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { 
        error: "Failed to parse text using OpenAI", 
        details: error?.message || "Unknown error"
      }, 
      { status: 500 }
    );
  }
}
