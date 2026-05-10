export const magicLinkTemplate = (url: string) => {
  const brandColor = "#BEFF00";
  const bgColor = "#050505";
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to onlyaff.io</title>
      <style>
        body { background-color: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; }
        .content { padding: 48px 40px; text-align: center; }
        .logo { width: 48px; height: 48px; background-color: ${brandColor}; border-radius: 12px; margin: 0 auto 32px auto; box-shadow: 0 0 20px rgba(190, 255, 0, 0.2); }
        h1 { color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 16px 0; }
        p { color: #888888; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; }
        .button { display: inline-block; background-color: ${brandColor}; color: #000000; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 15px; transition: all 0.2s ease; }
        .footer { padding: 32px 40px; background-color: rgba(255,255,255,0.02); text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-text { color: #444444; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .link-text { color: #333; font-size: 11px; margin-top: 20px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo"></div>
          <h1>Sign in to onlyaff.io</h1>
          <p>We received a request to sign in to your account. Click the button below to securely access your dashboard.</p>
          <a href="${url}" class="button">Log In to Dashboard</a>
          <div class="link-text">Or copy this link: ${url}</div>
        </div>
        <div class="footer">
          <p class="footer-text">Secure Access • onlyaff.io Infrastructure</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
