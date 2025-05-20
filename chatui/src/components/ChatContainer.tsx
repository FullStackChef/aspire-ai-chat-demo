import React, { useEffect, ReactNode, RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/ChatTypes';
import { LuMessageSquare, LuSend } from 'react-icons/lu';

interface ChatContainerProps {
    messages: Message[];
    prompt: string;
    setPrompt: (prompt: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    cancelChat: () => void;
    streamingMessageId: string | null;
    messagesEndRef: RefObject<HTMLDivElement | null>;
    shouldAutoScroll: boolean;
    renderMessages: () => ReactNode;
    enterToSend: boolean;
    selectedChatId: string | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
    messages,
    prompt,
    setPrompt,
    handleSubmit,
    cancelChat,
    streamingMessageId,
    messagesEndRef,
    shouldAutoScroll,
    renderMessages,
    enterToSend,
    selectedChatId
}: ChatContainerProps) => {
    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldAutoScroll, messagesEndRef]);

    // Handle key down for textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (enterToSend && !streamingMessageId) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // Create a fake event to call handleSubmit
                const form = e.currentTarget.form;
                if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                }
            }
        }
    };

    if (!selectedChatId) {
        return (
            <div className="chat-container">
                <div className="empty-state">
                    <LuMessageSquare size={48} className="empty-state-icon" />
                    <h2>No conversation selected</h2>
                    <p>Create a new chat to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div ref={messagesEndRef} className="messages-container">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-content">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="message-form" style={{ position: 'relative' }}>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your message..."
                    disabled={streamingMessageId ? true : false}
                    className="message-input"
                    onKeyDown={handleKeyDown}
                />
                {streamingMessageId ? (
                    <span
                        className="message-icon-only chat-spinner"
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7,
                            pointerEvents: 'none',
                            fontSize: 20
                        }}
                    >
                        <span className="chat-loading-spinner" />
                    </span>
                ) : enterToSend ? (
                    <span
                        className="message-icon-only"
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 1,
                            pointerEvents: 'none',
                            fontSize: 20
                        }}
                    >
                        <LuSend size={24} />
                    </span>
                ) : (
                    <span
                        className="message-icon-only"
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            display: 'flex',
                            alignItems: 'center',
                            opacity: streamingMessageId ? 0.7 : 1,
                            fontSize: 20,
                            cursor: streamingMessageId ? 'not-allowed' : 'pointer',
                            pointerEvents: streamingMessageId ? 'none' : 'auto'
                        }}
                        onClick={streamingMessageId ? undefined : (e => {
                            e.preventDefault();
                            if (!streamingMessageId && prompt.trim()) {
                                handleSubmit(new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent);
                            }
                        })}
                        tabIndex={streamingMessageId ? -1 : 0}
                        role="button"
                        aria-label="Send message"
                    >
                        <LuSend size={24} />
                    </span>
                )}
            </form>
        </div>
    );
};

export default ChatContainer;