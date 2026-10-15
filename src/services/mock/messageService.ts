import { Conversation, Message, User } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from '../../data/mockData';
import { authService } from './authService';
import { notificationService } from './notificationService';

export const messageService = {
  getUserConversations: (userId: string): Conversation[] => {
    initStorageIfEmpty();
    const convs = getStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    const users = authService.getAllUsers();
    const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

    return convs
      .filter((c) => c.participantIds.includes(userId))
      .map((c) => ({
        ...c,
        participants: c.participantIds.map((pid) => userMap.get(pid)).filter(Boolean) as User[],
      }))
      .sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
  },

  getMessages: (conversationId: string): Message[] => {
    initStorageIfEmpty();
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  getOrCreateConversation: async (params: {
    rideId: string;
    rideTitle: string;
    participantIds: string[];
  }): Promise<Conversation> => {
    initStorageIfEmpty();
    const convs = getStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);

    // Look for existing conversation with the same ride and participants
    const existing = convs.find(
      (c) =>
        c.rideId === params.rideId &&
        params.participantIds.every((pid) => c.participantIds.includes(pid))
    );

    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      rideId: params.rideId,
      rideTitle: params.rideTitle,
      participantIds: params.participantIds,
      lastMessage: 'Conversation started',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    setStorage(STORAGE_KEYS.CONVERSATIONS, [newConv, ...convs]);
    return newConv;
  },

  sendMessage: async (params: {
    conversationId: string;
    senderId: string;
    text: string;
  }): Promise<Message> => {
    initStorageIfEmpty();
    const messages = getStorage<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const convs = getStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    const users = authService.getAllUsers();
    const sender = users.find((u) => u.id === params.senderId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: params.conversationId,
      senderId: params.senderId,
      senderName: sender?.fullName || 'Student',
      senderAvatar: sender?.avatarUrl,
      text: params.text.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setStorage(STORAGE_KEYS.MESSAGES, [...messages, newMsg]);

    // Update conversation metadata
    const convIndex = convs.findIndex((c) => c.id === params.conversationId);
    if (convIndex !== -1) {
      const conv = convs[convIndex];
      convs[convIndex] = {
        ...conv,
        lastMessage: newMsg.text,
        lastMessageAt: newMsg.createdAt,
      };
      setStorage(STORAGE_KEYS.CONVERSATIONS, convs);

      // Notify other participants
      const otherParticipantIds = conv.participantIds.filter((pid) => pid !== params.senderId);
      for (const recipientId of otherParticipantIds) {
        await notificationService.createNotification({
          userId: recipientId,
          title: `New message from ${sender?.fullName || 'Student'}`,
          message: newMsg.text.length > 50 ? `${newMsg.text.substring(0, 50)}...` : newMsg.text,
          type: 'new_message',
          link: '/messages',
        });
      }
    }

    return newMsg;
  },
};
