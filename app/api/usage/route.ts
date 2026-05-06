import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session as any).user.provider !== "linkedin") {
      return NextResponse.json({ count: 0, limit: 3 });
    }

    const today = new Date().toISOString().split("T")[0];
    const usage = await prisma.usage.findUnique({
      where: {
        email_date: {
          email: session.user.email,
          date: today,
        },
      },
    });

    return NextResponse.json({ 
      count: usage ? usage.count : 0, 
      limit: 3 
    });
  } catch (error: any) {
    console.error('Usage fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
