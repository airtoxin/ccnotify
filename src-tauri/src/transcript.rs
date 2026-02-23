use std::io::SeekFrom;
use tokio::io::{AsyncBufReadExt, AsyncSeekExt, BufReader};

pub async fn read_task_summary(path: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let file = tokio::fs::File::open(path).await?;
    let file_len = file.metadata().await?.len();

    let mut file = file;
    // Read last 32KB
    let start = if file_len > 32768 {
        file_len - 32768
    } else {
        0
    };
    file.seek(SeekFrom::Start(start)).await?;

    let reader = BufReader::new(file);
    let mut lines = reader.lines();
    let mut last_assistant_message = String::new();

    while let Some(line) = lines.next_line().await? {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&line) {
            if val.get("role").and_then(|r| r.as_str()) == Some("assistant") {
                if let Some(content) = val.get("content") {
                    if let Some(text) = content.as_str() {
                        last_assistant_message = text.chars().take(200).collect();
                    } else if let Some(arr) = content.as_array() {
                        for item in arr {
                            if item.get("type").and_then(|t| t.as_str()) == Some("text") {
                                if let Some(text) = item.get("text").and_then(|t| t.as_str()) {
                                    last_assistant_message = text.chars().take(200).collect();
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(last_assistant_message)
}
