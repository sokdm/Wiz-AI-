import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useStore } from '../store/useStore';

export default function Tutor() {
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const { isAuthenticated, logout } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
      if (response.data.length > 0 && !currentConv) {
        loadConversation(response.data[0]);
      }
    } catch (error) {
      if (error.response?.status === 401) logout();
    }
  };

  const loadConversation = async (conv) => {
    try {
      const response = await api.get(`/conversations/${conv._id}`);
      setCurrentConv(response.data);
      setMessages(response.data.messages);
      setSidebarOpen(false);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const createConversation = async () => {
    try {
      const response = await api.post('/conversations', { title: 'New Chat' });
      setConversations([response.data, ...conversations]);
      setCurrentConv(response.data);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(conversations.filter(c => c._id !== id));
      if (currentConv?._id === id) {
        setCurrentConv(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateTitle = async (id, newTitle) => {
    try {
      await api.patch(`/conversations/${id}`, { title: newTitle });
      setConversations(conversations.map(c => 
        c._id === id ? { ...c, title: newTitle } : c
      ));
      if (currentConv?._id === id) {
        setCurrentConv({ ...currentConv, title: newTitle });
      }
      setEditingTitle(null);
    } catch (error) {
      toast.error('Failed to update title');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      // Create conversation if none exists
      let convId = currentConv?._id;
      if (!convId) {
        const response = await api.post('/conversations', { title: userMessage.slice(0, 30) });
        convId = response.data._id;
        setCurrentConv(response.data);
        setConversations([response.data, ...conversations]);
      }

      // Save user message
      await api.post(`/conversations/${convId}/message`, { role: 'user', content: userMessage });

      // Get AI response
      const aiResponse = await api.post('/ai/tutor', { message: userMessage, conversationId: convId });
      
      // Save AI message
      await api.post(`/conversations/${convId}/message`, { 
        role: 'assistant', 
        content: aiResponse.data.response 
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.data.response, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      if (error.response?.data?.upgrade) {
        toast.error('Daily limit reached. Upgrade to Premium!');
      } else {
        toast.error('Failed to get response');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Head>
        <title>AI Tutor - Wiz AI</title>
      </Head>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white transform transition-transform duration-300 
        md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">Chat History</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={createConversation}
          className="m-4 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-3 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => loadConversation(conv)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                currentConv?._id === conv._id ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              {editingTitle === conv._id ? (
                <input
                  autoFocus
                  defaultValue={conv.title}
                  onBlur={(e) => updateTitle(conv._id, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && updateTitle(conv._id, e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded flex-1 mr-2"
                />
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTitle(conv._id); }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteConversation(conv._id, e)}
                      className="p-1 hover:bg-red-600 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">AI Tutor</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <h3 className="text-2xl font-bold mb-4">How can I help you today?</h3>
              <p>Ask me anything about your studies!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <span className={`text-xs mt-2 block ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t p-6">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-6 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-3">
            AI responses are generated automatically. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
