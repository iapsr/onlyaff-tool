import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const totalUsers = await prisma.usage.groupBy({
      by: ['email'],
    });

    const aggregateUsage = await prisma.usage.aggregate({
      _sum: {
        promptTokens: true,
        completionTokens: true,
        count: true,
      },
    });

    const promptTokens = aggregateUsage._sum.promptTokens || 0;
    const completionTokens = aggregateUsage._sum.completionTokens || 0;
    const totalBriefs = aggregateUsage._sum.count || 0;

    // GPT-4o Pricing (Estimate)
    // Input: $5.00 / 1M tokens
    // Output: $15.00 / 1M tokens
    const inputCost = (promptTokens / 1000000) * 5.00;
    const outputCost = (completionTokens / 1000000) * 15.00;
    const totalCost = inputCost + outputCost;

    return NextResponse.json({
      totalUsers: totalUsers.length,
      totalBriefs,
      promptTokens,
      completionTokens,
      estimatedCost: totalCost.toFixed(4),
      currency: "USD"
    });
  } catch (error: any) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
