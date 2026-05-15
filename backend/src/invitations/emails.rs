use resend_rs::types::CreateEmailBaseOptions;

use urlencoding::encode;

use crate::shared::email_helpers::{DEFAULT_EMAIL_FROM_ADDRESS, absolute_url_for_email};

pub struct InvitedToCircleEmailParams {
    pub invitation_id: i64,
    pub invitation_token: String,
    pub invitee_name: String,
    pub inviter_name: String,
    pub project_name: Option<String>,
    pub message: Option<String>,
}

pub fn invited_to_circle_email(
    to_address: String,
    params: InvitedToCircleEmailParams,
) -> CreateEmailBaseOptions {
    let to = [to_address];
    let subject = "You're invited to join a project on RADicalise";

    let manage_eoi_url = absolute_url_for_email(&format!(
        "/people/invitation/{}/accept?token={}",
        params.invitation_id,
        encode(&params.invitation_token)
    ));

    let message_html = params
        .message
        .map(|m| format!("<p>They write:</p>\n<pre>{}</pre>", m))
        .unwrap_or_default();

    let html_content = format!(
        "<p>Hi {name}.</p>
        <p>{inviter} has invited you to join {project} on RADicalise.</p>
        {message_html}
        <p>To accept the invitation, click <a href=\"{url}\">here</a>.</p>",
        name = params.invitee_name,
        inviter = params.inviter_name,
        project = params
            .project_name
            .unwrap_or_else(|| "their project".to_string()),
        message_html = message_html,
        url = manage_eoi_url,
    );

    CreateEmailBaseOptions::new(DEFAULT_EMAIL_FROM_ADDRESS, to, subject).with_html(&html_content)
}
