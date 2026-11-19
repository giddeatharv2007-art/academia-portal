import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Video, Mic, MicOff, VideoOff, Play, ChevronRight, CheckCircle, Volume2, AlertTriangle, Flag, Eye, ShieldCheck } from 'lucide-react'
import useFaceProctor from '../../hooks/useFaceProctor'

// --- Utility: text-to-speech ---
function speak(text, onEnd) {
  if (!window.speechSynthesis) { onEnd && onEnd(); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9; u.pitch = 1; u.lang = 'en-US'
  u.onend = () => onEnd && onEnd()
  window.speechSynthesis.speak(u)
}

// --- Utility: speech-to-text ---
function useSpeechRecognition() {
  const recognitionRef = useRef(null)
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { toast.error('Speech recognition not supported. Type your answer.'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (e) => {
      let final = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
      }
      setTranscript(final.trim())
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { transcript, setTranscript, listening, start, stop }
}

// STEP 1: Setup
function SetupStep({ onStart }) {
  const [config, setConfig] = useState({ interview_type: 'internship', target_role: 'Python Developer' })
  const [loading, setLoading] = useState(false)

  const roles = ['Python Developer', 'Django Developer', 'React Developer', 'Data Scientist',
    'Full Stack Developer', 'ML Engineer', 'DevOps Engineer', 'Java Developer']

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await interviewsAPI.start(config)
      onStart(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mx-auto mb-3">
            <Video size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Interview Simulator</h1>
          <p className="text-gray-500 text-sm mt-1">Speech-to-speech conversation with AI interviewer</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Interview Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['internship', 'job'].map(t => (
                <button key={t} type="button" onClick={() => setConfig({...config, interview_type: t})}
                  className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors
                    ${config.interview_type === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Target Role</label>
            <select className="input" value={config.target_role}
              onChange={e => setConfig({...config, target_role: e.target.value})}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 space-y-1">
            <p className="font-semibold">How it works:</p>
            <p>• AI will ask you 8 role-specific questions</p>
            <p>• Questions are spoken aloud in English</p>
            <p>• Answer using your microphone (speech-to-text)</p>
            <p>• Or type your answer manually</p>
            <p>• Your performance will be evaluated automatically</p>
          </div>

          <button onClick={handleStart} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Play size={18} />}
            {loading ? 'Preparing interview...' : 'Start AI Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

// STEP 2: Interview
function InterviewStep({ session, onComplete }) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)   // hidden canvas for face detection
  const streamRef   = useRef(null)
  const faceTimer   = useRef(null)
  const bannerTimer = useRef(null)

  const [cameraOn, setCameraOn]       = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [currentQ, setCurrentQ]       = useState(0)
  const [answers, setAnswers]         = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [botSpeaking, setBotSpeaking] = useState(false)
  const [questionAsked, setQuestionAsked] = useState(false)

  /* ── proctoring state ─────────────────────────────────────── */
  const [violations, setViolations]   = useState([])
  const [banner, setBanner]           = useState(null)
  const [paused, setPaused]           = useState(false)
  const [flagged, setFlagged]         = useState(false)

  const { transcript, setTranscript, listening, start, stop } = useSpeechRecognition()

  const questions = session.questions || []
  const question  = questions[currentQ]

  /* ── re-attach stream after every render ──────────────────── */
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(() => {})
      }
    }
  })

  /* ── camera setup ─────────────────────────────────────────── */
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraOn(true)
      })
      .catch(() => setCameraError(true))
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      clearInterval(faceTimer.current)
      clearTimeout(bannerTimer.current)
    }
  }, [])

  /* ── violation logger ─────────────────────────────────────── */
  const logViolation = useCallback((type, details = '') => {
    const v = { type, timestamp: new Date().toISOString(), details }
    setViolations(prev => {
      const next = [...prev, v]
      const critical = next.filter(x => x.type === 'multi_face' || x.type === 'tab_switch').length
      if (critical >= 3) setFlagged(true)
      return next
    })
    setBanner(type)
    clearTimeout(bannerTimer.current)
    if (type !== 'multi_face') {
      bannerTimer.current = setTimeout(() => setBanner(null), 5000)
    }
    if (type === 'multi_face') setPaused(true)
  }, [])

  /* ── face detection via real ML (face-api.js TinyFaceDetector) */
  const handleFaceCount = useCallback((count) => {
    if (count === 0 && !paused) logViolation('no_face', 'Face not visible')
    else if (count >= 2 && !paused) logViolation('multi_face', `${count} faces detected`)
    if (count === 1 && banner === 'no_face') setBanner(null)
  }, [paused, banner, logViolation])

  useFaceProctor(videoRef, canvasRef, cameraOn, 1500, handleFaceCount)

  /* ── tab/window switch detection ──────────────────────────── */
  useEffect(() => {
    const handler = () => {
      if (document.hidden) logViolation('tab_switch', 'User switched tab or minimised')
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [logViolation])

  /* ── block copy/paste/contextmenu in answer field ──────────── */
  useEffect(() => {
    const block = e => { if (e.target.closest('[data-interview-proctored]')) { e.preventDefault(); e.stopPropagation() } }
    const evts  = ['copy', 'paste', 'cut', 'contextmenu', 'dragstart', 'drop']
    evts.forEach(ev => document.addEventListener(ev, block, true))
    return () => evts.forEach(ev => document.removeEventListener(ev, block, true))
  }, [])

  /* ── speak question aloud ──────────────────────────────────── */
  useEffect(() => {
    if (!question || questionAsked) return
    setTranscript('')
    setBotSpeaking(true)
    setQuestionAsked(true)
    speak(`Question ${question.order}. ${question.question_text}`, () => setBotSpeaking(false))
  }, [currentQ, question])

  const readQuestion = () => {
    if (!question) return
    setBotSpeaking(true)
    speak(question.question_text, () => setBotSpeaking(false))
  }

  /* ── dismiss banner / resume ───────────────────────────────── */
  const dismissBanner = () => {
    if (banner === 'multi_face') setPaused(false)
    setBanner(null)
  }

  /* ── submit answer ─────────────────────────────────────────── */
  const submitAnswer = async () => {
    if (!transcript.trim()) { toast.error('Please provide an answer'); return }
    if (paused) { toast.error('Resume the test first (face issue)'); return }
    setSubmitting(true)
    try {
      await interviewsAPI.submitAnswer({
        interview_id: session.interview_id,
        question_id: question.id,
        transcript: transcript.trim(),
        duration_seconds: 30,
      })
      setAnswers({ ...answers, [question.id]: transcript.trim() })
      setTranscript('')
      setQuestionAsked(false)

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
      } else {
        const res = await interviewsAPI.complete(session.interview_id)
        toast.success('Interview completed!')
        onComplete(res.data)
      }
    } catch {
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (!question) return null

  const progress = (currentQ / questions.length) * 100

  /* ── violation banner colours ─────────────────────────────── */
  const bannerCfg = {
    no_face:    { bg: 'bg-yellow-50 border-yellow-300',   icon: 'text-yellow-600', text: 'text-yellow-800', msg: 'Please keep your face visible in the camera.' },
    multi_face: { bg: 'bg-red-50 border-red-300',         icon: 'text-red-600',    text: 'text-red-800',    msg: 'Multiple faces detected. Please give the test yourself.' },
    tab_switch: { bg: 'bg-orange-50 border-orange-300',   icon: 'text-orange-600', text: 'text-orange-800', msg: 'Tab/window switch detected and recorded.' },
  }
  const bc = bannerCfg[banner]

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium text-gray-700">Question {currentQ + 1} of {questions.length}</span>
          <div className="flex items-center gap-3">
            {flagged && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <Flag size={11} /> Flagged
              </span>
            )}
            <span className="text-blue-600 font-semibold">{Math.round(progress)}% Complete</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1 mt-2">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors
              ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-blue-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {/* Violation banner */}
      {banner && bc && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${bc.bg}`}>
          <AlertTriangle size={18} className={`flex-shrink-0 ${bc.icon}`} />
          <p className={`font-semibold text-sm flex-1 ${bc.text}`}>{bc.msg}</p>
          {banner === 'multi_face' ? (
            <button onClick={dismissBanner}
              className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
              I'm alone — Resume
            </button>
          ) : (
            <button onClick={dismissBanner} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>
      )}

      {/* Paused overlay (multi-face) */}
      {paused && !banner && (
        <div className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-red-700 text-sm">Interview Paused</p>
            <p className="text-red-600 text-xs mt-0.5">Multiple faces were detected. Ensure you are alone and click Resume.</p>
          </div>
          <button onClick={() => setPaused(false)}
            className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
            Resume
          </button>
        </div>
      )}

      {/* Flagged notice */}
      {flagged && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-xl p-3 text-xs text-red-700">
          <Flag size={13} className="flex-shrink-0" />
          <span><strong>Interview flagged</strong> — 3+ violations recorded. Result will be reviewed by admin.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Camera + proctoring panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-3">
            {/* Live camera feed */}
            <div className="aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden relative">
              {cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff size={32} className="text-gray-500" />
                </div>
              )}
              {/* hidden canvas for face detection */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Status dot */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${cameraOn ? 'bg-green-400' : 'bg-gray-500'} ${listening ? 'animate-pulse' : ''}`} />
              </div>
              {/* REC badge */}
              {cameraOn && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-[9px] font-bold">REC</span>
                </div>
              )}
              {/* Proctored badge */}
              <div className="absolute bottom-2 left-2 right-2">
                {listening ? (
                  <div className="bg-red-600 text-white text-xs py-1 px-2 rounded-lg flex items-center gap-1.5 justify-center animate-pulse">
                    <Mic size={11} /> Recording…
                  </div>
                ) : (
                  <div className="bg-black/50 text-white text-[10px] py-1 px-2 rounded-lg flex items-center gap-1 justify-center">
                    <ShieldCheck size={10} className="text-green-400" /> AI Proctored
                  </div>
                )}
              </div>
            </div>
            {cameraError && (
              <p className="text-xs text-yellow-600 mt-2 text-center">Camera unavailable — mic still works</p>
            )}
          </div>

          {/* Violation log */}
          <div className="card p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye size={11} /> Proctoring Log
            </p>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {violations.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-1">No violations recorded ✓</p>
              ) : (
                violations.slice(-6).map((v, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0
                      ${v.type === 'multi_face' ? 'bg-red-500' : v.type === 'tab_switch' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <span className="text-gray-500 leading-snug">
                      {new Date(v.timestamp).toLocaleTimeString()} — {v.type.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Question + Answer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bot question bubble */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-700 uppercase">
                    {question.question_type.replace('_', ' ')}
                  </span>
                  {botSpeaking && (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                      <Volume2 size={10} className="animate-pulse" /> Speaking…
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-medium">{question.question_text}</p>
              </div>
              <button onClick={readQuestion} title="Read question aloud"
                className="text-blue-500 hover:text-blue-700 flex-shrink-0">
                <Volume2 size={16} />
              </button>
            </div>
          </div>

          {/* Answer area */}
          <div className="card" data-interview-proctored="true">
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Your Answer</label>
              <span className="text-xs text-gray-400">{transcript.split(' ').filter(Boolean).length} words</span>
            </div>
            <textarea
              className={`input resize-none ${paused ? 'opacity-50 cursor-not-allowed' : ''}`}
              rows={5}
              disabled={paused}
              placeholder={
                paused        ? '⏸ Test paused — resolve camera issue first' :
                listening     ? 'Listening… speak now' :
                'Start recording or type your answer here…'
              }
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                disabled={paused}
                onClick={listening ? stop : start}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${paused ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' :
                    listening ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {listening ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Record</>}
              </button>

              <button onClick={submitAnswer}
                disabled={submitting || !transcript.trim() || paused}
                className="btn-primary flex items-center gap-2 ml-auto disabled:opacity-50">
                {submitting
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : currentQ < questions.length - 1
                    ? <><ChevronRight size={16} /> Next Question</>
                    : <><CheckCircle size={16} /> Finish Interview</>
                }
              </button>
            </div>
          </div>

          <div className="text-xs text-center text-gray-400">
            {Object.keys(answers).length} / {questions.length} questions answered
          </div>
        </div>
      </div>
    </div>
  )
}

// STEP 3: Completion
function ResultSummary({ result, interviewId }) {
  const navigate = useNavigate()
  const scores = result?.scores || {}

  return (
    <div className="max-w-xl mx-auto">
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-extrabold">{scores.overall?.toFixed(0) || 0}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Interview Complete!</h2>
        <p className="text-gray-500 text-sm mb-6">Overall Score: {scores.overall?.toFixed(1)}/100</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Technical', value: scores.technical },
            { label: 'Communication', value: scores.communication },
            { label: 'Problem Solving', value: scores.problem_solving },
            { label: 'Relevance', value: scores.answer_relevance },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{value?.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={() => navigate(`/student/interview/result/${interviewId}`)} className="btn-primary w-full mb-3">
          View Detailed Results
        </button>
        <button onClick={() => navigate('/student/dashboard')} className="btn-secondary w-full">
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

// Main component
export default function AIInterviewPage() {
  const [step, setStep] = useState('setup') // setup | interview | done
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Interview Simulator</h1>
        <p className="text-gray-500 text-sm">Practice role-specific interviews with real-time AI evaluation</p>
      </div>

      {step === 'setup' && <SetupStep onStart={(s) => { setSession(s); setStep('interview') }} />}
      {step === 'interview' && session && (
        <InterviewStep session={session} onComplete={(r) => { setResult(r); setStep('done') }} />
      )}
      {step === 'done' && result && (
        <ResultSummary result={result} interviewId={result.interview_id} />
      )}
    </div>
  )
}
