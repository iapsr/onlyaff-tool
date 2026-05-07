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

    const userStats = await prisma.usage.groupBy({
      by: ['email'],
      _sum: {
        count: true,
        promptTokens: true,
        completionTokens: true,
      },
      _max: {
        updatedAt: true,
      },
      orderBy: {
        _sum: {
          count: 'desc',
        },
      },
    });

    // Calculate DAU (Today)
    const today = new Date().toISOString().split('T')[0];
    const dau = await prisma.usage.count({
      where: { date: today },
    });

    // Calculate MAU (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mauRaw = await prisma.usage.groupBy({
      by: ['email'],
      where: {
        updatedAt: { gte: thirtyDaysAgo }
      }
    });
    const mau = mauRaw.length;

    return NextResponse.json({
      totalUsers: totalUsers.length,
      totalBriefs,
      promptTokens,
      completionTokens,
      estimatedCost: totalCost.toFixed(4),
      currency: "USD",
      dau,
      mau,
      users: userStats.map(u => ({
        email: u.email,
        count: u._sum.count || 0,
        tokens: (u._sum.promptTokens || 0) + (u._sum.completionTokens || 0),
        lastActive: u._max.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
