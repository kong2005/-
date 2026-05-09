Page({
  data: {
    currentUser: null,
    animVisible: false,
    isMonologuePlaying: false
  },
  onShow() {
    this.setData({ currentUser: this.getCurrentUser() });
  },
  onLoad() {
    this.setData({ currentUser: this.getCurrentUser() });
    setTimeout(() => { this.setData({ animVisible: true }); }, 100);

    // 初始化独白音频
    this.monologueCtx = wx.createInnerAudioContext();
    // 使用经测试有效的 CDN 资源作为兜底，避免 404
    this.monologueCtx.src = '/backend/static/audio/dubai.mp3'; 
    this.monologueCtx.onEnded(() => {
      this.setData({ isMonologuePlaying: false });
    });
    this.monologueCtx.onError((res) => { 
      console.error('独白播放错误', res); 
      // 修复：先记录状态再清除，避免判断失效 
      const wasPlaying = this.data.isMonologuePlaying; 
      this.setData({ isMonologuePlaying: false }); 
      if (wasPlaying) { 
        // 即使音频失败，也模拟5秒气泡显示 
        this.setData({ isMonologuePlaying: true }); 
        setTimeout(() => { 
          this.setData({ isMonologuePlaying: false }); 
        }, 5000); 
      } 
    });
  },
  onUnload() {
    if (this.monologueCtx) {
      this.monologueCtx.destroy();
    }
  },
  playMonologue() {
    if (this.data.isMonologuePlaying) {
      this.monologueCtx.stop();
      this.setData({ isMonologuePlaying: false });
      return;
    }

    this.setData({ isMonologuePlaying: true });
    this.monologueCtx.play();
    
    wx.showToast({
      title: '李贺正在诉说...',
      icon: 'none',
      duration: 2000
    });
  },
  getCurrentUser() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    return userInfo || null;
  },
  goLesson() {
    wx.switchTab({ url: '/pages/lesson/index' });
  },
  goAIDialog() {
    wx.switchTab({ url: '/pages/ai/index' });
  },
  goInstrument() {
    wx.switchTab({ url: '/pages/lesson/index' });
  },
  goLogin() {
    wx.navigateTo({ url: '/pages/register/index' });
  },
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储中的用户信息
          wx.removeStorageSync('userInfo');
          this.setData({ currentUser: null });
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  }
});
