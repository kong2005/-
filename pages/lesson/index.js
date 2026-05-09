Page({
  data: {
    currentScrollTop: 0,
    targetScrollTop: 0,
    showInstrumentModal: false,
    selectedInstrument: null,
    showComparisonModal: false,
    scrollToViewId: '',
    playingKey: '',
    isReciting: false,
    activeLineIndex: -1,
    // 诗词数据：同步时间戳已微调，预留了 0.2s 的提前量
    poemLines: [
      { chars: ['吴','丝','蜀','桐','张','高','秋'], startTime: 1 },
      { chars: ['空','山','凝','云','颓','不','流'], startTime: 4.0 },
      { chars: ['江','娥','啼','竹','素','女','愁'], startTime: 7.3 },
      { chars: ['李','凭','中','国','弹','箜','篌'], startTime: 9.6 },
      { chars: ['昆','山','玉','碎','凤','凰','叫'], startTime: 12.3 },
      { chars: ['芙','蓉','泣','露','香','兰','笑'], startTime: 14.9 },
      { chars: ['十','二','门','前','融','冷','光'], startTime: 18.3 },
      { chars: ['二','十','三','丝','动','紫','皇'], startTime: 21.7 },
      { chars: ['女','娲','炼','石','补','天','处'], startTime: 25.0 },
      { chars: ['石','破','天','惊','逗','秋','雨'], startTime: 27.5 },
      { chars: ['梦','入','神','山','教','神','妪'], startTime: 30.2 },
      { chars: ['老','鱼','跳','波','瘦','蛟','舞'], startTime: 32.9 },
      { chars: ['吴','质','不','眠','倚','桂','树'], startTime: 35.3 },
      { chars: ['露','脚','斜','飞','湿','寒','兔'], startTime: 37.7 }
    ],
    instrumentDetails: {
      'konghou': {
        name: '箜篌',
        dynasty: '汉唐盛世',
        features: '音色清亮透明，表现力极强。',
        story: '李贺诗中"昆山玉碎凤凰叫"即是描摹其声。它自西域传入，在唐代达到鼎盛，是宫廷乐府的核心乐器。'
      },
      'zheng': {
        name: '古筝',
        dynasty: '秦汉至今',
        features: '音域宽广，音色优美醇厚。',
        story: '唐代雅乐、俗乐必备。与箜篌相比，筝声更显沉稳，常用于描摹流水或哀思。'
      },
      'ruanxian': {
        name: '阮咸',
        dynasty: '魏晋名器',
        features: '声合琴韵，形似明月。',
        story: '以"竹林七贤"之阮咸命名。其音中正平和，在唐代乐坊中占有重要地位。'
      }
    },
    comparisonContent: {
      title: '历代音乐诗对比分析',
      activeTab: 'all',
      list: [
        {
          poem: '《李凭箜篌引》· 李贺',
          style: '奇崛瑰丽，充满神话色彩。',
          method: '通感、想象、侧面烘托（石破天惊）。',
          tags: ['all', 'tonggan', 'imagination'],
          isMatched: true
        },
        {
          poem: '《琵琶行》· 白居易',
          style: '写实传神，情感细腻。',
          method: '比喻（大珠小珠落玉盘）、虚实结合。',
          tags: ['all', 'realism', 'metaphor'],
          isMatched: true
        },
        {
          poem: '《听颖师弹琴》· 韩愈',
          style: '跌宕起伏，气势磅礴。',
          method: '正面描写与心理感受交织。',
          tags: ['all', 'emotion', 'positive'],
          isMatched: true
        }
      ]
    }
  },

  onLoad(options) {
    this.audioCtx = wx.createInnerAudioContext({ useWebAudioImplement: true });
    this.reciteCtx = wx.createInnerAudioContext();
  },

  onUnload() {
    this.stopRecitation();
    if (this.audioCtx) this.audioCtx.destroy();
    if (this.reciteCtx) this.reciteCtx.destroy();
  },

  // ===== 吟诵同步核心逻辑 (高频检查) =====
  initSyncTimer() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = setInterval(() => {
      if (!this.data.isReciting) return;
      const current = this.reciteCtx.currentTime;
      const offsetTime = current + 0.2; // 提前 0.2s 高亮，解决视觉延迟感

      let lineIdx = -1;
      for (let i = this.data.poemLines.length - 1; i >= 0; i--) {
        if (offsetTime >= this.data.poemLines[i].startTime) {
          lineIdx = i;
          break;
        }
      }
      if (lineIdx !== this.data.activeLineIndex) {
        this.setData({ activeLineIndex: lineIdx });
      }
    }, 100);
  },

  toggleRecitation() {
    this.data.isReciting ? this.stopRecitation() : this.startRecitation();
  },

  startRecitation() {
    const app = getApp();
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3000';
    this.setData({ isReciting: true });
    this.reciteCtx.src = `${baseUrl}/api/get-audio/langsong.mp3`;
    this.reciteCtx.onPlay(() => this.initSyncTimer());
    this.reciteCtx.onEnded(() => this.stopRecitation());
    this.reciteCtx.play();
  },

  stopRecitation() {
    if (this.reciteCtx) this.reciteCtx.stop();
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.setData({ isReciting: false, activeLineIndex: -1 });
  },

  // ===== 乐器及弹窗逻辑 (保留你的原始文案) =====
  handleInstrumentPlay(e) {
    const key = e.currentTarget.dataset.key;
    const app = getApp();
    const baseUrl = app.globalData.baseUrl;
    const audioSources = app.globalData.audioSources;
    const audioUrl = `${baseUrl}${audioSources[key]}`;

    if (this.data.playingKey === key) {
      this.audioCtx.stop();
      this.setData({ playingKey: '', selectedInstrument: null });
      return;
    }
    // Stop any currently playing audio before starting a new one
    if (this.audioCtx && this.data.playingKey) {
      this.audioCtx.stop();
    }
    this.audioCtx.src = audioUrl;
    this.audioCtx.play();
    this.setData({ playingKey: key, selectedInstrument: this.data.instrumentDetails[key], showInstrumentModal: true });
  },

  closeInstrumentModal() { this.setData({ showInstrumentModal: false }); },
  openComparison() { this.setData({ showComparisonModal: true }); },
  closeComparison() { this.setData({ showComparisonModal: false }); },
  
  switchCompTab(e) {
    const tab = e.currentTarget.dataset.tab;
    const list = this.data.comparisonContent.list.map(item => ({
      ...item,
      isMatched: item.tags.indexOf(tab) !== -1
    }));
    this.setData({ 'comparisonContent.activeTab': tab, 'comparisonContent.list': list });
  },

  goBack() { wx.switchTab({ url: '/pages/index/index' }); },
  goToScenePage() { wx.navigateTo({ url: '/pages/scene/index' }); },
  stopBubble() {},
  onPageScroll(e) { this.setData({ currentScrollTop: e.scrollTop }); }
});