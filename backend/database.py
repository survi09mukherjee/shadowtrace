import sqlite3
import os
from datetime import datetime

DB_FILE = 'shadowtrace.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Create logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            risk_score REAL NOT NULL,
            status TEXT NOT NULL,
            anomaly_score REAL NOT NULL,
            details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def log_activity(user_id: str, risk_score: float, status: str, anomaly_score: float, details: str = ""):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO activity_logs (user_id, timestamp, risk_score, status, anomaly_score, details)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, timestamp, risk_score, status, anomaly_score, details))
    conn.commit()
    conn.close()
    return True

def get_user_logs(user_id: str, limit: int = 50):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM activity_logs 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
    ''', (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]
