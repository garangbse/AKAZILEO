# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker , joinedload
from models import engine, User, Task, TaskSubmission, Portfolio, Post, Comment, Like, Role, UserRole, TaskApplication, Notification
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from datetime import datetime, timedelta

# --- CONFIGURATION ---
app = Flask(__name__)
CORS(app,
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True,
     max_age=3600)
app.config['SECRET_KEY'] = 'OiJIUzI1NiIsInR5cCI6IkpXVCJ9'
Session = sessionmaker(bind=engine)

# --- HELPER FUNCTIONS ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"status": "error", "message": "Token missing"}), 401

        try:
            # Extract token
            token = token.split(" ")[1]

            # Decode JWT
            data = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=["HS256"]
            )

            # Open session
            session = Session()

            # EAGER LOAD roles to avoid DetachedInstanceError
            current_user = session.query(User).options(
                joinedload(User.roles).joinedload(UserRole.role)
            ).filter_by(id=data['user_id']).first()

            # Optional: handle user not found
            if not current_user:
                session.close()
                return jsonify({"status": "error", "message": "User not found"}), 404

            # Keep user usable after session close
            session.expunge(current_user)
            session.close()

        except Exception as e:
            print(f"Token error: {str(e)}")
            return jsonify({"status": "error", "message": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
# --- USER ROUTES ---
@app.route("/register", methods=["POST"])
def register():
    session = Session()
    data = request.json

    # 1. hash password
    hashed_password = generate_password_hash(data["password"])

    # 2. create user
    new_user = User(
        username=data["username"],
        email=data["email"],
        password_hash=hashed_password
    )
    session.add(new_user)
    session.commit()

    # 3. find role
    role = session.query(Role).filter_by(name=data["role"]).first()

    # 4. link user-role
    user_role = UserRole(user_id=new_user.id, role_id=role.id)
    session.add(user_role)

    session.commit()
    session.close()

    return jsonify({"status": "success"})
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

@app.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    return jsonify({
        "status": "success",
        "data": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "bio": current_user.bio,
            "profile_picture": current_user.profile_picture,
            "roles": [role.role.name for role in current_user.roles]
        }
    })

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
#not yet
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

@app.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, user_id):
    # Verify authorization - user can only delete their own account
    if current_user.id != user_id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
    
    session = Session()
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            session.close()
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # Delete all related data
        # Delete posts and their associated likes and comments (cascade handles this)
        session.query(Post).filter_by(user_id=user_id).delete()
        
        # Delete comments
        session.query(Comment).filter_by(user_id=user_id).delete()
        
        # Delete likes
        session.query(Like).filter_by(user_id=user_id).delete()
        
        # Delete portfolio items
        session.query(Portfolio).filter_by(user_id=user_id).delete()
        
        # Delete task submissions
        session.query(TaskSubmission).filter_by(worker_id=user_id).delete()
        
        # Delete task applications
        session.query(TaskApplication).filter_by(worker_id=user_id).delete()
        
        # Delete tasks posted by user
        session.query(Task).filter_by(poster_id=user_id).delete()
        
        # Delete user roles
        session.query(UserRole).filter_by(user_id=user_id).delete()
        
        # Delete notifications
        session.query(Notification).filter_by(user_id=user_id).delete()
        
        # Finally, delete the user
        session.delete(user)
        
        session.commit()
        session.close()
        
        return jsonify({"status": "success", "message": "Account deleted successfully"})
    
    except Exception as e:
        session.rollback()
        session.close()
        print(f"Error deleting user: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to delete account"}), 500

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

@app.route("/tasks/<int:task_id>", methods=["GET"])
@token_required
def get_task(current_user, task_id):
    session = Session()
    task = session.query(Task).filter_by(id=task_id).first()
    if not task:
        session.close()
        return jsonify({"status": "error", "message": "Task not found"}), 404
    result = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "payment": task.payment,
        "status": task.status,
        "due_date": str(task.due_date) if task.due_date else None,
        "poster_id": task.poster_id,
        "created_at": str(task.created_at)
    }
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/tasks", methods=["POST"])
@token_required
def create_task(current_user):

    session = Session()
    data = request.json

    due_date = None

    if data.get("due_date"):
        due_date = datetime.strptime(data["due_date"], "%Y-%m-%d")

    task = Task(
        title=data["title"],
        description=data["description"],
        poster_id=current_user.id,
        payment=data.get("payment"),
        due_date=due_date,  # ✅ pass converted datetime
    )
    
    session.add(task)
    session.commit()

    result = {"id": task.id, "title": task.title}

    session.close()

    return jsonify({"status": "success", "data": result})

# --- TASK Application ROUTE ---
@app.route('/tasks/<int:task_id>/applications', methods=['GET'])
@token_required
def get_task_applications(current_user, task_id):

    session = Session()

    task = session.query(Task).get(task_id)

    if not task:
        session.close()
        return jsonify({"error": "Task not found"}), 404

    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"error": "Unauthorized"}), 403

    applications = session.query(TaskApplication).filter_by(task_id=task_id).all()

    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "worker_id": app.worker_id,
            "username": app.worker.username,
            "status": app.status
        })

    session.close()

    return jsonify({"status": "success", "data": result})

@app.route('/user/applications', methods=['GET'])
@token_required
def get_user_applications(current_user):
    """Get all applications submitted by the current user"""
    session = Session()
    
    applications = session.query(TaskApplication).filter_by(worker_id=current_user.id).all()
    
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "task_id": app.task_id,
            "status": app.status,
            "task_title": app.task.title if app.task else "Unknown"
        })
    
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route('/user/accepted-tasks', methods=['GET'])
@token_required
def get_user_accepted_tasks(current_user):
    """Get all tasks that have been accepted by the current user"""
    session = Session()
    
    # Get all applications with status "accepted" for current user
    accepted_applications = session.query(TaskApplication).filter_by(
        worker_id=current_user.id,
        status="accepted"
    ).all()
    
    result = []
    for app in accepted_applications:
        task = app.task
        if task:
            result.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "payment": task.payment,
                "status": task.status,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "poster_id": task.poster_id,
                "poster": task.poster.username if task.poster else "Unknown",
                "poster_avatar": task.poster.profile_picture if task.poster else None,
                "created_at": task.created_at.isoformat() if task.created_at else None
            })
    
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route('/tasks/<int:task_id>/apply', methods=['POST'])
@token_required
def apply_to_task(current_user, task_id):

    session = Session()

    try:
        task = session.query(Task).get(task_id)

        if not task:
            session.close()
            return jsonify({"status": "error", "message": "Task not found"}), 404

        # DEBUG: Log current user and task owner info
        print(f"[APPLY DEBUG] Current User ID: {current_user.id}, Current User Username: {current_user.username}")
        print(f"[APPLY DEBUG] Task ID: {task.id}, Task Title: {task.title}, Task Poster ID: {task.poster_id}")
        print(f"[APPLY DEBUG] Are they the same? {task.poster_id == current_user.id}")

        if task.poster_id == current_user.id:
            session.close()
            return jsonify({"status": "error", "message": "You cannot apply to your own task"}), 400

        existing_application = session.query(TaskApplication).filter_by(
            task_id=task_id,
            worker_id=current_user.id
        ).first()

        if existing_application:
            session.close()
            return jsonify({"status": "error", "message": "Already applied"}), 400

        application = TaskApplication(
            task_id=task_id,
            worker_id=current_user.id,
            status="pending"
        )

        session.add(application)
        session.commit()

        result = {
            "id": application.id,
            "task_id": application.task_id,
            "worker_id": application.worker_id,
            "status": application.status
        }

        session.close()

        return jsonify({"status": "success", "data": result}), 201
    
    except Exception as e:
        session.close()
        print(f"Apply error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/applications/<int:app_id>/accept', methods=['POST'])
@token_required
def accept_application(current_user, app_id):

    session = Session()

    application = session.query(TaskApplication).get(app_id)

    if not application:
        session.close()
        return jsonify({"error": "Application not found"}), 404

    task = session.query(Task).get(application.task_id)

    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"error": "Unauthorized"}), 403

    if application.status != "pending":
        session.close()
        return jsonify({"error": "Already processed"}), 400

    application.status = "accepted"
    
    # Create notification for the worker
    notification = Notification(
        user_id=application.worker_id,
        type="application_accepted",
        title="Application Accepted",
        message=f"Your application for '{task.title}' has been accepted!",
        related_id=application.id
    )
    session.add(notification)
    session.commit()

    result = {
        "id": application.id,
        "status": application.status
    }

    session.close()

    return jsonify({"status": "success", "data": result})

@app.route('/applications/<int:app_id>/reject', methods=['POST'])
@token_required
def reject_application(current_user, app_id):

    session = Session()

    application = session.query(TaskApplication).get(app_id)

    if not application:
        session.close()
        return jsonify({"error": "Application not found"}), 404

    task = session.query(Task).get(application.task_id)

    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"error": "Unauthorized"}), 403

    if application.status != "pending":
        session.close()
        return jsonify({"error": "Already processed"}), 400

    application.status = "rejected"
    
    # Create notification for the worker
    notification = Notification(
        user_id=application.worker_id,
        type="application_rejected",
        title="Application Rejected",
        message=f"Your application for '{task.title}' has been rejected.",
        related_id=application.id
    )
    session.add(notification)
    session.commit()

    result = {
        "id": application.id,
        "status": application.status
    }

    session.close()

    return jsonify({"status": "success", "data": result})

@app.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    session = Session()
    
    notifications = session.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    result = []
    for notification in notifications:
        result.append({
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "related_id": notification.related_id,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        })
    
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(current_user, notification_id):
    session = Session()
    
    notification = session.query(Notification).get(notification_id)
    
    if not notification:
        session.close()
        return jsonify({"error": "Notification not found"}), 404
    
    if notification.user_id != current_user.id:
        session.close()
        return jsonify({"error": "Unauthorized"}), 403
    
    notification.is_read = True
    session.commit()
    
    result = {
        "id": notification.id,
        "is_read": notification.is_read
    }
    
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route('/tasks/<int:task_id>/workers', methods=['GET'])
@token_required
def get_task_workers(current_user, task_id):

    session = Session()

    workers = session.query(TaskApplication).filter_by(
        task_id=task_id,
        status="accepted"
    ).all()

    result = []
    for w in workers:
        result.append({
            "application_id": w.id,
            "worker_id": w.worker_id,
            "username": w.worker.username
        })

    session.close()

    return jsonify({"status": "success", "data": result})
    
#not yet
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
        submission_file=data.get("submission_file"),  # This is now base64 string
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
        worker = session.query(User).filter_by(id=s.worker_id).first()
        
        # Determine file type for displaying base64
        file_data = None
        if s.submission_file:
            file_data = {
                "base64": s.submission_file,
                "name": f"submission_{s.id}"
            }
        
        result.append({
            "id": s.id,
            "worker_id": s.worker_id,
            "worker_username": worker.username if worker else "Unknown",
            "submission_text": s.submission_text,
            "submission_file": file_data,  # Now returns base64 data
            "status": s.status,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
        })
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/tasks/<int:task_id>/submissions/<int:submission_id>", methods=["PATCH"])
@token_required
def update_submission_status(current_user, task_id, submission_id):
    session = Session()
    task = session.query(Task).filter_by(id=task_id).first()
    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
    submission = session.query(TaskSubmission).filter_by(id=submission_id).first()
    data = request.json
    if data.get("status") in ["approved", "rejected"]:
        submission.status = data["status"]
    session.commit()
    session.close()
    return jsonify({"status": "success", "data": "Submission updated"})

@app.route("/tasks/<int:task_id>", methods=["PATCH"])
@token_required
def update_task(current_user, task_id):
    session = Session()
    
    task = session.query(Task).filter_by(id=task_id).first()
    
    if not task:
        session.close()
        return jsonify({"status": "error", "message": "Task not found"}), 404
    
    # Only the employer (poster) can update the task
    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
    
    data = request.json
    
    # Update task status if provided
    if data.get("status"):
        task.status = data["status"]
    
    session.commit()
    session.close()
    
    return jsonify({"status": "success", "data": "Task updated"})

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    session = Session()

    task = session.query(Task).filter_by(id=task_id).first()

    if not task:
        session.close()
        return jsonify({"status": "error", "message": "Task not found"}), 404

    # Only the employer (poster) can delete the task
    if task.poster_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    session.delete(task)
    session.commit()
    session.close()

    return jsonify({"status": "success", "data": "Task deleted"})

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
    
    # Extract data BEFORE closing session to avoid DetachedInstanceError
    item_id = item.id
    item_title = item.title
    
    session.close()
    return jsonify({"status": "success", "data": {"id": item_id, "title": item_title}})

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

@app.route("/portfolio/<int:portfolio_id>", methods=["DELETE"])
@token_required
def delete_portfolio(current_user, portfolio_id):
    session = Session()

    item = session.query(Portfolio).filter_by(id=portfolio_id).first()

    if not item:
        session.close()
        return jsonify({"status": "error", "message": "Portfolio item not found"}), 404

    # Only the owner can delete their portfolio item
    if item.user_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    session.delete(item)
    session.commit()
    session.close()

    return jsonify({"status": "success", "data": "Portfolio item deleted"})

# --- POSTS, COMMENTS, LIKES ROUTES ---
@app.route("/posts", methods=["POST"])
@token_required
def create_post(current_user):
    data = request.json
    session = Session()
    post = Post(user_id=current_user.id, content=data["content"], media_file=data.get("media_file"))
    session.add(post)
    session.commit()
    
    # Extract data before closing session
    post_id = post.id
    session.close()
    return jsonify({"status": "success", "data": {"id": post_id}})

@app.route("/posts", methods=["GET"])
@token_required
def get_posts(current_user):
    session = Session()
    posts = session.query(Post).all()
    result = []
    for p in posts:
        user = session.query(User).filter_by(id=p.user_id).first()
        comments = [{
            "id": c.id,
            "content": c.content,
            "username": session.query(User).filter_by(id=c.user_id).first().username if c.user_id else "Unknown",
            "parent_id": c.parent_id
        } for c in p.comments]
        likes_count = len(p.likes)
        
        # Check if current user liked this post
        user_liked = any(like.user_id == current_user.id for like in p.likes)
        
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "author": user.username if user else "Unknown",
            "authorAvatar": user.profile_picture if user else "https://via.placeholder.com/40",
            "role": user.roles[0].role.name if user and user.roles else "user",
            "content": p.content,
            "media_file": p.media_file,
            "comments": comments,
            "likes": likes_count,
            "liked": user_liked,
            "timestamp": p.created_at.strftime("%b %d, %Y") if hasattr(p, "created_at") and p.created_at else "Just now"
        })
    session.close()
    return jsonify({"status": "success", "data": result})

@app.route("/posts/<int:post_id>", methods=["DELETE"])
@token_required
def delete_post(current_user, post_id):
    session = Session()

    post = session.query(Post).filter_by(id=post_id).first()

    if not post:
        session.close()
        return jsonify({"status": "error", "message": "Post not found"}), 404

    # Only the post owner can delete
    if post.user_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "You can only delete your own posts"}), 403

    try:
        session.delete(post)
        session.commit()
        session.close()
        return jsonify({"status": "success", "data": "Post deleted"})
    except Exception as e:
        session.close()
        print(f"Error deleting post: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to delete post"}), 500

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
    
    # Extract data before closing
    comment_id = comment.id
    session.close()
    return jsonify({"status": "success", "data": {"id": comment_id, "username": current_user.username, "content": data["content"]}})

@app.route("/comments/<int:comment_id>", methods=["DELETE"])
@token_required
def delete_comment(current_user, comment_id):
    session = Session()

    comment = session.query(Comment).filter_by(id=comment_id).first()

    if not comment:
        session.close()
        return jsonify({"status": "error", "message": "Comment not found"}), 404

    if comment.user_id != current_user.id:
        session.close()
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    post_id = comment.post_id
    session.delete(comment)
    session.commit()
    session.close()

    return jsonify({"status": "success", "data": "Comment deleted", "post_id": post_id})

@app.route("/posts/<int:post_id>/like", methods=["POST"])
@token_required
def like_post(current_user, post_id):
    session = Session()
    existing_like = session.query(Like).filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if existing_like:
        session.delete(existing_like)
        session.commit()
        
        # Get updated likes count
        post = session.query(Post).filter_by(id=post_id).first()
        likes_count = len(post.likes) if post else 0
        
        session.close()
        return jsonify({"status": "success", "data": {"liked": False, "likes": likes_count}})
    
    like = Like(post_id=post_id, user_id=current_user.id)
    session.add(like)
    session.commit()
    
    # Get updated likes count
    post = session.query(Post).filter_by(id=post_id).first()
    likes_count = len(post.likes) if post else 0
    
    session.close()
    return jsonify({"status": "success", "data": {"liked": True, "likes": likes_count}})

# --- RUN SERVER ---
if __name__ == "__main__":
    app.run(debug=True)
