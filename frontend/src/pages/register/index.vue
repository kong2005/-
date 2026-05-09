<template>
  <view class="register-page">
    <!-- 背景装饰 -->
    <view class="bg-decor">
      <image
        class="bg-img"
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/mobilewallpapers/cHJpdmF0ZS9sci91748499161072-9712WI4ZGMuanBn.jpg"
        mode="aspectFill"
      />
      <view class="bg-overlay" />
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-scroll" scroll-y>
      <view class="content-wrap">
        <!-- 顶部印章标题 -->
        <view class="header-area">
          <view class="seal-wrap">
            <view class="seal-outer">
              <text class="seal-char">诗</text>
            </view>
          </view>
          <text class="main-title">诗乐共生·大唐浪漫</text>
          <view class="gold-line" />
          <text class="sub-title">AI辅助教学 · 李凭箜篌引</text>
        </view>

        <!-- 表单卡片 -->
        <view class="form-card">
          <!-- Tab切换 -->
          <view class="tab-row">
            <view
              class="tab-item"
              :class="{ 'tab-active': mode === 'login' }"
              @click="switchMode('login')"
            >
              <text class="tab-text">登录</text>
            </view>
            <view class="tab-divider" />
            <view
              class="tab-item"
              :class="{ 'tab-active': mode === 'register' }"
              @click="switchMode('register')"
            >
              <text class="tab-text">注册</text>
            </view>
          </view>

          <view class="tab-indicator-wrap">
            <view class="tab-indicator" :class="mode === 'register' ? 'ind-right' : 'ind-left'" />
          </view>

          <!-- 表单区域 -->
          <view class="form-body">
            <!-- 用户名 -->
            <view class="field-wrap">
              <text class="field-label">用户名</text>
              <view class="input-box" :class="{ 'input-focus': focusField === 'username', 'input-error': !!errors.username }">
                <text class="input-icon">👤</text>
                <input
                  class="field-input"
                  type="text"
                  v-model="form.username"
                  placeholder="请输入用户名"
                  placeholder-style="color:rgba(176,168,152,0.8);font-size:28rpx;"
                  :maxlength="20"
                  @focus="focusField = 'username'"
                  @blur="focusField = ''; validateUsername()"
                  @input="onUsernameInput"
                />
              </view>
              <text v-if="errors.username" class="error-tip">{{ errors.username }}</text>
            </view>

            <!-- 密码 -->
            <view class="field-wrap">
              <text class="field-label">密码</text>
              <view class="input-box" :class="{ 'input-focus': focusField === 'password', 'input-error': !!errors.password }">
                <text class="input-icon">🔒</text>
                <input
                  class="field-input"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="请输入密码"
                  placeholder-style="color:rgba(176,168,152,0.8);font-size:28rpx;"
                  :maxlength="32"
                  @focus="focusField = 'password'"
                  @blur="focusField = ''; validatePassword()"
                  @input="onPasswordInput"
                />
                <text class="eye-icon" @click="showPassword = !showPassword">
                  {{ showPassword ? '👁' : '🙈' }}
                </text>
              </view>
              <text v-if="errors.password" class="error-tip">{{ errors.password }}</text>
            </view>

            <!-- 确认密码（仅注册） -->
            <view v-if="mode === 'register'" class="field-wrap">
              <text class="field-label">确认密码</text>
              <view class="input-box" :class="{ 'input-focus': focusField === 'confirm', 'input-error': !!errors.confirm }">
                <text class="input-icon">🔑</text>
                <input
                  class="field-input"
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="form.confirm"
                  placeholder="再次输入密码"
                  placeholder-style="color:rgba(176,168,152,0.8);font-size:28rpx;"
                  :maxlength="32"
                  @focus="focusField = 'confirm'"
                  @blur="focusField = ''"
                  @input="onConfirmInput"
                />
                <text class="eye-icon" @click="showConfirm = !showConfirm">
                  {{ showConfirm ? '👁' : '🙈' }}
                </text>
              </view>
              <text v-if="errors.confirm" class="error-tip">{{ errors.confirm }}</text>
            </view>

            <!-- 错误全局提示 -->
            <view v-if="globalError" class="global-error">
              <text class="global-error-text">⚠ {{ globalError }}</text>
            </view>

            <!-- 提交按钮 -->
            <view
              class="submit-btn"
              :class="{ 'btn-disabled': loading }"
              @click="handleSubmit"
            >
              <view v-if="loading" class="loading-wrap">
                <view class="ldot" />
                <view class="ldot" style="animation-delay:0.2s;" />
                <view class="ldot" style="animation-delay:0.4s;" />
              </view>
              <text v-else class="submit-text">{{ mode === 'login' ? '踏入诗乐殿堂' : '开启学习之旅' }}</text>
            </view>

            <!-- 切换提示 -->
            <view class="switch-tip">
              <text class="switch-text">
                {{ mode === 'login' ? '还没有账号？' : '已有账号？' }}
              </text>
              <text class="switch-link" @click="switchMode(mode === 'login' ? 'register' : 'login')">
                {{ mode === 'login' ? '立即注册' : '去登录' }}
              </text>
            </view>
          </view>
        </view>

        <!-- 底部装饰文字 -->
        <view class="footer-quote">
          <text class="quote-text">「昆山玉碎凤凰叫，芙蓉泣露香兰笑」</text>
          <text class="quote-author">— 李贺《李凭箜篌引》</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { register, login, getCurrentUser } from '@/utils/api.js'

export default {
  name: 'RegisterPage',
  data() {
    return {
      mode: 'login',
      form: { username: '', password: '', confirm: '' },
      errors: { username: '', password: '', confirm: '' },
      globalError: '',
      focusField: '',
      showPassword: false,
      showConfirm: false,
      loading: false
    }
  },
  onLoad() {
    const user = getCurrentUser()
    if (user) {
      uni.redirectTo({ url: '/pages/lesson/index' })
    }
  },
  methods: {
    switchMode(mode) {
      this.mode = mode
      this.form = { username: '', password: '', confirm: '' }
      this.errors = { username: '', password: '', confirm: '' }
      this.globalError = ''
    },

    onUsernameInput(e) {
      this.form.username = e.detail.value
      this.errors.username = ''
      this.globalError = ''
    },

    onPasswordInput(e) {
      this.form.password = e.detail.value
      this.errors.password = ''
      this.globalError = ''
    },

    onConfirmInput(e) {
      this.form.confirm = e.detail.value
      this.errors.confirm = ''
    },

    validateUsername() {
      if (!this.form.username.trim()) {
        this.errors.username = '用户名不能为空'
        return false
      }
      if (this.form.username.length < 2) {
        this.errors.username = '用户名至少2个字符'
        return false
      }
      this.errors.username = ''
      return true
    },

    validatePassword() {
      if (!this.form.password) {
        this.errors.password = '密码不能为空'
        return false
      }
      if (this.form.password.length < 6) {
        this.errors.password = '密码至少6位'
        return false
      }
      this.errors.password = ''
      return true
    },

    validateConfirm() {
      if (this.mode !== 'register') return true
      if (this.form.password !== this.form.confirm) {
        this.errors.confirm = '两次密码输入不一致'
        return false
      }
      this.errors.confirm = ''
      return true
    },

    async handleSubmit() {
      if (this.loading) return
      this.globalError = ''

      const uValid = this.validateUsername()
      const pValid = this.validatePassword()
      const cValid = this.validateConfirm()
      if (!uValid || !pValid || !cValid) return

      this.loading = true
      try {
        if (this.mode === 'login') {
          await this.doLogin()
        } else {
          await this.doRegister()
        }
      } finally {
        this.loading = false
      }
    },

    async doLogin() {
      try {
        const res = await login({ username: this.form.username.trim(), password: this.form.password })
        if (res && res.success) {
          uni.showToast({ title: '登录成功，欢迎回来', icon: 'success', duration: 1500 })
          setTimeout(() => uni.redirectTo({ url: '/pages/lesson/index' }), 1600)
        } else {
          this.globalError = res?.message || '登录失败，请检查用户名或密码'
        }
      } catch (e) {
        this.globalError = '网络异常，请稍后重试'
      }
    },

    async doRegister() {
      try {
        const res = await register({ username: this.form.username.trim(), password: this.form.password })
        if (res && res.success) {
          uni.showToast({ title: '注册成功，已自动登录', icon: 'success', duration: 1500 })
          setTimeout(() => uni.redirectTo({ url: '/pages/lesson/index' }), 1600)
        } else {
          this.globalError = res?.message || '注册失败，用户名可能已存在'
        }
      } catch (e) {
        this.globalError = '网络异常，请稍后重试'
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  position: relative;
}

/* 背景 */
.bg-decor {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  display: block;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(13,27,42,0.82) 0%, rgba(26,26,46,0.88) 50%, rgba(44,24,16,0.85) 100%);
}

/* 滚动区 */
.main-scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.content-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx 60rpx;
}

/* 顶部标题区 */
.header-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.seal-wrap {
  margin-bottom: 24rpx;
}

.seal-outer {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid #C9A84C;
  background: rgba(201,168,76,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24rpx rgba(201,168,76,0.35), inset 0 0 16rpx rgba(201,168,76,0.1);
}

.seal-char {
  font-size: 44rpx;
  color: #C9A84C;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
}

.main-title {
  font-size: 40rpx;
  color: #C9A84C;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 6rpx;
  text-shadow: 0 0 20rpx rgba(201,168,76,0.4);
}

.gold-line {
  width: 80rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #C9A84C, transparent);
  margin: 16rpx auto;
}

.sub-title {
  font-size: 24rpx;
  color: rgba(232,213,163,0.7);
  letter-spacing: 3rpx;
  font-family: "STKaiti", serif;
}

/* 表单卡片 */
.form-card {
  width: 100%;
  max-width: 660rpx;
  background: rgba(248,243,232,0.95);
  border-radius: 32rpx;
  border: 1rpx solid rgba(201,168,76,0.3);
  box-shadow: 0 16rpx 64rpx rgba(13,27,42,0.5);
  overflow: hidden;
}

/* Tab */
.tab-row {
  display: flex;
  align-items: center;
  background: rgba(26,26,46,0.06);
  border-bottom: 1rpx solid rgba(201,168,76,0.15);
}

.tab-item {
  flex: 1;
  padding: 32rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-divider {
  width: 1rpx;
  height: 36rpx;
  background: rgba(201,168,76,0.3);
}

.tab-text {
  font-size: 30rpx;
  color: #8B8B8B;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
  transition: color 0.3s;
}

.tab-active .tab-text {
  color: #C9A84C;
}

.tab-indicator-wrap {
  height: 4rpx;
  background: rgba(201,168,76,0.1);
  position: relative;
}

.tab-indicator {
  position: absolute;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #C9A84C, transparent);
  transition: left 0.3s ease;
}

.ind-left { left: 0; }
.ind-right { left: 50%; }

/* 表单主体 */
.form-body {
  padding: 40rpx 40rpx 36rpx;
}

.field-wrap {
  margin-bottom: 28rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  color: #2C5F6E;
  margin-bottom: 12rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.input-box {
  background: rgba(255,255,255,0.92);
  border: 1.5rpx solid #E8D5A3;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-focus {
  border-color: #C9A84C;
  box-shadow: 0 0 0 4rpx rgba(201,168,76,0.15);
}

.input-error {
  border-color: #C0392B;
  box-shadow: 0 0 0 4rpx rgba(192,57,43,0.1);
}

.input-icon {
  font-size: 30rpx;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A2E;
  font-family: "STKaiti", "KaiTi", serif;
  background: transparent;
  border: none;
  min-height: 48rpx;
  line-height: 48rpx;
}

.eye-icon {
  font-size: 28rpx;
  flex-shrink: 0;
  color: #8B8B8B;
  padding-left: 8rpx;
}

.error-tip {
  display: block;
  font-size: 22rpx;
  color: #C0392B;
  margin-top: 8rpx;
  padding-left: 4rpx;
}

/* 全局错误 */
.global-error {
  background: rgba(192,57,43,0.08);
  border: 1rpx solid rgba(192,57,43,0.3);
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 24rpx;
}

.global-error-text {
  font-size: 26rpx;
  color: #C0392B;
  line-height: 1.6;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #C9A84C 0%, #A07830 100%);
  border-radius: 9999rpx;
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 24rpx rgba(201,168,76,0.4);
  margin-top: 8rpx;
  margin-bottom: 28rpx;
}

.submit-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(201,168,76,0.2);
}

.btn-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.submit-text {
  font-size: 30rpx;
  color: #fff;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
  letter-spacing: 4rpx;
}

/* loading点 */
.loading-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.ldot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #fff;
  animation: ldot-bounce 1.2s infinite ease-in-out;
}

@keyframes ldot-bounce {
  0%, 80%, 100% { transform: scale(0.55); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 切换提示 */
.switch-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.switch-text {
  font-size: 26rpx;
  color: #8B8B8B;
  font-family: "STKaiti", serif;
}

.switch-link {
  font-size: 26rpx;
  color: #C9A84C;
  font-family: "STKaiti", serif;
  font-weight: bold;
  text-decoration: underline;
  text-decoration-color: rgba(201,168,76,0.4);
}

/* 底部引用 */
.footer-quote {
  margin-top: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.quote-text {
  font-size: 24rpx;
  color: rgba(232,213,163,0.65);
  font-family: "STKaiti", serif;
  font-style: italic;
  letter-spacing: 2rpx;
  text-align: center;
}

.quote-author {
  font-size: 20rpx;
  color: rgba(201,168,76,0.5);
  letter-spacing: 2rpx;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>