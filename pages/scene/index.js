Page({
  data: {
    sceneStarted: false,
    showPopup: false,
    activeId: '',
    pulseId: '',
    currentHotspot: {},
    hotspots: [
      {
        id: 'cloud',
        label: '凝云',
        image: '/images/cloud.png',
        left: '15%',
        top: '28%',
        width: '220rpx',
        delay: 0,
        visible: false,
        floatClass: 'float-a',
        poem: '空山凝云颓不流',
        desc: '乐声一起，连空山中的流云都仿佛停住不再流动。诗人不直接写声音，而是借“云停”侧面表现箜篌声的强烈感染力。',
        technique: '侧面烘托，以景衬乐'
      },
      {
        id: 'phoenix',
        label: '凤凰叫',
        image: '/images/phoenix.png',
        left: '72%',
        top: '30%',
        width: '120rpx',
        delay: 300,
        visible: false,
        floatClass: 'float-b',
        poem: '昆山玉碎凤凰叫',
        desc: '诗人把音乐比作美玉碎裂时的清脆之声，又像凤凰鸣叫般高亢悠扬，让抽象的声音有了鲜明画面。',
        technique: '通感交融，以形写声'
      },
      {
        id: 'nvwa',
        label: '女娲补天处',
        image: '/images/nvwa.png',
        left: '50%',
        top: '36%',
        width: '96rpx',
        delay: 600,
        visible: false,
        floatClass: 'float-c',
        poem: '女娲炼石补天处，石破天惊逗秋雨',
        desc: '音乐仿佛震动天地，直冲女娲补天之处，惊裂天石，引动秋雨，把想象推向极致。',
        technique: '想象奇崛，夸张极致'
      },
      {
        id: 'furong',
        label: '芙蓉泣露',
        image: '/images/furong.png',
        left: '10%',
        top: '54%',
        width: '104rpx',
        delay: 900,
        visible: false,
        floatClass: 'float-d',
        poem: '芙蓉泣露香兰笑',
        desc: '乐声一时凄清婉转，像带露芙蓉一般，诗人把听觉转换成视觉和情绪感受。',
        technique: '通感描写，虚实结合'
      },
      {
        id: 'xianglan',
        label: '香兰笑',
        image: '/images/xianglan.png',
        left: '70%',
        top: '50%',
        width: '120rpx',
        delay: 1100,
        visible: false,
        floatClass: 'float-e',
        poem: '芙蓉泣露香兰笑',
        desc: '与“芙蓉泣露”的凄清相对，“香兰笑”写出乐声中明朗、轻快、清新的另一面。诗人把声音转写成可见的花姿与情绪变化。',
        technique: '通感交融，以形写声'
      },
      {
        id: 'laoyu',
        label: '老鱼跳波',
        image: '/images/laoyu.png',
        left: '8%',
        top: '68.5%',
        width: '120rpx',
        delay: 1300,
        visible: false,
        floatClass: 'float-b',
        poem: '老鱼跳波瘦蛟舞',
        desc: '连深水中的老鱼与瘦蛟都被乐声感染而跃动起舞，表现音乐动人至深、感发万物。',
        technique: '层层渲染，借物写乐'
      },
      {
        id: 'shoujiao',
        label: '瘦蛟舞',
        image: '/images/shoujiao.png',
        left: '32%',
        top: '57%',
        width: '120rpx',
        delay: 1500,
        visible: false,
        floatClass: 'float-c',
        poem: '老鱼跳波瘦蛟舞',
        desc: '不仅老鱼跃波，连瘦蛟也随乐起舞，进一步写出箜篌声感动水族、震动万物的效果。',
        technique: '层层递进，夸张渲染'
      },
      {
        id: 'hantu',
        label: '寒兔',
        image: '/images/hantu.png',
        left: '60%',
        top: '63%',
        width: '120rpx',
        delay: 1700,
        visible: false,
        floatClass: 'float-a',
        poem: '露脚斜飞湿寒兔',
        desc: '月宫中的寒兔也沉浸在乐声余韵中，连露水沾湿都浑然不觉，写出音乐余音袅袅、动人心魄。',
        technique: '神话想象，余韵收束'
      },
      {
        id: 'konghou',
        label: '二十三丝',
        type: 'area',
        left: '48%',
        top: '71%',
        areaWidth: '120rpx',
        areaHeight: '200rpx',
        delay: 1900,
        visible: false,
        floatClass: 'float-d',
        poem: '十二门前融冷光，二十三丝动紫皇',
        desc: '"二十三丝"代指箜篌本身。这里既点明乐器特征，也把震动天庭的乐声重新扣回到李凭高超的演奏技艺上。',
        technique: '借器写乐，点明本体'
      }
    ]
    
    
  },

  onLoad() {
    this.timers = [];
    // 创建并播放音频
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = '/backend/static/audio/changjing.mp3'; // 音频路径
    innerAudioContext.onPlay(() => {
      console.log('开始播放箜篌音频');
    });
    innerAudioContext.onError((res) => {
      console.error('箜篌音频播放错误', res.errMsg, res.errCode);
    });
    this.audioContext = innerAudioContext;
  },

  onUnload() {
    // 页面卸载时停止并销毁音频
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
      console.log('箜篌音频已停止并销毁');
    }
    this.clearTimers();
  },
  onHide() {
    if (this.audioContext) {
      this.audioContext.stop();
    }
  },
  
  onShow() {
    if (this.audioContext) {
      this.audioContext.play();
    }
  },

  handleStartScene() {
    this.clearTimers();
  
    const resetHotspots = this.data.hotspots.map(item => ({
      ...item,
      visible: false
    }));
  
    if (!this.data.sceneStarted) {
      this.setData({
        sceneStarted: true,
        showPopup: false,
        activeId: '',
        pulseId: '',
        currentHotspot: {},
        hotspots: resetHotspots
      });
  
      // ② 按从上到下顺序出现
      const orderedIds = ['cloud', 'phoenix', 'nvwa', 'furong', 'xianglan', 'shoujiao', 'laoyu', 'hantu', 'konghou'];
      orderedIds.forEach((id, i) => {
        const index = this.data.hotspots.findIndex(h => h.id === id);
        if (index === -1) return;
        const timer = setTimeout(() => {
          this.setData({ [`hotspots[${index}].visible`]: true });
        }, i * 280);
        this.timers.push(timer);
      });
  
      // ⑤ 2秒后自动pulse凤凰，提示可点击
      const hintTimer = setTimeout(() => {
        this.setData({ pulseId: 'phoenix' });
        setTimeout(() => this.setData({ pulseId: '' }), 650);
      }, 2000);
      this.timers.push(hintTimer);
  
    } else {
      this.setData({
        sceneStarted: false,
        showPopup: false,
        activeId: '',
        pulseId: '',
        currentHotspot: {},
        hotspots: resetHotspots
      });
    }
  },
  
  handleTapHotspot(e) {
    if (!this.data.sceneStarted) return;
  
    const { id } = e.currentTarget.dataset;
    const hotspot = this.data.hotspots.find(item => item.id === id);
    if (!hotspot) return;
  
    // ③ 根据点击位置动态决定弹窗位置
    const topVal = parseFloat(hotspot.top);
    const popupTop = topVal > 55 ? '38%' : '58%';
  
    this.setData({
      activeId: id,
      pulseId: id,
      currentHotspot: hotspot,
      showPopup: true,
      popupTop
    });
  
    setTimeout(() => {
      if (this.data.pulseId === id) {
        this.setData({ pulseId: '' });
      }
    }, 650);
  },
  handleClosePopup() {
    this.setData({
      showPopup: false,
      activeId: ''
    });
  },

  clearTimers() {
    if (this.timers && this.timers.length) {
      this.timers.forEach(timer => clearTimeout(timer));
      this.timers = [];
    }
  },

  
});