<template>
  <view class="sim-page">
    <view class="sim-navbar">
      <view class="nav-back" @click="goBack"><text>❮</text></view>
      <text class="nav-title">虚拟仿真·诗中场景</text>
      <view style="width:60rpx;" />
    </view>

    <scroll-view scroll-y style="height:calc(100vh - 90rpx);">
      <view class="sim-body">

        <!-- 场景选择器 -->
        <scroll-view scroll-x class="scene-tabs">
          <view
            v-for="(scene, idx) in scenes"
            :key="idx"
            class="scene-tab"
            :class="{ 'tab-active': activeIdx === idx }"
            @click="switchScene(idx)"
          >
            <text class="tab-label">{{ scene.label }}</text>
          </view>
        </scroll-view>

        <!-- 主图展示 -->
        <view class="main-scene-wrap" @click="onMainClick">
          <image
            :src="scenes[activeIdx].imgUrl"
            mode="aspectFill"
            class="main-scene-img ink-filter"
          />
          <view class="ink-overlay" />
          <view class="scene-info-mask">
            <text class="scene-title">{{ scenes[activeIdx].label }}</text>
            <text class="scene-verse">{{ scenes[activeIdx].verse }}</text>
          </view>
          <view class="click-hint"><text class="click-hint-txt">✦ 点击感受意境</text></view>
          <view v-if="ripple" class="ripple-anim" />
        </view>

        <!-- 意境描述 -->
        <view class="desc-card">
          <view class="desc-header">
            <text class="desc-dot">◆</text>
            <text class="desc-title cu-text-gold">意境解读</text>
          </view>
          <text class="desc-content">{{ scenes[activeIdx].desc }}</text>
        </view>

        <!-- 诗句详解 -->
        <view class="verse-card">
          <view class="desc-header">
            <text class="desc-dot">◆</text>
            <text class="desc-title cu-text-red">诗句赏析</text>
          </view>
          <view class="verse-box">
            <text class="verse-text-main">{{ scenes[activeIdx].verse }}</text>
          </view>
          <text class="verse-annotation">{{ scenes[activeIdx].annotation }}</text>
        </view>

        <!-- 意象列表 -->
        <view class="imagery-section">
          <view class="desc-header">
            <text class="desc-dot">◆</text>
            <text class="desc-title" style="color:#2C5F6E;">核心意象</text>
          </view>
          <view class="imagery-grid">
            <view
              v-for="(img, ii) in scenes[activeIdx].imagery"
              :key="ii"
              class="imagery-item"
              @click="onImageryClick(img)"
            >
              <text class="imagery-icon">{{ img.icon }}</text>
              <text class="imagery-name">{{ img.name }}</text>
              <text class="imagery-note">{{ img.note }}</text>
            </view>
          </view>
        </view>

        <!-- 场景缩略导航 -->
        <view class="thumb-nav">
          <view
            v-for="(scene, idx) in scenes"
            :key="idx"
            class="thumb-item"
            :class="{ 'thumb-active': activeIdx === idx }"
            @click="switchScene(idx)"
          >
            <image :src="scene.imgUrl" mode="aspectFill" class="thumb-img" />
            <text class="thumb-label">{{ scene.label }}</text>
          </view>
        </view>

        <view style="height:60rpx;" />
      </view>
    </scroll-view>

    <!-- 意象详情弹窗 -->
    <view v-if="showModal" class="modal-mask" @click.self="showModal=false">
      <view class="modal-box">
        <view class="modal-hd">
          <text class="modal-ttl cu-text-gold">{{ modalData.name }}</text>
          <view class="modal-close" @click="showModal=false"><text>✕</text></view>
        </view>
        <view class="modal-bd">
          <!-- 图标展示区 -->
          <view class="modal-icon-wrap">
            <view class="modal-icon-bg">
              <text class="modal-icon-big">{{ modalData.icon }}</text>
            </view>
            <view class="modal-icon-glow" />
          </view>
          <!-- 标签区 -->
          <view class="modal-tag-row">
            <view class="modal-tag">
              <text class="modal-tag-txt">{{ modalData.note }}</text>
            </view>
          </view>
          <!-- 描述区 -->
          <view class="modal-desc-wrap">
            <text class="modal-desc">{{ modalData.detail }}</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
const SCENES = [
  {
    label: '空山凝云',
    verse: '空山凝云颓不流',
    imgUrl: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    desc: '箜篌一起，浮云为之凝滞，天地屏息，万籁俱寂。空山之中，云雾缭绕，随乐声沉浮，不肯流散，以天地之静衬托音乐之动，侧面烘托乐声震撼之力。',
    annotation: '以浮云凝滞不流，侧面烘托箜篌之音令天地屏息，此乃侧面烘托之妙法。',
    imagery: [
      { icon: '🏔', name: '空山', note: '清净无人', detail: '空山意象象征清净幽远，衬托音乐超凡脱俗的艺术境界。' },
      { icon: '☁️', name: '凝云', note: '驻足屏息', detail: '浮云凝滞，以自然界的静止反衬乐声之强，通感手法的典型运用。' },
      { icon: '🌫', name: '颓不流', note: '天地动容', detail: '云颓而不流，写乐声使自然界动容，极言箜篌之感染力。' }
    ]
  }
]

export default {
  name: 'SimulationPage',
  data() {
    return {
      scenes: SCENES,
      activeIdx: 0,
      ripple: false,
      showModal: false,
      modalData: {}
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchScene(idx) {
      if (this.activeIdx === idx) return
      this.activeIdx = idx
    },
    onMainClick() {
      this.ripple = true
      setTimeout(() => { this.ripple = false }, 700)
      const s = this.scenes[this.activeIdx]
      uni.showModal({
        title: `✦ ${s.label}`,
        content: `「${s.verse}」\n\n${s.desc}`,
        showCancel: false,
        confirmText: '妙哉'
      })
    },
    onImageryClick(img) {
      this.modalData = img
      this.showModal = true
    }
  }
}
</script>

<style scoped>
.sim-page {
  min-height: 100vh;
  background: #F8F3E8;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

.sim-navbar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background: linear-gradient(135deg, #1A1A2E 0%, #2C2C4A 100%);
  border-bottom: 2rpx solid rgba(201,168,76,0.4);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A84C;
  font-size: 36rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 3rpx;
}

.sim-body { padding: 0 0 40rpx; }

/* 场景Tab */
.scene-tabs {
  width: 100%;
  white-space: nowrap;
  padding: 20rpx 24rpx;
  background: #1A1A2E;
  border-bottom: 1rpx solid rgba(201,168,76,0.2);
}

.scene-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  border-radius: 9999rpx;
  border: 1rpx solid rgba(201,168,76,0.3);
  background: rgba(201,168,76,0.06);
}

.tab-active {
  background: linear-gradient(135deg,#C9A84C,#A07830);
  border-color: #C9A84C;
}

.tab-label {
  font-size: 26rpx;
  color: #E8D5A3;
  font-family: "STKaiti", serif;
}

.tab-active .tab-label { color: #fff; font-weight: bold; }

/* 主场景图 */
.main-scene-wrap {
  position: relative;
  width: 100%;
  height: 480rpx;
  overflow: hidden;
}

.main-scene-img {
  width: 100%;
  height: 480rpx;
  display: block;
}

.ink-filter {
  filter: sepia(30%) contrast(1.1) brightness(0.9) saturate(0.7);
}

.ink-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(13,20,35,0.1) 0%,
    transparent 40%,
    rgba(13,20,35,0.65) 100%
  );
  pointer-events: none;
}

.scene-info-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28rpx 32rpx 24rpx;
}

.scene-title {
  display: block;
  font-size: 40rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 4rpx;
  text-shadow: 0 0 16rpx rgba(201,168,76,0.7);
  font-family: "STKaiti", serif;
}

.scene-verse {
  display: block;
  font-size: 26rpx;
  color: #E8D5A3;
  margin-top: 8rpx;
  letter-spacing: 2rpx;
}

.click-hint {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  background: rgba(201,168,76,0.15);
  border: 1rpx solid rgba(201,168,76,0.35);
  border-radius: 9999rpx;
  padding: 8rpx 20rpx;
}

.click-hint-txt {
  font-size: 20rpx;
  color: rgba(201,168,76,0.9);
  font-family: "STKaiti", serif;
}

.ripple-anim {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200rpx;
  height: 200rpx;
  margin: -100rpx 0 0 -100rpx;
  border-radius: 50%;
  background: rgba(201,168,76,0.25);
  animation: ripple-out 0.7s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-out {
  0% { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}

/* 描述卡片 */
.desc-card, .verse-card, .imagery-section {
  margin: 24rpx 24rpx 0;
  background: rgba(255,255,255,0.92);
  border-radius: 20rpx;
  border: 1rpx solid rgba(201,168,76,0.2);
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(26,26,46,0.08);
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(201,168,76,0.15);
}

.desc-dot { font-size: 18rpx; color: #C9A84C; }

.desc-title {
  font-size: 28rpx;
  font-weight: bold;
}

.desc-content {
  font-size: 27rpx;
  color: #1A1A2E;
  line-height: 1.9;
  display: block;
}

.verse-box {
  background: linear-gradient(135deg,#1A1A2E,#2C2C4A);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #C9A84C;
}

.verse-text-main {
  font-size: 34rpx;
  color: #C9A84C;
  font-family: "STKaiti", serif;
  letter-spacing: 4rpx;
  display: block;
  text-align: center;
  text-shadow: 0 0 12rpx rgba(201,168,76,0.5);
}

.verse-annotation {
  font-size: 25rpx;
  color: #5A5A7A;
  line-height: 1.8;
  display: block;
}

/* 意象网格 */
.imagery-grid {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.imagery-item {
  flex: 1;
  min-width: 160rpx;
  background: linear-gradient(135deg,rgba(201,168,76,0.08),rgba(232,213,163,0.15));
  border: 1rpx solid rgba(201,168,76,0.25);
  border-radius: 16rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.imagery-item:active { opacity: 0.8; }

.imagery-icon { font-size: 48rpx; }

.imagery-name {
  font-size: 28rpx;
  color: #1A1A2E;
  font-weight: bold;
  font-family: "STKaiti", serif;
}

.imagery-note {
  font-size: 22rpx;
  color: #A07830;
}

/* 缩略图导航 */
.thumb-nav {
  margin: 24rpx 24rpx 0;
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
}

.thumb-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.thumb-img {
  width: 100rpx;
  height: 70rpx;
  border-radius: 10rpx;
  border: 2rpx solid rgba(201,168,76,0.2);
  filter: sepia(20%) contrast(1.05);
  display: block;
}

.thumb-active .thumb-img {
  border-color: #C9A84C;
  filter: none;
  box-shadow: 0 0 10rpx rgba(201,168,76,0.5);
}

.thumb-label {
  font-size: 20rpx;
  color: #8B8B8B;
  font-family: "STKaiti", serif;
}

.thumb-active .thumb-label {
  color: #C9A84C;
  font-weight: bold;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(26,26,46,0.65);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.modal-box {
  background: #F8F3E8;
  border-radius: 28rpx;
  overflow: hidden;
  width: 100%;
  max-width: 580rpx;
  border: 1rpx solid rgba(201,168,76,0.3);
  box-shadow: 0 16rpx 64rpx rgba(26,26,46,0.4);
}

.modal-hd {
  background: linear-gradient(135deg,#1A1A2E,#2C2C4A);
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid rgba(201,168,76,0.4);
}

.modal-ttl {
  font-size: 30rpx;
  font-weight: bold;
  font-family: "STKaiti", serif;
}

.modal-close {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(201,168,76,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A3;
  font-size: 26rpx;
}

.modal-bd {
  padding: 36rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* 图标展示区 */
.modal-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.modal-icon-bg {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(232,213,163,0.22) 100%);
  border: 2rpx solid rgba(201,168,76,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 24rpx rgba(201,168,76,0.18);
}

.modal-icon-glow {
  position: absolute;
  inset: -10rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(201,168,76,0.18);
  pointer-events: none;
}

.modal-icon-big {
  font-size: 72rpx;
  line-height: 1;
}

/* 标签区 */
.modal-tag-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.modal-tag {
  background: rgba(201,168,76,0.14);
  border: 1rpx solid rgba(201,168,76,0.4);
  border-radius: 9999rpx;
  padding: 8rpx 28rpx;
}

.modal-tag-txt {
  font-size: 24rpx;
  color: #A07830;
  font-family: "STKaiti", serif;
  letter-spacing: 2rpx;
}

/* 描述区 */
.modal-desc-wrap {
  width: 100%;
  background: rgba(248,243,232,0.8);
  border-radius: 16rpx;
  border: 1rpx solid rgba(201,168,76,0.15);
  padding: 24rpx 28rpx;
}

.modal-desc {
  font-size: 28rpx;
  color: #1A1A2E;
  line-height: 2;
  text-align: center;
  font-family: "STKaiti", serif;
  display: block;
}

.cu-text-gold { color: #C9A84C; }
.cu-text-red { color: #C0392B; }
</style>