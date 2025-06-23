use resend_rs::{
    Resend,
    types::{CreateEmailBaseOptions, CreateEmailResponse},
};
use urlencoding::encode;

pub async fn reset_password_email(
    resend: &Resend,
    email: String,
    token: String,
) -> Result<CreateEmailResponse, ()> {
    let from = "RADicalise <noreply@radicalise.radhousing.org>";
    let to = [email];
    let subject = "Reset your RADicalise password";

    let base_url =
        std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    let html_content = format!(
        "<p>Please click the link below to reset your password.</p><p><a href=\"{}/auth/reset_password?token={}\">Reset Password</a></p>",
        base_url,
        encode(&token)
    );

    let email = CreateEmailBaseOptions::new(from, to, subject).with_html(&html_content);

    let result: Result<CreateEmailResponse, resend_rs::Error> = resend.emails.send(email).await;

    match result {
        Ok(response) => {
            println!("Reset password email sent successfully: {:?}", response);
            Ok(response)
        }
        Err(e) => match e {
            resend_rs::Error::Http(error) => {
                let reqwest_error: reqwest::Error = error;

                if reqwest_error.is_timeout() {
                    eprintln!("Request timed out: {}", reqwest_error);
                } else if reqwest_error.is_connect() {
                    let status = reqwest_error.status();
                    let url = reqwest_error.url();

                    eprintln!("Connection error: {}", reqwest_error);

                    if let Some(status_code) = status {
                        eprintln!("Status code: {}", status_code);
                    }

                    if let Some(url) = url {
                        eprintln!("Error URL: {}", url);
                    }

                    // get more detail about this error
                } else if reqwest_error.is_status() {
                    eprintln!("HTTP status error: {}", reqwest_error);
                } else {
                    eprintln!("Other HTTP error: {}", reqwest_error);
                }

                eprintln!("HTTP Error: {}", reqwest_error);
                Err(())
            }
            resend_rs::Error::Resend(error) => {
                eprintln!("Resend Error: {}", error);
                Err(())
            }
            resend_rs::Error::RateLimit {
                ratelimit_limit,
                ratelimit_remaining,
                ratelimit_reset,
            } => {
                eprintln!(
                    "Rate Limit Error: {} - {} - {}",
                    ratelimit_limit.unwrap_or(0),
                    ratelimit_remaining.unwrap_or(0),
                    ratelimit_reset.unwrap_or(0)
                );
                Err(())
            }
            other_error => {
                eprintln!("An unexpected error occurred: {}", other_error);
                Err(())
            }
        },
    }
}
