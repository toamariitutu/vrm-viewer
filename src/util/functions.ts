export function isMobileDevice() {
  const ua = navigator.userAgent.toLowerCase()
  if (
    ua.indexOf('iphone') > -1 ||
    ua.indexOf('ipad') > -1 ||
    (ua.indexOf('macintosh') > -1 && 'ontouchend' in document) ||
    ua.indexOf('android') > -1
  ) {
    return true
  }
  return false
}
