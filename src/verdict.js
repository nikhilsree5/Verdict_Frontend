import React, { useState } from 'react';

function Verdict({ type }) {
  const [text, setText] = useState(''); //  State for storing the text input
  const [file, setFile] = useState(null); //  State for storing the file input
  const [result, setResult] = useState(null); //  State for storing the result of the analysis
  const [loading, setLoading] = useState(false); //  State for loading animation
  const [errorMessage, setErrorMessage] = useState("");
  const allowedExts = ["txt", "docx", "pdf"];



  const handleFileChange = (picked) => {
    if (!picked) {
      setFile(null);
      setErrorMessage("");
      return;
    }
    const ext = picked.name.split(".").pop().toLowerCase();
    if (!allowedExts.includes(ext)) {
      setFile(null);
      setErrorMessage("Unsupported format. Please upload .txt, .docx or .pdf.");
    } else {
      setFile(picked);
      setErrorMessage("");
    }
  };






  const handleAnalyze = async () => {
    setLoading(true); //  loading animation
    let response;

    try {
      if (type === 'sms') {
        response = await fetch('https://verdict-backend.onrender.com/api/analyze_sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('https://verdict-backend.onrender.com/api/analyze_document', {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setLoading(false); //Stop loading
    }
  };
  return (
  <div className="container">
    <h1>VerdictAI</h1>

    {type === 'sms' ? (
      <textarea
        rows="6"
        placeholder="Enter SMS text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    ) : (
      <div>
        {/* Supported‐formats notice */}
        <div style={{ marginBottom: 8 }}>
          Supported formats – .txt, .docx, .pdf
        </div>

        {/* File picker with validation */}
        <input
          type="file"
          accept=".txt,.docx,.pdf"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        {/* Unsupported‐format error */}
        {errorMessage && (
          <div style={{ color: "red", marginTop: 4 }}>
            {errorMessage}
          </div>
        )}
      </div>
    )}

    <button onClick={handleAnalyze}>Analyze</button>

    {loading && <p className="loading">🔄 Loading...</p>}

    {result && !loading && (
      <div className="result">
        <h2>
          Major Emotion: {result.Predicted_Sentiment} - {result.cd}%
        </h2>
        <ul>
          {result.emotions.map(({ emotion, prob }) => (
            <li key={emotion}>
              {emotion}: {prob}%
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

}

export default Verdict;