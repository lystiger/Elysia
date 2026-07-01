// No audio is wired up yet — these are call-site hooks so the moments that
// should eventually have sound (startup, a finished reply, a notification,
// voice activation) are already marked in the app flow. Fill in an Audio()
// call per hook when sound assets land.

export function playStartupChime() {
  // no-op — reserved for a startup chime
}

export function playResponseComplete() {
  // no-op — reserved for a "response finished" cue
}

export function playNotification() {
  // no-op — reserved for background/notification alerts
}

export function playVoiceActivation() {
  // no-op — reserved for voice-mode activation, once voice ships
}
