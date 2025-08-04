import axios from "axios";

socket.on("receive_message", async (msg) => {
  setMessages((prev) => [...prev, {
    ...msg,
    isOwn: msg.senderId === user.id
  }]);

  // ✅ 서버에 메시지 저장 요청
  try {
    await axios.post("/api/chat/save", {
      senderId: user.id,
      anonymousSenderId: user.anonymousId,  // 없으면 null 처리
      receiverId: null, // 상대방 ID 있으면 넣기
      anonymousReceiverId: null,
      message: msg.text,
      messageType: "text",
      roomId: msg.roomId,
      createdAt: msg.timestamp,
    });
  } catch (err) {
    console.error("메시지 저장 실패:", err);
  }
});
