import React, { useEffect, useRef } from 'react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#14b8a6', '#f97316',
]

export default function CursorAnimation({ dark = false }) {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })
  const triangles = useRef([])
  const animId = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMove = (e) => {
      const pos = e.touches ? e.touches[0] : e
      mouse.current = { x: pos.clientX, y: pos.clientY }
      // Spawn 2 triangles on move
      for (let i = 0; i < 2; i++) spawnTriangle(pos.clientX, pos.clientY)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: true })

    // Spawn background ambient triangles periodically
    const ambientId = setInterval(() => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      spawnTriangle(x, y, true)
    }, 600)

    function spawnTriangle(x, y, ambient = false) {
      const size = ambient
        ? Math.random() * 12 + 4
        : Math.random() * 22 + 8
      const speed = ambient
        ? Math.random() * 0.4 + 0.1
        : Math.random() * 1.2 + 0.4
      triangles.current.push({
        x, y,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: ambient ? 0.25 : 0.7,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed - (ambient ? 0 : 0.3),
        decay: ambient ? 0.003 : 0.012,
        spread: ambient ? 0 : Math.random() * 0.5 + 0.5,
      })
    }

    function drawTriangle(t) {
      ctx.save()
      ctx.translate(t.x, t.y)
      ctx.rotate(t.angle)
      ctx.globalAlpha = t.alpha
      ctx.fillStyle = t.color
      ctx.shadowColor = t.color
      ctx.shadowBlur = 8
      ctx.beginPath()
      const s = t.size
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.866, s * 0.5)
      ctx.lineTo(-s * 0.866, s * 0.5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      triangles.current = triangles.current.filter(t => t.alpha > 0.01)
      for (const t of triangles.current) {
        t.x += t.vx
        t.y += t.vy
        t.angle += t.rotSpeed
        t.alpha -= t.decay
        t.size += t.spread * 0.05
        drawTriangle(t)
      }

      animId.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      clearInterval(ambientId)
      if (animId.current) cancelAnimationFrame(animId.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: dark ? 0.35 : 0.18 }}
    />
  )
}
