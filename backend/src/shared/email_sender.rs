use resend_rs::{Resend, types::CreateEmailBaseOptions};

pub trait EmailSender: Send + Sync {
    async fn send_email(&self, email: CreateEmailBaseOptions) -> Result<(), String>;
}

pub struct ResendEmailSender {
    resend: Resend,
}

impl ResendEmailSender {
    pub fn new(resend: Resend) -> Self {
        Self { resend }
    }
}

impl EmailSender for ResendEmailSender {
    async fn send_email(&self, email: CreateEmailBaseOptions) -> Result<(), String> {
        self.resend
            .emails
            .send(email)
            .await
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
}

#[cfg(test)]
pub mod test_helpers {
    use super::*;
    use std::sync::Mutex;

    pub struct MockEmailSender {
        pub sent_emails: Mutex<Vec<CreateEmailBaseOptions>>,
    }

    impl MockEmailSender {
        pub fn new() -> Self {
            Self {
                sent_emails: Mutex::new(vec![]),
            }
        }
    }

    impl EmailSender for MockEmailSender {
        async fn send_email(&self, email: CreateEmailBaseOptions) -> Result<(), String> {
            self.sent_emails.lock().unwrap().push(email);
            Ok(())
        }
    }
}
