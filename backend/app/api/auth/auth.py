from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import RegisterUser
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from passlib.context import CryptContext
from app.utils.jwt import create_access_token, decode_access_token



router = APIRouter()



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload.get("sub")

@router.post("/register", status_code=201)
async def register_user(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    print(" DATA comming from frontend ==<<>>:", body)

    email = body.get("email")
    mobile = body.get("mobile")
    print('email =<<>>', email)
    print('mobile number ==<<<>>', mobile)

    # Check if email or mobile already exists
    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        print("⚠️ Email already exists:", email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    existing_mobile = db.query(User).filter(User.mobile == mobile).first()
    if existing_mobile:
        print("⚠️ Mobile number already exists:", mobile)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already exists"
        )

    # ✅ Create user
    try:
        new_user = User(
            full_name=body["fullName"],
            email=email,
            mobile=mobile,
            age=body["age"],
            password=hash_password(body["password"]),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ User registered: {new_user.email}")
        return {"message": "User registered successfully"}
    except Exception as e:
        print("❌ Error during registration:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while registering the user"
        )




pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", status_code=200)
async def login_user(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    print('data coming from frontend ==<<<>>', body)

    identifier = body.get("identifier")  # username, email, or mobile
    password = body.get("password")

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Missing identifier or password")

    # Try to find user by email or mobile or username
    user = db.query(User).filter(
        (User.email == identifier) |
        (User.mobile == identifier) |
        (User.full_name == identifier)
    ).first()

    print('user =<<>>', user)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # ✅ Create JWT access token
    token = create_access_token(data={"sub": user.email})  

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }