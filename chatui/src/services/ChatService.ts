import { Chat, Message, MessageFragment } from '../types/ChatTypes';
import * as signalR from '@microsoft/signalr';
import { UnboundedChannel } from '../utils/UnboundedChannel';
import { MockChatService } from './MockChatService';

class ChatService {
    private static instance: ChatService;
    private hubConnection?: signalR.HubConnection;
    private initialized = false;
    private backendUrl: string;
    private activeStreams = new Map<string, UnboundedChannel<MessageFragment>>();
    private mockService: MockChatService;
    private isOffline = false;

    private constructor(backendUrl: string) {
        this.backendUrl = backendUrl;
        this.mockService = new MockChatService();
    }

    static getInstance(backendUrl: string): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService(backendUrl);
        }
        return ChatService.instance;
    }

    private async checkApiAvailability(): Promise<boolean> {
        try {
            const response = await fetch(this.backendUrl);
            return response.ok;
        } catch (error) {
            console.warn('API is not available, falling back to mock data');
            this.isOffline = true;
            return false;
        }
    }

    async ensureInitialized(): Promise<void> {
        if (await this.checkApiAvailability()) {
            if (!this.hubConnection && !this.initialized) {
                console.debug('Initializing SignalR connection...');
                this.hubConnection = new signalR.HubConnectionBuilder()
                    .withUrl(`${this.backendUrl}/stream`, {
                        skipNegotiation: true,
                        transport: signalR.HttpTransportType.WebSockets
                    })
                    .withStatefulReconnect()
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: retryContext => {
                            if (retryContext.elapsedMilliseconds > 15 * 1000) {
                                return 15000;
                            }
                            return (retryContext.previousRetryCount + 1) * 1000;
                        }
                    })
                    .build();

                this.hubConnection.onreconnected(async () => {
                    console.debug('Reconnected to SignalR hub');
                    for (const channel of this.activeStreams.values()) {
                        channel?.close();
                    }
                    this.activeStreams.clear();
                });

                await this.hubConnection.start();
                this.initialized = true;
            }
        }
    }

    async getChats(): Promise<Chat[]> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}`);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            return this.mockService.getChats();
        }
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}/${chatId}`);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            return this.mockService.getChatMessages(chatId);
        }
    }

    async createChat(name: string): Promise<Chat> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            return this.mockService.createChat(name);
        }
    }

    async *stream(
        id: string,
        initialLastMessageId: string | null,
        abortController: AbortController
    ): AsyncGenerator<MessageFragment> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            await this.ensureInitialized();
            if (!this.hubConnection) throw new Error('Connection failed');

            let lastFragmentId: string | undefined;
            let lastMessageId = initialLastMessageId;

            const abortHandler = () => {
                console.log(`Aborting stream for chat: ${id}`);
                this.activeStreams.get(id)?.close();
            };

            abortController.signal.addEventListener('abort', abortHandler);

            try {
                while (!abortController.signal.aborted) {
                    let channel = new UnboundedChannel<MessageFragment>();
                    this.activeStreams.set(id, channel);

                    let subscription = this.hubConnection.stream("Stream", id, { lastMessageId, lastFragmentId })
                        .subscribe({
                            next: (value) => {
                                const fragment: MessageFragment = {
                                    id: value.id,
                                    sender: value.sender,
                                    text: value.text,
                                    isFinal: value.isFinal ?? false,
                                    fragmentId: value.fragmentId
                                };
                                lastFragmentId = fragment.fragmentId;
                                if (fragment.isFinal) {
                                    lastMessageId = fragment.id;
                                }
                                channel.write(fragment);
                            },
                            complete: () => {
                                console.debug(`Stream completed for chat: ${id}`);
                                channel.close();
                            },
                            error: () => {}
                        });

                    try {
                        for await (const fragment of channel) {
                            yield fragment;
                        }
                    } catch (error) {
                        console.error('Stream error:', error);
                        if (abortController.signal.aborted) {
                            break;
                        }
                    } finally {
                        subscription?.dispose();
                        this.activeStreams.delete(id);
                    }

                    if (!abortController.signal.aborted) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } finally {
                abortController.signal.removeEventListener('abort', abortHandler);
            }
        } catch (error) {
            yield* this.mockService.stream(id, initialLastMessageId, abortController);
        }
    }

    async sendPrompt(id: string, prompt: string): Promise<void> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt })
            });
            if (!response.ok) throw new Error('API error');
        } catch (error) {
            await this.mockService.sendPrompt(id, prompt);
        }
    }

    async deleteChat(id: string): Promise<void> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('API error');
        } catch (error) {
            await this.mockService.deleteChat(id);
        }
    }

    async cancelChat(id: string): Promise<void> {
        try {
            if (this.isOffline) throw new Error('Offline mode');
            const response = await fetch(`${this.backendUrl}/${id}/cancel`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('API error');
        } catch (error) {
            await this.mockService.cancelChat(id);
        }
    }
}

export default ChatService;