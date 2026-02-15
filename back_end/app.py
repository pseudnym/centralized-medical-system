from flask import Flask, request, jsonify
from auth import login, get_user
import os
from dotenv import load_dotenv
from google import genai
from db import supabase
from medline import fetch_medline_summary

load_dotenv()

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def do_login():
    data = request.json

    token = login(
        data["email"],
        data["password"]
    )

    if not token:
        return jsonify({"error": "Invalid login"}), 401
    
    return jsonify({"access_token": token})

@app.route("/patients")
def patients():
    jwt = request.headers.get("Authorization").split()[1]

    user = get_user(jwt)

    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({"message": "Access granted"})

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
question = "What is Amphetamine?"
medline_info = fetch_medline_summary(question)

def ask_ai(user_id, user_message):
    appointments = supabase.table("appointment") \
        .select("scheduled_for, reason, physician_name") \
        .eq("user_id", user_id) \
        .execute().data
    
    medical_providers = supabase.table("medical_provider") \
        .select("name, address, phone_number") \
        .eq("user_id", user_id) \
        .execute().data
    
    observations = supabase.table("observation") \
        .select("patient_id, appointment_id, code, category, value_numeric, value_text, unit, reference_low, reference_high, occurence_datetime") \
        .eq("user_id", user_id) \
        .execute().data
    
    patients = supabase.table("patient") \
        .select("name, dob, email, user_id") \
        .eq("user_id", user_id) \
        .execute().data

    prescriptions = supabase.table("prescription") \
        .select("patient_id, instructions, medical_provider_id, quantity, dosage_strength, frequency, refills, status") \
        .eq("user_id", user_id) \
        .execute().data
    
    records = supabase.table("record") \
        .select("medical_provider_id, patient_id, file_path, file_name, appointment_id") \
        .eq("user_id", user_id) \
        .execute().data
    
    remote_monitorings = supabase.table("remote_monitoring") \
        .select("patient_id, monitoring_device, measurement_type, value_numeric, value_text, unit") \
        .eq("user_id", user_id) \
        .execute().data

    prompt = f"""
    You are a medical assistant.
    Only use these records:
    {appointments}
    {medical_providers}
    {observations}
    {patients}
    {prescriptions}
    {records}
    {remote_monitorings}

    Trusted medical reference (MedlinePlus):
    {medline_info}

    Question: {user_message}

    Rules:
    - No diagnosis
    - No guessing
    - If unsure say so
    - Suggest doctor when needed
    - No formatting; only plain text
    - When asked about drug information, use medlineplus api as your primary reference; all drug information can be found on there, but specify that consultation should be done with their doctor
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text

response = ask_ai(os.getenv("user_id"), question) #user_id and question is hard-coded in. ideally in front end, the user_id would be implied by the person accessing their profile and the question would be an instance via chat sent
print(response)
print(medline_info)

#print(client.models.list())
#for model in client.models.list():
#    print(model.name, model.available_methods)
'''#keep this to look for other models
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models = list(client.models.list())

print("Found models:", len(models))

for m in models[:10]:
    print(m.name)
'''