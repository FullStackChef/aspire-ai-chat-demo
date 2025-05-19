import React, { useEffect, ReactNode, RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/ChatTypes';
import { LuMessageSquare, LuSend, LuSquareSlash } from 'react-icons/lu';

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
}

const ChatContainer: React.FC<ChatContainerProps> = ({
    messages,
    prompt,
    setPrompt,
    handleSubmit,
    cancelChat,
    streamingMessageId,
    messagesEndRef,
    shouldAutoScroll
}: ChatContainerProps) => {
    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldAutoScroll, messagesEndRef]);

    if (messages.length === 0) {
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
            <form onSubmit={handleSubmit} className="message-form">
                <textarea
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your message..."
                    disabled={streamingMessageId ? true : false}
                    className="message-input"
                />
                {streamingMessageId ? (
                    <button type="button" onClick={cancelChat} className="message-button">
                        <LuSquareSlash size={20} />
                        <span>Stop</span>
                    </button>
                ) : (
                    <button type="submit" disabled={streamingMessageId ? true : false} className="message-button">
                        <LuSend size={20} />
                        <span>Send</span>
                    </button>
                )}
            </form>
        </div>
    );
};

export default ChatContainer;