import React, { useState } from "react";

function Summarizer() {
  const [transcript, setTranscript] = useState("");
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState(
    "Summarize in bullet points for executives."
  );
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target.result);
        setFileName(file.name);
        setError(null);
      };
      reader.onerror = () => setError("Failed to read the file.");
      reader.readAsText(file);
    } else {
      setError("Please upload a valid .txt file.");
      setFileName("");
      setTranscript("");
    }
  };

  const generateSummary = async () => {
    if (!transcript) {
      setError("Please upload a transcript first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, prompt }),
      });

      const result = await response.json();
      if (result.choices?.[0]?.message?.content) {
        setSummary(result.choices[0].message.content);
      } else if (result.error) {
        setError(result.error);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (!summary || !recipients) {
      setError(
        "Please generate a summary and enter recipient emails to share."
      );
      return;
    }
    const subject = "Meeting Notes Summary";
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="main-content">
      <div className="form-section">
        <label htmlFor="file-upload">1. Upload Transcript</label>
        <div className="file-upload-wrapper">
          <label className="file-upload-label">
            <span>Choose a .txt file</span>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="file-upload-input"
              onChange={handleFileChange}
            />
          </label>
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
      </div>

      <div className="form-section">
        <label htmlFor="custom-prompt">2. Add Custom Instructions</label>
        <textarea
          id="custom-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Summarize in bullet points for executives'"
          className="form-textarea"
          rows="3"
        ></textarea>
      </div>

      <div className="button-container form-section">
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className="button button-generate"
        >
          {isLoading ? "Generating..." : "Generate Summary"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="form-section">
        <label htmlFor="summary">3. Generated Summary (Editable)</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Your AI-generated summary will appear here..."
          className="form-textarea summary-textarea"
        ></textarea>
      </div>

      <div className="form-section">
        <label htmlFor="recipients">4. Share via Email</label>
        <div className="share-wrapper">
          <input
            type="email"
            id="recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="Enter recipient emails, separated by commas"
            className="form-input form-input-grow"
          />
          <button onClick={handleShare} className="button button-share">
            Share Summary
          </button>
        </div>
      </div>
    </main>
  );
}

export default Summarizer;
