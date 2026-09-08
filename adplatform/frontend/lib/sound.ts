// A short, synthesized two-tone chime via the real Web Audio API — no audio
// asset to ship/load, genuinely plays when called (not a no-op placeholder).
export function playNotificationChime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.15, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playTone(880, 0, 0.12);
    playTone(1175, 0.1, 0.16);

    setTimeout(() => ctx.close().catch(() => {}), 500);
  } catch {
    // Audio isn't available in every environment (e.g. autoplay policy
    // before any user gesture) — a missed chime isn't worth surfacing an error for.
  }
}
