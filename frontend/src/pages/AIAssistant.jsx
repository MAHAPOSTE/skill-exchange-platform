import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  askAI,
  clearChat,
} from "../store/aiSlice";

function AIAssistant() {
  const dispatch = useDispatch();

  const {
    messages,
    loading,
    error,
  } = useSelector((state) => state.ai);

  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setQuestion("");

    dispatch(askAI(trimmedQuestion));
  };

  const handleClearChat = () => {
    dispatch(clearChat());
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <h1>AI Assistant</h1>

        <p>
          Ask questions about skills, learning,
          communities and available resources.
        </p>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
          >
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
                {message.role === "user"
                  ? "You"
                  : "AI Assistant"}
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

      {error && (
        <p className="ai-error">
          {error}
        </p>
      )}

      <form
        className="ai-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Ask something..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading || !question.trim()
          }
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;