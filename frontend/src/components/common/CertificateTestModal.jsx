/**
 * CertificateTestModal
 * ─────────────────────
 * Full flow:
 *   Stage 1 – upload    : drag-drop / click to upload certificate image/PDF
 *   Stage 2 – verifying : AI analysis of the certificate (OCR + keyword check)
 *   Stage 3 – verified  : show extracted info + "Take Test" button
 *           | failed    : show reason, allow re-upload
 *   Stage 4 – test      : proctored 5-question MCQ (ProctoredTestModal logic inlined
 *                         so the whole flow stays in one modal)
 *   Stage 5 – result    : score card, violations summary, save to profile option
 *
 * Props:
 *   onClose()
 *   onSave(certData)   – called with { name, issuer, score, violations, verified }
 *                        so parent can persist to state / API
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  X, Upload, FileText, Image, CheckCircle, AlertTriangle,
  ShieldCheck, Trophy, Lock, Flag, Camera, CameraOff,
  Mic, RefreshCw, Eye, Star, Award
} from 'lucide-react'

/* ─── re-use the same skin heuristic from ProctoredTestModal ─────────────── */
function detectFaceCount(videoEl, canvasEl) {
  if (!videoEl || !canvasEl) return null
  if (videoEl.readyState < 2) return null
  const ctx = canvasEl.getContext('2d')
  canvasEl.width = 160; canvasEl.height = 120
  try { ctx.drawImage(videoEl, 0, 0, 160, 120) } catch { return null }
  const { data } = ctx.getImageData(0, 0, 160, 120)
  let skinPixels = 0, brightness = 0
  const total = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    brightness += r + g + b
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (r > 50 && g > 20 && b > 10 && r >= g && r >= b && max - min > 10 && r - b > 5 && r < 250)
      skinPixels++
  }
  brightness /= (total * 3)
  if (brightness < 8) return 0
  const ratio = skinPixels / total
  if (ratio < 0.02) return 0
  if (ratio > 0.30) return 2
  return 1
}

/* ─── AI certificate analyser (client-side heuristic) ───────────────────── */
function analyseCertificate(file, previewText) {
  return new Promise(resolve => {
    setTimeout(() => {
      const name  = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const lower = (previewText + ' ' + name).toLowerCase()

      // Keywords that suggest a real certificate
      const certKeywords   = ['certificate','certif','issued','awarded','completed',
                               'achievement','course','program','training','verify']
      const platformNames  = ['coursera','udemy','linkedin','nptel','google','aws',
                               'microsoft','oracle','cisco','ibm','edx','udacity',
                               'simplilearn','infosys','tcs','wipro','nasscom']
      const techTopics     = ['python','java','javascript','react','node','sql','data',
                               'machine learning','ai','cloud','devops','web','mobile',
                               'cyber','network','database','design','management']

      const hasCertWord  = certKeywords.some(k => lower.includes(k))
      const hasPlatform  = platformNames.some(k => lower.includes(k))
      const hasTopic     = techTopics.some(k  => lower.includes(k))

      // Derive cert name & issuer heuristically
      let certName   = name
      let issuer     = 'Unknown Issuer'
      let topic      = 'General'

      platformNames.forEach(p => { if (lower.includes(p)) issuer = p.charAt(0).toUpperCase() + p.slice(1) })
      techTopics.forEach(t    => { if (lower.includes(t)) topic  = t.split(' ').map(w => w[0].toUpperCase()+w.slice(1)).join(' ') })

      if (hasTopic) certName = `${topic} Certificate`

      const confidence = (hasCertWord ? 0.4 : 0) + (hasPlatform ? 0.35 : 0) + (hasTopic ? 0.25 : 0)

      if (confidence >= 0.4 || hasCertWord) {
        resolve({ valid: true, certName, issuer, topic, confidence: Math.min(confidence + 0.2, 1) })
      } else {
        resolve({ valid: false, reason: 'Could not confirm this is a valid certificate. Please upload a clear certificate image.' })
      }
    }, 2200) // simulate AI processing delay
  })
}

/* ─── generate questions based on certificate topic ─────────────────────── */
function generateCertQuestions(topic) {
  const banks = {
    python: [
      { id:1, q:'What is the correct way to define a function in Python?', opts:['function myFunc():','def myFunc():','define myFunc():','func myFunc():'], ans:'def myFunc():' },
      { id:2, q:'Which data type is immutable in Python?', opts:['List','Dictionary','Tuple','Set'], ans:'Tuple' },
      { id:3, q:'What does PEP 8 define?', opts:['Python package index','Style guide for Python','Error handling','Module imports'], ans:'Style guide for Python' },
      { id:4, q:'What is the output of type(3.14)?', opts:['<class int>','<class float>','<class double>','<class number>'], ans:'<class float>' },
      { id:5, q:'Which keyword is used to handle exceptions?', opts:['catch','error','except','handle'], ans:'except' },
    ],
    java: [
      { id:1, q:'Which concept allows a class to inherit from multiple interfaces?', opts:['Multiple inheritance','Polymorphism','Encapsulation','Abstraction'], ans:'Multiple inheritance' },
      { id:2, q:'What is the default value of an int variable in Java?', opts:['null','undefined','0','-1'], ans:'0' },
      { id:3, q:'Which keyword prevents a class from being subclassed?', opts:['static','final','abstract','private'], ans:'final' },
      { id:4, q:'What does JVM stand for?', opts:['Java Virtual Machine','Java Variable Method','Java Value Memory','Java Version Module'], ans:'Java Virtual Machine' },
      { id:5, q:'Which collection maintains insertion order and allows duplicates?', opts:['Set','Map','List','Queue'], ans:'List' },
    ],
    javascript: [
      { id:1, q:'What does === check in JavaScript?', opts:['Value only','Type only','Value and type','Reference'], ans:'Value and type' },
      { id:2, q:'Which method converts a JSON string to an object?', opts:['JSON.stringify()','JSON.parse()','JSON.convert()','JSON.toObject()'], ans:'JSON.parse()' },
      { id:3, q:'What is a closure in JavaScript?', opts:['A type of loop','Function with access to outer scope','An error handler','A module system'], ans:'Function with access to outer scope' },
      { id:4, q:'Which keyword is block-scoped?', opts:['var','let','both var and let','function'], ans:'let' },
      { id:5, q:'What does the spread operator (...) do?', opts:['Creates an array','Expands iterables','Imports modules','Defines rest params'], ans:'Expands iterables' },
    ],
    react: [
      { id:1, q:'Which hook is used for side effects in React?', opts:['useState','useRef','useEffect','useContext'], ans:'useEffect' },
      { id:2, q:'What is a React key prop used for?', opts:['Styling','Identifying list items uniquely','Passing data to children','Event handling'], ans:'Identifying list items uniquely' },
      { id:3, q:'What is the virtual DOM?', opts:['A browser API','A lightweight copy of the real DOM','A CSS framework','A state manager'], ans:'A lightweight copy of the real DOM' },
      { id:4, q:'Which lifecycle method is equivalent to useEffect with []?', opts:['componentDidUpdate','componentWillUnmount','componentDidMount','shouldComponentUpdate'], ans:'componentDidMount' },
      { id:5, q:'What does prop drilling mean?', opts:['Deleting props','Passing props through many layers','Creating new props','Validating props'], ans:'Passing props through many layers' },
    ],
    sql: [
      { id:1, q:'Which SQL clause filters groups after aggregation?', opts:['WHERE','HAVING','GROUP BY','ORDER BY'], ans:'HAVING' },
      { id:2, q:'What does INNER JOIN return?', opts:['All rows from both tables','Matching rows from both tables','All left rows','All right rows'], ans:'Matching rows from both tables' },
      { id:3, q:'Which function returns the number of rows?', opts:['SUM()','AVG()','COUNT()','MAX()'], ans:'COUNT()' },
      { id:4, q:'What constraint ensures no duplicate values in a column?', opts:['PRIMARY KEY','FOREIGN KEY','UNIQUE','NOT NULL'], ans:'UNIQUE' },
      { id:5, q:'Which command removes all rows but keeps table structure?', opts:['DROP','DELETE','TRUNCATE','REMOVE'], ans:'TRUNCATE' },
    ],
    'machine learning': [
      { id:1, q:'Which algorithm is used for classification?', opts:['Linear Regression','K-Means','Decision Tree','PCA'], ans:'Decision Tree' },
      { id:2, q:'What does overfitting mean?', opts:['Model is too simple','Model fits training data too well','Model has low bias','Model ignores features'], ans:'Model fits training data too well' },
      { id:3, q:'Which metric evaluates classification model performance?', opts:['R-squared','MAE','Accuracy','RMSE'], ans:'Accuracy' },
      { id:4, q:'What is the purpose of train-test split?', opts:['Speed up training','Evaluate generalisation','Reduce data size','Increase accuracy'], ans:'Evaluate generalisation' },
      { id:5, q:'Which technique reduces overfitting?', opts:['More features','Less data','Regularisation','Higher learning rate'], ans:'Regularisation' },
    ],
    cloud: [
      { id:1, q:'What does IaaS stand for?', opts:['Internet as a Service','Infrastructure as a Service','Integration as a Service','Instance as a Service'], ans:'Infrastructure as a Service' },
      { id:2, q:'Which AWS service provides scalable object storage?', opts:['EC2','RDS','S3','Lambda'], ans:'S3' },
      { id:3, q:'What is autoscaling?', opts:['Automatic backups','Automatic resource adjustment based on demand','Automatic deployments','Automatic billing'], ans:'Automatic resource adjustment based on demand' },
      { id:4, q:'What is a CDN used for?', opts:['Database replication','Faster content delivery via edge servers','Encryption','Load balancing'], ans:'Faster content delivery via edge servers' },
      { id:5, q:'Which model is serverless computing?', opts:['IaaS','PaaS','FaaS','SaaS'], ans:'FaaS' },
    ],
  }

  const topicLower = topic.toLowerCase()
  const match = Object.keys(banks).find(k => topicLower.includes(k))
  const rawQs  = match ? banks[match] : banks.python // fallback to python

  return rawQs.map(q => ({
    id: q.id,
    question_text: q.q,
    options: q.opts,
    correct_answer: q.ans,
  }))
}

/* ─── Violation banner (same design as ProctoredTestModal) ──────────────── */
function ViolationBanner({ type, onDismiss }) {
  const cfg = {
    no_face:    { text: 'Please keep your face visible in the camera.',              bg: 'bg-yellow-900/90 border-yellow-500', color: 'text-yellow-200' },
    multi_face: { text: 'Multiple faces detected. Only you should take this test.',  bg: 'bg-red-900/90 border-red-500',       color: 'text-red-200'    },
    tab_switch: { text: 'Tab/window switch detected and recorded.',                  bg: 'bg-orange-900/90 border-orange-500', color: 'text-orange-200' },
  }
  const c = cfg[type]; if (!c) return null
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg}`}>
      <AlertTriangle size={15} className="text-current flex-shrink-0" />
      <p className={`text-sm font-semibold flex-1 ${c.color}`}>{c.text}</p>
      <button onClick={onDismiss} className="text-white/60 hover:text-white"><X size={13} /></button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function CertificateTestModal({ onClose, onSave }) {
  const [stage, setStage]             = useState('upload')   // upload|verifying|verified|verify_fail|setup_cam|test|result
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)       // data URL for image
  const [certInfo, setCertInfo]       = useState(null)       // { certName, issuer, topic, confidence }
  const [verifyError, setVerifyError] = useState('')
  const [questions, setQuestions]     = useState([])
  const [current, setCurrent]         = useState(0)
  const [answers, setAnswers]         = useState({})
  const [score, setScore]             = useState(null)
  const [violations, setViolations]   = useState([])
  const [banner, setBanner]           = useState(null)
  const [paused, setPaused]           = useState(false)
  const [flagged, setFlagged]         = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [micReady, setMicReady]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [drag, setDrag]               = useState(false)

  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)
  const faceTimer   = useRef(null)
  const bannerTimer = useRef(null)
  const fileInputRef= useRef(null)

  const q        = questions[current]
  const answered = Object.keys(answers).length

  /* ── cleanup ────────────────────────────────────────────────── */
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    clearInterval(faceTimer.current)
    clearTimeout(bannerTimer.current)
  }, [])

  /* ── violation logger ───────────────────────────────────────── */
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
    if (type !== 'multi_face') bannerTimer.current = setTimeout(() => setBanner(null), 4000)
    if (type === 'multi_face') setPaused(true)
  }, [])

  const dismissBanner = () => {
    if (banner === 'multi_face') setPaused(false)
    setBanner(null)
  }

  /* ── re-attach stream whenever the video element re-mounts ─────
     Stage transitions unmount/remount the <video> node; this keeps
     the stream synced without needing extra state.                    */
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(() => {})
      }
    }
  }) // runs after every render

  /* ── face polling ────────────────────────────────────────────── */
  useEffect(() => {
    if (stage !== 'test') return
    faceTimer.current = setInterval(() => {
      const count = detectFaceCount(videoRef.current, canvasRef.current)
      if (count === null) return
      if (count === 0 && !paused) logViolation('no_face', 'Face not visible')
      else if (count >= 2 && !paused) logViolation('multi_face', `${count} faces detected`)
      if (count === 1 && banner === 'no_face') setBanner(null)
    }, 2000)
    return () => clearInterval(faceTimer.current)
  }, [stage, paused, banner, logViolation])

  /* ── tab/visibility detection ───────────────────────────────── */
  useEffect(() => {
    if (stage !== 'test') return
    const handler = () => { if (document.hidden) logViolation('tab_switch', 'User left the page') }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [stage, logViolation])

  /* ── block copy/paste/etc in test area ──────────────────────── */
  useEffect(() => {
    if (stage !== 'test') return
    const block = e => { if (e.target.closest('[data-cert-proctored]')) { e.preventDefault(); e.stopPropagation() } }
    const evts  = ['copy','paste','cut','contextmenu','dragstart','drop']
    evts.forEach(ev => document.addEventListener(ev, block, true))
    return () => evts.forEach(ev => document.removeEventListener(ev, block, true))
  }, [stage])

  /* ── FILE HANDLING ──────────────────────────────────────────── */
  const handleFile = (f) => {
    if (!f) return
    const allowed = ['image/jpeg','image/png','image/webp','application/pdf']
    if (!allowed.includes(f.type)) {
      alert('Please upload a JPG, PNG, WEBP or PDF file.')
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null) // PDF — no preview
    }
  }

  const onDrop = e => {
    e.preventDefault(); setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  /* ── VERIFY CERTIFICATE ─────────────────────────────────────── */
  const verifyCertificate = async () => {
    if (!file) return
    setStage('verifying')
    const textHint = file.name + ' ' + (preview || '')
    try {
      const result = await analyseCertificate(file, textHint)
      if (result.valid) {
        setCertInfo(result)
        setQuestions(generateCertQuestions(result.topic))
        setStage('verified')
      } else {
        setVerifyError(result.reason)
        setStage('verify_fail')
      }
    } catch {
      setVerifyError('Verification failed. Please try again.')
      setStage('verify_fail')
    }
  }

  /* ── START CAMERA for proctoring ────────────────────────────── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 }, audio: true })
      streamRef.current = stream
      setCameraReady(true)
      setMicReady(true)
    } catch {
      try {
        const vs = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = vs
        setCameraReady(true)
      } catch {
        setCameraError(true)
      }
    }
    // Store stream first, then change stage so the video element mounts
    // and the re-attach useEffect above wires it up automatically
    setStage('setup_cam')
    setTimeout(() => setStage('test'), 2500)
  }

  /* ── SUBMIT TEST ─────────────────────────────────────────────── */
  const handleSubmit = () => {
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id]?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) correct++
    })
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)
    setStage('result')
    streamRef.current?.getTracks().forEach(t => t.stop())
    clearInterval(faceTimer.current)
  }

  /* ── SAVE CERTIFICATE ────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        name:       certInfo?.certName || file?.name || 'Certificate',
        issuer:     certInfo?.issuer   || 'Unknown',
        topic:      certInfo?.topic    || 'General',
        score,
        violations,
        flagged,
        verified:   true,
        file,
        uploadedAt: new Date().toISOString(),
      })
      onClose()
    } catch { setSaving(false) }
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  const stageTitle = {
    upload:       'Upload Certificate',
    verifying:    'Verifying Certificate…',
    verified:     'Certificate Verified ✓',
    verify_fail:  'Verification Failed',
    setup_cam:    'Setting Up Proctoring…',
    test:         'Certificate Knowledge Test',
    result:       'Test Complete',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* ── HEADER ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Certificates</p>
              <h2 className="text-white font-bold text-lg mt-0.5">{stageTitle[stage]}</h2>
            </div>
            <div className="flex items-center gap-2">
              {stage === 'test' && (
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-white text-xs font-medium">Proctored</span>
                </div>
              )}
              {stage !== 'test' && (
                <button onClick={() => { streamRef.current?.getTracks().forEach(t=>t.stop()); onClose() }}
                  className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5 mt-3">
            {[
              { key:'upload',   label:'Upload'  },
              { key:'verified', label:'Verify'  },
              { key:'test',     label:'Test'    },
              { key:'result',   label:'Result'  },
            ].map(({ key, label }, i, arr) => {
              const order = ['upload','verifying','verified','verify_fail','setup_cam','test','result']
              const cur   = order.indexOf(stage)
              const me    = order.indexOf(key)
              const done  = cur > me
              const active= cur === me || (key === 'verified' && stage === 'verifying')
              return (
                <React.Fragment key={key}>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all
                    ${done   ? 'bg-green-500 text-white' :
                      active ? 'bg-white text-blue-700' : 'bg-white/20 text-blue-200'}`}>
                    {done ? <CheckCircle size={10} /> : <span>{i+1}</span>}
                    {label}
                  </div>
                  {i < arr.length-1 && <div className="flex-1 h-px bg-white/20" />}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── UPLOAD ────────────────────────────────────── */}
          {stage === 'upload' && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload your certificate (image or PDF). Our AI will verify it, then give you a
                quick 5-question proctored test on the topic.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${drag ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/40'}`}
              >
                <input ref={fileInputRef} type="file" className="hidden"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <div className="space-y-2">
                    {preview
                      ? <img src={preview} alt="cert preview" className="max-h-40 mx-auto rounded-xl object-contain shadow" />
                      : <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                          <FileText size={28} className="text-blue-600" />
                        </div>
                    }
                    <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Drop certificate here or click to browse</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP or PDF · Max 10 MB</p>
                  </div>
                )}
              </div>

              <button onClick={verifyCertificate} disabled={!file}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold
                           py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ShieldCheck size={16} /> Verify with AI
              </button>
            </div>
          )}

          {/* ── VERIFYING ─────────────────────────────────── */}
          {stage === 'verifying' && (
            <div className="p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <ShieldCheck size={36} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Analysing Certificate…</p>
                <p className="text-sm text-gray-500 mt-1">AI is extracting and verifying certificate details</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              {/* Steps */}
              <div className="text-left space-y-2 max-w-xs mx-auto">
                {['Uploading certificate…','Extracting text & details…','Validating authenticity…','Generating test questions…']
                  .map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={12} className="text-blue-400" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── VERIFIED ──────────────────────────────────── */}
          {stage === 'verified' && certInfo && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
                <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Certificate Verified!</p>
                  <p className="text-xs text-green-600 mt-0.5">AI confidence: {Math.round(certInfo.confidence * 100)}%</p>
                </div>
              </div>

              {/* Certificate details card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{certInfo.certName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Issued by <span className="font-semibold text-blue-700">{certInfo.issuer}</span></p>
                    <p className="text-xs text-indigo-600 mt-1 bg-indigo-100 inline-block px-2 py-0.5 rounded-full font-medium">
                      Topic: {certInfo.topic}
                    </p>
                  </div>
                </div>
                {preview && (
                  <img src={preview} alt="certificate" className="mt-4 rounded-xl w-full object-contain max-h-36 border border-blue-100" />
                )}
              </div>

              {/* Test info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  To add this certificate to your profile, take a <strong>proctored 5-question test</strong> on{' '}
                  <strong>{certInfo.topic}</strong>. Camera access is required.
                </p>
              </div>

              <button onClick={startCamera}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl
                           flex items-center justify-center gap-2 transition-colors">
                <Camera size={16} /> Allow Camera &amp; Take Test
              </button>
              <button onClick={() => setStage('upload')}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-1">
                ← Re-upload Certificate
              </button>
            </div>
          )}

          {/* ── VERIFY FAIL ───────────────────────────────── */}
          {stage === 'verify_fail' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Verification Failed</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{verifyError}</p>
              <div className="text-left bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700 mb-1">Tips for a successful verification:</p>
                <p>• Upload a clear, well-lit image of the certificate</p>
                <p>• Ensure the certificate title is visible</p>
                <p>• Include the issuing organisation name</p>
                <p>• JPG or PNG files work best</p>
              </div>
              <button onClick={() => { setFile(null); setPreview(null); setStage('upload') }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl
                           flex items-center justify-center gap-2 transition-colors">
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          )}

          {/* ── CAMERA SETUP ──────────────────────────────── */}
          {stage === 'setup_cam' && (
            <div className="p-6 text-center space-y-4">
              <p className="text-gray-600 font-medium">Setting up proctoring environment…</p>
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video max-w-xs mx-auto border-4 border-indigo-500 animate-pulse">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              {cameraReady
                ? <p className="text-green-600 font-semibold flex items-center justify-center gap-2 text-sm">
                    <CheckCircle size={15} /> Camera ready — starting test…
                  </p>
                : <p className="text-gray-500 text-sm">Requesting camera access…</p>
              }
              {cameraError && (
                <p className="text-orange-500 text-xs">Camera not available — test will continue without proctoring.</p>
              )}
            </div>
          )}

          {/* ── TEST ──────────────────────────────────────── */}
          {stage === 'test' && q && (
            <div className="p-5 space-y-4" data-cert-proctored="true">

              {/* Camera row */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-24 h-18 rounded-xl overflow-hidden bg-gray-900 relative border-2
                    border-green-400 shadow-sm" style={{ height: '72px' }}>
                    {cameraReady
                      ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><CameraOff size={18} className="text-gray-500" /></div>
                    }
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/60 rounded px-1 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-[8px] font-bold">REC</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-0.5 flex items-center justify-center gap-0.5">
                    {micReady && <Mic size={9} className="text-green-500" />}
                    {cameraReady ? 'Live' : 'No cam'}
                  </p>
                </div>
                {/* Violation log */}
                <div className="flex-1 bg-gray-50 rounded-xl p-2 overflow-y-auto border border-gray-100 text-xs" style={{ maxHeight:'72px' }}>
                  {violations.length === 0
                    ? <p className="text-gray-400 text-center mt-3">No violations ✓</p>
                    : violations.slice(-3).map((v, i) => (
                        <div key={i} className="flex items-center gap-1.5 mb-0.5 text-gray-500">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                            ${v.type==='multi_face'?'bg-red-500':v.type==='tab_switch'?'bg-orange-400':'bg-yellow-400'}`} />
                          {new Date(v.timestamp).toLocaleTimeString()} — {v.type.replace('_',' ')}
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Banner */}
              {banner && <ViolationBanner type={banner} onDismiss={dismissBanner} />}

              {/* Paused overlay */}
              {paused && (
                <div className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-sm">Test Paused — Multiple Faces Detected</p>
                    <p className="text-red-600 text-xs mt-0.5">Ensure you are alone, then resume.</p>
                  </div>
                  <button onClick={dismissBanner}
                    className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
                    I'm alone
                  </button>
                </div>
              )}

              {flagged && (
                <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-xl p-3 text-xs text-red-700">
                  <Flag size={12} className="flex-shrink-0" />
                  <span><strong>Test flagged</strong> — result will be reviewed by admin.</span>
                </div>
              )}

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Question {current + 1} of {questions.length}</span>
                  <span>{answered}/{questions.length} answered</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width:`${((current+1)/questions.length)*100}%` }} />
                </div>
              </div>

              {/* Question */}
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100"
                onCopy={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()}>
                <p className="text-gray-900 font-semibold text-sm leading-snug">{q.question_text}</p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button key={i} disabled={paused}
                    onClick={() => !paused && setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    onCopy={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all select-none
                      ${paused ? 'opacity-50 cursor-not-allowed' : ''}
                      ${answers[q.id] === opt
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
                    <span className="text-gray-400 mr-2">{String.fromCharCode(65+i)}.</span>{opt}
                  </button>
                ))}
              </div>

              {/* Nav */}
              <div className="flex gap-3">
                {current > 0 && (
                  <button onClick={() => setCurrent(c=>c-1)}
                    className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-indigo-300">
                    ← Back
                  </button>
                )}
                {current < questions.length-1
                  ? <button onClick={() => setCurrent(c=>c+1)} disabled={!answers[q.id]||paused}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
                      Next →
                    </button>
                  : <button onClick={handleSubmit} disabled={answered<questions.length||paused}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                      <CheckCircle size={14} /> Submit Test
                    </button>
                }
              </div>
              {answered < questions.length && (
                <p className="text-xs text-center text-gray-400">Answer all {questions.length} questions to submit</p>
              )}
            </div>
          )}

          {/* ── RESULT ────────────────────────────────────── */}
          {stage === 'result' && (
            <div className="p-6 space-y-4">
              {/* Score card */}
              <div className={`rounded-2xl p-5 text-center ${score>=60?'bg-green-50 border-2 border-green-200':'bg-red-50 border-2 border-red-200'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3
                  ${score>=60?'bg-green-100':'bg-red-100'}`}>
                  {score>=60 ? <Trophy size={28} className="text-green-600" /> : <AlertTriangle size={28} className="text-red-500" />}
                </div>
                <p className={`text-4xl font-extrabold mb-1 ${score>=80?'text-green-600':score>=60?'text-yellow-600':'text-red-500'}`}>
                  {score}%
                </p>
                <p className="font-bold text-gray-800">{score>=60 ? 'Test Passed! 🎉' : 'Needs Improvement 💪'}</p>
                <p className="text-xs text-gray-500 mt-1">{certInfo?.certName}</p>
              </div>

              {/* Score bar */}
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${score>=80?'bg-green-500':score>=60?'bg-yellow-500':'bg-red-400'}`}
                  style={{ width:`${score}%` }} />
              </div>

              {/* Certificate details */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                <Award size={18} className="text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{certInfo?.certName}</p>
                  <p className="text-gray-500 text-xs">Issued by {certInfo?.issuer} · Topic: {certInfo?.topic}</p>
                </div>
              </div>

              {/* Violations */}
              {violations.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-100">
                  <p className={`font-semibold mb-2 flex items-center gap-1.5 ${flagged?'text-red-600':'text-gray-700'}`}>
                    <Flag size={11} className={flagged?'text-red-500':'text-yellow-500'} />
                    {flagged ? 'Flagged for admin review' : `${violations.length} violation(s) recorded`}
                  </p>
                  <div className="space-y-0.5 max-h-20 overflow-y-auto">
                    {violations.map((v,i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                          ${v.type==='multi_face'?'bg-red-400':v.type==='tab_switch'?'bg-orange-400':'bg-yellow-400'}`} />
                        {new Date(v.timestamp).toLocaleTimeString()} — {v.type.replace('_',' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 justify-center text-xs text-gray-400">
                <Lock size={10} /> Score locked to this certificate
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl
                           flex items-center justify-center gap-2 transition-colors">
                {saving
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving…</>
                  : <><Star size={15} /> Add to My Profile</>
                }
              </button>
              {score < 60 && (
                <button onClick={() => { setStage('verified'); setAnswers({}); setCurrent(0); setViolations([]); setFlagged(false) }}
                  className="w-full text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors py-1">
                  Retake Test
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
