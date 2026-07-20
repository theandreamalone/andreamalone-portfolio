// Web Speech API (SpeechRecognition) — not part of TypeScript's lib.dom.d.ts.
// Minimal ambient types covering what useVoiceInput.ts actually uses.
// Not attached to the global Window interface on purpose: callers read
// SpeechRecognition off `window` via an `any` cast (see getRecognition()),
// since it's vendor-prefixed (webkitSpeechRecognition) and unsupported in
// some browsers (Firefox) — `supported` is checked at runtime, not by types.

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
