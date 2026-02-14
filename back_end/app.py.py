from flask import Flask, request, jsonify
from auth import login, get_user

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

