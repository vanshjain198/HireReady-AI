import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Reusable hook for managing the Web SpeechSynthesis API (text-to-speech).
 * Includes Chrome GC protection, resume check, and safety fallback timer.
 *
 * @param {Object} options
 * @param {Function} options.onSpeechEnd - Called when the AI finishes speaking (e.g., to restart user's mic)
 * @returns {{ isAiSpeaking, aiSubtitle, speakText, cancelSpeech, skipSpeech }}
 */
export const useSpeechSynthesis = ({ onSpeechEnd } = {}) => {
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [aiSubtitle, setAiSubtitle] = useState('')
  const utteranceRef = useRef(null)
  const safetyTimeoutRef = useRef(null)
  const onSpeechEndRef = useRef(onSpeechEnd)

  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd
  }, [onSpeechEnd])

  const finishSpeaking = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
      safetyTimeoutRef.current = null
    }
    setIsAiSpeaking(false)
    onSpeechEndRef.current?.()
  }, [])

  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      finishSpeaking()
      return
    }

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
    }

    try {
      window.speechSynthesis.cancel()
    } catch (e) {}

    setIsAiSpeaking(true)
    setAiSubtitle(text)

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance // Prevent GC in Chrome

    utterance.onend = () => {
      finishSpeaking()
    }

    utterance.onerror = (e) => {
      console.warn('Speech synthesis ended or error:', e)
      finishSpeaking()
    }

    // Chrome bug workaround: resume if paused
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    } catch (err) {}

    window.speechSynthesis.speak(utterance)

    // Safety fallback: in case browser doesn't fire onend
    const wordCount = (text || '').trim().split(/\s+/).length
    const expectedDurationMs = Math.max(3500, wordCount * 380 + 2000)
    safetyTimeoutRef.current = setTimeout(() => {
      finishSpeaking()
    }, expectedDurationMs)
  }, [finishSpeaking])

  const cancelSpeech = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
      safetyTimeoutRef.current = null
    }
    try {
      window.speechSynthesis?.cancel()
    } catch (e) {}
    setIsAiSpeaking(false)
    setAiSubtitle('')
  }, [])

  return { isAiSpeaking, aiSubtitle, setAiSubtitle, speakText, cancelSpeech, skipSpeech: finishSpeaking }
}
