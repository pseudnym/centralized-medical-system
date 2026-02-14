from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # server-side only

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Signup
def signup(email: str, password: str):
    return supabase.auth.sign_up({
        "email": email,
        "password": password
    })

# Login
def login(email: str, password: str):
    res = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    if res.session:
        return res.session.access_token
    
    return None

# Verify JWT
def get_user(jwt: str):
    return supabase.auth.get_user(jwt)

# Get patients (shoutout RLS)
def get_patients(jwt: str):
    supabase.postgrest.auth(jwt)

    return supabase.table("patients") \
        .select("*") \
        .execute()

# Get user role
def get_role(user_id: str):
    return supabase.table("profiles") \
        .select("role") \
        .eq("id", user_id) \
        .single() \
        .execute()

