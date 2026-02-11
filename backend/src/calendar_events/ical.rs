use chrono::NaiveDateTime;
use icalendar::{Calendar, Component, Event, EventLike};

use crate::shared::entities::CalendarEvent;

pub fn get_ical_string(name: String, events: Vec<CalendarEvent>) -> String {
    let mut my_calendar = Calendar::new();

    let builder = my_calendar.name(&name);

    events.into_iter().for_each(|event| {
        let mut cal_event = Event::new();
        let start_at = parse_naive_date_time(&event.start_at);
        let end_at = parse_optional_naive_date_time(&event.end_at);

        cal_event
            .summary(&event.name)
            .description("")
            .starts(start_at);

        if let Some(end_at) = &end_at {
            cal_event.ends(*end_at);
        }

        builder.push(cal_event);
    });

    builder.done().to_string()
}

fn parse_optional_naive_date_time(input: &Option<String>) -> Option<NaiveDateTime> {
    input.as_ref().map(|s| parse_naive_date_time(s))
}

fn parse_naive_date_time(input: &str) -> NaiveDateTime {
    NaiveDateTime::parse_from_str(input, "%Y-%m-%d %H:%M:%S")
        .map_err(|err| {
            eprintln!("Failed to parse date time '{}': {}", input, err);
            err
        })
        .unwrap()
}
