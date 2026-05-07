import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const currentUserEmail = session?.user?.email?.toLowerCase();

    if (!currentUserEmail || !adminEmails.includes(currentUserEmail)) {
      console.error('Unauthorized access attempt:', currentUserEmail);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
        _max: {
          updatedAt: 'desc',
        },
      },
    });

    const totalUsers = await prisma.usage.groupBy({
      by: ['email'],
    });

    const totalStats = await prisma.usage.aggregate({
      _sum: {
        count: true,
        promptTokens: true,
        completionTokens: true,
      },
    });

    const totalBriefs = totalStats._sum.count || 0;
    const promptTokens = totalStats._sum.promptTokens || 0;
    const completionTokens = totalStats._sum.completionTokens || 0;

    // GPT-4o estimated cost ($5 per 1M prompt tokens, $15 per 1M completion tokens)
    const promptCost = (promptTokens / 1000000) * 5.00;
    const completionCost = (completionTokens / 1000000) * 15.00;
    const totalCost = promptCost + completionCost;

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

    // Calculate Real-time (Active in last 5 mins)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineNowRaw = await prisma.usage.groupBy({
      by: ['email'],
      where: {
        updatedAt: { gte: fiveMinsAgo }
      }
    });
    const onlineNow = onlineNowRaw.length;

    return NextResponse.json({
      totalUsers: totalUsers.length,
      totalBriefs,
      promptTokens,
      completionTokens,
      estimatedCost: totalCost.toFixed(4),
      currency: "USD",
      dau,
      mau,
      onlineNow,
      users: userStats.map(u => ({
        email: u.email,
        count: u._sum.count || 0,
        tokens: (u._sum.promptTokens || 0) + (u._sum.completionTokens || 0),
        lastActive: u._max.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Admin stats critical error:', error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
