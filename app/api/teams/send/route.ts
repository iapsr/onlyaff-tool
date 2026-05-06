import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized", details: "No access token" }, { status: 401 });
    }

    const { email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get current user's MS Graph ID
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!meRes.ok) {
        throw new Error("Failed to fetch user profile from MS Graph");
    }
    const meData = await meRes.json();
    const myId = meData.id;

    // 2. Create or get existing 1-on-1 chat
    const chatRes = await fetch("https://graph.microsoft.com/v1.0/chats", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatType: "oneOnOne",
        members: [
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: ["owner"],
            "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${myId}')`,
          },
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: ["owner"],
            "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${email}')`,
          },
        ],
      }),
    });

    const chatData = await chatRes.json();
    
    if (!chatRes.ok) {
        throw new Error(chatData.error?.message || "Failed to create Chat session");
    }

    const chatId = chatData.id;

    // 3. Send message to chat
    // Convert newlines to HTML <br> for Teams rendering
    const htmlMessage = message.replace(/\n/g, "<br/>");

    const sendRes = await fetch(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: {
          contentType: "html",
          content: htmlMessage,
        },
      }),
    });

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      throw new Error(sendData.error?.message || "Failed to send message via MS Graph API");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("MS Teams API Error:", error.message);
    return NextResponse.json({ error: "Graph API Error", details: error.message }, { status: 500 });
  }
}
