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
      console.error('Unauthorized settings read attempt:', currentUserEmail);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const openaiKey = await prisma.setting.findUnique({ where: { id: 'openai_api_key' } });

    return NextResponse.json({
      openai_api_key: openaiKey?.value || '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const currentUserEmail = session?.user?.email?.toLowerCase();

    if (!currentUserEmail || !adminEmails.includes(currentUserEmail)) {
      console.error('Unauthorized settings write attempt:', currentUserEmail);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { openai_api_key } = await request.json();

    await prisma.setting.upsert({
      where: { id: 'openai_api_key' },
      update: { value: openai_api_key },
      create: { id: 'openai_api_key', value: openai_api_key }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
