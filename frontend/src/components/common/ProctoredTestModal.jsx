/**
 * ProctoredTestModal
 * ──────────────────
 * A reusable, fully-proctored 5-question MCQ test modal.
 *
 * Proctoring features:
 *  • Camera live feed — must stay ON throughout the test
 *  • Face detection via MediaPipe FaceDetection (WASM-free, canvas-based)
 *    — Falls back to a lightweight pixel-variance heuristic when API unavailable
 *  • 0 faces  → warning "Please keep your face visible"
 *  • 2+ faces → warning "Only you should be taking this test" + test paused
 *  • Copy / Paste / Cut / Right-click / Drag-drop blocked on answer fields
 *  • Tab / window visibility change detection + warning overlay
 *  • All violations logged with timestamps
 *  • 3+ critical violations (multi-face / ≥3 tab switches) → test flagged for admin
 *
 * Props:
 *  skill        – { skill_name }
 *  questions    – [{ id, question_text, options: [], correct_answer }]
 *  onClose()
 *  onComplete(score, violations)
 */
import React, {
  useState, useRef, useEffect, useCallback
} from 'react'
import {
  X, Camera, CameraOff, AlertTriangle, ShieldCheck,
  CheckCircle, Lock, Trophy, Eye, Flag, Mic
} from 'lucide-react'
import useFaceProctor from '../../hooks/useFaceProctor'

/* ─── Violation banner ──────────────────────────────────────────────────── */
function ViolationBanner({ type, onDismiss }) {
  const cfg = {
    no_face: {
      icon: <CameraOff size={18} className="text-yellow-400" />,
      text: 'Please keep your face visible in the camera.',
      bg: 'bg-yellow-900/90 border-yellow-500',
      color: 'text-yellow-200',
    },
    multi_face: {
      icon: <AlertTriangle size={18} className="text-red-400" />,
      text: 'Multiple faces detected. Please give the test yourself.',
      bg: 'bg-red-900/90 border-red-500',
      color: 'text-red-200',
    },
    tab_switch: {
      icon: <Eye size={18} className="text-orange-400" />,
      text: 'You switched tabs/windows. This has been recorded.',
      bg: 'bg-orange-900/90 border-orange-500',
      color: 'text-orange-200',
    },
  }
  const c = cfg[type]
  if (!c) return null
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} animate-shake`}>
      {c.icon}
      <p className={`text-sm font-semibold flex-1 ${c.color}`}>{c.text}</p>
      <button onClick={onDismiss} className="text-white/60 hover:text-white">
        <X size={14} />
      </button>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function ProctoredTestModal({
  skill, questions = [], onClose, onComplete
}) {
  /* stages: setup | proctoring-check | test | paused | result */
  const [stage, setStage]           = useState('setup')
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState({})
  const [score, setScore]           = useState(null)
  const [violations, setViolations] = useState([])   // { type, timestamp, details }
  const [banner, setBanner]         = useState(null) // current visible banner
  const [paused, setPaused]         = useState(false)
  const [flagged, setFlagged]       = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [micReady, setMicReady]     = useState(false)

  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const bannerTimer= useRef(null)
  const faceTimer  = useRef(null)

  const q = questions[current]

  /* ── log a violation ─────────────────────────────────────────── */
  const logViolation = useCallback((type, details = '') => {
    const v = { type, timestamp: new Date().toISOString(), details }
    setViolations(prev => {
      const next = [...prev, v]
      // Count critical violations
      const critical = next.filter(x =>
        x.type === 'multi_face' || x.type === 'tab_switch'
      ).length
      if (critical >= 3) setFlagged(true)
      return next
    })
    showBanner(type)
    if (type === 'multi_face') setPaused(true)
  }, [])

  /* ── banner helpers ──────────────────────────────────────────── */
  const showBanner = (type) => {
    setBanner(type)
    clearTimeout(bannerTimer.current)
    if (type === 'tab_switch' || type === 'no_face') {
      bannerTimer.current = setTimeout(() => setBanner(null), 4000)
    }
    // multi_face banner stays until dismissed (test is paused)
  }
  const dismissBanner = () => {
    if (banner === 'multi_face') {
      // resume test only if paused by multi_face
      setPaused(false)
    }
    setBanner(null)
  }

  /* ── re-attach stream whenever the video element re-mounts ─────
     Stage transitions cause the <video> node to be replaced in the
     DOM; this effect ensures the stream is always assigned.          */
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(() => {})
      }
    }
  })   // runs after every render — cheap check, no deps needed

  /* ── camera + mic setup ──────────────────────────────────────── */
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setCameraReady(true)
      setMicReady(true)
    } catch {
      // Try video only
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = vStream
        if (videoRef.current) {
          videoRef.current.srcObject = vStream
          videoRef.current.play().catch(() => {})
        }
        setCameraReady(true)
      } catch {
        setCameraError(true)
      }
    }
  }, [])

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    clearInterval(faceTimer.current)
  }, [])

  /* ── face detection via face-api.js TinyFaceDetector ──────── */
  const handleFaceCount = useCallback((count) => {
    if (count === 0 && !paused) logViolation('no_face', 'Face not visible')
    else if (count >= 2 && !paused) logViolation('multi_face', `${count} faces detected`)
    if (count === 1 && banner === 'no_face') setBanner(null)
  }, [paused, banner, logViolation])

  useFaceProctor(videoRef, canvasRef, stage === 'test', 1500, handleFaceCount)

  /* ── tab / visibility change detection ──────────────────────── */
  useEffect(() => {
    if (stage !== 'test') return
    const handler = () => {
      if (document.hidden) logViolation('tab_switch', 'User switched tab or minimized')
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [stage, logViolation])

  /* ── block copy/paste/cut/contextmenu/drag on answer area ─────
     Applied to the entire modal while test is active via data attr */
  useEffect(() => {
    if (stage !== 'test') return
    const block = (e) => {
      if (e.target.closest('[data-proctored]')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const events = ['copy', 'paste', 'cut', 'contextmenu', 'dragstart', 'drop']
    events.forEach(ev => document.addEventListener(ev, block, true))
    return () => events.forEach(ev => document.removeEventListener(ev, block, true))
  }, [stage])

  /* ── cleanup on unmount ──────────────────────────────────────── */
  useEffect(() => () => {
    stopMedia()
    clearTimeout(bannerTimer.current)
    clearInterval(faceTimer.current)
    document.title = document.title // restore
  }, [stopMedia])

  /* ── STAGE: setup ────────────────────────────────────────────── */
  const handleSetup = async () => {
    setStage('proctoring-check')
    await startMedia()
    // auto-advance to test after 2.5 s (camera settle time)
    setTimeout(() => setStage('test'), 2500)
  }

  /* ── STAGE: submit ───────────────────────────────────────────── */
  const handleSubmit = () => {
    let correct = 0
    questions.forEach(q => {
      const given    = answers[q.id]?.trim().toLowerCase()
      const expected = q.correct_answer?.trim().toLowerCase()
      if (given && expected && given === expected) correct++
    })
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)
    setStage('result')
    stopMedia()
    onComplete(pct, violations)
  }

  /* ── answer selection ────────────────────────────────────────── */
  const selectAnswer = (qId, opt) => {
    if (paused) return
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const answered = Object.keys(answers).length
  const progress = ((current) / questions.length) * 100

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">
                {stage === 'result' ? 'Test Complete' : 'Proctored Assessment'}
              </p>
              <h2 className="text-white font-bold text-lg mt-0.5">
                {skill?.skill_name || 'Skill'} Test
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Proctoring status badge */}
              {(stage === 'test' || stage === 'proctoring-check') && (
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-white text-xs font-medium">
                    {cameraReady ? 'Proctored' : 'No Camera'}
                  </span>
                </div>
              )}
              {stage !== 'test' && (
                <button onClick={() => { stopMedia(); onClose() }}
                  className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar — visible during test */}
          {stage === 'test' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-violet-200 mb-1">
                <span>Question {current + 1} of {questions.length}</span>
                <span className="flex items-center gap-1">
                  {flagged && <><Flag size={10} className="text-red-300" /> Flagged</>}
                  {!flagged && <><ShieldCheck size={10} className="text-green-300" /> {answered}/{questions.length} answered</>}
                </span>
              </div>
              <div className="w-full bg-violet-500/30 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── SETUP STAGE ────────────────────────────────────── */}
          {stage === 'setup' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Proctored Assessment</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                This test is monitored by AI. Before starting, please read the rules below.
              </p>

              <div className="text-left bg-gray-50 rounded-2xl p-4 mb-5 space-y-2.5">
                {[
                  { icon: <Camera size={14} className="text-violet-600" />,   text: 'Camera must stay ON. Your face must be visible at all times.' },
                  { icon: <Eye size={14} className="text-red-500" />,          text: 'Only ONE face allowed in frame. Multiple faces will pause the test.' },
                  { icon: <Lock size={14} className="text-orange-500" />,      text: 'Copy, Paste, Cut, Right-click and Drag-Drop are disabled.' },
                  { icon: <Flag size={14} className="text-yellow-600" />,      text: 'Tab or window switching is detected and recorded.' },
                  { icon: <AlertTriangle size={14} className="text-red-500" />,text: '3+ violations will flag your test for admin review.' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 flex-shrink-0">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5 text-center text-xs">
                <div className="bg-violet-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-violet-700">5</p>
                  <p className="text-gray-500">Questions</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-violet-700">MCQ</p>
                  <p className="text-gray-500">Format</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-violet-700">60%</p>
                  <p className="text-gray-500">To Pass</p>
                </div>
              </div>

              <button onClick={handleSetup}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl
                           flex items-center justify-center gap-2 transition-colors">
                <Camera size={16} /> Allow Camera &amp; Start Test
              </button>
              <button onClick={onClose}
                className="w-full text-gray-400 text-sm mt-2 hover:text-gray-600 transition-colors py-1">
                Cancel
              </button>
            </div>
          )}

          {/* ── PROCTORING CHECK STAGE ────────────────────────── */}
          {stage === 'proctoring-check' && (
            <div className="p-6 text-center space-y-4">
              <p className="text-gray-600 font-medium">Setting up proctoring environment…</p>
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video max-w-xs mx-auto">
                <video ref={videoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-4 border-violet-500 rounded-2xl animate-pulse pointer-events-none" />
              </div>
              {cameraReady
                ? <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Camera ready — starting test…
                  </p>
                : <p className="text-gray-500 text-sm">Requesting camera access…</p>
              }
              {cameraError && (
                <p className="text-red-500 text-sm">Camera not available. Test will proceed without proctoring.</p>
              )}
            </div>
          )}

          {/* ── TEST STAGE ────────────────────────────────────── */}
          {stage === 'test' && q && (
            <div className="p-6 space-y-4" data-proctored="true">

              {/* Camera + violations row */}
              <div className="flex gap-4">
                {/* Live camera feed */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-900 relative border-2
                    border-green-400 shadow-sm">
                    {cameraReady
                      ? <video ref={videoRef} autoPlay muted playsInline
                          className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <CameraOff size={20} className="text-gray-500" />
                        </div>
                    }
                    <canvas ref={canvasRef} className="hidden" />
                    {/* REC indicator */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-[9px] font-bold">REC</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    {micReady && <Mic size={10} className="text-green-500" />}
                    <span className="text-[10px] text-gray-400">
                      {cameraReady ? 'Live' : 'No cam'}
                    </span>
                  </div>
                </div>

                {/* Violation log */}
                <div className="flex-1 min-h-[80px] bg-gray-50 rounded-xl p-2.5 overflow-y-auto max-h-20 border border-gray-100">
                  {violations.length === 0
                    ? <p className="text-xs text-gray-400 text-center mt-3">No violations recorded ✓</p>
                    : violations.slice(-4).map((v, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs mb-0.5">
                          <span className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full
                            ${v.type === 'multi_face' ? 'bg-red-500' :
                              v.type === 'tab_switch' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                          <span className="text-gray-500 truncate">
                            {new Date(v.timestamp).toLocaleTimeString()} — {v.details || v.type}
                          </span>
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Violation banner */}
              {banner && (
                <ViolationBanner type={banner} onDismiss={dismissBanner} />
              )}

              {/* PAUSED overlay */}
              {paused && (
                <div className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-700 text-sm">Test Paused</p>
                    <p className="text-red-600 text-xs mt-0.5">
                      Multiple faces were detected. Ensure you are alone and dismiss this warning to continue.
                    </p>
                  </div>
                  <button onClick={dismissBanner}
                    className="ml-auto bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                    I'm alone — Resume
                  </button>
                </div>
              )}

              {/* Flagged banner */}
              {flagged && (
                <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-xl p-3 text-xs text-red-700">
                  <Flag size={13} className="flex-shrink-0" />
                  <span>
                    <strong>Test flagged</strong> — multiple violations detected.
                    Your result will be reviewed by an administrator.
                  </span>
                </div>
              )}

              {/* Question */}
              <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">
                  Question {current + 1} of {questions.length}
                </p>
                <p className="text-gray-900 font-semibold text-base leading-snug"
                  onCopy={e => e.preventDefault()}
                  onContextMenu={e => e.preventDefault()}
                >
                  {q.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2" data-proctored="true">
                {(q.options || []).map((opt, i) => (
                  <button key={i}
                    disabled={paused}
                    onClick={() => selectAnswer(q.id, opt)}
                    onCopy={e => e.preventDefault()}
                    onContextMenu={e => e.preventDefault()}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                      select-none
                      ${paused ? 'opacity-50 cursor-not-allowed' : ''}
                      ${answers[q.id] === opt
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50/50'}`}>
                    <span className="text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {current > 0 && (
                  <button onClick={() => setCurrent(c => c - 1)}
                    className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-violet-300 transition-all">
                    ← Back
                  </button>
                )}
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(c => c + 1)}
                    disabled={!answers[q.id] || paused}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl
                               text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Next Question →
                  </button>
                ) : (
                  <button onClick={handleSubmit}
                    disabled={answered < questions.length || paused}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl
                               text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Submit Test
                  </button>
                )}
              </div>
              {answered < questions.length && (
                <p className="text-xs text-center text-gray-400">
                  Answer all {questions.length} questions to submit
                </p>
              )}
            </div>
          )}

          {/* ── RESULT STAGE ─────────────────────────────────── */}
          {stage === 'result' && (
            <div className="p-6 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
                ${score >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
                {score >= 60
                  ? <Trophy size={32} className="text-green-600" />
                  : <AlertTriangle size={32} className="text-red-500" />}
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                {score >= 60 ? 'Assessment Passed! 🎉' : 'Keep Practising! 💪'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Your <span className="font-semibold text-violet-700">{skill?.skill_name}</span> score:
              </p>
              <div className={`text-5xl font-extrabold mb-3
                ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                {score}%
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-5">
                <div className={`h-3 rounded-full transition-all
                  ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
                  style={{ width: `${score}%` }} />
              </div>

              {/* Violations summary */}
              {violations.length > 0 && (
                <div className="text-left bg-gray-50 rounded-xl p-3 mb-4 text-xs">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Flag size={12} className={flagged ? 'text-red-500' : 'text-yellow-500'} />
                    {flagged ? 'Test Flagged for Admin Review' : `${violations.length} violation(s) recorded`}
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {violations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                          ${v.type === 'multi_face' ? 'bg-red-400' :
                            v.type === 'tab_switch' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                        <span>{new Date(v.timestamp).toLocaleTimeString()} — {v.type.replace('_', ' ')}: {v.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-5">
                <Lock size={11} />
                <span>Score is locked. Retake to update.</span>
              </div>
              <button onClick={onClose}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl
                           flex items-center justify-center gap-2 transition-colors">
                <CheckCircle size={15} /> Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
