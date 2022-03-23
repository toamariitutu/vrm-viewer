/**
 * uaを見てモバイルデバイスを判定する
 */
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

/**
 * UUID (Ver4)を生成する
 */
export const generateUuid = function() {
  var chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('')
  for (var i = 0, len = chars.length; i < len; i++) {
    switch (chars[i]) {
      case 'x':
        chars[i] = Math.floor(Math.random() * 16).toString(16)
        break
      case 'y':
        chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16)
        break
    }
  }
  return chars.join('')
}
