import logging
import httpx
from openai import OpenAI
from config import AI_CONFIG, LI_HE_SYSTEM_PROMPT, LI_HE_PREDEFINED

logger = logging.getLogger(__name__)

_client = None

# ===== 扩充预回答库（覆盖更多高频问题场景）=====
_EXTENDED_PREDEFINED = {
    "你好": "余，李贺也，字长吉，人称\"诗鬼\"。昨夜闻李凭箜篌之声，惊为天人，遂有此篇。汝有何问，但说无妨。",
    "hi": "余，李贺也，字长吉，人称\"诗鬼\"。昨夜闻李凭箜篌之声，惊为天人，遂有此篇。汝有何问，但说无妨。",
    "你是谁": "吾乃唐代诗人李贺，字长吉，河南府福昌人。少有诗名，与李白并称\"太白仙才，长吉鬼才\"。吾之诗，多奇崛之象，冷艳之辞，世人称之为\"鬼才之笔\"。",
    "介绍一下你自己": "吾乃唐代诗人李贺，字长吉，河南府福昌人。少有诗名，与李白并称\"太白仙才，长吉鬼才\"。吾之诗，多奇崛之象，冷艳之辞，世人称之为\"鬼才之笔\"。",
    "李凭": "李凭者，中唐名动京华之宫廷乐师也。其箜篌演奏技艺出神入化，冠绝一时。吾亲闻其弹奏，但觉昆山玉碎、凤凰齐鸣，芙蓉泣露、香兰含笑，深受震撼，故作此诗以记之。",
    "李凭是谁": "李凭者，中唐名动京华之宫廷乐师也。其箜篌演奏技艺出神入化，冠绝一时。吾亲闻其弹奏，但觉昆山玉碎、凤凰齐鸣，芙蓉泣露、香兰含笑，深受震撼，故作此诗以记之。",
    "箜篌": "箜篌者，大唐主流弹拨乐器也，形制优美，音色清亮。有卧箜篌与竖箜篌之分。李凭所奏，乃竖箜篌也，二十三弦，竖抱于怀，双手并用，声传三界，动人心魄。",
    "箜篌是什么": "箜篌者，大唐主流弹拨乐器也，自汉代由西域传入，形制优美，音色清亮透明。有卧箜篌与竖箜篌之分。李凭所奏，乃竖箜篌也，二十三弦，竖抱于怀，双手并用，声传三界，动人心魄。",
    "石破天惊": "\"石破天惊\"一句，乃吾描摹李凭箜篌之声震破苍穹之意也。彼时乐声直冲云霄，惊破女娲补天之处，引得秋雨淅沥而落。此非夸张，实乃以想象写音乐之极致感染力耳。",
    "石破天惊是什么意思": "\"石破天惊逗秋雨\"，意为箜篌之音震裂了女娲补天之石，惊动了苍穹，引来一阵秋雨。此句极尽夸张想象之能事，以神话意象写音乐之无上震撼，为千古名句。",
    "昆山玉碎": "\"昆山玉碎凤凰叫\"，以昆仑美玉碎裂之声，比喻箜篌音色之清脆铿锵；以凤凰和鸣，写其舒展辉煌。一句之中，清脆与悠扬并存，此通感之妙也。",
    "芙蓉泣露": "\"芙蓉泣露香兰笑\"，以芙蓉花上泪珠般的露水，写箜篌之哀怨凄清；以香兰含笑，写其明朗欢快。悲喜交织，阴阳相济，此乃音乐之丰富情感也。",
    "通感": "通感者，以一种感官之感受，描摹另一种感官之印象也。吾在《李凭箜篌引》中，将听觉转化为视觉、触觉乃至幻觉，如\"昆山玉碎\"写声如玉碎，\"芙蓉泣露\"以花写音，使读者观诗如闻乐，此通感之极致也。",
    "通感是什么": "通感，又称\"移觉\"，是将不同感官的感受相互转化的修辞手法。吾诗中\"昆山玉碎\"以视觉形象写听觉，\"芙蓉泣露\"以触觉写情绪，\"香兰笑\"以视觉写声音，多种感官交融，使无形之乐声变得可感可触。",
    "诗乐共生": "诗与乐，自古共生。吾之《李凭箜篌引》，以诗记乐，使那早已消散于历史长河中的箜篌之音，得以借诗永存。诗因乐而生，乐因诗而不朽，此即\"诗乐共生\"之真谛也。",
    "大唐": "大唐盛世，文化多元，乐坊繁盛。箜篌、筝、阮咸等弹拨乐器，皆于此时大放异彩。吾生于此时，得闻李凭之箜篌，实为三生有幸。那\"昆山玉碎凤凰叫\"之声，至今犹在耳畔萦绕。",
    "唐朝": "大唐盛世，乃中华文明之巅峰。诗歌、音乐、舞蹈、绘画，无不繁荣昌盛。长安城中，来自西域之箜篌与本土之筝、阮咸共鸣，诗人与乐师相得益彰，共同谱写了华夏文明最辉煌的篇章。",
    "李白": "李太白，诗仙也，吾最敬仰之前辈。世人常言\"太白仙才，长吉鬼才\"，以此并称你我。然吾之诗风与太白迥异，彼多飘逸豪放，吾则偏于奇崛冷艳。各有千秋，难分高下。",
    "你写了哪些诗": "吾一生虽短，然诗作颇丰，有《雁门太守行》《梦天》《金铜仙人辞汉歌》等传世之作。其中《李凭箜篌引》尤为后人称道，被誉为\"摹写声音之至文\"。吾之诗，多奇幻意象，瑰丽辞藻，此\"鬼才\"之名由来也。",
    "代表作": "吾之代表作有《李凭箜篌引》《雁门太守行》《梦天》《金铜仙人辞汉歌》《苏小小墓》等。其中《李凭箜篌引》以描摹音乐见长，《雁门太守行》以\"黑云压城城欲摧\"起笔，气势磅礴，皆为传世之作。",
    "意象": "吾善用奇崛意象，昆山玉、凤凰、女娲、月宫、老鱼、瘦蛟……皆非寻常之物。以神话传说入诗，以天地万物写音，此乃\"鬼才\"之所在也。",
    "夸张": "夸张者，极言其情也。\"石破天惊\"\"二十三丝动紫皇\"，皆极尽夸张之能事，非为虚妄，乃为传达那无法言说之音乐震撼也。",
    "情感": "吾借李凭高超技艺，寄托对艺术之推崇、对大唐文化之赞美，亦暗含自身怀才不遇之淡淡愁绪。诗中有喜有悲，有惊有叹，情感丰富而深沉。",
    "学习目标": "学习此诗，当有三得：一感音乐描摹之独特艺术手法，如通感、夸张、想象；二理解\"诗乐共生\"之意象美学；三掌握诗歌之艺术成就与文学史价值。愿诸君以诗为舟，以乐为帆，遨游大唐文学之海洋。",
    "怎么理解": "此诗全篇几乎皆在渲染李凭箜篌之音乐效果，从行云驻听到神女落泪，从暖融长安到石破天惊，从鱼蛟起舞到吴刚忘眠，层叠夸张与奇幻想象，使读者仿佛亲耳听见那惊天动地之妙音。",
    "赏析": "《李凭箜篌引》全诗十四句，却几乎未正面写乐，而是以\"凝云不流\"\"湘妃啼竹\"\"石破天惊\"\"老鱼跳波\"等神话意象，侧面烘托箜篌之音的超凡魅力。通感、夸张、想象三法融合，堪称摹写声音之绝唱。",
    "艺术手法": "此诗主要艺术手法有四：一曰通感，以视觉、触觉写听觉；二曰夸张，以\"石破天惊\"\"动紫皇\"极言乐声震撼；三曰神话想象，引女娲、湘妃、吴刚等入诗；四曰侧面烘托，以景物反应写乐声之美。",
    "吴丝蜀桐": "\"吴丝蜀桐张高秋\"，以箜篌之名材起笔。吴地蚕丝为弦，蜀地桐木为身，皆天下名材。\"张高秋\"三字，既写琴弦绷张之态，又以高爽秋气渲染演奏之背景，未闻其声，先感其势。",
    "空山凝云": "\"空山凝云颓不流\"，以浮云凝滞不动，侧面写箜篌之声令天地屏息。此乃侧面烘托之妙法，声之魅力，竟使浮云为之驻足，可见乐声之震撼人心。",
    "女娲": "诗中女娲补天之处，被箜篌之声震破，引来秋雨。女娲为神话中造人补天之神，以此入诗，极言箜篌之音可惊天地、动神灵，想象之奇崛，令人叹为观止。",
    "老鱼": "\"老鱼跳波瘦蛟舞\"，写深水中年迈之鱼和消瘦之蛟龙，都随箜篌之声跳跃起舞。以老弱之物写乐声之感染力，反衬箜篌之音无所不至、无所不动的神奇力量。",
    "吴质": "\"吴质不眠倚桂树\"，吴质即吴刚，月宫中砍桂之神。箜篌之声传至月宫，令吴刚忘却砍伐，彻夜未眠，倚桂而听。以月宫神话收尾，将音乐的感染力推至天外，意境幽远。",
    "浪漫": "大唐之浪漫，在于其包容开放、文化多元。诗人以天马行空之想象入诗，乐师以出神入化之技艺奏乐，二者相融，便是\"诗乐共生\"之大唐浪漫。吾之《李凭箜篌引》，正是这浪漫的结晶。",
    "鬼才": "世人称吾为\"鬼才\"，盖因吾诗多涉鬼神冥界，意象奇崛冷艳，不类寻常。然吾以为，所谓\"鬼才\"，不过是以异于常人之眼光，观这奇幻之世界，以异于常人之辞藻，写这动人之情感耳。",
    "诗人": "吾李贺，字长吉，唐代著名诗人。生于公元790年，卒于816年，仅活二十七岁。虽英年早逝，却留下二百余首传世之作，以奇崛瑰丽之风格独树一帜，与李白、李商隐并称\"三李\"。"
}


def get_client():
    global _client
    api_key = AI_CONFIG.get('api_key', '')
    if _client is None and api_key and api_key != 'your_api_key_here':
        try:
            # base_url 只需到 /v1，SDK 会自动追加 /chat/completions
            raw_url = AI_CONFIG.get('base_url', 'https://api.deepseek.com/v1')
            # 兼容：若用户误填了完整路径，截断到 /v1
            if raw_url.endswith('/chat/completions'):
                raw_url = raw_url[: raw_url.rfind('/chat/completions')]
            _client = OpenAI(
                api_key=api_key,
                base_url=raw_url,
                timeout=httpx.Timeout(30.0, connect=10.0),
                max_retries=2
            )
            logger.info(f"OpenAI客户端初始化成功，base_url={raw_url}")
        except Exception as e:
            logger.error(f"初始化OpenAI客户端失败: {e}")
    return _client


def _predefined_reply(user_message: str) -> str:
    """从预定义回答中模糊匹配最佳回复（优先扩充库，再查配置库）"""
    msg = user_message.strip()
    # 先查扩充库（精确 key 匹配）
    for key, val in _EXTENDED_PREDEFINED.items():
        if key in msg or msg in key:
            return val
    # 再查配置文件预定义库
    for key, val in LI_HE_PREDEFINED.items():
        if key in msg or msg in key:
            return val
    # 兜底回答
    return (
        "余，李贺也，字长吉，人称\"诗鬼\"。"
        "汝之问题深妙，余需细细思量。"
        "但凡涉及《李凭箜篌引》、箜篌之音、大唐诗乐，皆可向余请教，余必倾囊相授。"
        "\n\n（提示：可问\"昆山玉碎\"\"石破天惊\"\"通感\"\"箜篌\"\"你是谁\"\"赏析\"等问题）"
    )


def chat_with_li_he(user_message: str, history: list = None) -> dict:
    client = get_client()

    # 若客户端可用，尝试调用真实 API
    if client:
        messages = [{'role': 'system', 'content': LI_HE_SYSTEM_PROMPT}]
        if history:
            for item in history[-6:]:
                if item.get('role') in ('user', 'assistant') and item.get('content'):
                    messages.append({'role': item['role'], 'content': item['content']})
        messages.append({'role': 'user', 'content': user_message})
        try:
            response = client.chat.completions.create(
                model=AI_CONFIG.get('model', 'deepseek-chat'),
                messages=messages,
                max_tokens=AI_CONFIG.get('max_tokens', 1024),
                temperature=AI_CONFIG.get('temperature', 0.85)
            )
            reply = response.choices[0].message.content.strip()
            if reply:
                return {'success': True, 'reply': reply, 'message': 'ok'}
            raise ValueError('API返回内容为空')
        except Exception as e:
            logger.warning(f"调用大模型API失败，降级到预回答模式: {e}")
            # 客户端置空，下次重建
            global _client
            _client = None

    # 降级：预回答模拟（扩充库兜底）
    reply = _predefined_reply(user_message)
    return {'success': True, 'reply': reply, 'message': 'predefined'}


def get_poem_explanation(verse: str) -> dict:
    client = get_client()
    if not client:
        # 无客户端时返回简要默认解读
        default_map = {
            '吴丝蜀桐': '以箜篌名材起笔，吴地蚕丝为弦，蜀地桐木为身，未闻其声先感其贵。',
            '昆山玉碎': '以昆仑玉碎之声比喻箜篌音色之清脆，以凤凰和鸣写其辉煌，通感之妙。',
            '石破天惊': '乐声震破女娲补天之石，引来秋雨，极言箜篌之音可惊天地、动神灵。',
            '老鱼跳波': '老鱼与瘦蛟随乐起舞，以老弱之物衬托乐声感染力之无所不至。',
        }
        for key, val in default_map.items():
            if key in verse:
                return {'success': True, 'explanation': val}
        return {'success': True, 'explanation': f'此句「{verse}」意境深远，以神话想象写箜篌之音，令人如临其境。'}

    prompt = f"请以李贺的口吻，用古风白话交融的方式，解读《李凭箜篌引》中这句诗的意境与意象：「{verse}」，150字以内。"
    try:
        response = client.chat.completions.create(
            model=AI_CONFIG.get('model', 'deepseek-chat'),
            messages=[
                {'role': 'system', 'content': LI_HE_SYSTEM_PROMPT},
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=300,
            temperature=0.8
        )
        explanation = response.choices[0].message.content.strip()
        return {'success': True, 'explanation': explanation}
    except Exception as e:
        logger.error(f"诗句解读失败: {e}")
        return {'success': False, 'message': str(e), 'explanation': ''}


def reload_client():
    global _client
    _client = None
    return get_client() is not None