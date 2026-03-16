from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

db_url = "sqlite:///database.db"

#Create a connection manager between the database and pythoncode
# cable / tube to connect teller to vault
engine = create_engine(db_url, echo=True)#echo -prints SQL statements for debugging.

#Create models
Base = declarative_base()


#@ = reason for index
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, index=True)
    email = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String(100), nullable=False)
    bio = Column(Text)
    profile_picture = Column(String(255))
    website = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow ,onupdate=datetime.utcnow)

    roles = relationship("UserRole" , back_populates="user")
    task_posted = relationship("Task", back_populates="poster")
    submissions = relationship("TaskSubmission", back_populates="worker")
    portfolio_items = relationship("Portfolio", back_populates="user")
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    likes = relationship("Like", back_populates="user")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    users = relationship("UserRole", back_populates="role")

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)

    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="users")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False, index=True) #@To search for tasks faster
    description = Column(Text, nullable=False)
    poster_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)#@used in joins apparently but we'll see
    payment = Column(Float, nullable=False)
    status = Column(Enum("open", "assigned", "completed", "cancelled", name="task_status"), nullable=False, default="open")#@filtering tasks
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)

    poster = relationship("User", back_populates="task_posted")
    submissions = relationship("TaskSubmission", back_populates="task")

class TaskSubmission(Base):
    __tablename__ = "task_submissions"
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)#@Find all submissions for a task
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)#@Find all submissions by a user
    submission_text = Column(Text, nullable=True)
    submission_file = Column(String(255), nullable=False)
    status = Column(Enum("pending", "approved", "rejected", name="submission_status"), nullable=False, default="pending")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="submissions")
    worker = relationship("User", back_populates="submissions")

class Portfolio(Base):
    __tablename__ = "portfolio"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)#@find all portfolio items by a user
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_link = Column(String(255), nullable=True)
    media_file = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="portfolio_items")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)#@find all posts by a user
    content = Column(Text, nullable=False)
    media_file = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    likes = relationship("Like", back_populates="post")

class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)#@get all comments for a post
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)#@get all comments by a user
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")

#Create the database and tables
Base.metadata.create_all(engine)


