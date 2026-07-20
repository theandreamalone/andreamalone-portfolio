import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useVoiceInput — Web Speech API (SpeechRecognition) wrapper.
 * Feeds the free-text question path: interim transcript for live display,
 * final transcript delivered via onFinal (send it to the router).
 *
 * Support reality (check before demoing): Chrome/Edge/Safari yes,
 * Firefox no. `supported === false` → hide the mic button, text input
 * remains the baseline. Static-baseline principle applies here too.
 */

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ??
    (window as any).webkitSpeechRecognition ??
    null
  );
}

export function useVoiceInput(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported] = useState(() => getRecognition() !== null);

  const recRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => {
    recRef.current?.stop();
    // state clears in onend
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor || recRef.current) return;

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false; // one question per activation

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim('');
        onFinalRef.current(finalText.trim());
      }
    };

    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
    };
    rec.onerror = () => rec.stop();

    recRef.current = rec;
    setListening(true);
    rec.start();
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, interim, start, stop };
}
