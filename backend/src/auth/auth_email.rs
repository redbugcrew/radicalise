use resend_rs::{Resend, types::CreateEmailBaseOptions};

pub async fn hello_world_email(resend: &Resend, email: String, _token: String) {
    let from = "Acme <onboarding@resend.dev>";
    let to = [email];
    let subject = "Hello World.";

    let email =
        CreateEmailBaseOptions::new(from, to, subject).with_html("<strong>It works!</strong>");

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
