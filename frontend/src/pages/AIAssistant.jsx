
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  askAI,
  clearChat,
} from "../store/aiSlice";

function AIAssistant() {
  const dispatch = useDispatch();

  const { messages, loading, error } = useSelector(
    (state) => state.ai
  );

  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setQuestion("");
    dispatch(
  askAI({
    question: trimmedQuestion,
    history: messages,
  })
);
  };

  return (
    <div className="ai-page">
      <style>{`
        .ai-page {
          min-height: calc(100vh - 100px);
          padding: 28px;
          background: #f8fafc;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          gap: 22px;
          font-family: Arial, sans-serif;
        }

        .ai-header {
          padding: 26px;
          background: linear-gradient(135deg, #fff, #f5f3ff);
          border: 1px solid #e9e5ff;
          border-radius: 20px;
          box-shadow: 0 4px 16px #4c1d950d;
        }

        .ai-header h1 {
          margin: 0 0 10px;
          color: #5b21b6;
          font-size: 28px;
          font-weight: 750;
        }

        .ai-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .ai-header button {
          margin-top: 16px;
          padding: 10px 16px;
          border: 1px solid #ddd6fe;
          border-radius: 9px;
          background: white;
          color: #6d28d9;
          font-weight: 600;
          cursor: pointer;
        }

        .ai-chat {
          flex: 1;
          min-height: 350px;
          max-height: 55vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 24px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 4px 18px #0f172a08;
        }

        .ai-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 35px 15px;
        }

        .ai-empty h2 {
          margin: 0 0 10px;
          color: #334155;
          font-size: 22px;
        }

        .ai-empty p {
          max-width: 430px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.8;
        }

        .ai-message {
          width: fit-content;
          max-width: 80%;
          padding: 15px 18px;
          border-radius: 15px;
          overflow-wrap: anywhere;
        }

        .ai-message.user {
          align-self: flex-end;
          background: #6d28d9;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .ai-message.assistant {
          align-self: flex-start;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .ai-message strong {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
        }

        .ai-message p {
          margin: 0;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .ai-error {
          padding: 12px 15px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 14px;
        }

        .ai-form {
          display: flex;
          gap: 12px;
          padding: 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 16px #0f172a08;
        }

        .ai-form input {
          flex: 1;
          min-width: 0;
          padding: 13px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #1e293b;
          font-size: 14px;
          outline: none;
        }

        .ai-form input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px #8b5cf620;
        }

        .ai-form button {
          padding: 12px 22px;
          border: none;
          border-radius: 10px;
          background: #6d28d9;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .ai-form button:hover:not(:disabled) {
          background: #5b21b6;
        }

        .ai-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .ai-page {
            padding: 15px;
            gap: 15px;
          }

          .ai-header {
            padding: 20px;
          }

          .ai-header h1 {
            font-size: 24px;
          }

          .ai-chat {
            min-height: 300px;
            padding: 16px;
          }

          .ai-message {
            max-width: 92%;
          }
        }

        @media (max-width: 420px) {
          .ai-form {
            flex-direction: column;
          }

          .ai-form button {
            width: 100%;
          }
        }
      `}</style>

      <div className="ai-header">
        <h1>AI Assistant</h1>
        <p>
          Ask questions about skills, learning,
          communities and available resources.
        </p>

        {messages.length > 0 && (
          <button type="button" onClick={() => dispatch(clearChat())}>
            Clear Chat
          </button>
        )}
      </div>

      <div className="ai-chat">
        {messages.length === 0 ? (
          <div className="ai-empty">
            <h2>How can I help you?</h2>
            <p>
              Ask me about skills, learning resources,
              communities or skill exchange.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`ai-message ${message.role}`}
            >
              <strong>
                {message.role === "user" ? "You" : "AI Assistant"}
              </strong>
              <p>{message.content}</p>
            </div>
          ))
        )}

        {loading && (
          <div className="ai-message assistant">
            <strong>AI Assistant</strong>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      {error && <p className="ai-error" role="alert">{error}</p>}

      <form className="ai-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          aria-label="Ask the AI assistant a question"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;
