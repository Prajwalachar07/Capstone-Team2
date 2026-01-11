from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "super-secret-key-change-this"
ALGO = "HS256"

def create_token(payload):
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGO)

def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGO])
