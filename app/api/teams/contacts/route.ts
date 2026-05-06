import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "No access token in session. Dump: " + JSON.stringify(session)
      }, { status: 401 });
    }

    // Fetch user's chats to extract direct contacts
    const chatsRes = await fetch("https://graph.microsoft.com/v1.0/me/chats?$expand=members&$top=50", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });

    const responseText = await chatsRes.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        return NextResponse.json({ 
            error: "Bad Response", 
            details: "Microsoft Graph returned invalid JSON: " + responseText.substring(0, 150)
        }, { status: 500 });
    }

    // Get the current user's profile to exclude them from the list
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData = meRes.ok ? await meRes.json() : null;
    const myId = meData?.id;

    // Extract unique members from chats
    const uniqueContacts = new Map();

    if (chatsRes.ok && data.value && Array.isArray(data.value)) {
      data.value.forEach((chat: any) => {
        if (chat.members && Array.isArray(chat.members)) {
          chat.members.forEach((member: any) => {
             const id = member.userId || member.id;
             // Exclude myself and any system bots without emails
             if (id && id !== myId && member.displayName !== "Teams") {
               const email = member.email || member.userPrincipalName;
               if (email && !uniqueContacts.has(email)) {
                 uniqueContacts.set(email, {
                   id: id,
                   name: member.displayName || email.split('@')[0],
                   teams: email
                 });
               }
             }
          });
        }
      });
    }

    // Fallback to /me/people if chats API is blocked by Azure policies OR is completely empty
    if (!chatsRes.ok || uniqueContacts.size === 0) {
        const peopleRes = await fetch("https://graph.microsoft.com/v1.0/me/people?$select=id,displayName,scoredEmailAddresses,userPrincipalName", {
           headers: { Authorization: `Bearer ${accessToken}` },
           cache: 'no-store'
        });
        
        if (peopleRes.ok) {
            const peopleText = await peopleRes.text();
            try {
                const peopleData = JSON.parse(peopleText);
                if (peopleData.value && Array.isArray(peopleData.value)) {
                    peopleData.value.forEach((u: any) => {
                        let email = u.userPrincipalName;
                        if (u.scoredEmailAddresses && u.scoredEmailAddresses.length > 0) {
                            email = u.scoredEmailAddresses[0].address;
                        }
                        if (email && !uniqueContacts.has(email) && u.id !== myId) {
                            uniqueContacts.set(email, {
                                id: u.id,
                                name: u.displayName || "Unknown Contact",
                                teams: email, 
                            });
                        }
                    });
                }
            } catch (e) {
                console.error("People fallback failed parsing");
            }
        } else {
             // If BOTH endpoints completely fail, throw the original explicit error to the frontend
             if (!chatsRes.ok) {
                 return NextResponse.json({ 
                     error: "Graph API Blocked", 
                     details: `Chats API Error: ${data?.error?.message}. People API also failed. Please add 'Chat.ReadWrite' and 'People.Read' in your Azure App Registration and click 'Grant Admin Consent'.` 
                 }, { status: 403 });
             }
        }
    }

    const contacts = Array.from(uniqueContacts.values());
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ contacts });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
