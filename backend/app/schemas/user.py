from pydantic import BaseModel

class RegisterUser(BaseModel):
    fullName: str
    email: str
    mobile: str
    age: str
    password: str
