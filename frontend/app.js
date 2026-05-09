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
    baseUrl: ''
  }
})