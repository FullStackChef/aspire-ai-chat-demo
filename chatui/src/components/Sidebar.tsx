import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../types/ChatTypes';
import { LuPencilLine, LuTrash2, LuMessageSquarePlus } from 'react-icons/lu';

interface SidebarProps {
    chats: Chat[];
    selectedChatId: string | null;
    loadingChats: boolean;
    newChatName: string;
    setNewChatName: (name: string) => void;
    handleNewChatSubmit: (e: React.FormEvent) => void;
    handleDeleteChat: (e: React.MouseEvent, chatId: string) => void;
    onSelectChat?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    chats,
    selectedChatId,
    loadingChats,
    newChatName,
    setNewChatName,
    handleNewChatSubmit,
    handleDeleteChat
}) => {
    const navigate = useNavigate();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newChatName.trim()) {
            e.preventDefault();
            handleNewChatSubmit(e);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <img src="https://learn.microsoft.com/en-us/dotnet/aspire/assets/dotnet-aspire-logo-128.svg" alt="Aspire Logo" />
                </div>
                <h1>Aspire AI Chat</h1>
            </div>
            <div className="new-chat-container">
                <form onSubmit={handleNewChatSubmit} className="new-chat-form">
                    <div className="new-chat-input-group">
                        <input
                            type="text"
                            value={newChatName}
                            onChange={e => setNewChatName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="New conversation..."
                            className="new-chat-input"
                        />
                        <button type="submit" className="new-chat-button" title="Create new chat">
                            <LuMessageSquarePlus size={20} />
                        </button>
                    </div>
                </form>
            </div>
            <div className="chats-container">
                <div className="chats-header">
                    <h2>Conversations</h2>
                    {loadingChats && <span className="loading-indicator">Loading...</span>}
                </div>
                <ul className="chat-list">
                    {chats.map(chat => (
                        <li
                            key={chat.id}
                            onClick={() => navigate(`/chat/${chat.id}`)}
                            className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                        >
                            <LuPencilLine size={16} className="chat-icon" />
                            <span className="chat-name">{chat.name}</span>
                            <button
                                className="delete-chat-button"
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                title="Delete chat"
                            >
                                <LuTrash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;