import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, Zap, Target, Award, Users, Building2, GraduationCap,
  Brain, BarChart3, Video, Globe, Star, TrendingUp, Shield, Sparkles, ChevronDown,
  Play
} from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

/* ═══════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════ */

/** Animated counter when element enters viewport */
function useCounter(target, duration = 2000, started = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let current = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setVal(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, started])
  return val
}

/** Fire callback once when element is visible */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/** Navbar scroll state */
function useScrolled(px = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > px)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [px])
  return scrolled
}

/* ═══════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════ */

/** Animated stat counter box */
function StatCounter({ value, label, suffix = '+', icon: Icon, delay = 0 }) {
  const [ref, inView] = useInView(0.3)
  const num   = parseInt(String(value).replace(/\D/g, ''))
  const count = useCounter(num, 1800, inView)
  return (
    <div
      ref={ref}
      className="text-center group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <Icon size={22} className="text-white" />
        </div>
      )}
      <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-indigo-200 text-sm font-medium">{label}</div>
    </div>
  )
}

/** Scroll-reveal wrapper — children fade+slide in when visible */
function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const [ref, inView] = useInView()
  const translate = {
    up:    'translateY(40px)',
    down:  'translateY(-40px)',
    left:  'translateX(-40px)',
    right: 'translateX(40px)',
    scale: 'scale(0.9)',
  }[direction] || 'translateY(40px)'

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'none' : translate,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** Feature card with reveal */
function FeatureCard({ icon: Icon, title, desc, index }) {
  const [ref, inView] = useInView(0.1)
  const delay = (index % 4) * 80
  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-gray-100 p-5
                 hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-2
                 transition-all duration-400 cursor-default group"
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s, border-color 0.3s`,
      }}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-100
                      flex items-center justify-center mb-4
                      group-hover:scale-110 group-hover:from-indigo-600 group-hover:to-violet-600
                      transition-all duration-300">
        <Icon size={19} className="text-indigo-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-indigo-700 transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

/** Role card */
function RoleCard({ icon: Icon, gradient, ringColor, title, titleColor, points, cta, href, index }) {
  const [ref, inView] = useInView(0.15)
  const delay = index * 120
  return (
    <div
      ref={ref}
      className="group card hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 border border-gray-100"
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, box-shadow 0.3s`,
      }}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5
                       ring-4 ${ringColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
        <Icon size={28} className="text-white" />
      </div>
      <h3 className={`text-xl font-bold mb-4 ${titleColor}`}>{title}</h3>
      <ul className="space-y-2 mb-6">
        {points.map((p, i) => (
          <li key={p} className="flex items-center gap-2 text-sm text-gray-600"
              style={{ transitionDelay: `${i * 30}ms` }}>
            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            {p}
          </li>
        ))}
      </ul>
      <Link to={href}
        className="btn-secondary w-full text-center text-sm block
                   group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600
                   transition-all duration-300">
        {cta}
      </Link>
    </div>
  )
}

/** Floating particle dot */
function Particle({ x, y, size, delay, color }) {
  return (
    <div
      className="absolute rounded-full animate-float pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        background: color,
        opacity: 0.35,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + delay}s`,
      }}
    />
  )
}

/** Typewriter effect for hero sub-headline */
function Typewriter({ words, speed = 80, pause = 1800 }) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    if (!deleting && charIdx < word.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), speed)
      return () => clearTimeout(t)
    }
    if (!deleting && charIdx === word.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
    }
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  useEffect(() => {
    setDisplay(words[wordIdx].slice(0, charIdx))
  }, [charIdx, wordIdx, words])

  return (
    <span className="gradient-text-light">
      {display}
      <span className="animate-pulse text-indigo-400">|</span>
    </span>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function Home() {
  const scrolled = useScrolled(30)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Smooth scroll to section
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const PARTICLES = [
    { x: 10, y: 20, size: 6,  delay: 0,   color: '#818cf8' },
    { x: 85, y: 15, size: 10, delay: 0.8, color: '#a78bfa' },
    { x: 25, y: 70, size: 8,  delay: 1.4, color: '#60a5fa' },
    { x: 70, y: 60, size: 5,  delay: 0.5, color: '#c4b5fd' },
    { x: 50, y: 85, size: 7,  delay: 2.0, color: '#818cf8' },
    { x: 90, y: 75, size: 9,  delay: 1.1, color: '#60a5fa' },
    { x: 5,  y: 50, size: 4,  delay: 1.7, color: '#a78bfa' },
    { x: 60, y: 10, size: 6,  delay: 0.3, color: '#c4b5fd' },
  ]

  const STEPS = [
    'Industry Requirement', 'Skill Analysis', 'Skill Gap',
    'Personalized Learning', 'Assessment', 'Verified Skill',
    'AI Interview', 'Job Match', 'Company Feedback', 'Better Matching'
  ]

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-100/80 border-b border-gray-100'
          : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <EduNexusLogo size={38} darkText={scrolled} />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[
              { label: 'Features',  id: 'features'  },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'For You',   id: 'for-everyone' },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`transition-colors hover:text-indigo-600
                  ${scrolled ? 'text-gray-600' : 'text-white/80 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all hidden sm:block
                ${scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
              Sign In
            </Link>
            <Link to="/register"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white
                         font-semibold text-sm px-5 py-2.5 rounded-xl transition-all
                         shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="min-h-screen flex items-center justify-center pt-16
                           bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b]
                           relative overflow-hidden">

        {/* Animated mesh gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px]
                          bg-indigo-600/15 rounded-full blur-[120px] animate-float" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px]
                          bg-violet-600/15 rounded-full blur-[120px] animate-float"
               style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[100px]
                          animate-float" style={{ animationDelay: '1s' }} />

          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 py-20">

          {/* Hero Logo */}
          <div
            className="flex flex-col items-center gap-4 mb-10"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.9)',
              transition: 'opacity 0.9s ease 0s, transform 0.9s ease 0s',
            }}
          >
            <img
              src="/edunexus-logo.svg"
              alt="EduNexus"
              className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_0_32px_rgba(59,130,246,0.5)]"
            />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
                Edu<span className="text-blue-400">Nexus</span>
              </p>
              <p className="text-sm text-blue-200/70 mt-1 tracking-widest font-medium uppercase">
                Learn &bull; Grow &bull; Build Your Future
              </p>
            </div>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs
                        font-semibold px-4 py-2 rounded-full border border-indigo-500/25 mb-8"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
            }}
          >
            <Sparkles size={12} className="text-indigo-400 animate-pulse" />
            AI-Powered Student Career Intelligence Platform
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white
                        leading-[1.08] mb-4 tracking-tight"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
            }}
          >
            Launch Your Career
          </h1>

          {/* Typewriter */}
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-7 min-h-[1.3em]"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s',
            }}
          >
            <Typewriter
              words={['The Smart Way', 'With AI Matching', 'Through EduNexus', 'Build Your Future']}
              speed={70}
              pause={2200}
            />
          </h2>

          {/* Sub */}
          <p
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.65s, transform 0.8s ease 0.65s',
            }}
          >
            EduNexus connects students with top companies through AI-driven skill matching,
            verified credentials, real industry challenges — and a platform built to make you
            <span className="text-indigo-300 font-semibold"> genuinely job-ready.</span>
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-14"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.8s, transform 0.8s ease 0.8s',
            }}
          >
            <Link to="/register"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                         text-white font-bold px-8 py-4 rounded-2xl
                         shadow-2xl shadow-indigo-900/60 hover:shadow-indigo-900/80
                         hover:-translate-y-1 transition-all duration-300 text-base">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="flex items-center gap-2 bg-white/8 hover:bg-white/15
                         text-white font-semibold px-8 py-4 rounded-2xl
                         border border-white/15 hover:border-white/30
                         hover:-translate-y-1 transition-all duration-300 text-base">
              <Play size={16} className="fill-current" /> See How It Works
            </button>
          </div>

          {/* Floating feature pills */}
          <div
            className="flex flex-wrap justify-center gap-2.5"
            style={{
              opacity:    heroVisible ? 1 : 0,
              transition: 'opacity 0.8s ease 1s',
            }}
          >
            {[
              { emoji: '🎯', text: 'AI Skill Matching'     },
              { emoji: '🤖', text: 'AI Interview Simulator' },
              { emoji: '🏅', text: 'Verified Skill Passport'},
              { emoji: '📊', text: 'Skill Gap Analysis'    },
              { emoji: '🚀', text: 'Industry Challenges'   },
              { emoji: '📈', text: 'Rejection Analysis'    },
            ].map(({ emoji, text }, i) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 bg-white/6 border border-white/12
                           text-white/75 text-xs font-medium px-3.5 py-2 rounded-full
                           hover:bg-white/12 hover:text-white hover:border-white/25
                           transition-all duration-200 cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span>{emoji}</span> {text}
              </span>
            ))}
          </div>

          {/* Scroll cue */}
          <div
            className="mt-16 flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => scrollTo('how-it-works')}
            style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 1s ease 1.2s' }}
          >
            <span className="text-white/30 text-xs font-medium tracking-widest uppercase">Scroll</span>
            <div className="relative w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-1.5">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-scroll-dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="badge-info text-xs mb-3 inline-block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              The Complete Employability Loop
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
              Every step is connected, transparent, and data-driven —
              from industry demand all the way to your placement.
            </p>
          </Reveal>

          {/* Steps timeline */}
          <StepsTimeline steps={STEPS} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOR EVERYONE
      ══════════════════════════════════════ */}
      <section id="for-everyone" className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="badge-info text-xs mb-3 inline-block">Built For Everyone</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">One Platform, Three Audiences</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
              Whether you're a student, company, or college — EduNexus has something powerful for you.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users, gradient: 'from-indigo-500 to-indigo-700', ringColor: 'ring-indigo-100',
                title: 'Students', titleColor: 'text-indigo-600',
                points: ['Verified Skill Passport', 'AI Interview Practice', 'Personalized Job Matching',
                         'Learning Roadmaps', 'Industry Challenges', 'Rejection Analysis'],
                cta: 'Register as Student', href: '/register',
              },
              {
                icon: Building2, gradient: 'from-emerald-500 to-teal-600', ringColor: 'ring-emerald-100',
                title: 'Companies', titleColor: 'text-emerald-600',
                points: ['Post Jobs & Internships', 'Find Top Candidates', 'AI Skill Matching',
                         'Industry Challenges', 'Priority-Based Ranking', 'Real Skill Verification'],
                cta: 'Register Company', href: '/register?role=company',
              },
              {
                icon: GraduationCap, gradient: 'from-violet-500 to-purple-600', ringColor: 'ring-violet-100',
                title: 'Colleges', titleColor: 'text-violet-600',
                points: ['Industry Demand Analytics', 'Skill Gap Insights', 'Student Performance',
                         'Training Programs', 'Placement Tracking', 'Verified Education Records'],
                cta: 'Register College', href: '/register?role=college',
              },
            ].map((card, i) => <RoleCard key={card.title} {...card} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="badge-info text-xs mb-3 inline-block">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              12 Unique Differentiators
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Features you won't find in a standard job portal — built specifically for academia.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { icon: Brain,       title: 'Explainable Skill Matching',  desc: 'Know exactly WHY your score is what it is — full skill-by-skill breakdown.' },
              { icon: Target,      title: 'Skill Gap Analysis',           desc: 'Identify exactly which skills you need for your target role and by how much.' },
              { icon: Award,       title: 'Verified Skill Passport',      desc: 'College-verified, assessment-backed, project-proven skill credentials.' },
              { icon: Video,       title: 'AI Interview Simulator',       desc: 'Speech-to-speech AI interview with role-specific questions and real evaluation.' },
              { icon: Globe,       title: 'Reverse Mapping',              desc: 'Companies find students — not just students finding jobs.' },
              { icon: Zap,         title: 'Industry Challenges',          desc: 'Real problems from companies. Winners get internship/job offers.' },
              { icon: TrendingUp,  title: 'Rejection Analysis',           desc: 'Understand why you were rejected and exactly what to fix next time.' },
              { icon: BarChart3,   title: 'College Analytics',            desc: 'See skill demand vs availability gaps at institutional level.' },
              { icon: Shield,      title: 'Verified Credentials',         desc: 'Education, internships and certifications verified by institutions.' },
              { icon: Star,        title: 'Badge System',                 desc: 'Earn gamified achievement badges that boost your profile score.' },
              { icon: Users,       title: 'Priority Ranking',             desc: 'Multi-factor candidate ranking — not just skill percentage.' },
              { icon: GraduationCap, title: 'Training Programs',          desc: 'Colleges create targeted training based on real industry skill gaps.' },
            ].map(({ icon, title, desc }, i) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        {/* Animated BG */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <Reveal className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">EduNexus at a Glance</h2>
            <p className="text-indigo-200 text-sm">Numbers that speak for themselves.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <StatCounter value="10000" label="Students Registered"   icon={Users}        suffix="+" delay={0}   />
            <StatCounter value="500"   label="Partner Companies"     icon={Building2}    suffix="+" delay={100} />
            <StatCounter value="50"    label="Partner Colleges"      icon={GraduationCap}suffix="+" delay={200} />
            <StatCounter value="3000"  label="Successful Placements" icon={Award}        suffix="+" delay={300} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUOTE
      ══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mx-auto mb-10" />
            <div className="text-6xl text-indigo-100 font-serif leading-none mb-2 select-none">"</div>
            <blockquote className="text-2xl sm:text-3xl font-bold text-gray-800 leading-relaxed mb-6 -mt-4">
              We don't just connect students with jobs.{' '}
              <span className="gradient-text">We make students job-ready.</span>
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-px bg-gray-200" />
              <p className="text-gray-400 text-sm font-medium">The EduNexus Mission</p>
              <div className="w-10 h-px bg-gray-200" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-300 text-xs
                            font-semibold px-4 py-2 rounded-full border border-indigo-500/25 mb-6">
              <Sparkles size={12} /> Get Started Today
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Ready to bridge the gap?
            </h2>
            <p className="text-gray-400 mb-10 text-base max-w-xl mx-auto leading-relaxed">
              Join thousands of students, companies, and colleges building the future
              of education and employment together.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                           text-white font-bold px-8 py-4 rounded-2xl
                           shadow-2xl shadow-indigo-900/60 hover:-translate-y-1 transition-all duration-300">
                Register as Student <ArrowRight size={17} />
              </Link>
              <Link to="/register?role=company"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/18 text-white
                           font-semibold px-8 py-4 rounded-2xl border border-white/20
                           hover:border-white/35 hover:-translate-y-1 transition-all duration-300">
                Register Company
              </Link>
              <Link to="/register?role=college"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/18 text-white
                           font-semibold px-8 py-4 rounded-2xl border border-white/20
                           hover:border-white/35 hover:-translate-y-1 transition-all duration-300">
                Register College
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-500 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <EduNexusLogo size={44} showTagline={true} />
            </Link>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              {[
                { label: 'Sign In',           to: '/login'              },
                { label: 'Register',          to: '/register'           },
                { label: 'For Companies',     to: '/register?role=company' },
                { label: 'For Colleges',      to: '/register?role=college' },
              ].map(({ label, to }) => (
                <Link key={label} to={to}
                  className="hover:text-white transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800/60 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} EduNexus. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Built with <span className="text-red-500">❤️</span> for students everywhere
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Steps timeline — properly uses hook at component level */
function StepItem({ step, index, total }) {
  const [ref, inView] = useInView(0.1)
  return (
    <React.Fragment>
      <div
        ref={ref}
        className="flex flex-col items-center gap-2 group"
        style={{
          opacity:    inView ? 1 : 0,
          transform:  inView ? 'translateY(0)' : 'translateY(25px)',
          transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
        }}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-extrabold
                        flex items-center justify-center
                        group-hover:scale-125 group-hover:bg-violet-600
                        transition-all duration-300 shadow-md shadow-indigo-200">
          {index + 1}
        </div>
        <div className="bg-white border border-gray-200 hover:border-indigo-300
                        rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700
                        shadow-sm hover:shadow-md hover:-translate-y-1
                        transition-all duration-200 whitespace-nowrap cursor-default">
          {step}
        </div>
      </div>
      {index < total - 1 && (
        <ArrowRight size={13} className="text-indigo-300 flex-shrink-0 mt-5 hidden sm:block" />
      )}
    </React.Fragment>
  )
}

function StepsTimeline({ steps }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 items-center">
      {steps.map((step, i) => (
        <StepItem key={step} step={step} index={i} total={steps.length} />
      ))}
    </div>
  )
}
