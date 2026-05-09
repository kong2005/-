Page({
  data: {
    username: '',
    password: ''
  },
  onLoad() {
    console.log('注册页加载');
  },
  goBack() {
    wx.navigateBack();
  },
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },
  handleLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }
    // 模拟登录并存储用户信息
    const userInfo = {
      username: username,
      isLoggedIn: true
    };
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },
  handleRegister() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }
    // 模拟注册并存储用户信息
    const userInfo = {
      username: username,
      isLoggedIn: true
    };
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },
  quickLogin() {
    // 模拟游客登录并存储用户信息
    const userInfo = {
      username: '游客',
      isLoggedIn: true
    };
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  }
});