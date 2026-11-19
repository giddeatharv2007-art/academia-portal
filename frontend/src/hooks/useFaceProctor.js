/**
 * useFaceProctor
 * ──────────────
 * Loads face-api.js TinyFaceDetector model once (cached globally),
 * then polls the given video element every `interval` ms and returns
 * the detected face count (0 = no face, 1 = OK, 2+ = multiple faces).
 *
 * Usage:
 *   const { faceCount, modelReady } = useFaceProctor(videoRef, canvasRef, running)
 *
 *  videoRef   – ref to a <video> element
 *  canvasRef  – ref to a hidden <canvas> (any size, used internally)
 *  running    – boolean; set false to pause polling
 *  interval   – polling interval in ms (default 1500)
 *  onCount    – optional callback(count) fired on each detection result
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'

const MODEL_URL = '/models'
let modelLoadPromise = null   // singleton — load only once per page

function ensureModels() {
  if (!modelLoadPromise) {
    modelLoadPromise = faceapi.nets.tinyFaceDetector
      .loadFromUri(MODEL_URL)
      .catch(err => {
        modelLoadPromise = null   // allow retry on next call
        throw err
      })
  }
  return modelLoadPromise
}

export default function useFaceProctor(
  videoRef,
  canvasRef,
  running = true,
  interval = 1500,
  onCount = null
) {
  const [modelReady, setModelReady] = useState(false)
  const [faceCount,  setFaceCount]  = useState(null)   // null = not yet measured
  const timerRef = useRef(null)

  /* load model once */
  useEffect(() => {
    ensureModels()
      .then(() => setModelReady(true))
      .catch(() => setModelReady(false))
  }, [])

  /* detect faces */
  const detect = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || video.paused) return

    try {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.35 })
      )
      const count = detections.length
      setFaceCount(count)
      onCount && onCount(count)
    } catch {
      // silently ignore single-frame errors
    }
  }, [videoRef, onCount])

  /* start / stop polling */
  useEffect(() => {
    if (!modelReady || !running) {
      clearInterval(timerRef.current)
      return
    }
    detect()  // immediate first check
    timerRef.current = setInterval(detect, interval)
    return () => clearInterval(timerRef.current)
  }, [modelReady, running, detect, interval])

  return { faceCount, modelReady }
}
