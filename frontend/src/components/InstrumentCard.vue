<template>
  <view class="instrument-card" :class="{ 'card-active': isPlaying }" @click="handleClick">
    <!-- 鎏金光晕 -->
    <view v-if="isPlaying" class="gold-glow" />

    <!-- 乐器图片 -->
    <view class="img-wrap">
      <image class="inst-img" :src="instrument.icon" mode="aspectFit" />
      <!-- 播放动效 -->
      <view v-if="isPlaying" class="wave-ring" />
    </view>

    <!-- 乐器名称 -->
    <text class="inst-name">{{ instrument.name }}</text>

    <!-- 朝代标签 -->
    <view class="dynasty-tag">
      <text class="dynasty-text">{{ instrument.dynasty }}</text>
    </view>

    <!-- 播放指示器 -->
    <view v-if="isPlaying" class="playing-bar">
      <view v-for="i in 4" :key="i" class="bar-item" :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
    </view>

    <!-- 点击提示 -->
    <view v-else class="tap-hint">
      <text class="hint-text">点击聆听</text>
    </view>

    <!-- 科普信息弹窗 -->
    <view v-if="showModal" class="modal-mask" @click.stop="closeModal">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ instrument.name }} · 科普</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <image class="modal-img" :src="instrument.icon" mode="aspectFit" />
          <view class="modal-tags">
            <view class="tag tag-gold"><text class="tag-text">{{ instrument.dynasty }}</text></view>
            <view class="tag tag-red"><text class="tag-text">弹拨乐</text></view>
          </view>
          <text class="modal-desc">{{ instrument.description }}</text>
          <view class="play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
            <text class="play-btn-text">{{ isPlaying ? '⏹ 停止播放' : '🎵 播放音效' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { playInstrumentSound, stopInstrumentSound, isPlaying as checkPlaying } from '@/utils/audio.js'

export default {
  name: 'InstrumentCard',
  props: {
    instrument: {
      type: Object,
      required: true,
      default: () => ({ key: '', name: '', dynasty: '', description: '', icon: '' })
    }
  },
  emits: ['play', 'stop'],
  data() {
    return {
      isPlaying: false,
      showModal: false
    }
  },
  beforeDestroy() {
    if (this.isPlaying) stopInstrumentSound(this.instrument.key)
  },
  methods: {
    handleClick() {
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    togglePlay() {
      if (this.isPlaying) {
        stopInstrumentSound(this.instrument.key)
        this.isPlaying = false
        this.$emit('stop', this.instrument.key)
        return
      }
      this.isPlaying = true
      this.$emit('play', this.instrument.key)
      playInstrumentSound(this.instrument.key, (success) => {
        this.isPlaying = false
        if (!success) {
          uni.showToast({ title: '音效暂不可用', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style scoped>
.instrument-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  border: 2rpx solid rgba(201, 168, 76, 0.25);
  padding: 28rpx 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 24rpx rgba(26, 26, 46, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.instrument-card:active {
  transform: scale(0.96);
}

.card-active {
  border-color: #C9A84C;
  box-shadow: 0 4rpx 24rpx rgba(201, 168, 76, 0.4);
  background: rgba(201, 168, 76, 0.06);
}

.gold-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(201, 168, 76, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.img-wrap {
  position: relative;
  width: 120rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inst-img {
  width: 100rpx;
  height: 150rpx;
  border-radius: 12rpx;
  background: #F0EDE6;
}

.wave-ring {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(201, 168, 76, 0.5);
  animation: wave-pulse 1.2s infinite ease-out;
}

@keyframes wave-pulse {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}

.inst-name {
  font-size: 32rpx;
  color: #1A1A2E;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.dynasty-tag {
  background: rgba(201, 168, 76, 0.15);
  border: 1rpx solid rgba(201, 168, 76, 0.4);
  border-radius: 9999rpx;
  padding: 4rpx 18rpx;
}

.dynasty-text {
  font-size: 22rpx;
  color: #A07830;
}

.playing-bar {
  display: flex;
  align-items: flex-end;
  gap: 6rpx;
  height: 28rpx;
}

.bar-item {
  width: 8rpx;
  background: #C9A84C;
  border-radius: 4rpx;
  animation: bar-dance 0.6s infinite alternate ease-in-out;
}

@keyframes bar-dance {
  0% { height: 8rpx; }
  100% { height: 28rpx; }
}

.tap-hint {
  padding: 4rpx 0;
}

.hint-text {
  font-size: 22rpx;
  color: rgba(139, 139, 139, 0.7);
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.65);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-box {
  background: #F8F3E8;
  border-radius: 32rpx;
  overflow: hidden;
  width: 100%;
  max-width: 620rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.35);
  box-shadow: 0 16rpx 64rpx rgba(26, 26, 46, 0.4);
}

.modal-header {
  background: linear-gradient(135deg, #1A1A2E 0%, #2C2C4A 100%);
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid rgba(201, 168, 76, 0.4);
}

.modal-title {
  font-size: 30rpx;
  color: #C9A84C;
  font-weight: bold;
  font-family: "STKaiti", serif;
}

.modal-close {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 26rpx;
  color: #E8D5A3;
}

.modal-body {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.modal-img {
  width: 160rpx;
  height: 220rpx;
  border-radius: 16rpx;
  background: #F0EDE6;
}

.modal-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 20rpx;
  border-radius: 9999rpx;
}

.tag-gold {
  background: rgba(201, 168, 76, 0.15);
  border: 1rpx solid rgba(201, 168, 76, 0.4);
}

.tag-red {
  background: rgba(192, 57, 43, 0.1);
  border: 1rpx solid rgba(192, 57, 43, 0.3);
}

.tag-text {
  font-size: 22rpx;
  color: #A07830;
}

.tag-red .tag-text {
  color: #C0392B;
}

.modal-desc {
  font-size: 27rpx;
  color: #1A1A2E;
  line-height: 1.85;
  text-align: justify;
  font-family: "STKaiti", serif;
}

.play-btn {
  width: 100%;
  background: linear-gradient(135deg, #C9A84C, #A07830);
  border-radius: 9999rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(201, 168, 76, 0.3);
  margin-top: 8rpx;
}

.play-btn.playing {
  background: linear-gradient(135deg, #2C5F6E, #1A3D47);
  box-shadow: 0 4rpx 20rpx rgba(44, 95, 110, 0.3);
}

.play-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-family: "STKaiti", serif;
}
</style>