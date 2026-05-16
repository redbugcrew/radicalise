use resend_rs::types::CreateEmailBaseOptions;

use crate::shared::email_helpers::{DEFAULT_EMAIL_FROM_ADDRESS, absolute_url_for_email};

pub fn manage_your_eoi_email(
    to_address: String,
    project_slug: String,
    eoi_auth_token: String,
) -> CreateEmailBaseOptions {
    let to = [to_address];
    let subject = "Thanks for your expression of interest";

    let manage_eoi_url = absolute_url_for_email(&format!(
        "/project/{}/interest/{}",
        project_slug, eoi_auth_token
    ));

    let html_content = format!(
        "<p>Thanks for your expression of interest.</p>
        <p>You can edit or delete it at any time by clicking <a href=\"{}\">here</a>.</p>",
        manage_eoi_url,
    );

    CreateEmailBaseOptions::new(DEFAULT_EMAIL_FROM_ADDRESS, to, subject).with_html(&html_content)
}

pub fn eoi_received_notification_email(
    to_addresses: Vec<String>,
    project_name: Option<String>,
) -> CreateEmailBaseOptions {
    let to = to_addresses;
    let name = project_name.unwrap_or_else(|| "your project".to_string());
    let subject = format!("New expression of interest for {}", name);
    let eoi_url = absolute_url_for_email("/entry_pathways");

    let html_content = format!(
        "<p>A new expression of interest has been received for your project, {}.</p><p>You can view all expressions of interest <a href=\"{}\">here</a>.</p>",
        name, eoi_url
    );

    CreateEmailBaseOptions::new(DEFAULT_EMAIL_FROM_ADDRESS, to, subject).with_html(&html_content)
}
