<template>
  <view class="index-page">
    <!-- 背景层 -->
    <view class="bg-layer">
      <image
        class="bg-img"
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/mobilewallpapers/cHJpdmF0ZS9sci91748499179271-5318NTlfMi5qcGc.jpg"
        mode="aspectFill"
      />
      <view class="bg-mask" />
      <!-- 星光粒子装饰 -->
      <view class="star s1" />
      <view class="star s2" />
      <view class="star s3" />
      <view class="star s4" />
      <view class="star s5" />
    </view>

    <!-- 主内容区 -->
    <scroll-view scroll-y class="main-scroll">
      <view class="content-wrap">

        <!-- 顶部印章区 -->
        <view class="top-badge-row">
          <view class="badge-item">
            <text class="badge-text">微课</text>
          </view>
          <view class="badge-divider" />
          <view class="badge-item">
            <text class="badge-text">AI辅助教学</text>
          </view>
        </view>

        <!-- 封面主标题区 -->
        <view class="cover-title-area">
          <!-- 装饰线 -->
          <view class="deco-line-top">
            <view class="deco-dot" />
            <view class="deco-line" />
            <view class="deco-dot" />
          </view>

          <view class="title-seal-wrap">
            <view class="outer-ring">
              <view class="inner-ring">
                <text class="seal-main">箜</text>
              </view>
            </view>
          </view>

          <text class="main-title-full">诗乐共生·大唐浪漫</text>

          <view class="gold-line-wrap">
            <view class="gold-line-full" />
          </view>

          <text class="sub-title">解析李贺《李凭箜篌引》</text>

          <!-- 装饰线 -->
          <view class="deco-line-bottom">
            <view class="deco-dot" />
            <view class="deco-line" />
            <view class="deco-dot" />
          </view>
        </view>

        <!-- 乐器装饰图 -->
        <view class="instrument-deco">
          <image
            class="inst-img"
            src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_14/1757359537504-8977.jpg"
            mode="aspectFit"
          />
          <view class="inst-glow" />
        </view>

        <!-- 诗句引导语 -->
        <view class="poem-preview">
          <view class="poem-inner">
            <text class="poem-line">昆山玉碎凤凰叫</text>
            <view class="poem-sep" />
            <text class="poem-line">芙蓉泣露香兰笑</text>
          </view>
        </view>

        <!-- 功能入口卡片区 -->
        <view class="cards-section">

          <!-- 开始微课 -->
          <view class="func-card card-primary" @click="goLesson">
            <view class="card-icon-wrap card-icon-gold">
              <image
                class="card-icon-img"
                src="https://img.icons8.com/fluency/96/musical-notes.png"
                mode="aspectFit"
              />
            </view>
            <view class="card-info">
              <text class="card-title">进入微课</text>
              <text class="card-desc">诗乐解构 · 乐器科普 · 艺术成就</text>
            </view>
            <view class="card-arrow">
              <text class="arrow-text">❯</text>
            </view>
          </view>

          <!-- AI对话 -->
          <view class="func-card card-ai" @click="goAIDialog">
            <view class="card-icon-wrap card-icon-red">
              <image
                class="card-icon-img"
                src="https://img.icons8.com/fluency/96/chat.png"
                mode="aspectFit"
              />
            </view>
            <view class="card-info">
              <text class="card-title">双时空对话</text>
              <text class="card-desc">与AI李贺跨越千年对话</text>
            </view>
            <view class="card-arrow">
              <text class="arrow-text">❯</text>
            </view>
          </view>

          <!-- 乐器体验 -->
          <view class="func-card card-inst" @click="goInstrument">
            <view class="card-icon-wrap card-icon-cyan">
              <image
                class="card-icon-img"
                src="https://img.icons8.com/fluency/96/harp.png"
                mode="aspectFit"
              />
            </view>
            <view class="card-info">
              <text class="card-title">乐器聆听</text>
              <text class="card-desc">箜篌 · 筝 · 阮咸 · 千年回响</text>
            </view>
            <view class="card-arrow">
              <text class="arrow-text">❯</text>
            </view>
          </view>

        </view>

        <!-- 用户区域 -->
        <view class="user-section">
          <view v-if="!currentUser" class="user-unlogged" @click="goLogin">
            <image
              class="user-avatar-icon"
              src="https://img.icons8.com/fluency/96/user-male-circle.png"
              mode="aspectFit"
            />
            <view class="user-text-wrap">
              <text class="user-login-hint">登录以解锁完整AI对话</text>
              <text class="user-login-sub">点击注册 / 登录</text>
            </view>
            <view class="login-btn">
              <text class="login-btn-text">登录</text>
            </view>
          </view>

          <view v-else class="user-logged">
            <view class="user-avatar-wrap">
              <text class="user-emoji">🎓</text>
            </view>
            <view class="user-text-wrap">
              <text class="user-welcome">欢迎回来，{{ currentUser.username }}</text>
              <text class="user-sub">诗乐共生 · 大唐浪漫</text>
            </view>
            <view class="logout-btn" @click="handleLogout">
              <text class="logout-text">退出</text>
            </view>
          </view>
        </view>

        <!-- 底部信息 -->
        <view class="footer-info">
          <view class="footer-divider" />
          <view class="footer-poem">
            <text class="footer-poem-text">「诗乐共生，是大唐的浪漫」</text>
          </view>
        </view>

        <view style="height: 60rpx;" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getCurrentUser, logout } from '@/utils/api.js'

export default {
  name: 'IndexPage',
  data() {
    return {
      currentUser: null,
      animVisible: false
    }
  },
  onShow() {
    this.currentUser = getCurrentUser()
  },
  onLoad() {
    this.currentUser = getCurrentUser()
    setTimeout(() => { this.animVisible = true }, 100)
  },
  methods: {
    goLesson() {
      uni.navigateTo({ url: '/pages/lesson/index?tab=lesson&sectionIndex=0' })
    },
    goAIDialog() {
      uni.navigateTo({ url: '/pages/lesson/index?tab=ai&sectionIndex=1' })
    },
    goInstrument() {
      uni.navigateTo({ url: '/pages/lesson/index?tab=instrument&sectionIndex=4' })
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/register/index' })
    },
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmText: '退出',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            logout()
            this.currentUser = null
            uni.showToast({ title: '已退出登录', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
/* ===== 页面基础 ===== */
.index-page {
  min-height: 100vh;
  position: relative;
  background: #0D1B2A;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

/* ===== 背景层 ===== */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-img {
  width: 100%;
  height: 100%;
  display: block;
}

.bg-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(13, 27, 42, 0.78) 0%,
    rgba(26, 26, 46, 0.85) 45%,
    rgba(44, 24, 16, 0.82) 100%
  );
}

/* 星光粒子 */
.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.8);
  animation: star-twinkle 3s infinite ease-in-out;
}
.s1 { width: 4rpx; height: 4rpx; top: 12%; left: 18%; animation-delay: 0s; }
.s2 { width: 6rpx; height: 6rpx; top: 25%; left: 72%; animation-delay: 0.7s; }
.s3 { width: 3rpx; height: 3rpx; top: 38%; left: 45%; animation-delay: 1.2s; }
.s4 { width: 5rpx; height: 5rpx; top: 60%; left: 85%; animation-delay: 0.4s; }
.s5 { width: 4rpx; height: 4rpx; top: 72%; left: 10%; animation-delay: 1.8s; }

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ===== 主滚动区 ===== */
.main-scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.content-wrap {
  min-height: 100vh;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== 顶部徽章 ===== */
.top-badge-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 80rpx;
  margin-bottom: 40rpx;
}

.badge-item {
  background: rgba(201, 168, 76, 0.12);
  border: 1rpx solid rgba(201, 168, 76, 0.4);
  border-radius: 9999rpx;
  padding: 8rpx 28rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #C9A84C;
  letter-spacing: 2rpx;
}

.badge-divider {
  width: 1rpx;
  height: 28rpx;
  background: rgba(201, 168, 76, 0.35);
}

/* ===== 封面标题区 ===== */
.cover-title-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16rpx;
}

.deco-line-top,
.deco-line-bottom {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.deco-line-bottom {
  margin-top: 32rpx;
  margin-bottom: 0;
}

.deco-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #C9A84C;
  flex-shrink: 0;
}

.deco-line {
  width: 120rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #C9A84C, transparent);
}

/* 印章 */
.title-seal-wrap {
  margin-bottom: 36rpx;
}

.outer-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(201, 168, 76, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 168, 76, 0.04);
  box-shadow: 0 0 32rpx rgba(201, 168, 76, 0.2), inset 0 0 24rpx rgba(201, 168, 76, 0.06);
  animation: ring-glow 3s infinite ease-in-out;
}

.inner-ring {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 2rpx solid #C9A84C;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 168, 76, 0.08);
}

@keyframes ring-glow {
  0%, 100% { box-shadow: 0 0 24rpx rgba(201, 168, 76, 0.2); }
  50% { box-shadow: 0 0 48rpx rgba(201, 168, 76, 0.45), inset 0 0 24rpx rgba(201, 168, 76, 0.1); }
}

.seal-main {
  font-size: 44rpx;
  color: #C9A84C;
  font-weight: bold;
  text-shadow: 0 0 16rpx rgba(201, 168, 76, 0.6);
}

/* 主标题 */
.main-title {
  font-size: 52rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 8rpx;
  text-align: center;
  text-shadow: 0 0 24rpx rgba(201, 168, 76, 0.5);
  line-height: 1.3;
}

.main-title-full {
  font-size: 52rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 6rpx;
  text-align: center;
  text-shadow: 0 0 28rpx rgba(201, 168, 76, 0.55);
  line-height: 1.4;
  margin: 4rpx 0;
}

.title-dot {
  font-size: 36rpx;
  color: rgba(201, 168, 76, 0.6);
  margin: 8rpx 0;
}

.gold-line-wrap {
  width: 100%;
  margin: 24rpx 0 20rpx;
}

.gold-line-full {
  width: 100%;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #C9A84C, transparent);
}

.sub-title {
  font-size: 30rpx;
  color: #E8D5A3;
  letter-spacing: 4rpx;
  opacity: 0.9;
}

/* ===== 乐器装饰 ===== */
.instrument-deco {
  position: relative;
  margin: 40rpx 0 32rpx;
  width: 160rpx;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inst-img {
  width: 120rpx;
  height: 200rpx;
  opacity: 0.75;
  filter: sepia(30%) brightness(1.1);
}

.inst-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

/* ===== 诗句预览 ===== */
.poem-preview {
  margin-bottom: 48rpx;
}

.poem-inner {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: rgba(201, 168, 76, 0.06);
  border: 1rpx solid rgba(201, 168, 76, 0.22);
  border-radius: 12rpx;
  padding: 20rpx 36rpx;
}

.poem-line {
  font-size: 26rpx;
  color: #E8D5A3;
  letter-spacing: 3rpx;
  font-style: italic;
}

.poem-sep {
  width: 1rpx;
  height: 32rpx;
  background: rgba(201, 168, 76, 0.4);
  flex-shrink: 0;
}

/* ===== 功能卡片 ===== */
.cards-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 36rpx;
}

.func-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border-radius: 24rpx;
  padding: 28rpx 28rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.2);
  box-shadow: 0 4rpx 24rpx rgba(13, 27, 42, 0.4);
  transition: transform 0.2s;
}

.func-card:active {
  transform: scale(0.975);
}

.card-primary {
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.14) 0%, rgba(26, 26, 46, 0.9) 100%);
  border-color: rgba(201, 168, 76, 0.35);
}

.card-ai {
  background: linear-gradient(135deg, rgba(192, 57, 43, 0.12) 0%, rgba(26, 26, 46, 0.9) 100%);
  border-color: rgba(192, 57, 43, 0.3);
}

.card-inst {
  background: linear-gradient(135deg, rgba(44, 95, 110, 0.15) 0%, rgba(26, 26, 46, 0.9) 100%);
  border-color: rgba(44, 95, 110, 0.35);
}

.card-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.card-icon-gold { background: rgba(201, 168, 76, 0.18); border: 1rpx solid rgba(201, 168, 76, 0.4); }
.card-icon-red  { background: rgba(192, 57, 43, 0.15); border: 1rpx solid rgba(192, 57, 43, 0.35); }
.card-icon-cyan { background: rgba(44, 95, 110, 0.15); border: 1rpx solid rgba(44, 95, 110, 0.4); }

.card-icon-img {
  width: 56rpx;
  height: 56rpx;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-title {
  font-size: 32rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.card-desc {
  font-size: 23rpx;
  color: rgba(232, 213, 163, 0.65);
  line-height: 1.5;
}

.card-arrow {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.12);
  border: 1rpx solid rgba(201, 168, 76, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-text {
  font-size: 24rpx;
  color: #C9A84C;
  font-weight: bold;
}

/* ===== 用户区域 ===== */
.user-section {
  width: 100%;
  margin-bottom: 32rpx;
}

.user-unlogged,
.user-logged {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(201, 168, 76, 0.2);
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
}

.user-unlogged:active,
.user-logged:active {
  opacity: 0.85;
}

.user-avatar-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-avatar-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(44, 95, 110, 0.25);
  border: 2rpx solid rgba(44, 95, 110, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-emoji {
  font-size: 36rpx;
}

.user-text-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.user-login-hint {
  font-size: 28rpx;
  color: #E8D5A3;
  font-weight: bold;
}

.user-login-sub {
  font-size: 22rpx;
  color: rgba(232, 213, 163, 0.55);
}

.user-welcome {
  font-size: 28rpx;
  color: #C9A84C;
  font-weight: bold;
}

.user-sub {
  font-size: 22rpx;
  color: rgba(201, 168, 76, 0.55);
}

.login-btn {
  background: linear-gradient(135deg, #C9A84C, #A07830);
  border-radius: 9999rpx;
  padding: 14rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(201, 168, 76, 0.3);
  flex-shrink: 0;
}

.login-btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.logout-btn {
  background: rgba(192, 57, 43, 0.15);
  border: 1rpx solid rgba(192, 57, 43, 0.4);
  border-radius: 9999rpx;
  padding: 12rpx 28rpx;
  flex-shrink: 0;
}

.logout-text {
  font-size: 24rpx;
  color: #E8756A;
}

/* ===== 底部信息 ===== */
.footer-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding-bottom: 40rpx;
}

.footer-divider {
  width: 120rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.4), transparent);
  margin-bottom: 16rpx;
}

.footer-text {
  font-size: 22rpx;
  color: rgba(232, 213, 163, 0.5);
  letter-spacing: 2rpx;
}

.footer-sub {
  font-size: 20rpx;
  color: rgba(201, 168, 76, 0.4);
  letter-spacing: 1rpx;
}

.footer-poem {
  margin-top: 12rpx;
  background: rgba(201, 168, 76, 0.06);
  border-radius: 8rpx;
  padding: 10rpx 28rpx;
}

.footer-poem-text {
  font-size: 22rpx;
  color: rgba(201, 168, 76, 0.55);
  font-style: italic;
  letter-spacing: 2rpx;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>