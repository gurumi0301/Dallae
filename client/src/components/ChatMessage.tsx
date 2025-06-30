import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
  senderName?: string;
}

export default function ChatMessage({ message, isOwnMessage, senderName }: ChatMessageProps) {
  if (message.isAiMessage) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border-l-4 border-orange-400">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span className="text-orange-700 font-medium text-sm">AI 위로</span>
        </div>
        <p className="text-gray-800 text-sm">{message.content}</p>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs p-4 rounded-2xl
        ${isOwnMessage 
          ? 'chat-bubble-sent text-white' 
          : 'chat-bubble-received text-gray-800'
        }
      `}>
        <p>{message.content}</p>
        {!isOwnMessage && senderName && (
          <p className="text-gray-500 text-xs mt-2">{senderName}</p>
        )}
      </div>
    </div>
  );
}
