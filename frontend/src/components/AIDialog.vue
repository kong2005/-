<template>
  <view class="ai-dialog-wrap">
    <!-- 触发入口按钮 -->
    <view v-if="!visible" class="ai-entry" @click="openDialog">
      <view class="entry-avatar-wrap">
        <image class="entry-avatar" src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_14/1757368300999-7522.png" mode="aspectFit" />
        <view class="entry-glow" />
      </view>
      <view class="entry-label">
        <text class="entry-name">李贺</text>
        <text class="entry-hint">点击开启双时空对话</text>
      </view>
      <view class="entry-seal">
        <text class="seal-text">李贺</text>
      </view>
    </view>

    <!-- 对话弹窗 -->
    <view v-if="visible" class="dialog-mask">
      <view class="dialog-panel">
        <!-- 顶部头部 -->
        <view class="dialog-header">
          <view class="header-left">
            <view class="avatar-wrap">
              <image class="avatar-img" src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_14/1757368300999-7522.png" mode="aspectFit" />
              <view v-if="isLoading" class="avatar-pulse" />
            </view>
            <view class="header-info">
              <text class="dialog-title">李贺</text>
              <view class="status-row">
                <view class="status-dot" :class="{ active: !isLoading, loading: isLoading }" />
                <text class="status-text">{{ isLoading ? '思索中…' : '在线' }}</text>
              </view>
            </view>
          </view>
          <view class="header-close" @click="closeDialog">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <!-- 消息区域 -->
        <scroll-view
          class="messages-scroll"
          scroll-y
          :scroll-top="scrollTop"
          :scroll-with-animation="true"
        >
          <view class="messages-inner">
            <!-- 欢迎语 -->
            <view v-if="messages.length === 0" class="welcome-wrap">
              <view class="welcome-card">
                <text class="welcome-quote">
                  "余闻李凭弹箜篌，音绕梁宇，动星摇石，遂作此篇，记其神妙。"
                </text>
                <text class="welcome-sub">—— 李贺</text>
                <view class="welcome-divider" />
                <text class="welcome-tips">可向我提问关于诗歌、箜篌、大唐音乐的一切</text>
                <view class="quick-questions">
                  <view
                    v-for="(q, qi) in quickQuestions"
                    :key="qi"
                    class="quick-btn"
                    @click="sendQuick(q)"
                  >
                    <text class="quick-text">{{ q }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 消息列表 -->
            <view
              v-for="(msg, mi) in messages"
              :key="mi"
              class="msg-row"
              :class="msg.role === 'user' ? 'row-user' : 'row-ai'"
            >
              <!-- AI头像 -->
              <image
                v-if="msg.role === 'ai'"
                class="msg-avatar"
                src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_14/1757368300999-7522.png"
                mode="aspectFit"
              />
              <!-- 气泡 -->
              <view class="bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'">
                <text class="bubble-text">{{ msg.content }}</text>
                <text class="bubble-time">{{ msg.time }}</text>
              </view>
              <!-- 用户头像占位 -->
              <view v-if="msg.role === 'user'" class="user-avatar-wrap">
                <text class="user-avatar-icon">🎓</text>
              </view>
            </view>

            <!-- loading气泡 -->
            <view v-if="isLoading" class="msg-row row-ai">
              <image
                class="msg-avatar"
                src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_14/1757368300999-7522.png"
                mode="aspectFit"
              />
              <view class="bubble bubble-ai bubble-loading">
                <view class="loading-dots">
                  <view class="ldot" />
                  <view class="ldot" style="animation-delay:0.2s;" />
                  <view class="ldot" style="animation-delay:0.4s;" />
                </view>
              </view>
            </view>

            <!-- 底部占位 -->
            <view style="height:20rpx;" />
          </view>
        </scroll-view>

        <!-- 错误提示 -->
        <view v-if="errorMsg" class="error-bar">
          <text class="error-text">⚠ {{ errorMsg }}</text>
          <text class="error-close" @click="errorMsg = ''">✕</text>
        </view>

        <!-- 输入区域 -->
        <view class="input-area">
          <view class="input-row">
            <!-- 语音按钮 -->
            <view
              class="voice-btn"
              :class="{ 'voice-active': isRecording }"
              @touchstart="startVoice"
              @touchend="endVoice"
              @click="toggleVoice"
            >
              <text class="voice-icon">{{ isRecording ? '🔴' : '🎙' }}</text>
            </view>

            <!-- 文字输入 -->
            <view class="input-wrap">
              <input
                class="text-input"
                v-model="inputText"
                :placeholder="inputPlaceholder"
                placeholder-style="color:rgba(201,168,76,0.5);font-size:26rpx;"
                :maxlength="200"
                :disabled="isLoading"
                @confirm="sendMessage"
                @input="onInput"
              />
            </view>

            <!-- 发送按钮 -->
            <view
              class="send-btn"
              :class="{ 'send-active': inputText.trim().length > 0 && !isLoading }"
              @click="sendMessage"
            >
              <text class="send-icon">↑</text>
            </view>
          </view>

          <!-- 语音状态提示 -->
          <view v-if="isRecording" class="recording-tip">
            <view class="rec-wave">
              <view v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${(i-1)*0.12}s` }" />
            </view>
            <text class="rec-text">正在聆听，松开发送…</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { chatWithLiHe } from '@/utils/api.js'

const QUICK_QUESTIONS = [
  '你为何用"石破天惊"形容箜篌之声？',
  '箜篌究竟有多少根弦？',
  '你与李白谁更浪漫？',
  '"昆山玉碎"描摹的是怎样的声音？'
]

const EXTENDED_PREDEFINED = {
  '你好': '余，李贺也，字长吉，人称"诗鬼"。昨夜闻李凭箜篌之声，惊为天人，遂有此篇。汝有何问，但说无妨。',
  'hi': '余，李贺也，字长吉，人称"诗鬼"。昨夜闻李凭箜篌之声，惊为天人，遂有此篇。汝有何问，但说无妨。',
  '你是谁': '吾乃唐代诗人李贺，字长吉，河南府福昌人。少有诗名，与李白并称"太白仙才，长吉鬼才"。吾之诗，多奇崛之象，冷艳之辞，世人称之为"鬼才之笔"。',
  '介绍': '吾乃唐代诗人李贺，字长吉，河南府福昌人，生于790年，卒于816年，仅活二十七岁。虽英年早逝，却留下二百余首传世之作，以奇崛瑰丽之风格独树一帜，与李白、李商隐并称"三李"。',
  '李凭': '李凭者，中唐名动京华之宫廷乐师也。其箜篌演奏技艺出神入化，冠绝一时。吾亲闻其弹奏，但觉昆山玉碎、凤凰齐鸣，芙蓉泣露、香兰含笑，深受震撼，故作此诗以记之。',
  '李凭是谁': '李凭者，中唐名动京华之宫廷乐师也，技艺冠绝一时。吾亲闻其弹奏，深受震撼，故作此诗。',
  '箜篌': '箜篌者，大唐主流弹拨乐器也，形制优美，音色清亮。有卧箜篌与竖箜篌之分。李凭所奏，乃竖箜篌也，二十三弦，竖抱于怀，双手并用，其声之美，可感天地，可动鬼神。',
  '箜篌是什么': '箜篌，自汉代由西域传入，有卧、竖两制。李凭所奏竖箜篌，二十三弦，双手并奏，音色清亮透明，震撼人心。',
  '石破天惊': '"石破天惊"一句，乃吾描摹李凭箜篌之声震破苍穹之意也。彼时乐声直冲云霄，惊破女娲补天之处，引得秋雨淅沥而落。此非夸张，实乃以想象写音乐之极致感染力耳。',
  '石破天惊是什么意思': '"石破天惊逗秋雨"，意为箜篌之音震裂了女娲补天之石，惊动了苍穹，引来一阵秋雨。此句极尽夸张想象之能事，以神话意象写音乐之无上震撼，为千古名句。',
  '昆山玉碎': '"昆山玉碎凤凰叫"，以昆仑美玉碎裂之声，比喻箜篌音色之清脆铿锵；以凤凰和鸣，写其舒展辉煌。一句之中，清脆与悠扬并存，此通感之妙也。',
  '芙蓉泣露': '"芙蓉泣露香兰笑"，以芙蓉泣露写哀怨凄清，以香兰含笑写明朗欢快。悲喜交织，阴阳相济，此乃音乐之丰富情感也。',
  '通感': '通感者，以一种感官之感受，描摹另一种感官之印象也。吾诗中将听觉转化为视觉、触觉乃至幻觉，如"昆山玉碎"写声如玉碎，使读者观诗如闻乐，此通感之极致也。',
  '通感是什么': '通感，又称"移觉"，是将不同感官的感受相互转化的修辞手法。吾诗中以视觉写听觉，以触觉写情绪，多种感官交融，使无形之乐声变得可感可触。',
  '诗乐共生': '诗与乐，自古共生。吾之《李凭箜篌引》，以诗记乐，使早已消散的箜篌之音借诗永存。诗因乐而生，乐因诗而不朽，此即"诗乐共生"之真谛也。',
  '大唐': '大唐盛世，文化多元，乐坊繁盛。箜篌、筝、阮咸等弹拨乐器，皆于此时大放异彩。吾生于此时，得闻李凭之箜篌，实为三生有幸。',
  '唐朝': '大唐盛世，乃中华文明之巅峰。诗歌、音乐、舞蹈、绘画，无不繁荣昌盛。长安城中，来自西域之箜篌与本土之筝、阮咸共鸣，诗人与乐师相得益彰。',
  '李白': '李太白，诗仙也，吾最敬仰之前辈。世人常言"太白仙才，长吉鬼才"，以此并称你我。然吾诗风与太白迥异，彼多飘逸豪放，吾则偏于奇崛冷艳。各有千秋，难分高下。',
  '谁更浪漫': '太白好言仙境，飘逸豪迈；吾喜写鬼神，冷艳奇崛。浪漫之道，各有千秋。太白如日，吾如月，皆为大唐浪漫之代表也。',
  '你写了哪些诗': '吾一生虽短，然诗作颇丰，有《雁门太守行》《梦天》《金铜仙人辞汉歌》等传世之作。其中《李凭箜篌引》尤为后人称道，被誉为"摹写声音之至文"。',
  '代表作': '吾之代表作有《李凭箜篌引》《雁门太守行》《梦天》《金铜仙人辞汉歌》《苏小小墓》等。《李凭箜篌引》以描摹音乐见长，《雁门太守行》以"黑云压城城欲摧"起笔，气势磅礴。',
  '意象': '吾善用奇崛意象，昆山玉、凤凰、女娲、月宫、老鱼、瘦蛟……皆非寻常之物。以神话传说入诗，以天地万物写音，此乃"鬼才"之所在也。',
  '夸张': '夸张者，极言其情也。"石破天惊""二十三丝动紫皇"，皆极尽夸张之能事，非为虚妄，乃为传达那无法言说之音乐震撼也。',
  '情感': '吾借李凭高超技艺，寄托对艺术之推崇、对大唐文化之赞美，亦暗含自身怀才不遇之淡淡愁绪。诗中有喜有悲，有惊有叹，情感丰富而深沉。',
  '赏析': '《李凭箜篌引》全诗十四句，几乎未正面写乐，而是以神话意象侧面烘托箜篌之音的超凡魅力。通感、夸张、想象三法融合，堪称摹写声音之绝唱。',
  '艺术手法': '此诗主要艺术手法有四：一曰通感，以视觉写听觉；二曰夸张，极言乐声震撼；三曰神话想象，引女娲、湘妃、吴刚等入诗；四曰侧面烘托，以景物反应写乐声之美。',
  '吴丝蜀桐': '"吴丝蜀桐张高秋"，以箜篌之名材起笔。吴地蚕丝为弦，蜀地桐木为身，皆天下名材，未闻其声先感其贵。',
  '空山凝云': '"空山凝云颓不流"，以浮云凝滞不动，侧面写箜篌之声令天地屏息。此乃侧面烘托之妙法。',
  '江娥': '"江娥啼竹素女愁"，江娥即湘妃，素女乃神话神女。李凭箜篌之声，竟令仙人亦为之动容落泪，足见其感染力之强。',
  '女娲': '诗中女娲补天之处，被箜篌之声震破，引来秋雨。以神话入诗，极言箜篌之音可惊天地、动神灵。',
  '老鱼': '"老鱼跳波瘦蛟舞"，写深水中老鱼和瘦蛟随乐起舞，反衬箜篌之音无所不至的神奇力量。',
  '吴质': '"吴质不眠倚桂树"，吴质即吴刚，月宫砍桂之神。箜篌之声传至月宫，令吴刚忘却砍伐，彻夜倚桂而听。',
  '弦': '吾诗中所言"二十三丝动紫皇"，箜篌共有二十三根弦，弦弦皆能拨动天地，感动紫皇。',
  '筝': '古筝者，唐代雅乐俗乐必备之名器也，装饰华美，有银筝、金筝、玉筝之称，音色丰富悠扬。',
  '阮咸': '阮咸者，以竹林七贤阮咸命名之乐器也，形圆项长，十三品柱，唐代形制成熟，派生出月琴，形似明月，声合琴韵。',
  '鬼才': '世人称吾为"鬼才"，盖因吾诗多涉鬼神冥界，意象奇崛冷艳，不类寻常。然所谓"鬼才"，不过是以异于常人之眼光观奇幻之世界，以异于常人之辞藻写动人之情感耳。',
  '学习': '学习此诗，当有三得：一感音乐描摹之独特艺术手法；二理解"诗乐共生"之意象美学；三掌握诗歌之艺术成就与文学史价值。',
  '浪漫': '大唐之浪漫，在于其包容开放、文化多元。诗人以天马行空之想象入诗，乐师以出神入化之技艺奏乐，二者相融，便是"诗乐共生"之大唐浪漫。'
}

function localPredefinedReply(question) {
  const msg = (question || '').trim()
  for (const key of Object.keys(EXTENDED_PREDEFINED)) {
    if (msg.includes(key) || key.includes(msg)) {
      return EXTENDED_PREDEFINED[key]
    }
  }
  return '余，李贺也，字长吉，人称"诗鬼"。汝之问题深妙，余需细细思量。但凡涉及《李凭箜篌引》、箜篌之音、大唐诗乐，皆可向余请教，余必倾囊相授。\n\n（可问："昆山玉碎""石破天惊""通感""箜篌""你是谁""赏析"等）'
}

function getNow() {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default {
  name: 'AIDialog',
  props: {
    autoOpen: { type: Boolean, default: false }
  },
  emits: ['open', 'close'],
  data() {
    return {
      visible: false,
      messages: [],
      inputText: '',
      isLoading: false,
      isRecording: false,
      errorMsg: '',
      scrollTop: 0,
      scrollVal: 0,
      quickQuestions: QUICK_QUESTIONS,
      recognition: null,
      speechSupported: false
    }
  },
  computed: {
    inputPlaceholder() {
      return this.isRecording ? '语音识别中…' : '向李贺提问，穿越千年…'
    }
  },
  mounted() {
    if (this.autoOpen) this.openDialog()
    this.checkSpeechSupport()
  },
  beforeDestroy() {
    this.stopRecognition()
  },
  methods: {
    openDialog() {
      this.visible = true
      this.$emit('open')
    },

    closeDialog() {
      this.visible = false
      this.stopRecognition()
      this.$emit('close')
    },

    onInput(e) {
      this.inputText = e.detail.value
    },

    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.isLoading) return
      this.pushMessage('user', text)
      this.inputText = ''
      this.errorMsg = ''
      this.isLoading = true
      this.scrollToBottom()

      try {
        const res = await chatWithLiHe(text)
        if (res && res.success && res.reply) {
          this.pushMessage('ai', res.reply)
        } else {
          const fallback = localPredefinedReply(text)
          this.pushMessage('ai', fallback)
        }
      } catch (e) {
        const fallback = localPredefinedReply(text)
        this.pushMessage('ai', fallback)
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    sendQuick(question) {
      this.inputText = question
      this.sendMessage()
    },

    pushMessage(role, content) {
      this.messages.push({ role, content, time: getNow() })
      this.scrollToBottom()
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollVal += 9999
        this.scrollTop = this.scrollVal
      })
    },

    checkSpeechSupport() {
      if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        this.speechSupported = true
      }
    },

    toggleVoice() {
      if (!this.speechSupported) {
        uni.showToast({ title: '当前环境不支持语音识别', icon: 'none' })
        return
      }
      if (this.isRecording) {
        this.stopRecognition()
      } else {
        this.startRecognition()
      }
    },

    startVoice() {},
    endVoice() {},

    startRecognition() {
      if (!this.speechSupported) return
      try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SR()
        this.recognition.lang = 'zh-CN'
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript
          this.inputText = transcript
          this.isRecording = false
          if (transcript.trim()) this.sendMessage()
        }
        this.recognition.onerror = () => {
          this.isRecording = false
          uni.showToast({ title: '语音识别失败，请重试', icon: 'none' })
        }
        this.recognition.onend = () => {
          this.isRecording = false
        }
        this.recognition.start()
        this.isRecording = true
      } catch (e) {
        this.isRecording = false
        uni.showToast({ title: '语音功能不可用', icon: 'none' })
      }
    },

    stopRecognition() {
      if (this.recognition) {
        try { this.recognition.stop() } catch (e) {}
        this.recognition = null
      }
      this.isRecording = false
    }
  }
}
</script>

<style scoped>
.ai-dialog-wrap {
  width: 100%;
}

/* ===== 入口按钮 ===== */
.ai-entry {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: linear-gradient(135deg, #1A1A2E 0%, #2C2C4A 100%);
  border: 2rpx solid rgba(201, 168, 76, 0.4);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 6rpx 28rpx rgba(26, 26, 46, 0.25);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.ai-entry::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(201, 168, 76, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.ai-entry:active {
  transform: scale(0.98);
}

.entry-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.entry-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 3rpx solid #C9A84C;
  overflow: hidden;
  display: block;
  background: #fff;
}

.entry-glow {
  position: absolute;
  inset: -6rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(201, 168, 76, 0.3);
  animation: glow-pulse 2s infinite ease-in-out;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.06); }
}

.entry-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.entry-name {
  font-size: 32rpx;
  color: #C9A84C;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.entry-hint {
  font-size: 22rpx;
  color: rgba(232, 213, 163, 0.65);
}

.entry-seal {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(192, 57, 43, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(192, 57, 43, 0.12);
}

.seal-text {
  font-size: 22rpx;
  color: #E8756A;
  font-family: "STKaiti", serif;
  font-weight: bold;
}

/* ===== 弹窗遮罩 ===== */
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(13, 20, 40, 0.72);
  z-index: 9000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* ===== 对话面板 ===== */
.dialog-panel {
  width: 100%;
  max-width: 750rpx;
  height: 86vh;
  background: linear-gradient(180deg, #0D1527 0%, #151F3A 100%);
  border-radius: 40rpx 40rpx 0 0;
  border-top: 2rpx solid rgba(201, 168, 76, 0.4);
  border-left: 1rpx solid rgba(201, 168, 76, 0.15);
  border-right: 1rpx solid rgba(201, 168, 76, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 头部 ===== */
.dialog-header {
  flex-shrink: 0;
  padding: 28rpx 32rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-bottom: 1rpx solid rgba(201, 168, 76, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid #C9A84C;
  display: block;
  overflow: hidden;
  background: #fff;
}

.avatar-pulse {
  position: absolute;
  inset: -5rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(201, 168, 76, 0.5);
  animation: glow-pulse 1s infinite;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.dialog-title {
  font-size: 30rpx;
  color: #C9A84C;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #8B8B8B;
}

.status-dot.active {
  background: #27AE60;
  box-shadow: 0 0 8rpx rgba(39, 174, 96, 0.6);
}

.status-dot.loading {
  background: #C9A84C;
  animation: status-blink 0.8s infinite;
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-size: 22rpx;
  color: rgba(232, 213, 163, 0.6);
}

.header-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.12);
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-icon {
  font-size: 26rpx;
  color: #E8D5A3;
}

/* ===== 消息滚动区 ===== */
.messages-scroll {
  flex: 1;
  overflow: auto;
}

.messages-inner {
  padding: 24rpx 24rpx 0;
}

/* ===== 欢迎卡片 ===== */
.welcome-wrap {
  padding: 8rpx 0 24rpx;
}

.welcome-card {
  background: rgba(201, 168, 76, 0.08);
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-quote {
  font-size: 26rpx;
  color: #E8D5A3;
  line-height: 1.9;
  font-family: "STKaiti", serif;
  font-style: italic;
}

.welcome-sub {
  font-size: 22rpx;
  color: rgba(201, 168, 76, 0.65);
  margin-top: 10rpx;
}

.welcome-divider {
  width: 80rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #C9A84C, transparent);
  margin: 20rpx auto;
}

.welcome-tips {
  font-size: 24rpx;
  color: rgba(232, 213, 163, 0.5);
  margin-bottom: 20rpx;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
}

.quick-btn {
  background: rgba(201, 168, 76, 0.1);
  border: 1rpx solid rgba(201, 168, 76, 0.35);
  border-radius: 9999rpx;
  padding: 10rpx 22rpx;
}

.quick-btn:active {
  background: rgba(201, 168, 76, 0.25);
}

.quick-text {
  font-size: 23rpx;
  color: #C9A84C;
  font-family: "STKaiti", serif;
}

/* ===== 消息行 ===== */
.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.row-user {
  flex-direction: row-reverse;
}

.row-ai {
  flex-direction: row;
}

.msg-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(201, 168, 76, 0.5);
  flex-shrink: 0;
  display: block;
  overflow: hidden;
  background: #fff;
}

.user-avatar-wrap {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(44, 95, 110, 0.3);
  border: 2rpx solid rgba(44, 95, 110, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar-icon {
  font-size: 30rpx;
}

/* ===== 气泡 ===== */
.bubble {
  max-width: 68%;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bubble-ai {
  background: rgba(201, 168, 76, 0.2);
  border: 1rpx solid rgba(201, 168, 76, 0.35);
  border-bottom-left-radius: 6rpx;
}

.bubble-user {
  background: linear-gradient(135deg, #C9A84C 0%, #A07830 100%);
  border-bottom-right-radius: 6rpx;
}

.bubble-text {
  font-size: 28rpx;
  line-height: 1.8;
  font-family: "STKaiti", "KaiTi", serif;
}

.bubble-ai .bubble-text {
  color: #E8D5A3;
}

.bubble-user .bubble-text {
  color: #1A1A2E;
}

.bubble-time {
  font-size: 20rpx;
  opacity: 0.55;
  text-align: right;
}

.bubble-ai .bubble-time { color: #C9A84C; }
.bubble-user .bubble-time { color: rgba(26, 26, 46, 0.7); }

/* ===== loading气泡 ===== */
.bubble-loading {
  padding: 20rpx 28rpx;
  min-width: 80rpx;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 28rpx;
}

.ldot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #C9A84C;
  animation: ldot-bounce 1.2s infinite ease-in-out;
}

@keyframes ldot-bounce {
  0%, 80%, 100% { transform: scale(0.55); opacity: 0.45; }
  40% { transform: scale(1); opacity: 1; }
}

/* ===== 错误提示 ===== */
.error-bar {
  flex-shrink: 0;
  background: rgba(192, 57, 43, 0.15);
  border-top: 1rpx solid rgba(192, 57, 43, 0.3);
  padding: 14rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-text {
  font-size: 24rpx;
  color: #E8756A;
  flex: 1;
}

.error-close {
  font-size: 26rpx;
  color: rgba(232, 117, 106, 0.7);
  padding-left: 16rpx;
}

/* ===== 输入区 ===== */
.input-area {
  flex-shrink: 0;
  padding: 16rpx 20rpx 32rpx;
  background: rgba(13, 18, 38, 0.96);
  border-top: 1rpx solid rgba(201, 168, 76, 0.18);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.voice-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.1);
  border: 2rpx solid rgba(201, 168, 76, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.voice-btn:active, .voice-active {
  background: rgba(192, 57, 43, 0.25);
  border-color: #C0392B;
  transform: scale(1.06);
}

.voice-icon {
  font-size: 32rpx;
}

.input-wrap {
  flex: 1;
  background: rgba(255, 255, 255, 0.07);
  border: 1rpx solid rgba(201, 168, 76, 0.28);
  border-radius: 9999rpx;
  padding: 0 28rpx;
  min-height: 76rpx;
  display: flex;
  align-items: center;
}

.text-input {
  width: 100%;
  font-size: 28rpx;
  color: #E8D5A3;
  font-family: "STKaiti", "KaiTi", serif;
  background: transparent;
  border: none;
  min-height: 60rpx;
  line-height: 60rpx;
}

.send-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.15);
  border: 2rpx solid rgba(201, 168, 76, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.send-active {
  background: linear-gradient(135deg, #C9A84C, #A07830);
  border-color: #C9A84C;
  box-shadow: 0 4rpx 16rpx rgba(201, 168, 76, 0.4);
}

.send-icon {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.recording-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding-top: 16rpx;
}

.rec-wave {
  display: flex;
  align-items: center;
  gap: 5rpx;
  height: 32rpx;
}

.wave-bar {
  width: 6rpx;
  background: #C0392B;
  border-radius: 4rpx;
  animation: wave-dance 0.5s infinite alternate ease-in-out;
}

@keyframes wave-dance {
  0% { height: 8rpx; }
  100% { height: 28rpx; }
}

.rec-text {
  font-size: 22rpx;
  color: #E8756A;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>