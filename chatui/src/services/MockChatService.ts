import { Chat, Message, MessageFragment } from '../types/ChatTypes';

const mockChats: Chat[] = [
    { id: '1', name: 'Getting Started' },
    { id: '2', name: 'Sample Conversation' }
];

const mockMessages: Record<string, Message[]> = {
    '1': [
        { id: '1-1', sender: 'assistant', text: 'Hello! I\'m running in offline mode. How can I help you today?' },
        { id: '1-2', sender: 'user', text: 'What can you do?' },
        { id: '1-3', sender: 'assistant', text: 'I\'m currently in offline mode, but I can show you how the interface works. You can send messages, and I\'ll respond with pre-defined responses to demonstrate the chat functionality.' }
    ],
    '2': [
        { id: '2-1', sender: 'user', text: 'Tell me about offline mode' },
        { id: '2-2', sender: 'assistant', text: 'This is a demonstration of the offline mode. When the API is unavailable, the chat interface continues to work with mock data to ensure a smooth user experience.' }
    ]
};

let mockMessageId = 100;

export class MockChatService {
    async getChats(): Promise<Chat[]> {
        return mockChats;
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        return mockMessages[chatId] || [];
    }

    async createChat(name: string): Promise<Chat> {
        const newChat: Chat = {
            id: `mock-${Date.now()}`,
            name
        };
        mockChats.push(newChat);
        mockMessages[newChat.id] = [];
        return newChat;
    }

    async *stream(
        id: string,
        _lastMessageId: string | null,
        abortController: AbortController
    ): AsyncGenerator<MessageFragment> {
        const mockResponse = "I'm operating in offline mode right now. This is a simulated response to demonstrate the streaming functionality. The actual AI responses will be available when the connection to the API is restored.";
        const words = mockResponse.split(' ');
        
        for (let i = 0; i < words.length && !abortController.signal.aborted; i++) {
            const messageId = `mock-${mockMessageId++}`;
            yield {
                id: messageId,
                sender: 'assistant',
                text: words[i] + ' ',
                fragmentId: `${messageId}-${i}`,
                isFinal: i === words.length - 1
            };
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async sendPrompt(id: string, prompt: string): Promise<void> {
        const messageId = `mock-${Date.now()}`;
        if (!mockMessages[id]) {
            mockMessages[id] = [];
        }
        mockMessages[id].push({
            id: messageId,
            sender: 'user',
            text: prompt
        });
    }

    async deleteChat(id: string): Promise<void> {
        const index = mockChats.findIndex(chat => chat.id === id);
        if (index !== -1) {
            mockChats.splice(index, 1);
            delete mockMessages[id];
        }
    }

    async cancelChat(_id: string): Promise<void> {
        // No-op in mock mode
    }
}