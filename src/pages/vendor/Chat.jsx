import { useState, useRef, useEffect } from 'react'
import { Send, Search, User } from 'lucide-react'

const initialConversations = [
  {
    id: 1, name: 'Alice Johnson', vehicle: 'Toyota Camry', lastMsg: 'Is the car available tomorrow?', time: '2m ago', unread: 2,
    messages: [
      { from: 'user', text: 'Hi, I have a question about the Toyota Camry.', time: '10:30 AM' },
      { from: 'user', text: 'Is the car available tomorrow?', time: '10:31 AM' },
    ],
  },
  {
    id: 2, name: 'Bob Smith', vehicle: 'Honda Civic', lastMsg: 'Thanks for the confirmation!', time: '1h ago', unread: 0,
    messages: [
      { from: 'vendor', text: 'Your booking for Honda Civic has been confirmed.', time: '9:00 AM' },
      { from: 'user', text: 'Thanks for the confirmation!', time: '9:05 AM' },
    ],
  },
  {
    id: 3, name: 'Carol White', vehicle: 'Ford Explorer', lastMsg: 'What is the fuel policy?', time: '3h ago', unread: 1,
    messages: [
      { from: 'user', text: 'What is the fuel policy for the Ford Explorer?', time: '7:00 AM' },
    ],
  },
  {
    id: 4, name: 'David Lee', vehicle: 'BMW X5', lastMsg: 'Can I extend my rental?', time: 'Yesterday', unread: 0,
    messages: [
      { from: 'user', text: 'Can I extend my rental by 2 more days?', time: 'Yesterday' },
      { from: 'vendor', text: 'Yes, I can extend it. I will update the booking.', time: 'Yesterday' },
    ],
  },
]

export default function Chat() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(1)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef()

  const active = conversations.find(c => c.id === activeId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages])

  const selectConversation = (id) => {
    setActiveId(id)
    setConversations(c => c.map(x => x.id === id ? { ...x, unread: 0 } : x))
  }

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setConversations(c => c.map(x => x.id === activeId
      ? { ...x, messages: [...x.messages, { from: 'vendor', text: input.trim(), time: now }], lastMsg: input.trim(), time: 'Just now' }
      : x
    ))
    setInput('')
  }

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 h-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Chat with your customers</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-100 dark:border-slate-700 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map(c => (
              <button key={c.id} onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${activeId === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={15} className="text-slate-500 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.vehicle}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.lastMsg}</p>
                    {c.unread > 0 && (
                      <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-1">{c.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
              <User size={14} className="text-slate-500 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{active?.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{active?.vehicle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {active?.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  m.from === 'vendor'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === 'vendor' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" />
            <button onClick={sendMessage}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
