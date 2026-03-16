# app.py
from flask import Flask, request, jsonify
from sqlalchemy.orm import sessionmaker
from models import engine, User, Task, TaskSubmission, Portfolio, Post, Comment, Like, Role, UserRole
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from datetime import datetime, timedelta

# --- CONFIGURATION ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'  # replace with env var in production
Session = sessionmaker(bind=engine)

# --- HELPER FUNCTIONS ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"status": "error", "message": "Token missing"}), 401
        try:
            token = token.split(" ")[1]  # Authorization: Bearer <token>
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            session = Session()
            current_user = session.query(User).filter_by(id=data['user_id']).first()
            session.close()
        except:
            return jsonify({"status": "error", "message": "Invalid token"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- USER ROUTES ---
@app.route("/register", methods=["POST"])
def register():
    session = Session()
    data = request.json
    hashed_password = generate_password_hash(data["password"])
    new_user = User(
        username=data["username"],
        email=data["email"],
        password_hash=hashed_password
    )
    session.add(new_user)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": {"username": data["username"], "email": data["email"]}})

@app.route("/login", methods=["POST"])
def login():
    session = Session()
    data = request.json
    user = session.query(User).filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        session.close()
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    token = jwt.encode({"user_id": user.id, "exp": datetime.utcnow() + timedelta(hours=2)}, app.config['SECRET_KEY'], algorithm="HS256")
    session.close()
    return jsonify({"status": "success", "data": {"token": token}})

@app.route("/users/<int:user_id>", methods=["GET"])
@token_required
def get_user(current_user, user_id):
    session = Session()
    user = session.query(User).filter_by(id=user_id).first()
    if not user:
        session.close()
        return jsonify({"status": "error", "message": "User not found"}), 404
    result = {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "website": user.website,
        "roles": [role.role.name for role in user.roles],
        "created_at": user.created_at
    }
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/users/<int:user_id>", methods=["PUT"])
@token_required
def update_user(current_user, user_id):
    if current_user.id != user_id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
    data = request.json
    session = Session()
    user = session.query(User).filter_by(id=user_id).first()
    if "username" in data:
        user.username = data["username"]
    if "bio" in data:
        user.bio = data["bio"]
    if "profile_picture" in data:
        user.profile_picture = data["profile_picture"]
    if "website" in data:
        user.website = data["website"]
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": "Profile updated"})

# --- TASK ROUTES ---
@app.route("/tasks", methods=["GET"])
@token_required
def get_tasks(current_user):
    session = Session()
    query = session.query(Task)
    # Filters
    status = request.args.get("status")
    poster_id = request.args.get("poster_id")
    title = request.args.get("title")
    if status:
        query = query.filter(Task.status == status)
    if poster_id:
        query = query.filter(Task.poster_id == int(poster_id))
    if title:
        query = query.filter(Task.title.ilike(f"%{title}%"))
    tasks = query.all()
    result = []
    for task in tasks:
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "due_date": task.due_date,
            "poster_id": task.poster_id
        })
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/tasks", methods=["POST"])
@token_required
def create_task(current_user):
    session = Session()
    data = request.json
    task = Task(
        title=data["title"],
        description=data["description"],
        poster_id=current_user.id,
        due_date=data.get("due_date"),
        status=data.get("status", "open")
    )
    session.add(task)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": {"id": task.id, "title": task.title}})

# --- TASK SUBMISSION ROUTES ---
@app.route("/tasks/<int:task_id>/submit", methods=["POST"])
@token_required
def submit_task(current_user, task_id):
    session = Session()
    data = request.json
    submission = TaskSubmission(
        task_id=task_id,
        worker_id=current_user.id,
        submission_text=data.get("submission_text"),
        submission_file=data.get("submission_file"),
        status="pending"
    )
    session.add(submission)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": "Submission created"})

@app.route("/tasks/<int:task_id>/submissions", methods=["GET"])
@token_required
def get_task_submissions(current_user, task_id):
    session = Session()
    task = session.query(Task).filter_by(id=task_id).first()
    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
    submissions = session.query(TaskSubmission).filter_by(task_id=task_id).all()
    result = []
    for s in submissions:
        result.append({
            "id": s.id,
            "worker_id": s.worker_id,
            "submission_text": s.submission_text,
            "submission_file": s.submission_file,
            "status": s.status
        })
    session.close()
    return jsonify({"status": "success", "data": result})

# --- PORTFOLIO ROUTES ---
@app.route("/portfolio", methods=["POST"])
@token_required
def create_portfolio(current_user):
    data = request.json
    session = Session()
    item = Portfolio(
        user_id=current_user.id,
        title=data["title"],
        description=data.get("description"),
        project_link=data.get("project_link"),
        media_file=data.get("media_file")
    )
    session.add(item)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": {"id": item.id, "title": item.title}})

@app.route("/portfolio/<int:user_id>", methods=["GET"])
@token_required
def get_portfolio(current_user, user_id):
    session = Session()
    items = session.query(Portfolio).filter_by(user_id=user_id).all()
    result = []
    for i in items:
        result.append({
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "project_link": i.project_link,
            "media_file": i.media_file
        })
    session.close()
    return jsonify({"status": "success", "data": result})

# --- POSTS, COMMENTS, LIKES ROUTES ---
@app.route("/posts", methods=["POST"])
@token_required
def create_post(current_user):
    data = request.json
    session = Session()
    post = Post(user_id=current_user.id, content=data["content"], media_file=data.get("media_file"))
    session.add(post)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": {"id": post.id}})

@app.route("/posts", methods=["GET"])
@token_required
def get_posts(current_user):
    session = Session()
    posts = session.query(Post).all()
    result = []
    for p in posts:
        comments = [{"id": c.id, "content": c.content, "parent_id": c.parent_id} for c in p.comments]
        likes_count = len(p.likes)
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "content": p.content,
            "media_file": p.media_file,
            "comments": comments,
            "likes": likes_count
        })
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/posts/<int:post_id>/comment", methods=["POST"])
@token_required
def comment_post(current_user, post_id):
    data = request.json
    session = Session()
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=data["content"],
        parent_id=data.get("parent_id")
    )
    session.add(comment)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": {"id": comment.id}})

@app.route("/posts/<int:post_id>/like", methods=["POST"])
@token_required
def like_post(current_user, post_id):
    session = Session()
    existing_like = session.query(Like).filter_by(user_id=current_user.id, post_id=post_id).first()
    if existing_like:
        session.delete(existing_like)
        session.commit()
        session.close()
        return jsonify({"status": "success", "data": "Like removed"})
    like = Like(post_id=post_id, user_id=current_user.id)
    session.add(like)
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": "Post liked"})

# --- RUN SERVER ---
if __name__ == "__main__":
    app.run(debug=True)
