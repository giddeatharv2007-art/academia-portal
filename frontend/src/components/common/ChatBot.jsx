import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Zap, Bot, User, Loader2, Minimize2 } from 'lucide-react'

const API_KEY = process.env.REACT_APP_GCP_API_KEY
const API_URL = 'https://api.jina.ai/v1/chat/completions'

const SYSTEM_PROMPT = `You are EduNexus AI Assistant — a helpful career advisor embedded inside the EduNexus Academia Portal.

STRICT RULES:
1. ONLY answer questions related to:
   - EduNexus platform features (jobs, internships, skill passport, AI interview, badges, challenges, roadmap)
   - Career guidance for students (skills to learn, career paths, interview tips)
   - Company information available on EduNexus (TechWave Solutions, DataBridge Analytics, CloudNexus Technologies, FinEdge Systems, EduLearn Platform)
   - Learning roadmaps for roles like: Backend Developer, Frontend Developer, Data Scientist, AI/ML Engineer, Full Stack Developer, DevOps Engineer
   - Skill gap analysis advice
   - Resume and profile tips for students

2. REFUSE to answer anything unrelated to careers, education, or EduNexus features.

3. Keep answers concise, friendly and actionable. Use bullet points when listing items.

4. Always encourage students to use EduNexus features to improve their career readiness.

5. For company-specific roadmaps, guide the student based on the company's required skills visible on EduNexus.

You represent EduNexus — be professional, motivating and helpful.`

const QUICK_QUESTIONS = [
  '🗺️ Roadmap for Backend Developer?',
  '🏢 What companies are on EduNexus?',
  '⚡ How to improve my Skill Passport?',
  '🎯 How does AI Interview work?',
  '📈 How to increase job readiness?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **EduNexus AI Assistant**.\n\nI can help you with:\n• Career roadmaps\n• Company information\n• Skill gap advice\n• Platform features\n\nWhat would you like to know? 🚀"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus()
  }, [open, minimized])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')

    const userMsg = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'jina-deepsearch-v1',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMsg,
          ],
          max_tokens: 500,
          stream: false,
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || "I'm having trouble connecting right now. Please try again!"
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      // Fallback local responses for common questions
      const fallback = getLocalFallback(userText)
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  const getLocalFallback = (text) => {
    const t = text.toLowerCase()
    if (t.includes('backend') || t.includes('django') || t.includes('python developer'))
      return "**Backend Developer Roadmap:**\n\n1. **Core:** Python, Django, REST API, Git\n2. **Database:** PostgreSQL, Redis\n3. **Intermediate:** Docker, CI/CD\n4. **Advanced:** AWS, Kubernetes, Microservices\n\n✅ TechWave Solutions & FinEdge Systems are hiring Backend Developers on EduNexus!\n\nUse **Skill Gap Analysis** in your dashboard to see exactly what you need. 🎯"
    if (t.includes('frontend') || t.includes('react'))
      return "**Frontend Developer Roadmap:**\n\n1. **Core:** HTML, CSS, JavaScript, React\n2. **Intermediate:** TypeScript, Tailwind CSS, Git\n3. **Advanced:** Next.js, Testing, Performance\n\n✅ TechWave Solutions & EduLearn Platform need Frontend Developers!\n\nCheck **Job Matches** in your dashboard. 🚀"
    if (t.includes('data scientist') || t.includes('ml') || t.includes('machine learning'))
      return "**Data Scientist Roadmap:**\n\n1. **Core:** Python, SQL, Statistics, Pandas\n2. **ML:** Scikit-learn, TensorFlow, PyTorch\n3. **Advanced:** Deep Learning, MLOps, Cloud AI\n\n✅ DataBridge Analytics is actively hiring on EduNexus!\n\nTake the **ML Assessment** to verify your skills. 🤖"
    if (t.includes('company') || t.includes('companies'))
      return "**Companies on EduNexus:**\n\n🏢 **TechWave Solutions** — IT, Pune (Backend, Frontend)\n🤖 **DataBridge Analytics** — AI/ML, Bangalore\n☁️ **CloudNexus Technologies** — DevOps, Mumbai\n💰 **FinEdge Systems** — Fintech, Hyderabad\n📚 **EduLearn Platform** — EdTech, Pune\n\nVisit any company profile to see their skill requirements and apply! 💼"
    if (t.includes('skill') || t.includes('passport'))
      return "**Skill Passport Tips:**\n\n✅ Add skills with evidence (projects, certs)\n✅ Take skill assessments to get verified scores\n✅ Complete AI Interview to boost communication score\n✅ Upload certifications for extra verification\n✅ Get college verification for education proof\n\nVerified skills boost your match score by up to 15%! 🏅"
    if (t.includes('interview'))
      return "**AI Interview Guide:**\n\n🎙️ Go to **AI Interview** in the sidebar\n📝 Select: Internship or Job\n🎯 Choose your target role\n🤖 Answer 8 role-specific questions via mic or typing\n📊 Get scored: Technical, Communication, Problem Solving\n\n💡 Tip: Practice 2-3 times before your real interview!\n\nYour interview score updates your Skill Passport. 🚀"
    if (t.includes('readiness') || t.includes('ready'))
      return "**Boost Your Job Readiness:**\n\n📊 Current formula:\n• Skills: 30%\n• Projects: 20%\n• Assessments: 15%\n• AI Interview: 10%\n• Certifications: 5%\n• Others: 20%\n\n🎯 **Quick wins:**\n1. Complete your profile\n2. Add 5+ skills\n3. Upload a project with GitHub link\n4. Take one assessment\n5. Complete an AI Interview"
    return "I can help with career roadmaps, EduNexus features, company info, and skill advice. Could you rephrase your question? Try asking:\n\n• 'Roadmap for Data Scientist?'\n• 'Which companies need Python?'\n• 'How to improve my profile?'\n• 'How does AI Interview work?' 🤔"
  }

  const formatMessage = (text) => {
    // Bold, bullets, line breaks
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false) }}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2
            bg-gradient-to-br from-violet-600 to-indigo-600 text-white
            rounded-2xl px-4 py-3 shadow-2xl shadow-violet-500/40
            hover:shadow-violet-500/60 hover:scale-105 transition-all duration-300
            animate-bounce-slow"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">EduNexus AI</p>
            <p className="text-[10px] text-violet-200 leading-none mt-0.5">Ask me anything</p>
          </div>
          <MessageCircle size={16} className="ml-1 opacity-80" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={`fixed right-5 z-50 flex flex-col bg-white rounded-3xl shadow-2xl shadow-black/20 border border-gray-100
          transition-all duration-300 overflow-hidden
          ${minimized ? 'bottom-5 w-72 h-14' : 'bottom-5 w-80 sm:w-96 h-[560px]'}`}
          style={{ maxHeight: 'calc(100vh - 40px)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">EduNexus AI</p>
              <p className="text-violet-200 text-xs leading-none mt-0.5">Career Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <Minimize2 size={14} />
              </button>
              <button onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-500'
                        : 'bg-gradient-to-br from-violet-600 to-indigo-600'}`}>
                      {msg.role === 'user'
                        ? <User size={12} className="text-white" />
                        : <Bot size={12} className="text-white" />}
                    </div>
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'}`}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                  </div>
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              {messages.length === 1 && (
                <div className="px-3 pb-2 flex-shrink-0">
                  <p className="text-xs text-gray-400 font-medium mb-2 px-1">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 rounded-full
                          hover:bg-violet-100 transition-colors font-medium whitespace-nowrap">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask about careers, skills, companies..."
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-sm
                      focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30
                      placeholder-gray-400 transition-all"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl
                      flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-300 text-center mt-1.5">
                  Powered by Jina AI · EduNexus Career Advisor
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
