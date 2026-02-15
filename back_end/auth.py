from db import supabase

def login(email, password):
    res = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    return res.session.access_token if res.session else None

def get_user(jwt):
    return supabase.auth.get_user(jwt)


def get_patients(jwt):
    supabase.postgrest.auth(jwt)
    return supabase.table("patients").select("*").execute()
