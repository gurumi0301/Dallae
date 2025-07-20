export default function ChatMessage({ message, isOwn, isAI = false }) {
  const getMessageClass = () => {
    if (isAI) return 'chat-message ai';
    if (isOwn) return 'chat-message own';
    return 'chat-message other';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={getMessageClass()}>
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.createdAt)}
          </span>
          {isAI && (
            <span className="text-xs font-medium text-mint-600">AI</span>
          )}
        </div>
      </div>
    </div>
  );
}