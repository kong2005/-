import os
import hashlib
import time
import uuid
import requests as req
import sys
import logging
import asyncio
import edge_tts
import tempfile
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# --- 1. 基础配置与路径隔离 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

def global_exception_handler(exctype, value, traceback):
    logging.critical("未捕获的全局异常", exc_info=(exctype, value, traceback))
sys.excepthook = global_exception_handler

# TTS生成的音频存临时目录，避免触发微信开发者工具热重载
AUDIO_DIR = os.path.join(tempfile.gettempdir(), 'konghou_audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# 固定音频目录（recitation.mp3等预置文件放这里）
STATIC_AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'static', 'audio')
os.makedirs(STATIC_AUDIO_DIR, exist_ok=True)

logger.info(f"后端启动 | 临时音频目录: {AUDIO_DIR}")
logger.info(f"后端启动 | 固定音频目录: {STATIC_AUDIO_DIR}")

static_folder = '../frontend/public' if os.path.exists('../frontend/public') else '../frontend/dist'
app = Flask(__name__, static_folder=static_folder, static_url_path='/')
CORS(app)

# --- 2. 数据库初始化 ---
try:
    from utils.db import init_db, register_user, login_user, save_interaction, get_interactions
    init_db()
    logger.info("数据库初始化完成")
except Exception as e:
    logger.error(f"数据库初始化异常: {e}")

# --- 3. AI服务初始化 ---
try:
    import openai
    from utils.ai_service import chat_with_li_he
    from config import AI_CONFIG
    _override_key = os.environ.get('AI_API_KEY', 'sk-05615886d520418f97743cf53b84e087')
    _override_url = os.environ.get('AI_BASE_URL', 'https://api.deepseek.com/v1')
    _override_model = os.environ.get('AI_MODEL', 'deepseek-chat')
    AI_CONFIG['api_key'] = _override_key
    AI_CONFIG['base_url'] = _override_url
    AI_CONFIG['model'] = _override_model
    logger.info("AI服务加载完成")
except Exception as e:
    logger.error(f"AI服务加载异常: {e}")
    chat_with_li_he = None

# --- 4. JWT初始化 ---
try:
    import jwt as pyjwt
    from config import JWT_SECRET_KEY
except Exception as e:
    logger.error(f"JWT加载异常: {e}")
    pyjwt = None
    JWT_SECRET_KEY = 'fallback_secret_2024'

# --- 5. 预设兜底回答 ---
_BUILTIN_PREDEFINED = {
    "你好": "余，李贺也，字长吉，人称\"诗鬼\"。昨夜闻李凭箜篌之声，惊为天人，遂有此篇。汝有何问，但说无妨。",
    "你是谁": "吾乃唐代诗人李贺，字长吉，河南府福昌人。少有诗名，与李白并称\"太白仙才，长吉鬼才\"。",
    "李凭": "李凭者，中唐名动京华之宫廷乐师也。其箜篌演奏技艺出神入化，冠绝一时。",
    "箜篌": "箜篌者，大唐主流弹拨乐器也，形制优美，音色清亮。二十三弦，竖抱于怀，双手并用，其声之美，可感天地，可动鬼神。",
    "石破天惊": "此句言乐声之大，直冲云霄，令女娲补天之处亦为之震颤。乐声不仅在耳，更在魂魄。",
    "昆山玉碎": "\"昆山玉碎凤凰叫\"，以昆仑美玉碎裂之声，比喻箜篌音色之清脆铿锵；以凤凰和鸣，写其舒展辉煌。",
    "通感": "通感者，以一种感官之感受，描摹另一种感官之印象也。吾在此诗中，将听觉转化为视觉、触觉乃至幻觉。",
    "诗乐共生": "诗与乐，自古共生。吾之《李凭箜篌引》，以诗记乐，使那早已消散于历史长河中的箜篌之音，得以借诗永存。",
}

# --- 辅助函数 ---
def make_token(user_id, username):
    try:
        payload = {'user_id': user_id, 'username': username, 'exp': int(time.time()) + 86400}
        return pyjwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256') if pyjwt else f"token_{user_id}"
    except Exception as e:
        logger.error(f"生成token失败: {e}")
        return f"token_{user_id}"

# --- 6. API路由 ---

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json(silent=True) or {}
        username = str(data.get('username', '')).strip()
        password = str(data.get('password', '')).strip()
        if not username or not password:
            return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400
        res = register_user(username, password, username)
        if res['success']:
            res['token'] = make_token(res['user_id'], username)
        return jsonify(res)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}
        username = str(data.get('username', '')).strip()
        password = str(data.get('password', '')).strip()
        if not username or not password:
            return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400
        res = login_user(username, password)
        if res['success']:
            res['token'] = make_token(res['user_id'], username)
        return jsonify(res)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/ai-dialogue', methods=['POST'])
def ai_dialogue():
    try:
        data = request.get_json(silent=True) or {}
        question = str(data.get('question', '')).strip()
        user_id = data.get('user_id')
        if not question:
            return jsonify({'success': False, 'message': '问题不能为空'}), 400

        history = []
        if user_id:
            try:
                history = get_interactions(int(user_id), limit=10)
            except Exception:
                pass

        if chat_with_li_he:
            result = chat_with_li_he(question, history)
        else:
            reply = next((v for k, v in _BUILTIN_PREDEFINED.items() if k in question),
                "余，李贺也。汝之问题深妙，余需细细思量。但凡涉及《李凭箜篌引》、箜篌之音、大唐诗乐，皆可向余请教。")
            result = {'success': True, 'reply': reply}

        if result.get('success') and user_id:
            try:
                save_interaction(int(user_id), 'user', question)
                save_interaction(int(user_id), 'assistant', result.get('reply', ''))
            except Exception as e:
                logger.warning(f"保存对话记录失败: {e}")

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"AI对话接口异常: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tts', methods=['POST'])
def tts():
    start_time = time.time()
    try:
        data = request.get_json(silent=True) or {}
        text = str(data.get('text', '')).strip()
        if not text:
            return jsonify({'success': False, 'message': '文本不能为空'}), 400

        filename = f'tts_{int(time.time())}_{uuid.uuid4().hex[:6]}.mp3'
        filepath = os.path.join(AUDIO_DIR, filename)

        async def generate_audio():
            communicate = edge_tts.Communicate(
                text,
                "zh-CN-YunjianNeural",
                rate="-20%",
                pitch="+0Hz"
            )
            await communicate.save(filepath)

        if sys.platform == 'win32':
            loop = asyncio.ProactorEventLoop()
        else:
            loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(generate_audio())
        finally:
            loop.close()

        if not os.path.exists(filepath):
            return jsonify({'success': False, 'message': '音频生成失败'}), 500

        elapsed = time.time() - start_time
        logger.info(f'TTS生成成功 | 耗时: {elapsed:.2f}s | 大小: {os.path.getsize(filepath)} bytes')
        return jsonify({'success': True, 'url': f'/api/get-audio/{filename}'}), 200

    except Exception as e:
        logger.error(f'TTS接口异常: {e}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/get-audio/<filename>')
def get_audio(filename):
    try:
        safe_name = os.path.basename(filename)
        # 优先从临时目录找（TTS生成的文件）
        tmp_path = os.path.join(AUDIO_DIR, safe_name)
        if os.path.exists(tmp_path):
            return send_from_directory(AUDIO_DIR, safe_name)
        # 找不到则从固定音频目录找（recitation.mp3等预置文件）
        static_path = os.path.join(STATIC_AUDIO_DIR, safe_name)
        if os.path.exists(static_path):
            return send_from_directory(STATIC_AUDIO_DIR, safe_name)
        logger.error(f'音频文件不存在: {safe_name}')
        return jsonify({'success': False, 'message': '音频文件不存在'}), 404
    except Exception as e:
        logger.error(f'读取音频失败: {e}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': '缺少user_id'}), 400
        records = get_interactions(int(user_id), limit=20)
        return jsonify({'success': True, 'history': records}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/')
@app.route('/<path:path>')
def serve_static(path="index.html"):
    try:
        if app.static_folder and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return app.send_static_file('index.html')
    except Exception:
        return jsonify({'message': 'Li He AI Backend Running', 'status': 'ok'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=True)