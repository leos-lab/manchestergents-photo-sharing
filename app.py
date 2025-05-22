from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import sqlite3, os

load_dotenv(dotenv_path=os.path.join('config', '.env'))
app = Flask(__name__)
app.secret_key = 'your_secret_key'

TOP_LEVEL_FOLDER_ID = os.getenv('TOP_LEVEL_FOLDER_ID')

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.execute('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, file_id TEXT, name TEXT, text TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
        db.execute('CREATE TABLE IF NOT EXISTS likes (file_id TEXT PRIMARY KEY, count INTEGER)')
        db.execute('CREATE TABLE IF NOT EXISTS admin (username TEXT PRIMARY KEY, password TEXT)')
        db.execute('INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)', ('admin', generate_password_hash('adminpass')))
        db.commit()

@app.route('/')
def home():
    return render_template("home.html")

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)