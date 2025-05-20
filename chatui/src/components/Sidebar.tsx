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
    enterToSend: boolean;
    setEnterToSend: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    chats,
    selectedChatId,
    loadingChats,
    newChatName,
    setNewChatName,
    handleNewChatSubmit,
    handleDeleteChat,
    enterToSend,
    setEnterToSend
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
                {loadingChats && <span className="loading-indicator">Loading...</span>}
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
            {/* Settings box at the bottom */}
            <div className="sidebar-settings">
                <div style={{ borderTop: '1px solid #eee', padding: '12px 16px', fontSize: 13 }}>
                    <strong>Settings</strong>
                    <div style={{ marginTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={enterToSend}
                                onChange={e => setEnterToSend(e.target.checked)}
                                style={{ marginRight: 6 }}
                            />
                            Enter to Send
                        </label>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                            {enterToSend ? 'Press Enter to send, Shift+Enter for new line' : 'Click Send button to send'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;