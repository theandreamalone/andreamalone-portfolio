# Voice + Glow — Integration into AdaptiveHome

Four files, no new dependencies. Drop-in paths:

```
src/lib/voice/useMicLevel.ts
src/lib/voice/useVoiceInput.ts
src/lib/voice/useSpeechOutput.ts
src/components/VoiceGlow.tsx
src/components/VoiceGlow.css
src/components/VoiceUnavailable.tsx
src/components/VoiceUnavailable.css
```

Add `import { VoiceUnavailable } from '../components/VoiceUnavailable';`
to the AdaptiveHome imports.

## How the pieces fit

| State | Trigger | Glow source |
|---|---|---|
| `user-speaking` | Mic button pressed → SpeechRecognition active | Real mic amplitude (`useMicLevel`) |
| `ai-speaking` | Router answered → resolved block text spoken via TTS | Synthetic cadence (`useSpeechOutput.level`) |
| `idle` | Neither | Glow fades out |

Priority when both could apply: AI speaking wins (you cancel TTS if the
user interrupts by pressing the mic — interruption handling matches your
Voice-Ready interaction patterns).

## Wiring in AdaptiveHome.tsx

```tsx
import { VoiceGlow, type VoiceMode } from '../components/VoiceGlow';
import { useVoiceInput } from '../lib/voice/useVoiceInput';
import { useMicLevel } from '../lib/voice/useMicLevel';
import { useSpeechOutput } from '../lib/voice/useSpeechOutput';

// inside the component:
const mic = useMicLevel();
const tts = useSpeechOutput();

const voice = useVoiceInput((finalText) => {
  mic.stop();
  setQuestion(finalText);        // your existing input state
  handleSubmit(finalText);       // your existing router call
});

const startVoice = () => {
  tts.cancel();                  // user interrupts AI speech
  voice.start();
  mic.start();                   // separate stream for the analyser
};

const stopVoice = () => {
  voice.stop();
  mic.stop();
};

const mode: VoiceMode = tts.speaking
  ? 'ai-speaking'
  : voice.listening
    ? 'user-speaking'
    : 'idle';

const level = tts.speaking ? tts.level : mic.level;
```

Wrap your input (or an orb element, if you add one) with the glow:

```tsx
<VoiceGlow mode={mode} level={level}>
  <div className="adaptive-input-shell">
    <input
      value={voice.interim || question}
      onChange={(e) => setQuestion(e.target.value)}
      /* ...existing props... */
    />
    {voice.supported ? (
      <button
        type="button"
        onClick={voice.listening ? stopVoice : startVoice}
        aria-pressed={voice.listening}
        aria-label={voice.listening ? 'Stop listening' : 'Ask by voice'}
      >
        {voice.listening ? '◼' : '🎤'}
      </button>
    ) : (
      <VoiceUnavailable />
    )}
  </div>
</VoiceGlow>
```

Speaking the answer (after the router responds and blocks resolve):

```tsx
// After blockRegistry resolves the router's record IDs to prose,
// speak the first block's plain text. Pre-authored MDX only —
// consistent with Option A; TTS is a render mode, not generation.
tts.speak(resolvedBlockPlainText);
```

Extracting plain text from a resolved MDX block: simplest reliable path
is rendering the block into a hidden ref and reading `textContent`, or
storing a `plainText` field alongside each entry when `blockRegistry.ts`
is generated at build time. The second is cleaner — one extra field in
the registry, zero runtime DOM work.

## Constraints to know

- **SpeechRecognition support:** Chrome/Edge/Safari yes, Firefox no.
  `voice.supported === false` renders `<VoiceUnavailable />` — a muted
  mic with a slash and a plain-language tooltip — instead of hiding the
  feature. Text input remains the baseline.
- **TTS voice:** preference-ranked selection in `useSpeechOutput.ts`
  (`VOICE_PREFERENCES` array, edit to taste). Order: Google US English
  (Chrome) → Microsoft Aria/Jenny neural (Edge) → Samantha (Safari) →
  Zira (Windows offline) → any en-US → platform default. All are
  device-installed voices — no network call, no per-visitor consistency
  guarantee. Identical voice across all visitors requires API TTS.
- **Two mic permissions paths:** SpeechRecognition and getUserMedia each
  request the mic; browsers coalesce this into one prompt in practice.
  If mic-level permission is denied but recognition works, glow shows a
  fixed listening state (mode still `user-speaking`, level 0).
- **AI glow is synthetic** because browser TTS has no analysable stream.
  If you later move to API TTS (ElevenLabs etc.), play through an
  `<audio>` element + the AnalyserNode pattern from `useMicLevel`, and
  feed that level to VoiceGlow instead. The component is agnostic.
- **HTTPS required** for both mic APIs — fine on GitHub Pages and
  localhost.
- **Colors are placeholders** in VoiceGlow.css (`--vg-color`). Swap for
  your accent tokens; keep two distinct hues so user vs. AI state never
  relies on motion alone.

## Case-study angle (worth capturing while you build)

This is a live demonstration of your Voice-Ready skill set on your own
product: voice input, speaking-state indication, interruption handling,
reduced-motion and screen-reader treatment of AI state. Screenshot the
states as you go — user-speaking, AI-speaking, idle, reduced-motion —
they're artifacts for the ai-portfolio-orchestrator case study.
