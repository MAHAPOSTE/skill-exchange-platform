
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import socket from "../socket";

function Chat() {
  const { user } = useOutletContext();
  console.log("Logged-in user in Chat:", user);

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Load users with accepted exchange requests
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const [receivedResponse, sentResponse] = await Promise.all([
          api.get("/api/skill-exchange-requests/received", { headers }),
          api.get("/api/skill-exchange-requests/sent", { headers }),
        ]);

        const received = receivedResponse.data.requests || [];
        const sent = sentResponse.data.requests || [];

        const acceptedRequests = [...received, ...sent].filter(
          (request) => request.status === "accepted"
        );

        const chatContacts = acceptedRequests.map((request) => {
          const person =
            String(request.sender._id) === String(user.id)
              ? request.receiver
              : request.sender;

          return person;
        });

        const uniqueContacts = chatContacts.filter(
          (person, index, array) =>
            person &&
            array.findIndex(
              (item) => String(item._id) === String(person._id)
            ) === index
        );

        setContacts(uniqueContacts);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load contacts."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
  fetchContacts();
}
  }, [user]);

  // Load conversation when a contact is selected
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");

        const response = await api.get(
          `/api/messages/${selectedUser._id}`,
          { headers }
        );

        setMessages(response.data.messages || []);

        await api.put(
          `/api/messages/${selectedUser._id}/read`,
          {},
          { headers }
        );
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load messages."
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Receive messages in real time
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (
        selectedUser &&
        String(message.sender._id) === String(selectedUser.id)
      ) {
        setMessages((previousMessages) => [
          ...previousMessages,
          message,
        ]);

        api.put(
          `/api/messages/${selectedUser._id}/read`,
          {},
          { headers }
        ).catch((error) => {
          console.error("Failed to mark message as read:", error);
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedUser]);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) {
      return;
    }

    try {
      const response = await api.post(
        "/api/messages/send",
        {
          receiverId: selectedUser._id,
          message: newMessage,
        },
        { headers }
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        response.data.newMessage,
      ]);

      setNewMessage("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to send message."
      );
    }
  };

  if (loading) {
    return <p className="p-6">Loading contacts...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#142D4E]">
          Messages
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect with people after accepting a skill exchange request.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid min-h-[550px] grid-cols-1 overflow-hidden rounded-xl border border-[#DCE4EF] bg-white md:grid-cols-3">

        {/* Contact list */}
        <div className="border-b border-[#DCE4EF] md:col-span-1 md:border-b-0 md:border-r">
          <div className="border-b border-[#DCE4EF] p-4">
            <h2 className="font-semibold text-[#142D4E]">
              Conversations
            </h2>
          </div>

          {contacts.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No accepted exchange requests yet.
            </p>
          ) : (
            contacts.map((person) => (
              <button
                key={person._id}
                onClick={() => {
                  setSelectedUser(person);
                  setError("");
                }}
                className={`w-full border-b border-[#DCE4EF] p-4 text-left transition hover:bg-[#F3F6FA] ${
                  selectedUser?._id === person._id
                    ? "bg-[#EAF1FB]"
                    : ""
                }`}
              >
                <p className="font-medium text-[#142D4E]">
                  {person.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {person.email}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="flex flex-col md:col-span-2">
          {selectedUser ? (
            <>
              <div className="border-b border-[#DCE4EF] p-4">
                <h2 className="font-semibold text-[#142D4E]">
                  {selectedUser.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedUser.email}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {loadingMessages ? (
                  <p className="text-sm text-gray-500">
                    Loading messages...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="m-auto text-sm text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`max-w-[80%] rounded-xl p-3 text-sm ${
                        String(message.sender._id) === String(user._id)
                          ? "ml-auto bg-[#4F86F7] text-white"
                          : "mr-auto bg-[#F3F6FA] text-[#142D4E]"
                      }`}
                    >
                      {message.message}
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-[#DCE4EF] p-4"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-w-0 flex-1 rounded-lg border border-[#DCE4EF] px-3 py-2 text-sm outline-none focus:border-[#4F86F7]"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="rounded-lg bg-[#4F86F7] px-5 py-2 text-sm font-medium text-white hover:bg-[#3B72E8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-500">
              Select a contact to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
