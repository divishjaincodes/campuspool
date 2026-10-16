import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services';
import { Conversation, Message } from '../types';
import { getRelativeTimestamp } from '../utils/dateUtils';
import {
  Send,
  MessageSquare,
  ArrowLeft,
  Car,
  CheckCheck,
  User as UserIcon,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      messageService.getUserConversations(currentUser.id).then((convs) => {
        setConversations(convs);
        if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0]);
        }
      }).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeConv) {
      messageService.getMessages(activeConv.id).then(setMessages).catch(console.error);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !currentUser) return;

    try {
      const newMsg = await messageService.sendMessage({
        conversationId: activeConv.id,
        senderId: currentUser.id,
        text: inputText,
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');

      // Refresh conversations list to update lastMessage
      const updatedConvs = await messageService.getUserConversations(currentUser.id);
      setConversations(updatedConvs);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!currentUser) return null;

  const otherParticipant = activeConv?.participants?.find((p) => p.id !== currentUser.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 shadow-sm overflow-hidden h-[75vh] flex">
        {/* Left: Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-[#D2D2D7]/70 flex flex-col ${
            activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-[#F5F5F7]">
            <h2 className="text-base font-bold text-[#1D1D1F]">Student Messages</h2>
            <p className="text-[11px] text-[#6E6E73]">Coordinate pickup points & timings</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F7]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E6E73]">
                <MessageSquare className="w-8 h-8 text-[#A1A1A6] mx-auto mb-2" />
                No messages yet. Reach out to a ride creator or passenger!
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.participants?.find((p) => p.id !== currentUser.id);
                const isSelected = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected ? 'bg-[#0071E3]/5 border-l-2 border-[#0071E3]' : 'hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <img
                      src={
                        partner?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775?w=150'
                      }
                      alt={partner?.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-[#D2D2D7]/80 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#1D1D1F] truncate">
                          {partner?.fullName || 'Student'}
                        </span>
                        <span className="text-[10px] text-[#A1A1A6]">
                          {conv.lastMessageAt ? getRelativeTimestamp(conv.lastMessageAt) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0071E3] font-medium truncate mt-0.5">
                        {conv.rideTitle}
                      </p>
                      <p className="text-xs text-[#6E6E73] truncate mt-0.5">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div
          className={`flex-1 flex flex-col ${
            !activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-[#D2D2D7]/60 flex items-center justify-between bg-[#FFFFFF]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="p-1 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={
                      otherParticipant?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775?w=150'
                    }
                    alt={otherParticipant?.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-[#D2D2D7]"
                  />
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#1D1D1F]">
                      {otherParticipant?.fullName || 'Student'}
                    </h3>
                    <p className="text-[11px] text-[#0071E3] font-medium truncate max-w-xs sm:max-w-md">
                      {activeConv.rideTitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F7]/50">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#6E6E73]">
                    Say hello! Coordinate your pickup spot and timing.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${
                            isMe
                              ? 'bg-[#0071E3] text-white rounded-br-none shadow-sm'
                              : 'bg-white text-[#1D1D1F] border border-[#D2D2D7]/70 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-[#A1A1A6] mt-1 px-1">
                          {getRelativeTimestamp(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#D2D2D7]/70 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to your co-passenger..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 text-white flex items-center justify-center transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#6E6E73]">
              <MessageSquare className="w-10 h-10 text-[#A1A1A6] mb-2" />
              <p className="font-semibold text-sm text-[#1D1D1F]">Select a conversation</p>
              <p className="mt-1">Coordinate details with fellow carpoolers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
