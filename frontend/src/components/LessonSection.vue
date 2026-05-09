<template>
  <view class="lesson-section" :class="`section-${sectionData.type}`">
    <view class="cu-section-header">
      <view class="section-num">
        <text class="num-text">{{ sectionIndex + 1 }}</text>
      </view>
      <view class="header-content">
        <text class="section-title cu-text-gold">{{ sectionData.title }}</text>
        <text class="section-subtitle">{{ sectionData.subtitle }}</text>
      </view>
      <view class="header-badge" v-if="sectionData.badge">
        <text class="badge-text">{{ sectionData.badge }}</text>
      </view>
    </view>

    <!-- 封面章节 -->
    <view v-if="sectionData.type === 'cover'" class="cover-body">
      <image class="cover-bg-img" src="https://hpi-hub.tos-cn-beijing.volces.com/static/mobilewallpapers/cHJpdmF0ZS9sci91748499161072-9712WI4ZGMuanBn.jpg" mode="aspectFill" />
      <view class="cover-overlay">
        <text class="cu-cover-title">诗乐共生·大唐浪漫</text>
        <view class="cu-gold-line" style="margin: 20rpx auto;" />
        <text class="cu-cover-subtitle">解析李贺《李凭箜篌引》</text>
      </view>
    </view>

    <!-- 导入章节 -->
    <view v-else-if="sectionData.type === 'intro'" class="section-body">
      <view class="intro-desc cu-card-ink">
        <text class="desc-text">{{ sectionData.description }}</text>
      </view>
      <view class="character-row">
        <view v-for="char in sectionData.characters" :key="char.name" class="char-card cu-card-gold">
          <view class="char-avatar-wrap">
            <image class="char-avatar-img" :src="char.name === '李贺' ? LIHE_AVATAR : LIPING_AVATAR" mode="aspectFit" />
          </view>
          <text class="char-name">{{ char.name }}</text>
          <text class="char-alias cu-tag cu-tag-gold" style="margin: 8rpx 0;">{{ char.alias }}</text>
          <text class="char-desc">{{ char.desc }}</text>
        </view>
      </view>
      <view class="goals-wrap cu-card">
        <view class="cu-card-header">
          <text class="title">📚 学习目标</text>
        </view>
        <view v-for="(goal, i) in sectionData.goals" :key="i" class="goal-item">
          <view class="cu-gold-dot" style="flex-shrink:0;" />
          <text class="goal-text">{{ goal }}</text>
        </view>
      </view>
      <view class="ai-entry-wrap" @click="onAiClick">
        <view class="ai-entry-btn cu-btn cu-btn-gold">
          <text>对话李贺·穿越千年</text>
        </view>
        <text class="ai-hint">点击与AI李贺展开「双时空对话」</text>
      </view>
    </view>

    <!-- 原文章节 -->
    <view v-else-if="sectionData.type === 'poem'" class="section-body poem-body">
      <view class="poem-bg-wrap">
        <view class="poem-vertical-wrap">
          <view v-for="(col, ci) in poemColumns" :key="ci" class="poem-col">
            <text v-for="(char, chi) in col" :key="chi" class="poem-char" :class="{ highlight: isHighlighted(ci, chi) }">{{ char }}</text>
          </view>
        </view>
      </view>
      <view class="poem-actions">
        <view class="action-btn cu-btn cu-btn-outline-gold" @click="onRecite">
          <text>{{ isReciting ? '⏹ 停止吟诵' : '🔊 AI吟诵' }}</text>
        </view>
        <view class="action-btn cu-btn cu-btn-outline-gold" @click="onResetHighlight">
          <text>↺ 重置</text>
        </view>
      </view>
    </view>

    <!-- 诗乐解构章节 -->
    <view v-else-if="sectionData.type === 'analysis'" class="section-body">
      <view v-for="(stanza, si) in sectionData.stanzas" :key="si" class="stanza-block">
        <view class="stanza-header" @click="toggleStanza(si)">
          <view class="stanza-num-wrap">
            <text class="stanza-num">{{ si + 1 }}</text>
          </view>
          <text class="stanza-verse">{{ stanza.verse }}</text>
          <text class="stanza-arrow">{{ expandedStanza === si ? '▲' : '▼' }}</text>
        </view>
        <view v-if="expandedStanza === si" class="stanza-detail">
          <view class="detail-section">
            <text class="detail-label cu-text-gold">📖 注释</text>
            <text class="detail-content">{{ stanza.annotation }}</text>
          </view>
          <view class="cu-divider" />
          <view class="detail-section">
            <text class="detail-label cu-text-red">🔍 解读</text>
            <text class="detail-content">{{ stanza.interpretation }}</text>
          </view>
          <view class="cu-divider" />
          <view class="detail-section">
            <text class="detail-label" style="color:#2C5F6E;">✨ 手法</text>
            <view class="method-tags">
              <text v-for="(m, mi) in stanza.methods" :key="mi" class="cu-tag cu-tag-cyan" style="margin:4rpx;">{{ m }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="methods-summary cu-card-red" style="margin-top:24rpx;">
        <text class="summary-title cu-text-red cu-bold">四大核心音乐描摹手法</text>
        <view v-for="(m, i) in sectionData.methodsSummary" :key="i" class="method-row">
          <text class="method-index cu-text-gold">{{ i + 1 }}</text>
          <text class="method-text">{{ m }}</text>
        </view>
      </view>
      <view class="scene-btn-wrap">
        <view class="cu-btn cu-btn-gold" style="width:100%;" @click="onSceneRestore">
          <text>🎬 虚拟仿真·场景还原</text>
        </view>
      </view>
    </view>

    <!-- 乐器科普章节 -->
    <view v-else-if="sectionData.type === 'instrument'" class="section-body">
      <text class="intro-text cu-line-h">{{ sectionData.intro }}</text>
      <view class="instruments-grid">
        <view v-for="inst in sectionData.instruments" :key="inst.key" class="cu-instrument-card" :class="{ 'active-card': activeInstrument === inst.key }" @click="onInstrumentClick(inst)">
          <image class="inst-img" :src="getInstrumentIcon(inst.key)" mode="aspectFit" />
          <text class="instrument-name">{{ inst.name }}</text>
          <text class="cu-tag cu-tag-gold">{{ inst.dynasty }}</text>
          <view v-if="activeInstrument === inst.key" class="playing-indicator">
            <text class="play-dot" />
            <text class="play-dot" style="animation-delay:0.2s;" />
            <text class="play-dot" style="animation-delay:0.4s;" />
          </view>
        </view>
      </view>
    </view>

    <!-- 艺术成就章节 -->
    <view v-else-if="sectionData.type === 'achievement'" class="section-body">
      <view v-for="(ach, i) in sectionData.achievements" :key="i" class="cu-achievement">
        <view class="cu-achievement-num">{{ i + 1 }}</view>
        <view style="flex:1;">
          <text class="cu-achievement-title">{{ ach.title }}</text>
          <text class="cu-achievement-desc">{{ ach.desc }}</text>
        </view>
      </view>
      <view class="quotes-wrap">
        <text class="quotes-label cu-bold cu-text-red" style="font-size:30rpx;margin-bottom:16rpx;display:block;">名家评价</text>
        <view v-for="(q, qi) in sectionData.quotes" :key="qi" class="cu-quote">
          <text class="cu-quote-text">{{ q.text }}</text>
          <text class="cu-quote-author">—— {{ q.author }}</text>
        </view>
      </view>
      <view class="compare-btn-wrap">
        <view class="cu-btn cu-btn-cyan" style="width:100%;" @click="onCompare">
          <text>📜 历代音乐诗对比分析</text>
        </view>
      </view>
    </view>

    <!-- 文学史价值章节 -->
    <view v-else-if="sectionData.type === 'value'" class="section-body">
      <view v-for="(val, vi) in sectionData.values" :key="vi" class="value-item cu-card-cyan">
        <view class="value-head">
          <text class="val-index cu-text-gold cu-bold">0{{ vi + 1 }}</text>
          <text class="val-title cu-bold">{{ val.title }}</text>
        </view>
        <text class="val-desc cu-line-h">{{ val.desc }}</text>
      </view>
      <view class="heritage-block cu-card-ink">
        <text class="heritage-title cu-text-gold cu-bold">诗乐文化传承与创新</text>
        <view v-for="(h, hi) in sectionData.heritage" :key="hi" class="heritage-item">
          <view class="cu-gold-dot" />
          <text class="heritage-text">{{ h }}</text>
        </view>
      </view>
      <view class="ai-entry-wrap" @click="onAiClick">
        <view class="cu-btn cu-btn-red" style="width:100%;">
          <text>🏮 向李贺提问·双时空对话</text>
        </view>
      </view>
    </view>

    <!-- 课堂总结章节 -->
    <view v-else-if="sectionData.type === 'summary'" class="section-body">
      <view v-for="(s, si) in sectionData.summaries" :key="si" class="summary-item cu-card-gold">
        <view class="summary-icon-wrap">
          <text class="summary-icon">{{ s.icon }}</text>
        </view>
        <view style="flex:1;">
          <text class="summary-title cu-bold">{{ s.title }}</text>
          <text class="summary-desc cu-line-h">{{ s.desc }}</text>
        </view>
      </view>
      <view class="expand-tasks cu-card">
        <view class="cu-card-header">
          <text class="title">🚀 课后拓展任务</text>
        </view>
        <view v-for="(task, ti) in sectionData.tasks" :key="ti" class="task-item">
          <text class="task-num cu-tag cu-tag-red">{{ ti + 1 }}</text>
          <view style="flex:1;">
            <text class="task-title cu-bold">{{ task.title }}</text>
            <text class="task-desc">{{ task.desc }}</text>
          </view>
        </view>
      </view>
      <view class="closing-poem cu-card-ink" style="text-align:center;">
        <text class="closing-text cu-text-gold" style="font-size:30rpx;line-height:2;">
          诗乐共生，是大唐的浪漫{{ '\n' }}是文学的魅力，是文化的传承{{ '\n' }}愿你以诗为舟，以乐为帆
        </text>
      </view>
    </view>

    <view v-else class="section-body">
      <text class="default-content">{{ sectionData.description }}</text>
    </view>

    <!-- 场景还原弹窗 -->
    <view v-if="showSceneModal" class="cu-modal-mask" @click.self="showSceneModal = false">
      <view class="cu-modal">
        <view class="cu-modal-header">
          <text class="cu-modal-title">🎬 虚拟仿真·诗中场景</text>
          <view class="cu-modal-close" @click="showSceneModal = false">
            <text>✕</text>
          </view>
        </view>
        <view class="cu-modal-body">
          <!-- 空山凝云水墨画配图 -->
          <view class="scene-ink-wrap">
            <image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
              mode="aspectFill"
              style="width:100%;height:380rpx;border-radius:16rpx;"
            />
            <view class="scene-ink-overlay">
              <text class="scene-ink-title">空山凝云</text>
              <text class="scene-ink-verse">空山凝云颓不流</text>
            </view>
          </view>
          <view style="margin-top:24rpx;">
            <view class="scene-item active-scene">
              <view class="scene-dot-wrap">
                <text class="scene-dot cu-text-gold">◆</text>
              </view>
              <view style="flex:1;">
                <text class="scene-name cu-bold cu-text-red">空山凝云</text>
                <text class="scene-verse">空山凝云颓不流</text>
                <text class="scene-desc-text">琴声一响，浮云凝滞，天地屏息，万物为之动容</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 对比分析弹窗 -->
    <view v-if="showCompareModal" class="cu-modal-mask" @click.self="showCompareModal = false">
      <view class="cu-modal">
        <view class="cu-modal-header">
          <text class="cu-modal-title">📜 历代音乐诗对比</text>
          <view class="cu-modal-close" @click="showCompareModal = false">
            <text>✕</text>
          </view>
        </view>
        <view class="cu-modal-body">
          <view v-for="(comp, ci) in comparePoems" :key="ci" class="compare-item cu-card">
            <text class="comp-title cu-bold cu-text-gold">{{ comp.title }}</text>
            <text class="comp-author cu-text-gray" style="font-size:24rpx;">{{ comp.author }}</text>
            <text class="comp-feature cu-line-h" style="margin-top:12rpx;">{{ comp.feature }}</text>
            <view class="comp-tags" style="margin-top:12rpx;display:flex;flex-wrap:wrap;gap:8rpx;">
              <text v-for="(t, ti) in comp.tags" :key="ti" class="cu-tag cu-tag-cyan">{{ t }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 乐器弹窗 -->
    <view v-if="showInstrumentModal" class="cu-modal-mask" @click.self="closeInstrumentModal">
      <view class="cu-modal">
        <view class="cu-modal-header">
          <text class="cu-modal-title">{{ currentInstrument.name }} · 科普</text>
          <view class="cu-modal-close" @click="closeInstrumentModal">
            <text>✕</text>
          </view>
        </view>
        <view class="cu-modal-body">
          <image :src="getInstrumentIcon(currentInstrument.key)" mode="aspectFit" style="width:100%;height:280rpx;border-radius:16rpx;background:#FFFFFF;" />
          <view class="inst-info" style="margin-top:24rpx;">
            <view style="display:flex;align-items:center;gap:16rpx;margin-bottom:16rpx;">
              <text class="cu-tag cu-tag-gold">{{ currentInstrument.dynasty }}</text>
              <text class="cu-tag cu-tag-red">弹拨乐</text>
            </view>
            <text class="inst-desc cu-line-h" style="font-size:28rpx;color:#1A1A2E;">{{ currentInstrument.description }}</text>
          </view>
          <view class="cu-btn cu-btn-gold" style="width:100%;margin-top:24rpx;" @click="onPlaySound">
            <text>🎵 播放音效</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { playInstrumentSound, stopInstrumentSound } from '@/utils/audio.js'

const LIHE_AVATAR = 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_18/1757475284347-5248.jpg'
const LIPING_AVATAR = 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_25/1757747910949-9694.jpg'

const INSTRUMENT_ICONS = {
  konghou: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_22/1757583541871-3877.jpg',
  zheng: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_11/1757449804074-7374.png',
  ruanxian: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_7/1757274188237-1115.png'
}

const POEM_LINES = [
  '吴丝蜀桐张高秋','空山凝云颓不流','江娥啼竹素女愁','李凭中国弹箜篌',
  '昆山玉碎凤凰叫','芙蓉泣露香兰笑','十二门前融冷光','二十三丝动紫皇',
  '女娲炼石补天处','石破天惊逗秋雨','梦入神山教神妪','老鱼跳波瘦蛟舞',
  '吴质不眠倚桂树','露脚斜飞湿寒兔'
]

const COMPARE_POEMS = [
  { title: '《李凭箜篌引》', author: '李贺（唐）', feature: '全篇以奇幻意象渲染音乐效果，通感极致，想象奇崛，读诗如听乐。', tags: ['通感极致', '想象奇崛', '意象瑰丽', '诗乐共生'] },
  { title: '《琵琶行》', author: '白居易（唐）', feature: '由人引声，以声联人，叙事为主线，音乐与人物命运相融，感人至深。', tags: ['叙事抒情', '音人相融', '写实细腻', '以声移人'] },
  { title: '《听颖师弹琴》', author: '韩愈（唐）', feature: '以听者的感受与情绪变化为核心，描写音乐对人心的震撼，情感饱满。', tags: ['情感震撼', '听者视角', '以情写乐', '惊天动地'] }
]

export default {
  name: 'LessonSection',
  props: {
    sectionData: { type: Object, required: true },
    sectionIndex: { type: Number, default: 0 }
  },
  emits: ['ai-click', 'instrument-play'],
  data() {
    return {
      LIHE_AVATAR,
      LIPING_AVATAR,
      expandedStanza: null,
      isReciting: false,
      highlightPos: { col: -1, row: -1 },
      reciteTimer: null,
      reciteIndex: 0,
      activeInstrument: '',
      showSceneModal: false,
      showCompareModal: false,
      showInstrumentModal: false,
      currentInstrument: {},
      comparePoems: COMPARE_POEMS
    }
  },
  computed: {
    poemColumns() {
      const cols = []
      for (let i = 0; i < POEM_LINES.length; i += 2) {
        const col = []
        col.push(...POEM_LINES[i].split(''))
        col.push('·')
        if (POEM_LINES[i + 1]) col.push(...POEM_LINES[i + 1].split(''))
        cols.unshift(col)
      }
      return cols
    }
  },
  beforeDestroy() {
    this.stopRecite()
  },
  methods: {
    getInstrumentIcon(key) {
      return INSTRUMENT_ICONS[key] || 'https://img.icons8.com/ios/200/000000/harp.png'
    },
    toggleStanza(index) {
      this.expandedStanza = this.expandedStanza === index ? null : index
    },
    onAiClick() {
      this.$emit('ai-click')
    },
    onRecite() {
      if (this.isReciting) { this.stopRecite(); return }
      this.isReciting = true
      this.reciteIndex = 0
      this.doReciteStep()
    },
    doReciteStep() {
      const allChars = POEM_LINES.join('')
      if (this.reciteIndex >= allChars.length) { this.stopRecite(); return }
      const lineIdx = Math.floor(this.reciteIndex / 7)
      const charIdx = this.reciteIndex % 7
      const colIdx = Math.floor(lineIdx / 2)
      const rowOffset = (lineIdx % 2 === 0) ? 0 : 8
      this.highlightPos = { col: this.poemColumns.length - 1 - colIdx, row: charIdx + rowOffset }
      this.reciteIndex++
      this.reciteTimer = setTimeout(() => this.doReciteStep(), 350)
    },
    stopRecite() {
      this.isReciting = false
      if (this.reciteTimer) clearTimeout(this.reciteTimer)
    },
    onResetHighlight() {
      this.stopRecite()
      this.highlightPos = { col: -1, row: -1 }
    },
    isHighlighted(colIdx, rowIdx) {
      return this.highlightPos.col === colIdx && this.highlightPos.row === rowIdx
    },
    onInstrumentClick(inst) {
      this.currentInstrument = inst
      this.showInstrumentModal = true
    },
    closeInstrumentModal() {
      this.showInstrumentModal = false
      if (this.activeInstrument) { stopInstrumentSound(this.activeInstrument); this.activeInstrument = '' }
    },
    onPlaySound() {
      const key = this.currentInstrument.key
      if (this.activeInstrument === key) { stopInstrumentSound(key); this.activeInstrument = ''; return }
      if (this.activeInstrument) stopInstrumentSound(this.activeInstrument)
      this.activeInstrument = key
      this.$emit('instrument-play', key)
      playInstrumentSound(key, (success) => {
        this.activeInstrument = ''
        if (!success) uni.showToast({ title: '音效播放失败', icon: 'none' })
      })
    },
    onSceneRestore() {
      this.showSceneModal = true
    },
    onCompare() {
      this.showCompareModal = true
    }
  }
}
</script>

<style scoped>
.lesson-section {
  background: rgba(255,255,255,0.96);
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(26,26,46,0.1);
  border: 1rpx solid rgba(201,168,76,0.18);
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
}

.lesson-section:active { transform: scale(0.985); box-shadow: 0 2rpx 12rpx rgba(26,26,46,0.08); }

.cu-section-header {
  background: linear-gradient(135deg,#1A1A2E 0%,#2C3E50 100%);
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 2rpx solid rgba(201,168,76,0.5);
}

.section-num { width:52rpx;height:52rpx;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#A07830);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4rpx 12rpx rgba(201,168,76,0.4); }
.num-text { font-size:24rpx;color:#fff;font-weight:bold; }
.header-content { flex:1; }
.section-title { font-size:32rpx;font-weight:bold;display:block; }
.section-subtitle { font-size:22rpx;color:rgba(201,168,76,0.7);display:block;margin-top:4rpx; }
.header-badge { background:rgba(192,57,43,0.2);border:1rpx solid rgba(192,57,43,0.5);border-radius:20rpx;padding:4rpx 16rpx; }
.badge-text { font-size:20rpx;color:#E8756A; }

.cover-body { position:relative;height:480rpx;overflow:hidden; }
.cover-bg-img { width:100%;height:100%;position:absolute;top:0;left:0; }
.cover-overlay { position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,27,42,0.5) 0%,rgba(13,27,42,0.8) 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40rpx; }
.cu-cover-title { font-size:48rpx;color:#C9A84C;font-weight:bold;text-align:center;letter-spacing:6rpx;text-shadow:0 0 24rpx rgba(201,168,76,0.5); }
.cu-cover-subtitle { font-size:28rpx;color:#E8D5A3;letter-spacing:4rpx;margin-top:12rpx; }

.section-body { padding:32rpx; }

.intro-desc { margin-bottom:24rpx; }
.desc-text { font-size:28rpx;line-height:1.9;color:#E8D5A3; }
.character-row { display:flex;gap:20rpx;margin-bottom:24rpx; }
.char-card { flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:28rpx 16rpx; }
.char-avatar-wrap { width:120rpx;height:150rpx;border-radius:10rpx;border:3rpx solid #C9A84C;overflow:hidden;background:#F8F3E8;display:flex;align-items:center;justify-content:center;margin-bottom:16rpx;box-shadow:0 4rpx 16rpx rgba(201,168,76,0.35); }
.char-avatar-img { width:120rpx;height:150rpx;object-fit:cover; }
.char-name { font-size:30rpx;font-weight:bold;color:#1A1A2E;margin-bottom:8rpx; }
.char-desc { font-size:22rpx;color:#8B8B8B;line-height:1.6;margin-top:8rpx; }
.goals-wrap { margin-bottom:24rpx; }
.goal-item { display:flex;align-items:flex-start;gap:16rpx;padding:12rpx 0;border-bottom:1rpx solid rgba(201,168,76,0.1); }
.goal-item:last-child { border-bottom:none; }
.goal-text { font-size:27rpx;color:#1A1A2E;line-height:1.7;flex:1; }
.ai-entry-wrap { display:flex;flex-direction:column;align-items:center;gap:12rpx;margin-top:8rpx; }
.ai-hint { font-size:22rpx;color:#8B8B8B; }

.poem-body { padding:24rpx 16rpx;background:#0D1B2A; }
.poem-bg-wrap { background:linear-gradient(180deg,#0D1B2A 0%,#1A2040 100%);border-radius:16rpx;padding:32rpx 16rpx;border:1rpx solid rgba(201,168,76,0.2);overflow-x:auto; }
.poem-vertical-wrap { display:flex;flex-direction:row;justify-content:center;gap:0;min-width:max-content; }
.poem-col { display:flex;flex-direction:column;align-items:center;padding:0 20rpx;border-right:1rpx solid rgba(192,57,43,0.3); }
.poem-col:last-child { border-right:none; }
.poem-char { font-size:32rpx;color:#E8D5A3;font-family:"STKaiti","KaiTi",serif;line-height:1.8;transition:color 0.3s; }
.poem-char.highlight { color:#C9A84C;text-shadow:0 0 12rpx rgba(201,168,76,0.8); }
.poem-actions { display:flex;gap:16rpx;margin-top:24rpx;justify-content:center; }
.action-btn { flex:1; }

.stanza-block { margin-bottom:16rpx;border:1rpx solid rgba(201,168,76,0.2);border-radius:16rpx;overflow:hidden; }
.stanza-header { background:linear-gradient(135deg,rgba(26,26,46,0.05),rgba(201,168,76,0.08));padding:24rpx;display:flex;align-items:center;gap:16rpx; }
.stanza-num-wrap { width:44rpx;height:44rpx;border-radius:50%;background:#C9A84C;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.stanza-num { font-size:22rpx;color:#fff;font-weight:bold; }
.stanza-verse { flex:1;font-size:28rpx;color:#1A1A2E;font-weight:bold; }
.stanza-arrow { font-size:22rpx;color:#C9A84C; }
.stanza-detail { padding:24rpx;background:rgba(248,243,232,0.5); }
.detail-section { margin-bottom:16rpx; }
.detail-label { font-size:26rpx;font-weight:bold;display:block;margin-bottom:8rpx; }
.detail-content { font-size:26rpx;color:#1A1A2E;line-height:1.8; }
.method-tags { display:flex;flex-wrap:wrap;gap:8rpx;margin-top:8rpx; }
.methods-summary { padding:24rpx; }
.summary-title { display:block;margin-bottom:16rpx;font-size:30rpx; }
.method-row { display:flex;align-items:flex-start;gap:16rpx;padding:10rpx 0; }
.method-index { font-size:28rpx;font-weight:bold;flex-shrink:0;width:32rpx; }
.method-text { font-size:26rpx;color:#1A1A2E;line-height:1.7;flex:1; }
.scene-btn-wrap { margin-top:24rpx; }

.intro-text { display:block;font-size:27rpx;color:#1A1A2E;margin-bottom:24rpx; }
.instruments-grid { display:flex;gap:20rpx;flex-wrap:wrap; }
.cu-instrument-card { flex:1;min-width:180rpx;background:rgba(255,255,255,0.98);border-radius:24rpx;border:2rpx solid rgba(201,168,76,0.25);padding:28rpx 16rpx;display:flex;flex-direction:column;align-items:center;gap:12rpx;box-shadow:0 4rpx 24rpx rgba(26,26,46,0.08);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.cu-instrument-card:active { transform:scale(0.93) translateY(-4rpx);border-color:#C9A84C;box-shadow:0 8rpx 28rpx rgba(201,168,76,0.35); }
.cu-instrument-card.active-card { border-color:#C9A84C;box-shadow:0 4rpx 20rpx rgba(201,168,76,0.35);background:rgba(201,168,76,0.06); }
.inst-img { width:100rpx;height:140rpx;border-radius:8rpx;background:#FFFFFF;border:1rpx solid rgba(26,26,46,0.12); }
.instrument-name { font-size:30rpx;color:#1A1A2E;font-weight:bold; }
.playing-indicator { display:flex;gap:8rpx;align-items:center; }
.play-dot { width:12rpx;height:12rpx;border-radius:50%;background:#C9A84C;display:block;animation:bounce 0.8s infinite ease-in-out; }

@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.5;}40%{transform:scale(1);opacity:1;} }

.quotes-wrap { margin-top:24rpx; }
.compare-btn-wrap { margin-top:24rpx; }
.value-item { margin-bottom:16rpx;padding:24rpx; }
.value-head { display:flex;align-items:center;gap:16rpx;margin-bottom:12rpx; }
.val-index { font-size:40rpx;line-height:1; }
.val-title { font-size:30rpx;color:#1A1A2E; }
.val-desc { font-size:26rpx;color:#1A1A2E; }
.heritage-block { padding:28rpx;margin-bottom:24rpx; }
.heritage-title { display:block;font-size:30rpx;margin-bottom:20rpx; }
.heritage-item { display:flex;align-items:flex-start;gap:16rpx;margin-bottom:16rpx; }
.heritage-text { font-size:26rpx;color:#E8D5A3;line-height:1.7;flex:1; }

.summary-item { display:flex;align-items:flex-start;gap:20rpx;margin-bottom:16rpx;padding:24rpx; }
.summary-icon-wrap { width:64rpx;height:64rpx;border-radius:50%;background:rgba(201,168,76,0.15);border:2rpx solid rgba(201,168,76,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.summary-icon { font-size:30rpx; }
.summary-desc { font-size:26rpx;color:#1A1A2E; }
.task-item { display:flex;align-items:flex-start;gap:16rpx;padding:16rpx 0;border-bottom:1rpx solid rgba(201,168,76,0.1); }
.task-item:last-child { border-bottom:none; }
.task-num { flex-shrink:0;margin-top:4rpx; }
.task-title { font-size:28rpx;color:#1A1A2E;display:block;margin-bottom:6rpx; }
.task-desc { font-size:24rpx;color:#8B8B8B;line-height:1.6;display:block; }
.closing-text { display:block;white-space:pre-line; }

/* 场景弹窗 - 空山凝云 */
.scene-ink-wrap { position:relative;border-radius:16rpx;overflow:hidden;box-shadow:0 8rpx 32rpx rgba(26,26,46,0.25); }
.scene-ink-overlay { position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(13,27,42,0.85) 0%,transparent 100%);padding:24rpx 28rpx; }
.scene-ink-title { display:block;font-size:36rpx;color:#C9A84C;font-weight:bold;font-family:"STKaiti","KaiTi",serif;letter-spacing:6rpx;text-shadow:0 0 16rpx rgba(201,168,76,0.6); }
.scene-ink-verse { display:block;font-size:24rpx;color:rgba(232,213,163,0.8);margin-top:6rpx;font-family:"STKaiti",serif; }
.active-scene { background:rgba(201,168,76,0.06);border-radius:16rpx;padding:20rpx;border:1rpx solid rgba(201,168,76,0.2); }
.scene-dot-wrap { flex-shrink:0;margin-top:4rpx; }
.scene-dot { font-size:20rpx; }
.scene-name { font-size:30rpx;display:block;margin-bottom:6rpx; }
.scene-verse { font-size:26rpx;color:#8B8B8B;display:block;margin-bottom:6rpx; }
.scene-desc-text { font-size:24rpx;color:#8B8B8B;line-height:1.6;display:block; }

.compare-item { margin-bottom:20rpx; }
.comp-title { font-size:30rpx;display:block; }
.comp-author { display:block;margin-top:4rpx; }
.comp-feature { font-size:26rpx;color:#1A1A2E;display:block; }
.default-content { font-size:28rpx;color:#1A1A2E;line-height:1.8; }

/* 弹窗 */
.cu-modal-mask { position:fixed;inset:0;background:rgba(26,26,46,0.65);z-index:999;display:flex;align-items:center;justify-content:center;padding:40rpx; }
.cu-modal { background:#F8F3E8;border-radius:32rpx;overflow:hidden;width:100%;max-width:660rpx;box-shadow:0 16rpx 64rpx rgba(26,26,46,0.4);border:1rpx solid rgba(201,168,76,0.3);max-height:80vh;overflow-y:auto; }
.cu-modal-header { background:linear-gradient(135deg,#1A1A2E 0%,#2C2C4A 100%);padding:28rpx 32rpx;display:flex;align-items:center;justify-content:space-between;border-bottom:2rpx solid rgba(201,168,76,0.4);position:sticky;top:0;z-index:1; }
.cu-modal-title { font-size:30rpx;color:#C9A84C;font-weight:bold; }
.cu-modal-close { width:56rpx;height:56rpx;border-radius:50%;background:rgba(201,168,76,0.15);display:flex;align-items:center;justify-content:center;color:#E8D5A3;font-size:28rpx;transition:transform 0.2s ease; }
.cu-modal-close:active { transform:scale(0.88) rotate(90deg); }
.cu-modal-body { padding:32rpx; }

.cu-card { background:rgba(255,255,255,0.92);border-radius:16rpx;box-shadow:0 4rpx 24rpx rgba(26,26,46,0.12);padding:32rpx;margin-bottom:24rpx;border:1rpx solid rgba(201,168,76,0.2); }
.cu-card-header { display:flex;align-items:center;padding-bottom:20rpx;margin-bottom:20rpx;border-bottom:1rpx solid rgba(201,168,76,0.3); }
.cu-card-header .title { font-size:30rpx;font-weight:bold;color:#1A1A2E;flex:1; }
.cu-card-gold { background:linear-gradient(135deg,rgba(201,168,76,0.12),rgba(232,213,163,0.2));border-radius:16rpx;border:1rpx solid #E8D5A3;padding:28rpx 20rpx;box-shadow:0 4rpx 20rpx rgba(201,168,76,0.2); }
.cu-card-ink { background:linear-gradient(135deg,#1A1A2E 0%,#2C2C4A 100%);border-radius:16rpx;border:1rpx solid rgba(201,168,76,0.3);padding:28rpx;margin-bottom:24rpx;color:#F8F3E8; }
.cu-card-cyan { background:linear-gradient(135deg,rgba(44,95,110,0.08),rgba(74,143,160,0.12));border-radius:16rpx;border:1rpx solid rgba(44,95,110,0.3);padding:28rpx;margin-bottom:16rpx; }
.cu-card-red { background:linear-gradient(135deg,rgba(192,57,43,0.06),rgba(232,117,106,0.1));border-radius:16rpx;border:1rpx solid rgba(192,57,43,0.25);padding:28rpx;margin-bottom:24rpx; }

.cu-btn { display:inline-flex;align-items:center;justify-content:center;padding:20rpx 40rpx;border-radius:9999rpx;font-size:28rpx;font-family:"STKaiti","KaiTi",serif;border:none;cursor:pointer;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s ease; }
.cu-btn::after { border:none; }
.cu-btn:active { transform:scale(0.94);opacity:0.88; }
.cu-btn-gold { background:linear-gradient(135deg,#C9A84C,#A07830);color:#fff;box-shadow:0 4rpx 20rpx rgba(201,168,76,0.3); }
.cu-btn-red { background:linear-gradient(135deg,#C0392B,#A93226);color:#fff;box-shadow:0 4rpx 20rpx rgba(192,57,43,0.3); }
.cu-btn-cyan { background:linear-gradient(135deg,#2C5F6E,#1A3D47);color:#fff;box-shadow:0 4rpx 20rpx rgba(44,95,110,0.3); }
.cu-btn-outline-gold { background:transparent;color:#C9A84C;border:2rpx solid #C9A84C; }
.cu-btn-outline-gold:active { background:rgba(201,168,76,0.1); }

.cu-quote { background:linear-gradient(135deg,rgba(192,57,43,0.06),rgba(232,117,106,0.08));border-left:6rpx solid #C0392B;border-radius:0 16rpx 16rpx 0;padding:20rpx 24rpx;margin:16rpx 0; }
.cu-quote-text { font-size:26rpx;color:#1A1A2E;line-height:1.8;display:block; }
.cu-quote-author { font-size:22rpx;color:#C0392B;margin-top:10rpx;text-align:right;display:block; }

.cu-gold-dot { width:12rpx;height:12rpx;border-radius:50%;background:#C9A84C;display:inline-block;flex-shrink:0;margin-top:10rpx; }
.cu-gold-line { width:60rpx;height:3rpx;background:linear-gradient(90deg,transparent,#C9A84C,transparent); }
.cu-tag { display:inline-flex;align-items:center;padding:5rpx 18rpx;border-radius:9999rpx;font-size:22rpx; }
.cu-tag-gold { background:rgba(201,168,76,0.15);color:#A07830;border:1rpx solid rgba(201,168,76,0.4); }
.cu-tag-red { background:rgba(192,57,43,0.1);color:#C0392B;border:1rpx solid rgba(192,57,43,0.3); }
.cu-tag-cyan { background:rgba(44,95,110,0.1);color:#2C5F6E;border:1rpx solid rgba(44,95,110,0.3); }
.cu-bold { font-weight:bold; }
.cu-line-h { line-height:1.8; }
.cu-text-gold { color:#C9A84C; }
.cu-text-red { color:#C0392B; }
.cu-text-gray { color:#8B8B8B; }
.cu-divider { height:1rpx;background:linear-gradient(90deg,transparent,#E8D5A3,transparent);margin:20rpx 0; }
.cu-achievement { display:flex;align-items:flex-start;gap:20rpx;padding:24rpx;background:rgba(255,255,255,0.9);border-radius:16rpx;border:1rpx solid rgba(201,168,76,0.2);margin-bottom:16rpx;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.cu-achievement:active { transform:scale(0.975); }
.cu-achievement-num { width:52rpx;height:52rpx;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#A07830);color:#fff;font-size:24rpx;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4rpx 12rpx rgba(201,168,76,0.3); }
.cu-achievement-title { font-size:28rpx;color:#C0392B;font-weight:bold;display:block;margin-bottom:8rpx; }
.cu-achievement-desc { font-size:25rpx;color:#1A1A2E;line-height:1.7;display:block; }

uni-input { height:auto !important;min-height:0 !important;line-height:normal !important; }
</style>