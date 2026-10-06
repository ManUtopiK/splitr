// Permissions delegated to embedded pages. Cross-origin iframes are denied any
// feature not listed in `allow`; `*` delegates to whatever origin the frame
// navigates to (a bare `camera` would only cover the initial src origin).
export const IFRAME_ALLOW = [
  'fullscreen',
  'camera *',
  'microphone *',
  'display-capture *',
  'autoplay *',
  'clipboard-read *',
  'clipboard-write *',
  'geolocation *',
  'screen-wake-lock *',
  'web-share *',
].join('; ')
