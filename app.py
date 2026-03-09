from sqlalchemy.orm import sessionmaker
from models import User, engine
import random

# bank teller to communicate transactions to 
Session = sessionmaker(bind=engine)
session = Session()

users = session.query(User).order_by(User.username).all()

for user in users:
    print(f"{user.username}")