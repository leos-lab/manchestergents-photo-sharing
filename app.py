from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import sqlite3, os
from drive_service import get_drive

load_dotenv(dotenv_path=os.path.join('config', '.env'))

app = Flask(__name__)
app.secret_key = 'your_secret_key'

TOP_LEVEL_FOLDER_ID = os.getenv('TOP_LEVEL_FOLDER_ID')
drive = get_drive()

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
    folders = drive.ListFile({'q': f"'{TOP_LEVEL_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"}).GetList()
    events = [{'id': f['id'], 'title': f['title']} for f in folders]
    return render_template("home.html", events=events)

@app.route('/event/<folder_id>')
def gallery(folder_id):
    files = drive.ListFile({'q': f"'{folder_id}' in parents and trashed=false"}).GetList()
    db = get_db()
    file_data = []
    for f in files:
        comments = db.execute("SELECT name, text, timestamp FROM comments WHERE file_id = ? ORDER BY timestamp DESC", (f['id'],)).fetchall()
        likes = db.execute("SELECT count FROM likes WHERE file_id = ?", (f['id'],)).fetchone()
        file_data.append({
            'id': f['id'],
            'title': f['title'],
            'link': f['webContentLink'],
            'thumb': f.get('thumbnailLink', f['webContentLink']),
            'likes': likes['count'] if likes else 0,
            'comments': comments
        })
    return render_template("gallery.html", files=file_data, folder_id=folder_id)

@app.route('/like/<file_id>', methods=['POST'])
def like(file_id):
    db = get_db()
    db.execute("INSERT OR IGNORE INTO likes (file_id, count) VALUES (?, 0)", (file_id,))
    db.execute("UPDATE likes SET count = count + 1 WHERE file_id = ?", (file_id,))
    db.commit()
    return jsonify(success=True)

@app.route('/comment/<file_id>', methods=['POST'])
def comment(file_id):
    name = request.form.get('name', 'Anonymous')
    text = request.form.get('text', '')
    db = get_db()
    db.execute("INSERT INTO comments (file_id, name, text) VALUES (?, ?, ?)", (file_id, name, text))
    db.commit()
    return jsonify(success=True)

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        user = db.execute("SELECT * FROM admin WHERE username = ?", (username,)).fetchone()
        if user and check_password_hash(user['password'], password):
            session['admin'] = True
            return redirect(url_for('admin_panel'))
        return "Invalid credentials", 403
    return render_template("admin.html")

@app.route('/admin/panel')
def admin_panel():
    if not session.get('admin'):
        return redirect(url_for('admin'))
    db = get_db()
    comments = db.execute("SELECT * FROM comments").fetchall()
    return render_template("admin_panel.html", comments=comments)

@app.route('/admin/delete_comment/<int:comment_id>', methods=['POST'])
def delete_comment(comment_id):
    if not session.get('admin'):
        return redirect(url_for('admin'))
    db = get_db()
    db.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    db.commit()
    return redirect(url_for('admin_panel'))

@app.route('/upload/<folder_id>', methods=['POST'])
def upload(folder_id):
    file = request.files['file']
    file.save(file.filename)
    f = drive.CreateFile({'title': file.filename, 'parents': [{'id': folder_id}]})
    f.SetContentFile(file.filename)
    f.Upload()
    os.remove(file.filename)
    return redirect(url_for('gallery', folder_id=folder_id))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)