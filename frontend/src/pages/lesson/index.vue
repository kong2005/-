<template>
  <view class="lesson-page">
    <!-- 顶部导航 -->
    <view class="cu-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">❮</text>
      </view>
      <text class="nav-title">李凭箜篌引 · 微课</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 内容滚动区 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      enhanced
      :refresher-enabled="false"
      :scroll-top="targetScrollTop"
      :scroll-with-animation="true"
      @scroll="onPageScroll"
    >
      <view class="section-container">
        <!-- 动态渲染所有章节 -->
        <LessonSection
          v-for="(section, index) in sections"
          :key="index"
          :id="'section-' + index"
          :section-data="section"
          :section-index="index"
          class="section-anim"
          :style="{ animationDelay: (index * 0.08) + 's' }"
          @ai-click="openAiDialog"
          @instrument-play="handleInstrumentPlay"
        />
        <view style="height: 120rpx;" />
      </view>
    </scroll-view>

    <!-- AI 对话组件 -->
    <AIDialog ref="aiDialogRef" />
  </view>
</template>

<script>
import LessonSection from '@/components/LessonSection.vue'
import AIDialog from '@/components/AIDialog.vue'
import { getCurrentUser } from '@/utils/api.js'

export default {
  name: 'LessonIndex',
  components: { LessonSection, AIDialog },
  data() {
    return {
      currentScrollTop: 0,
      targetScrollTop: 0,
      sections: [
        {
          type: 'cover',
          title: '诗乐共生·大唐浪漫',
          subtitle: '解析李贺《李凭箜篌引》',
          description: '微课与 AI 辅助教学 — 汉语言文学（唐宋诗词）',
          meta: []
        },
        {
          type: 'intro',
          title: '一声箜篌起',
          subtitle: '大唐千古情',
          description: '旋律，触动的不仅仅是听觉；音乐，从不只是娱人而已。眼耳鼻舌身意，都将在一场盛大中得到感发。',
          characters: [
            { name: '李贺', alias: '诗鬼', icon: '👻', desc: '中唐"诗鬼"，善用奇崛意象，有"太白仙才，长吉鬼才"之称' },
            { name: '李凭', alias: '乐师', icon: '🎵', desc: '大唐著名箜篌演奏家，技艺冠绝一时，深得文人雅士推崇' }
          ],
          goals: [
            '感受诗歌中音乐描摹的独特艺术手法',
            '理解"诗乐共生"的诗词意象美学',
            '掌握诗歌的艺术成就与文学史价值'
          ]
        },
        {
          type: 'poem',
          title: '原文呈现',
          subtitle: '鬼才之笔，绘箜篌之音',
          content: '吴丝蜀桐张高秋，空山凝云颓不流。江娥啼竹素女愁，李凭中国弹箜篌。昆山玉碎凤凰叫，芙蓉泣露香兰笑。十二门前融冷光，二十三丝动紫皇。女娲炼石补天处，石破天惊逗秋雨。梦入神山教神妪，老鱼跳波瘦蛟舞。吴质不眠倚桂树，露脚斜飞湿寒兔。'
        },
        {
          type: 'analysis',
          title: '诗乐解构',
          subtitle: '意象为骨，音乐为魂',
          stanzas: [
            {
              verse: '吴丝蜀桐张高秋，空山凝云颓不流。',
              annotation: '吴丝蜀桐：箜篌优质材料；江娥：湘妃；素女：神话神女',
              interpretation: '以箜篌材质起笔，用"凝云不流""湘妃啼竹"夸张烘托乐声凄婉，未闻其声先感其势',
              methods: ['用典', '侧面烘托', '以景衬乐']
            },
            {
              verse: '昆山玉碎凤凰叫，芙蓉泣露香兰笑。',
              annotation: '昆山玉：昆仑美玉；十二门：长安城门；紫皇：天帝',
              interpretation: '核心描摹句，以"玉碎"写清脆、"凤凰叫"写悠扬、"芙蓉泣露"写凄婉、"香兰笑"写明快',
              methods: ['通感交融', '以形写声', '虚实结合']
            },
            {
              verse: '女娲炼石补天处，石破天惊逗秋雨。',
              annotation: '女娲：神话人物；神妪：神山善弹箜篌神女；吴质：吴刚',
              interpretation: '想象推至极致，乐声震天地、动鬼神、惊万物，感染力覆盖三界',
              methods: ['想象奇崛', '夸张极致']
            }
          ],
          methodsSummary: [
            '侧面烘托，以景衬乐',
            '通感交融，以形写声',
            '层层递进，虚实结合',
            '想象奇崛，夸张极致'
          ]
        },
        {
          type: 'instrument',
          title: '乐器科普',
          subtitle: '诗乐共生的文化根基',
          intro: '箜篌为大唐主流弹拨乐器，形制优美、音色清亮。点击乐器聆听千年回响。',
          instruments: [
            { key: 'konghou', name: '箜篌', dynasty: '汉唐', description: '竖箜篌，汉代自西域传入，二十三弦，竖抱于怀，双手齐奏，音色清亮透明。', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_22/1757583541871-3877.jpg' },
            { key: 'zheng', name: '筝', dynasty: '秦唐', description: '古筝，唐代雅乐俗乐必备，装饰华美，有银筝、金筝、玉筝之称，音色丰富悠扬。', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_11/1757449804074-7374.png' },
            { key: 'ruanxian', name: '阮咸', dynasty: '魏晋唐', description: '阮咸，以竹林七贤阮咸命名，形圆项长，十三品柱，派生出月琴，形似明月，声合琴韵。', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/batch_7/1757274188237-1115.png' }
          ]
        },
        {
          type: 'achievement',
          title: '艺术成就',
          subtitle: '千古绝唱，独步诗坛',
          achievements: [
            { title: '描摹手法的极致创新', desc: '突破历代音乐诗范式，将通感、夸张、想象用到极致，让抽象音乐变得具象可感。' },
            { title: '意象选择的奇崛瑰丽', desc: '选取昆山玉、凤凰、女娲、月宫等浪漫意象，贴合大唐文化，又融入李贺"鬼才"风格。' },
            { title: '诗乐融合的完美典范', desc: '无一句直接写"乐"，却句句扣住箜篌的节奏、音色与情感，读诗如听乐。' },
            { title: '情感表达的含蓄深沉', desc: '借李凭高超技艺，抒发对艺术的推崇、对大唐文化的赞美，暗含自身怀才不遇的淡淡愁绪。' }
          ],
          quotes: [
            { text: '白香山"江上琵琶"，韩退之《颖师琴》，李长吉《李凭箜篌引》，皆摹写声音之至文。', author: '方扶南《李长吉诗集批注》' },
            { text: '此诗赞美李凭弹箜篌所产生的艺术魅力，用多种手法描摹，想像奇幻，词彩浓丽。', author: '《中国古代文学作品选》' }
          ]
        },
        {
          type: 'value',
          title: '文学史价值',
          subtitle: '承前启后，光耀千古',
          values: [
            { title: '承大唐之韵，拓音乐诗之境', desc: '继承大唐浪漫主义诗歌传统，突破音乐诗写作边界，将描摹手法与想象推至极致。' },
            { title: '启后世之文，立诗乐之范', desc: '影响宋代豪放派、婉约派诗词，为后世音乐诗、咏乐文树立"诗乐共生"的创作典范。' },
            { title: '融文化之魂，传大唐之美', desc: '融合大唐乐器、美学、浪漫文化，是研究大唐文化的重要史料。' }
          ],
          heritage: [
            '文化传承：箜篌虽后世失传，却因《李凭箜篌引》留存音色、形制与文化内涵。',
            '当代创新：以 AI 数字人、虚拟仿真、交互设计等技术还原诗乐场景，让大唐浪漫焕发生命力。'
          ]
        },
        {
          type: 'summary',
          title: '课堂总结',
          subtitle: '诗乐共生，薪火相传',
          summaries: [
            { icon: '📜', title: '诗之美', desc: '李贺以鬼才之笔，用通感、夸张、想象描摹箜篌之声，意象奇崛、辞藻瑰丽。' },
            { icon: '🎵', title: '乐之魂', desc: '箜篌作为大唐主流乐器，是诗歌创作的文化根基，诗乐相融让文字有音乐之魂。' },
            { icon: '🏮', title: '文之韵', desc: '诗歌承前启后，是大唐浪漫主义文学代表，树立诗乐共生典范。' }
          ],
          tasks: [
            { title: '自主探究', desc: '扫描二维码进入 AI 诗词学习小程序，自主学习李贺其他代表作。' },
            { title: '实践互动', desc: '以"诗乐共生"为主题，借助 AI 工具制作迷你微课课件。' }
          ],
          closing: '诗乐共生，是大唐的浪漫\n是文学的魅力，是文化的传承\n愿你以诗为舟，以乐为帆'
        }
      ]
    }
  },
  onLoad(options) {
    const user = getCurrentUser()
    if (!user) {
      uni.showModal({
        title: '提示',
        content: '建议登录后体验完整 AI 对话功能',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) uni.navigateTo({ url: '/pages/register/index' })
        }
      })
    }
    const tab = options && options.tab
    const sectionIndex = options && options.sectionIndex !== undefined ? parseInt(options.sectionIndex) : undefined
    if (tab && tab !== 'lesson') {
      setTimeout(() => {
        if (sectionIndex !== undefined && !isNaN(sectionIndex)) {
          this.scrollToSection(sectionIndex)
        } else {
          this.scrollToTab(tab)
        }
      }, 800)
    }
  },
  methods: {
    onPageScroll(e) {
      this.currentScrollTop = e.detail ? e.detail.scrollTop : 0
    },
    goBack() {
      uni.navigateBack()
    },
    openAiDialog() {
      this.$refs.aiDialogRef.openDialog()
    },
    handleInstrumentPlay(key) {
      console.log('Playing instrument:', key)
    },
    scrollToTab(tab) {
      const tabIndexMap = { lesson: 0, ai: 1, instrument: 4 }
      const idx = tabIndexMap[tab]
      if (idx === undefined) return
      this.scrollToSection(idx)
    },
    scrollToSection(sectionIndex) {
      const selectorId = `section-${sectionIndex}`
      uni.createSelectorQuery()
        .in(this)
        .select(`#${selectorId}`)
        .boundingClientRect()
        .exec((res) => {
          if (res && res[0]) {
            const scrollTop = (this.currentScrollTop || 0) + res[0].top - 20
            this.targetScrollTop = scrollTop > 0 ? scrollTop : 0
          }
        })
    }
  }
}
</script>

<style scoped>
/* ===== 页面基础 ===== */
.lesson-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #F8F3E8 0%, #EDE4CC 60%, #E8D5A3 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ===== 顶部导航 ===== */
.cu-navbar {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #1A1A2E 0%, #2C2C4A 60%, #3A1F1A 100%);
  border-bottom: 2rpx solid rgba(201, 168, 76, 0.5);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  box-shadow: 0 4rpx 32rpx rgba(13, 27, 42, 0.45);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.12);
  border: 1rpx solid rgba(201, 168, 76, 0.3);
  flex-shrink: 0;
  transition: background 0.2s;
}

.nav-back:active {
  background: rgba(201, 168, 76, 0.28);
}

.nav-back-icon {
  color: #C9A84C;
  font-size: 32rpx;
  font-weight: bold;
}

.nav-placeholder {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
  opacity: 0;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  color: #C9A84C;
  font-weight: bold;
  letter-spacing: 4rpx;
  font-family: "STKaiti", "KaiTi", serif;
  text-shadow: 0 0 16rpx rgba(201, 168, 76, 0.4);
}

/* ===== 滚动区 ===== */
.content-scroll {
  flex: 1;
  height: calc(100vh - 120rpx);
  width: 100%;
}

/* ===== 章节容器 ===== */
.section-container {
  padding: 28rpx 24rpx 40rpx;
}

/* ===== 章节入场动画 ===== */
@keyframes sectionFadeUp {
  0% {
    opacity: 0;
    transform: translateY(40rpx) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.section-anim {
  animation: sectionFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ===== 渐变缩放交互特效 ===== */
.section-anim:active {
  transform: scale(0.985);
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>