import { useState, useCallback } from 'react';
import { getMessages as apiGetMessages, sendBroadcast as apiSendBroadcast } from '../services/api';

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetMessages();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      alert('Failed to fetch messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const broadcastMessage = useCallback(async ({ content, senderUsername }) => {
    setLoading(true);
    try {
      await apiSendBroadcast({ content, senderUsername });
      await fetchMessages();
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending broadcast:', err);
      alert('Failed to send broadcast. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  return { messages, loading, fetchMessages, broadcastMessage };
}
