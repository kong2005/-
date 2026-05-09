App({
  onLaunch() {
    console.log('诗乐共生·大唐浪漫 App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    userInfo: null,
    token: '',
    baseUrl: 'http://127.0.0.1:3000',
    audioSources: {
        konghou: '/api/get-audio/konghou.mp3',
        zheng: '/api/get-audio/guzheng.mp3',
        ruanxian: '/api/get-audio/ruan.mp3'
      }
  }
})