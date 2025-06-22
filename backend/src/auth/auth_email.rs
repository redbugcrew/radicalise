use resend_rs::{Resend, types::CreateEmailBaseOptions};

pub async fn hello_world_email(resend: &Resend, email: String, token: String) {
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

    let result = resend.emails.send(email).await;

    match result {
        Ok(response) => {
            println!("Email sent successfully: {:?}", response);
        }
        Err(e) => {
            eprintln!("Failed to send email: {}", e);
        }
    }
}
