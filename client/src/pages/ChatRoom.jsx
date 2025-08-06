import React, { useState, useRef, useEffect } from "react";
import { useAnonymousUser } from "../hooks/useAnonymousUser";
import { useLocation } from "wouter";
import { getSocket } from "../hooks/socket";
const socket = getSocket();
import { generateAnonymousName } from "../../../server/services/anonymousNames";
import "../styles/Chat.css";

export default function ChatRoom() {
  const { user } = useAnonymousUser();
  const [location, setLocation] = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null); // 타이핑 타이머 추적

  // URL에서 채팅 정보 추출
  useEffect(() => {
    const pathParts = location.split("/");
    if (pathParts.length >= 4) {
      const chatType = pathParts[2]; // random, ai, etc.
      const chatId = pathParts[3];

      let partnerName = "";
      switch (chatType) {
        case "random":
          partnerName = generateAnonymousName();
          break;
        case "ai":
          partnerName = "AI 상담사";
          break;
        default:
          partnerName = "채팅 상대";
      }

      setChatInfo({
        type: chatType,
        id: chatId,
        partnerName,
      });
    }
  }, [location]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 소켓 리스너 설정
  useEffect(() => {
    if (!chatInfo || !user) return;

    const joinedRoomId = chatInfo.id;
    const userId = user.id;

    const handleReceive = (message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          isOwn: message.senderId === userId,
        },
      ]);
    };

    const handleTyping = (data) => {
      if (data.senderId !== userId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          typingTimeoutRef.current = null;
        }, 5000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.senderId !== user?.Id) {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    };

    socket.emit("join_room", {
      roomId: joinedRoomId,
      user: {
        id: userId,
        name: user.anonymousName,
      },
    });

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.emit("leave_room", { roomId: joinedRoomId });
    };
  }, [chatInfo?.id, user?.id]);

  // 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim() || !chatInfo || !user) return;

    const message = {
      id: Date.now(),
      roomId: chatInfo.id,
      senderId: user.id,
      senderName: user.anonymousName,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", message);

    // 타이핑 중단 신호 보내기
    socket.emit("stop_typing", {
      roomId: chatInfo?.id,
      senderId: user?.id,
    });

    setNewMessage("");
  };

  // 입력 시 타이핑 신호
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      socket.emit("typing", {
        roomId: chatInfo?.id,
        senderId: user.id,
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shouldShowTime = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    const curr = new Date(currentMessage.timestamp);
    const prev = new Date(previousMessage.timestamp);
    return (
      curr.getMinutes() !== prev.getMinutes() ||
      curr.getHours() !== prev.getHours()
    );
  };

  const handleLeaveChat = () => {
    setLocation("/chat");
  };

  if (!chatInfo) {
    return (
      <div className="chat-container">
        <div className="loading">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-room-header">
          <button onClick={handleLeaveChat} className="back-button">
            ← 나가기
          </button>
          <div className="chat-room-info">
            <h1 className="page-title">{chatInfo.partnerName}</h1>
            <p className="page-subtitle">
              {chatInfo.type === "ai" ? "AI 상담" : "익명 채팅"}
            </p>
          </div>
        </div>
      </header>

      <div className="chat-interface">
        <div className="chat-messages">
          {messages.map((message, index) => {
            const showTime = shouldShowTime(message, messages[index - 1]);
            return (
              <div key={message.id}>
                <div className={`message ${message.isOwn ? "own" : ""}`}>
                  <div className="message-avatar">
                    {message.isOwn
                      ? user.anonymousName[0]
                      : chatInfo.type === "ai"
                      ? "🤖"
                      : `${chatInfo.partnerName[0]}`}
                  </div>
                  <div className="message-content">
                    <p className="message-text">{message.text}</p>
                  </div>
                </div>
                {showTime && (
                  <div
                    className={`message-timestamp ${
                      message.isOwn ? "own" : ""
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="message">
              <div className="message-avatar">
                {chatInfo.type === "ai" ? "🤖" : `${chatInfo.partnerName[0]}`}
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span>입력 중</span>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="chat-input"
              rows={1}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="chat-send-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="bottom-spacer"></div>
      <footer>테스트</footer>
    </div>
  );
}
