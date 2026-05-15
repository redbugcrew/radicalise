pub const DEFAULT_EMAIL_FROM_ADDRESS: &str = "RADicalise <noreply@radicalise.radhousing.org>";
pub const DEFAULT_EMAIL_BASE_URL: &str = "http://localhost:5173";

pub fn absolute_url_for_email(path: &str) -> String {
    let base_url = std::env::var("BASE_URL").unwrap_or_else(|_| DEFAULT_EMAIL_BASE_URL.to_string());
    format!("{}{}", base_url, path)
}
