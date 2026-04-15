import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getConversations, getThread, sendMessage } from '../api/messages'
import './Messages.css'

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div
      className={`conv-item ${isActive ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
      onClick={onClick}
    >
      <div className="conv-avatar">{conv.other_user_name.charAt(0).toUpperCase()}</div>
      <div className="conv-info">
        <div className="conv-header-row">
          <span className="conv-name">{conv.other_user_name}</span>
          {conv.last_message_at && (
            <span className="conv-time">
              {new Date(conv.last_message_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short',
              })}
            </span>
          )}
        </div>
        <p className="conv-property">{conv.property_title}</p>
        <p className="conv-preview">{conv.last_message || 'Aucun message'}</p>
      </div>
      {conv.unread_count > 0 && (
        <span className="conv-badge">{conv.unread_count}</span>
      )}
    </div>
  )
}

function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender_id === currentUserId
  return (
    <div className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
      <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
        <p className="msg-text">{msg.content}</p>
        <span className="msg-time">
          {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}

export default function Messages() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [thread, setThread] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    getConversations()
      .then(r => setConversations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!bookingId) return
    setThread(null)
    getThread(bookingId)
      .then(r => setThread(r.data))
      .catch(() => {})
  }, [bookingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending || !bookingId) return
    setSending(true)
    try {
      const res = await sendMessage(bookingId, input.trim())
      setThread(prev => ({ ...prev, messages: [...prev.messages, res.data] }))
      setInput('')
      setConversations(prev => prev.map(c =>
        c.booking_id === parseInt(bookingId)
          ? { ...c, last_message: input.trim(), last_message_at: new Date().toISOString() }
          : c
      ))
    } catch {}
    setSending(false)
  }

  const activeConvId = bookingId ? parseInt(bookingId) : null

  return (
    <div className="messages-layout container">
      {/* Sidebar */}
      <aside className="conv-sidebar">
        <div className="conv-sidebar-header">
          <h2 className="conv-sidebar-title">Messages</h2>
        </div>
        {loading ? (
          <div className="conv-loading">Chargement...</div>
        ) : conversations.length === 0 ? (
          <div className="conv-empty">
            <p>Aucune conversation</p>
            <p>Les messages apparaissent ici une fois qu'une réservation est créée.</p>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map(conv => (
              <ConversationItem
                key={conv.booking_id}
                conv={conv}
                isActive={conv.booking_id === activeConvId}
                onClick={() => navigate(`/messages/${conv.booking_id}`)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Thread */}
      <main className="thread-panel">
        {!bookingId ? (
          <div className="thread-empty">
            <div className="thread-empty-icon">✉</div>
            <h3>Sélectionnez une conversation</h3>
            <p>Choisissez une conversation dans la liste pour lire et répondre aux messages.</p>
          </div>
        ) : !thread ? (
          <div className="thread-loading">Chargement...</div>
        ) : (
          <>
            <div className="thread-header">
              <div className="thread-avatar">{thread.other_user.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="thread-name">{thread.other_user.name}</p>
                <p className="thread-property">{thread.property_title}</p>
              </div>
            </div>

            <div className="thread-messages">
              {thread.messages.length === 0 ? (
                <div className="thread-no-msg">
                  <p>Aucun message. Soyez le premier à écrire !</p>
                </div>
              ) : (
                thread.messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} currentUserId={user.id} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="thread-input" onSubmit={handleSend}>
              <textarea
                className="thread-textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                rows={2}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                }}
              />
              <button
                type="submit"
                className="btn btn-primary thread-send-btn"
                disabled={sending || !input.trim()}
              >
                {sending ? '...' : 'Envoyer'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
