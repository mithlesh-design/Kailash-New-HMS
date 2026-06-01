// Ambient voice scribe. Dictation uses the browser's Web Speech API
// (feature-detected, graceful fallback). `toSOAP` turns a free-text/dictated
// note into a structured S/O/A/P note the doctor can refine.

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

export type Recognition = { stop: () => void }

// Starts continuous dictation; `onText` receives finalised chunks. Returns a
// handle to stop, or null if unsupported / failed to start.
export function startDictation(onText: (chunk: string) => void, onEnd: () => void): Recognition | null {
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null
  if (!SR) return null
  let rec: any
  try { rec = new SR() } catch { return null }
  rec.continuous = true
  rec.interimResults = false
  rec.lang = 'en-IN'
  rec.onresult = (e: any) => {
    let text = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) text += e.results[i][0].transcript
    }
    if (text.trim()) onText(text.trim())
  }
  rec.onend = onEnd
  rec.onerror = onEnd
  try { rec.start() } catch { return null }
  return { stop: () => { try { rec.stop() } catch { /* ignore */ } } }
}

export function toSOAP(text: string, opts: { diagnosis?: string; vitals?: string }): string {
  const t = text.trim()
  return [
    `S (Subjective): ${t || '—'}`,
    `O (Objective): ${opts.vitals ? opts.vitals : 'Examination findings / vitals — to complete.'}`,
    `A (Assessment): ${opts.diagnosis?.trim() || 'Working diagnosis — to complete.'}`,
    `P (Plan): Investigations / medications as ordered above; follow-up and red-flag advice given.`,
  ].join('\n')
}
