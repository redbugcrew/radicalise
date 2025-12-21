use resend_rs::types::CreateEmailBaseOptions;

pub fn manage_your_eoi_email(
    to_address: String,
    collective_slug: String,
    eoi_auth_token: String,
) -> CreateEmailBaseOptions {
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

    CreateEmailBaseOptions::new(from, to, subject).with_html(&html_content)
}

pub fn eoi_received_notification_email(
    to_addresses: Vec<String>,
    collective_name: Option<String>,
) -> CreateEmailBaseOptions {
    let from = "RADicalise <noreply@radicalise.radhousing.org>";
    let to = to_addresses;
    let name = collective_name.unwrap_or_else(|| "your collective".to_string());
    let subject = format!("New expression of interest for {}", name);
    let base_url =
        std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let eoi_url = format!("{}/entry_pathways", base_url);

    let html_content = format!(
        "<p>A new expression of interest has been received for your collective, {}.</p><p>You can view all expressions of interest <a href=\"{}\">here</a>.</p>",
        name, eoi_url
    );

    CreateEmailBaseOptions::new(from, to, subject).with_html(&html_content)
}
