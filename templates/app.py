from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
app.secret_key = 'supersecretkey'

DATABASE = 'users.db'

# Criação do banco de dados e tabelas principais
if not os.path.exists(DATABASE):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, email TEXT, team_id INTEGER)''')
    c.execute('''CREATE TABLE teams (id INTEGER PRIMARY KEY, name TEXT UNIQUE)''')
    c.execute('''CREATE TABLE feedbacks (id INTEGER PRIMARY KEY, user_id INTEGER, content TEXT, created_at TEXT, status TEXT)''')
    c.execute('''CREATE TABLE reminders (id INTEGER PRIMARY KEY, user_id INTEGER, feedback_id INTEGER, sent_at TEXT, type TEXT)''')
    c.execute('''INSERT INTO teams (name) VALUES (?)''', ('TI',))
    c.execute('''INSERT INTO users (username, password, email, team_id) VALUES (?, ?, ?, ?)''', ('admin', generate_password_hash('admin123'), 'admin@empresa.com', 1))
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE)
    return conn

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return send_from_directory('.', '.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = c.fetchone()
        conn.close()
        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            return jsonify({'success': True})
        return jsonify({'success': False}), 401
    return redirect(url_for('login_page'))

@app.route('/login.html')
def login_page():
    return send_from_directory('.', 'login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login_page'))

@app.route('/dashboard')
def dashboard_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('dashboard.html')

@app.route('/teams')
def teams_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('teams.html')

@app.route('/reports')
def reports_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('reports.html')

@app.route('/settings')
def settings_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('settings.html')

@app.route('/api/teams', methods=['GET'])
def api_list_teams():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id, name FROM teams')
    teams = [{'id': row[0], 'name': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(teams)

@app.route('/api/teams', methods=['POST'])
def api_create_team():
    data = request.get_json()
    name = data.get('name')
    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO teams (name) VALUES (?)', (name,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/teams/<int:team_id>', methods=['PUT'])
def api_update_team(team_id):
    data = request.get_json()
    name = data.get('name')
    conn = get_db()
    c = conn.cursor()
    c.execute('UPDATE teams SET name = ? WHERE id = ?', (name, team_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def api_delete_team(team_id):
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM teams WHERE id = ?', (team_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/reminders')
def reminders_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('reminders.html')

@app.route('/api/reminders', methods=['GET'])
def api_list_reminders():
    conn = get_db()
    c = conn.cursor()
    c.execute('''SELECT reminders.id, users.username, feedbacks.content, reminders.type, reminders.sent_at, feedbacks.status FROM reminders JOIN users ON reminders.user_id = users.id JOIN feedbacks ON reminders.feedback_id = feedbacks.id WHERE feedbacks.status = "pendente"''')
    reminders = [
        {'id': row[0], 'username': row[1], 'feedback_content': row[2], 'type': row[3], 'sent_at': row[4], 'status': row[5]}
        for row in c.fetchall()
    ]
    conn.close()
    return jsonify(reminders)

@app.route('/api/reminders/<int:reminder_id>/send', methods=['POST'])
def api_send_reminder(reminder_id):
    # Buscar dados do lembrete
    conn = get_db()
    c = conn.cursor()
    c.execute('''SELECT users.email, users.username, feedbacks.content FROM reminders JOIN users ON reminders.user_id = users.id JOIN feedbacks ON reminders.feedback_id = feedbacks.id WHERE reminders.id = ?''', (reminder_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({'success': False, 'error': 'Lembrete não encontrado'}), 404
    email, username, feedback_content = row
    # Simular envio de email
    print(f"Enviando email para {email}: Olá {username}, você tem um feedback pendente: {feedback_content}")
    # Simular popup (será feito no frontend via alert)
    c.execute('UPDATE reminders SET sent_at = datetime("now") WHERE id = ?', (reminder_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Rotas para CRUD de usuários, equipes, feedbacks e lembretes serão adicionadas a seguir

if __name__ == '__main__':
    app.run(debug=True)