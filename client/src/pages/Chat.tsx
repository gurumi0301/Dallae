import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";
import { chatApi } from "@/lib/api";
import ChatMessage from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

export default function Chat() {
  const params = useParams();
  const sessionId = params.sessionId ? parseInt(params.sessionId) : null;
  const { user } = useAnonymousUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Match chat session if no sessionId provided
  const matchChat = useMutation({
    mutationFn: () => chatApi.matchChat(user?.id || 0),
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      // Start polling for messages
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', session.id] });
    },
    onError: () => {
      toast({
        title: "대화 매칭 실패",
        description: "대화 상대를 찾을 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // Get chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/chat/messages', currentSessionId],
    enabled: !!currentSessionId,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage({
      sessionId: currentSessionId!,
      senderId: user?.id || 0,
      content,
    }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', currentSessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "메시지 전송 실패",
        description: error.message || "메시지를 전송할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start chat matching if no session
  useEffect(() => {
    if (!currentSessionId && user && !matchChat.isPending) {
      matchChat.mutate();
    }
  }, [user, currentSessionId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentSessionId) return;
    sendMessage.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (matchChat.isPending) {
    return (
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">대화 상대를 찾고 있어요...</p>
          <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 flex items-center space-x-4">
        <Link href="/">
          <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Link>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">익명 대화</h3>
          <p className="text-gray-600 text-sm">익명의 상대와 대화 중</p>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto mobile-scroll" style={{ height: "calc(100vh - 140px)" }}>
        {/* Welcome Message */}
        <div className="text-center">
          <div className="bg-gray-100 rounded-full px-4 py-2 inline-block">
            <p className="text-gray-600 text-sm">익명 대화가 시작되었습니다</p>
          </div>
        </div>
        
        {/* Messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === user.id && !message.isAiMessage}
            senderName="익명"
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-full px-4 py-2">
              <p className="text-gray-600 text-sm">메시지를 불러오는 중...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
              disabled={sendMessage.isPending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
