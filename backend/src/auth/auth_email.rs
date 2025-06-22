use resend_rs::{
    Resend,
    types::{CreateEmailBaseOptions, CreateEmailResponse},
};

pub async fn reset_password_email(
    resend: &Resend,
    email: String,
    token: String,
) -> Result<CreateEmailResponse, resend_rs::Error> {
    let from = "RADicalise <noreply@radicalise.radhousing.org>";
    let to = [email];
    let subject = "Reset your RADicalise password";

    let base_url =
        std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    let html_content = format!(
        "<p>Please click the link below to reset your password.</p><p><a href=\"{}/reset_password?token={}\">Reset Password</a></p>",
        base_url, token
    );

    let email = CreateEmailBaseOptions::new(from, to, subject).with_html(&html_content);

    resend.emails.send(email).await
}
