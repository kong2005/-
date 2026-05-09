<template>
  <view class="form-input-wrap">
    <text v-if="label" class="cu-input-label">{{ label }}</text>
    <view class="cu-input-wrap" :class="{ 'input-error': !!error, 'input-focus': isFocused }">
      <text v-if="prefixIcon" class="prefix iconfont">{{ prefixIcon }}</text>
      <input
        class="input-field"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :placeholder-style="placeholderStyle"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @confirm="onConfirm"
      />
      <text
        v-if="type === 'password'"
        class="suffix-icon"
        @click="togglePasswordVisible"
      >{{ passwordVisible ? '👁' : '🙈' }}</text>
    </view>
    <text v-if="error" class="error-tip">{{ error }}</text>
  </view>
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '请输入' },
    type: { type: String, default: 'text' },
    prefixIcon: { type: String, default: '' },
    error: { type: String, default: '' },
    maxlength: { type: Number, default: 64 },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return {
      isFocused: false,
      passwordVisible: false
    }
  },
  computed: {
    inputType() {
      if (this.type === 'password') return this.passwordVisible ? 'text' : 'password'
      return this.type
    },
    placeholderStyle() {
      return 'color: #B0A898; font-size: 28rpx; font-family: STKaiti, KaiTi, serif;'
    }
  },
  methods: {
    onInput(e) {
      this.$emit('update:modelValue', e.detail.value)
    },
    onFocus() { this.isFocused = true },
    onBlur() { this.isFocused = false },
    onConfirm() { this.$emit('confirm') },
    togglePasswordVisible() { this.passwordVisible = !this.passwordVisible }
  }
}
</script>

<style scoped>
.form-input-wrap {
  margin-bottom: 32rpx;
}

.cu-input-label {
  display: block;
  font-size: 26rpx;
  color: #2C5F6E;
  margin-bottom: 12rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.cu-input-wrap {
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid #E8D5A3;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  display: flex;
  align-items: center;
  transition: border-color 0.3s;
}

.cu-input-wrap.input-focus {
  border-color: #C9A84C;
  box-shadow: 0 0 0 4rpx rgba(201, 168, 76, 0.15);
}

.cu-input-wrap.input-error {
  border-color: #C0392B;
  box-shadow: 0 0 0 4rpx rgba(192, 57, 43, 0.12);
}

.prefix {
  color: #C9A84C;
  margin-right: 16rpx;
  font-size: 32rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A2E;
  font-family: "STKaiti", "KaiTi", serif;
  background: transparent;
  border: none;
  min-height: 44rpx;
  line-height: 44rpx;
}

.suffix-icon {
  font-size: 28rpx;
  padding-left: 16rpx;
  color: #8B8B8B;
  flex-shrink: 0;
  cursor: pointer;
}

.error-tip {
  display: block;
  font-size: 22rpx;
  color: #C0392B;
  margin-top: 8rpx;
  padding-left: 4rpx;
}
</style>