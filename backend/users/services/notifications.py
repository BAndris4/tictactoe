import resend
from django.conf import settings

def send_password_reset_email(email, token):
    if not settings.RESEND_API_KEY:
        print("WARNING: RESEND_API_KEY is not set. Email not sent.")
        print(f"Token for {email}: {token}")
        return False

    resend.api_key = settings.RESEND_API_KEY
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    from_email = settings.EMAIL_FROM

    params = {
        "from": from_email,
        "to": email,
        "subject": "Action Required: Reset Your Tic-Tac-Toe Password",
        "html": f"""
        <div style="background-color: #EEF2FF; padding: 50px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(85, 112, 241, 0.15);">
                <div style="background: linear-gradient(135deg, #5570F1 0%, #4356C4 100%); padding: 50px 40px; text-align: center; position: relative;">
                    <div style="margin-bottom: 25px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="8" style="margin: 0 auto;">
                            <tr>
                                <td style="width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 24px; font-weight: 800; text-align: center;">X</td>
                                <td style="width: 44px; height: 44px; background: rgba(255,255,255,0.05); border-radius: 12px; color: rgba(255,255,255,0.4); font-size: 24px; font-weight: 800; text-align: center;">O</td>
                                <td style="width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 24px; font-weight: 800; text-align: center;">X</td>
                            </tr>
                        </table>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Security Update</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 16px; font-weight: 500;">Let's get you back in the game!</p>
                </div>
                <div style="padding: 45px 50px;">
                    <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #0F172A;">Forgot your password?</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #475569;">
                        We received a request to reset your password. No worries! Click the button below to choose a new one and continue your winning streak.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{reset_link}" style="display: inline-block; background-color: #5570F1; color: #ffffff; padding: 18px 45px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(85, 112, 241, 0.3); transition: all 0.3s ease;">
                            Reset Password Now
                        </a>
                    </div>
                    <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #64748B; text-align: center;">
                        This link will expire in <span style="color: #5570F1; font-weight: 600;">24 hours</span> for your security.
                    </p>
                </div>
                <div style="background-color: #F8FAFC; padding: 30px 50px; border-top: 1px solid #F1F5F9; text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                        If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                    <div style="margin-top: 20px;">
                        <span style="font-size: 13px; font-weight: 700; color: #5570F1; letter-spacing: 0.1em; text-transform: uppercase;">Ultimate Tic Tac Toe</span>
                    </div>
                </div>
            </div>
            <div style="max-width: 560px; margin: 25px auto 0; text-align: center;">
                <p style="font-size: 11px; color: #94A3B8; margin: 0;">
                    &copy; 2026 Tic-Tac-Toe App. Built with &hearts; for gamers.
                </p>
            </div>
        </div>
        """,
    }

    try:
        r = resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending email with Resend: {e}")
        return False
