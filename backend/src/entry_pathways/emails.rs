use resend_rs::{
    Resend,
    types::{CreateEmailBaseOptions, CreateEmailResponse},
};

pub async fn manage_your_eoi_email(
    resend: &Resend,
    to_address: String,
    collective_slug: String,
    eoi_auth_token: String,
) -> Result<CreateEmailResponse, resend_rs::Error> {
    let from = "RADicalise <noreply@radicalise.radhousing.org>";
    let to = [to_address];
    let subject = "Thanks for your expression of interest";

    let base_url =
        std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let manage_eoi_url = format!(
        "{}/collective/{}/interest/{}",
        base_url, collective_slug, eoi_auth_token
    );

    let html_content = format!(
        "<p>Thanks for your expression of interest.</p>
        <p>You can edit or delete it at any time by clicking <a href=\"{}\">here</a>.</p>",
        manage_eoi_url,
    );

    let email = CreateEmailBaseOptions::new(from, to, subject).with_html(&html_content);

    resend.emails.send(email).await
}
