/**
 * 音效管理工具 - 控制乐器音效与AI吟诵播放
 * 兼容 UniApp H5 / 微信小程序双端
 */

const currentPlayers = {}
const playingState = {}

// 主音效资源映射（使用公共CDN，确保小程序可访问）
const INSTRUMENT_SOUNDS = {
  konghou: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/konghou.mp3',
  zheng: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/guzheng.mp3',
  ruanxian: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/ruan.mp3',
  recitation: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/konghou.mp3'
}

// 备用音效（主CDN失败时降级）
const FALLBACK_SOUNDS = {
  konghou: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3',
  zheng: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/guzheng.mp3',
  ruanxian: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/ruan.mp3',
  recitation: 'https://hpi-hub.tos-cn-beijing.volces.com/haisnap/audio/konghou.mp3'
}

function isH5() {
  return typeof window !== 'undefined' && typeof window.Audio === 'function'
}

function isWeixin() {
  return typeof uni !== 'undefined' && typeof wx !== 'undefined'
}

/**
 * 播放乐器音效
 * @param {string} instrument - 乐器key
 * @param {Function} callback - callback(success: boolean)
 */
export function playInstrumentSound(instrument, callback) {
  const soundUrl = INSTRUMENT_SOUNDS[instrument]
  if (!soundUrl) {
    console.error(`[audio] 未找到乐器 ${instrument} 的音效`)
    if (callback) callback(false)
    return
  }
  stopInstrumentSound(instrument)
  playingState[instrument] = true

  if (isH5()) {
    _playH5(instrument, soundUrl, false, callback)
  } else {
    _playMiniProgram(instrument, soundUrl, false, callback)
  }
}

function _playH5(instrument, url, isFallback, callback) {
  try {
    const audio = new window.Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = 0.85
    audio.preload = 'auto'
    audio.src = url
    currentPlayers[instrument] = { _h5Audio: audio, _isH5: true }

    audio.oncanplaythrough = () => {
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.then(() => {
          console.log(`[audio] H5 开始播放 ${instrument}`)
        }).catch(err => {
          console.warn(`[audio] H5 play() 被阻止:`, err)
          _handleH5PlayError(instrument, url, isFallback, callback, err)
        })
      }
    }

    audio.onended = () => {
      playingState[instrument] = false
      delete currentPlayers[instrument]
      if (callback) callback(true)
    }

    audio.onerror = (e) => {
      console.error(`[audio] H5 加载失败(${isFallback ? '备用' : '主'}):`, e)
      delete currentPlayers[instrument]
      if (!isFallback && FALLBACK_SOUNDS[instrument] && FALLBACK_SOUNDS[instrument] !== url) {
        _playH5(instrument, FALLBACK_SOUNDS[instrument], true, callback)
      } else {
        playingState[instrument] = false
        if (callback) callback(false)
      }
    }

    audio.load()
  } catch (e) {
    console.error('[audio] H5 Audio 创建异常:', e)
    if (!isFallback && FALLBACK_SOUNDS[instrument]) {
      _playH5(instrument, FALLBACK_SOUNDS[instrument], true, callback)
    } else {
      playingState[instrument] = false
      if (callback) callback(false)
    }
  }
}

function _handleH5PlayError(instrument, url, isFallback, callback, err) {
  if (err && err.name === 'NotAllowedError') {
    const audio = currentPlayers[instrument] && currentPlayers[instrument]._h5Audio
    if (audio) {
      try {
        audio.muted = true
        const mp = audio.play()
        if (mp && typeof mp.then === 'function') {
          mp.then(() => {
            audio.muted = false
            audio.volume = 0.85
          }).catch(() => {
            delete currentPlayers[instrument]
            playingState[instrument] = false
            if (callback) callback(false)
          })
        }
        return
      } catch (_) {}
    }
  }
  delete currentPlayers[instrument]
  if (!isFallback && FALLBACK_SOUNDS[instrument] && FALLBACK_SOUNDS[instrument] !== url) {
    _playH5(instrument, FALLBACK_SOUNDS[instrument], true, callback)
  } else {
    playingState[instrument] = false
    if (callback) callback(false)
  }
}

function _playMiniProgram(instrument, url, isFallback, callback) {
  try {
    const player = uni.createInnerAudioContext()
    player.obeyMuteSwitch = false
    player.volume = 0.85
    currentPlayers[instrument] = player

    player.onPlay(() => {
      console.log(`[audio] 小程序 开始播放 ${instrument}${isFallback ? '(备用)' : ''}`)
    })

    player.onEnded(() => {
      playingState[instrument] = false
      delete currentPlayers[instrument]
      if (callback) callback(true)
    })

    player.onError((err) => {
      console.error(`[audio] 小程序 播放失败(${isFallback ? '备用' : '主'}):`, JSON.stringify(err))
      try { player.destroy() } catch (_) {}
      delete currentPlayers[instrument]
      if (!isFallback && FALLBACK_SOUNDS[instrument] && FALLBACK_SOUNDS[instrument] !== url) {
        _playMiniProgram(instrument, FALLBACK_SOUNDS[instrument], true, callback)
      } else {
        playingState[instrument] = false
        if (callback) callback(false)
      }
    })

    player.src = url
    player.play()
  } catch (e) {
    console.error('[audio] 创建 InnerAudioContext 异常:', e)
    if (!isFallback && FALLBACK_SOUNDS[instrument] && FALLBACK_SOUNDS[instrument] !== url) {
      _playMiniProgram(instrument, FALLBACK_SOUNDS[instrument], true, callback)
    } else {
      playingState[instrument] = false
      if (callback) callback(false)
    }
  }
}

/**
 * 停止指定乐器音效
 * @param {string} instrument
 */
export function stopInstrumentSound(instrument) {
  playingState[instrument] = false
  const player = currentPlayers[instrument]
  if (!player) return
  try {
    if (player._isH5) {
      const audio = player._h5Audio
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.onended = null
        audio.onerror = null
        audio.oncanplaythrough = null
      }
    } else {
      player.stop()
      player.destroy()
    }
  } catch (e) {
    console.warn('[audio] 停止音效出错:', e)
  }
  delete currentPlayers[instrument]
}

/**
 * 停止所有音效
 */
export function stopAllSounds() {
  Object.keys(currentPlayers).forEach(k => stopInstrumentSound(k))
}

/**
 * 预加载音效（H5端）
 * @param {Array<string>} instruments
 */
export function preloadSounds(instruments) {
  if (!isH5()) return
  instruments.forEach(instrument => {
    const url = INSTRUMENT_SOUNDS[instrument]
    if (!url) return
    try {
      const a = new window.Audio()
      a.preload = 'auto'
      a.src = url
      a.load()
    } catch (_) {}
  })
}

/**
 * 获取音效URL
 * @param {string} instrument
 * @returns {string|null}
 */
export function getSoundUrl(instrument) {
  return INSTRUMENT_SOUNDS[instrument] || null
}

/**
 * 检查是否正在播放
 * @param {string} instrument
 * @returns {boolean}
 */
export function isPlaying(instrument) {
  return !!playingState[instrument]
}

/**
 * 播放AI吟诵音频
 * @param {Function} callback - callback(success: boolean)
 */
export function playRecitation(callback) {
  playInstrumentSound('recitation', callback)
}

/**
 * 停止AI吟诵
 */
export function stopRecitation() {
  stopInstrumentSound('recitation')
}

/**
 * 清理所有音频资源
 */
export function cleanup() {
  stopAllSounds()
  Object.keys(playingState).forEach(k => { delete playingState[k] })
}

if (typeof uni !== 'undefined') {
  try {
    uni.$on('pageUnload', () => { cleanup() })
  } catch (_) {}
}