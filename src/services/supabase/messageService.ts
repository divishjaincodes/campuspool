import { Conversation, Message } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapProfileToUser } from './mappers';

export const messageService = {
  getConversationsForUser: async (userId: string): Promise<Conversation[]> => {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [userId])
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('[messageService.getConversations] Error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        rideId: row.ride_id,
        rideTitle: 'Carpool Travel Coordination',
        participantIds: row.participant_ids || [],
        lastMessage: row.last_message || 'Start coordinating your journey',
        lastMessageAt: row.last_message_at || row.created_at,
        unreadCount: 0,
      }));
    } catch {
      return [];
    }
  },

  getUserConversations: (userId: string): Promise<Conversation[]> => {
    return messageService.getConversationsForUser(userId);
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (!isSupabaseConfigured || !conversationId) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) return [];

      return (data || []).map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: m.sender?.full_name || 'Student',
        senderAvatar: m.sender?.avatar_url,
        text: m.text,
        createdAt: m.created_at,
        read: m.read,
      }));
    } catch {
      return [];
    }
  },

  sendMessage: async (
    arg1: string | { conversationId: string; senderId: string; text: string },
    arg2?: string,
    arg3?: string
  ): Promise<Message> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    let conversationId: string;
    let senderId: string;
    let text: string;

    if (typeof arg1 === 'object') {
      conversationId = arg1.conversationId;
      senderId = arg1.senderId;
      text = arg1.text;
    } else {
      conversationId = arg1;
      senderId = arg2!;
      text = arg3!;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text: text.trim(),
        read: false,
      })
      .select('*, sender:profiles!sender_id(*)')
      .single();

    if (error) throw new Error(error.message);

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: text.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderName: data.sender?.full_name || 'Student',
      senderAvatar: data.sender?.avatar_url,
      text: data.text,
      createdAt: data.created_at,
      read: data.read,
    };
  },
};
