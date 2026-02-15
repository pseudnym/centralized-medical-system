from supabase_auth.errors import AuthApiError
from supabase import create_client, Client
from dotenv import load_dotenv
import os, sys

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

# [SIGNUP]
def signup():
    try:
        insert_signup_email = input("Enter signup email: ")
        insert_signup_password = input("Enter signup password (at least six characters): ")
        response = supabase.auth.sign_up({"email": insert_signup_email, "password": insert_signup_password})
    except AuthApiError as e:
        print("This email is already in use.")
        login()

# [LOGIN]
def login():
    insert_login_email = input("Enter login email: ")
    insert_login_password = input("Enter login password: ")
    sessionData = None

    try:
        sessionData = supabase.auth.sign_in_with_password({"email": insert_login_email, "password": insert_login_password}) #contains session data
    except AuthApiError as e:
        print("Login failed.")

    user_id = sessionData.user.id # the short UID
    #print("User ID:", user_id)

    if sessionData.user:
        print("Signed in successfully!")
    else:
        # If user does not exist, sign up
        try:
            signup()
            print("Account created! Please check your email for confirmation.")
        except Exception as e:
            print("Error during signup:", e)

    return user_id, insert_login_password;

# [SEND DATA]
#user_id, insert_email = login()
#insert_name = input("What's your name: ")
#insert_dob = input("Enter your date of birth in YYYY-MM-DD format: ")

def send_patient(name, email, dob, user_id): # SCUFFED FUNCTION BUT YOU GET THE IDEA BEHIND THE METH OF THE MADNESS
    patient = {
        "name": name,
        "email": email,
        "dob": dob,
        "user_id": user_id
    }
    response = supabase.table("patient").insert(patient).execute()

def send_appointment():
    appointment = {
        "patient_id": 1,
        "scheduled_for": "2026-2-14 6:30",
        "physician_name": "Dr. Contour",
        "reason": "lou.gehrig@example.com",
        "user_id": os.getenv("user_id")
    }
    response = supabase.table("appointment").insert(appointment).execute()

#response = (supabase.table("patient").select("*").execute())
#print(response)

#send_patient(insert_name, insert_email, insert_dob, user_id)
