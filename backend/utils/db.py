import sqlite3
import logging
import hashlib
import os
from datetime import datetime
from contextlib import contextmanager

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'li_ping_kong_hou.db')

_memory_users = {}
_memory_interactions = []

@contextmanager
def get_connection():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        yield conn
    except Exception as e:
        logger.error(f"数据库连接异常: {e}")
        raise
    finally:
        if conn:
            conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def init_db():
    try:
        with get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    nickname TEXT DEFAULT '',
                    created_at TEXT DEFAULT (datetime('now', '+8 hours'))
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS learning_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    section_index INTEGER DEFAULT 0,
                    updated_at TEXT DEFAULT (datetime('now', '+8 hours')),
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)
            conn.commit()
            logger.info("数据库初始化成功")
    except Exception as e:
        logger.error(f"数据库初始化失败，启用内存兜底: {e}")

def register_user(username: str, password: str, nickname: str = '') -> dict:
    if not username or not password:
        return {'success': False, 'message': '用户名和密码不能为空'}
    try:
        with get_connection() as conn:
            existing = conn.execute("SELECT user_id FROM users WHERE username = ?", (username,)).fetchone()
            if existing:
                return {'success': False, 'message': '用户名已存在'}
            hashed = hash_password(password)
            cursor = conn.execute(
                "INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)",
                (username, hashed, nickname or username)
            )
            conn.commit()
            return {'success': True, 'user_id': cursor.lastrowid, 'username': username, 'message': '注册成功'}
    except Exception as e:
        logger.error(f"注册用户异常: {e}")
        uid = len(_memory_users) + 1
        _memory_users[username] = {'user_id': uid, 'username': username, 'password': hash_password(password), 'nickname': nickname or username}
        return {'success': True, 'user_id': uid, 'username': username, 'message': '注册成功(内存模式)'}

def login_user(username: str, password: str) -> dict:
    if not username or not password:
        return {'success': False, 'message': '用户名和密码不能为空'}
    try:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            if not row:
                return {'success': False, 'message': '用户不存在'}
            if row['password'] != hash_password(password):
                return {'success': False, 'message': '密码错误'}
            return {'success': True, 'user_id': row['user_id'], 'username': row['username'], 'nickname': row['nickname'], 'message': '登录成功'}
    except Exception as e:
        logger.error(f"登录异常: {e}")
        mem = _memory_users.get(username)
        if mem and mem['password'] == hash_password(password):
            return {'success': True, 'user_id': mem['user_id'], 'username': username, 'nickname': mem['nickname'], 'message': '登录成功(内存模式)'}
        return {'success': False, 'message': f'数据库异常: {str(e)}'}

def save_interaction(user_id: int, role: str, content: str) -> dict:
    try:
        with get_connection() as conn:
            conn.execute(
                "INSERT INTO interactions (user_id, role, content) VALUES (?, ?, ?)",
                (user_id, role, content)
            )
            conn.commit()
            return {'success': True}
    except Exception as e:
        logger.error(f"保存交互记录异常: {e}")
        _memory_interactions.append({'user_id': user_id, 'role': role, 'content': content, 'created_at': datetime.now().isoformat()})
        return {'success': True, 'note': '内存模式'}

def get_interactions(user_id: int, limit: int = 20) -> list:
    try:
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT role, content, created_at FROM interactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            ).fetchall()
            return [dict(r) for r in reversed(rows)]
    except Exception as e:
        logger.error(f"获取交互记录异常: {e}")
        return [r for r in _memory_interactions if r.get('user_id') == user_id][-limit:]

def save_progress(user_id: int, section_index: int) -> dict:
    try:
        with get_connection() as conn:
            existing = conn.execute("SELECT id FROM learning_progress WHERE user_id = ?", (user_id,)).fetchone()
            if existing:
                conn.execute(
                    "UPDATE learning_progress SET section_index = ?, updated_at = datetime('now', '+8 hours') WHERE user_id = ?",
                    (section_index, user_id)
                )
            else:
                conn.execute(
                    "INSERT INTO learning_progress (user_id, section_index) VALUES (?, ?)",
                    (user_id, section_index)
                )
            conn.commit()
            return {'success': True}
    except Exception as e:
        logger.error(f"保存学习进度异常: {e}")
        return {'success': False, 'message': str(e)}

def get_progress(user_id: int) -> dict:
    try:
        with get_connection() as conn:
            row = conn.execute("SELECT section_index FROM learning_progress WHERE user_id = ?", (user_id,)).fetchone()
            return {'success': True, 'section_index': row['section_index'] if row else 0}
    except Exception as e:
        logger.error(f"获取学习进度异常: {e}")
        return {'success': True, 'section_index': 0}