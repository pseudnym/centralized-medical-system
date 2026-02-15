from supabase_auth.errors import AuthApiError
from supabase import create_client, Client
from dotenv import load_dotenv
import os, sys

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

# [SIGN IN]
email = "medical.test@email.com"
password = "m3d1c4Lt35T"
sessionData = None

try:
    sessionData = supabase.auth.sign_in_with_password({"email": email, "password": password}) #contains session data
except AuthApiError as e:
    print("Login failed.")
    sys.exit()
    # HOLE IN CODE: have some try again call here and force it to not move forward

user_id = sessionData.user.id # the short UID
print("User ID:", user_id)
jwt = sessionData.session.access_token # the long access token
#print("\nJWT token:", jwt)

if sessionData.user:
    print("Signed in successfully!")
else:
    # If user does not exist, sign up
    try:
        resSign = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        print("Account created! Please check your email for confirmation.")
    except Exception as e:
        print("Error during signup:", e)
# [SEND DATA]

patient = {
    "name": "Lou Gehrig",
    "email": email,
    "dob": "2000-10-15",
    "user_id": user_id
}

appointment = {
    "patient_id": 1,
    "scheduled_for": "2026-2-14 6:30",
    "physician_name": "Dr. Contour",
    "reason": "lou.gehrig@example.com"
}

response = supabase.table("patient").insert(patient).execute()
response = supabase.table("appointment").insert(appointment).execute()
