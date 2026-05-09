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

Page({
  data: {
    visible: false,
    showEntry: true,
    messages: [],
    inputText: '',
    isLoading: false,
    isRecording: false,
    errorMsg: '',
    scrollTop: 0,
    scrollVal: 0,
    quickQuestions: QUICK_QUESTIONS,
    recognition: null,
    speechSupported: false,
    inputPlaceholder: '向李贺提问，穿越千年…'
  },
  onLoad() {
    this.checkSpeechSupport()
  },
  openDialog() {
    console.log('[AI] openDialog')
    this.setData({
      visible: true,
      showEntry: false
    })
  },
  closeDialog() {
    console.log('[AI] closeDialog')
    this.setData({
      visible: false,
      showEntry: true
    })
    this.stopRecognition()
  },
  onInput(e) {
    const v = e && e.detail ? e.detail.value : ''
    console.log('[AI] onInput ->', v)
    this.setData({
      inputText: v
    })
  },
  sendMessage() {
    const text = this.data.inputText.trim()
    if (!text || this.data.isLoading) return
    console.log('[AI] sendMessage ->', text)
    this.pushMessage('user', text)
    this.setData({
      inputText: '',
      errorMsg: '',
      isLoading: true
    })
    this.scrollToBottom()

    // 获取全局配置
    const app = getApp()
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3000'
    const user = app.globalData.userInfo
    const token = app.globalData.token

    // 调用真实 AI 接口
    wx.request({
      url: `${baseUrl}/api/ai-dialogue`,
      method: 'POST',
      data: {
        question: text,
        user_id: user ? user.user_id : null
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      timeout: 30000,
      success: (res) => {
        console.log('[AI] API success ->', res)
        // 修正：只要接口返回 200 且有 reply 内容，就通过 pushMessage 更新消息列表
        // pushMessage 内部封装了 setData 逻辑，确保 UI 能够正确渲染
        if (res.statusCode === 200 && res.data && res.data.reply) {
          this.pushMessage('ai', res.data.reply)
        } else {
          this.triggerFallback(text)
        }
      },
      fail: (err) => {
        console.error('[AI] API fail (timeout or network error) ->', err)
        this.triggerFallback(text)
      },
      complete: () => {
        this.setData({ isLoading: false })
        this.scrollToBottom()
      }
    })
  },
  triggerFallback(text) {
    const fallback = localPredefinedReply(text)
    console.log('[AI] replying (fallback) ->', fallback)
    this.pushMessage('ai', fallback || '抱歉，暂无法回应。')
  },
  sendQuick(e) {
    const question = e.currentTarget.dataset.question
    this.setData({
      inputText: question
    })
    this.sendMessage()
  },
  pushMessage(role, content) {
    const messages = [...this.data.messages, { role, content, time: getNow() }]
    console.log('[AI] pushMessage ->', messages[messages.length - 1])
    this.setData({ messages }, () => {
      this.scrollToBottom()
    })
  },
  scrollToBottom() {
    this.setData({
      scrollTop: 99999
    })
  },
  checkSpeechSupport() {
    if (typeof wx !== 'undefined' && wx.getRecorderManager) {
      this.setData({
        speechSupported: true
      })
    }
  },
  toggleVoice() {
    if (!this.data.speechSupported) {
      wx.showToast({ title: '当前环境不支持语音识别', icon: 'none' })
      return
    }
    if (this.data.isRecording) {
      this.stopRecognition()
      this.setData({
        inputPlaceholder: '向李贺提问，穿越千年…'
      })
    } else {
      this.startRecognition()
      this.setData({
        inputPlaceholder: '语音识别中…'
      })
    }
  },
  startRecognition() {
    if (!this.data.speechSupported) return
    try {
      const recorder = wx.getRecorderManager()
      const options = {
        duration: 60000,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      }
      recorder.start(options)
      this.setData({
        isRecording: true
      })
      recorder.onStop((res) => {
        this.setData({
          isRecording: false
        })
        // 这里可以添加语音识别逻辑
        wx.showToast({ title: '语音识别功能暂未实现', icon: 'none' })
      })
      recorder.onError((err) => {
        this.setData({
          isRecording: false
        })
        wx.showToast({ title: '语音识别失败，请重试', icon: 'none' })
      })
    } catch (e) {
      this.setData({
        isRecording: false
      })
      wx.showToast({ title: '语音功能不可用', icon: 'none' })
    }
  },
  stopRecognition() {
    if (this.data.isRecording) {
      try {
        const recorder = wx.getRecorderManager()
        recorder.stop()
      } catch (e) {}
      this.setData({
        isRecording: false
      })
    }
  },
  clearError() {
    this.setData({
      errorMsg: ''
    })
  }
})