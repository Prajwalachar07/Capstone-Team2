from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .db import patients_col, practitioners_col, organizations_col, shared_profiles_col, fhir_patients_col, loan_providers_col
from datetime import datetime
import random
from django.contrib.auth.hashers import make_password, check_password
import uuid



User = get_user_model()

def generate_patient_id():
    return f"PAT-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000,9999)}"


def generate_practitioner_id():
    return f"DR-{random.randint(100000,999999)}"


def generate_organization_id():
    return f"HOSP-{random.randint(100000,999999)}"

def generate_loan_provider_id():
    return f"LOANP-{random.randint(100000,999999)}"

def generate_loan_id():
    return f"LOAN-{random.randint(100000,999999)}"


@api_view(["POST"])
def register(request):
    data = request.data
    role = data.get("role")

    if not role:
        return Response({"error": "role required"}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return Response({"error": "email and password required"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "User already exists"}, status=400)

    # ---------- HOSPITAL ----------
    if role == "hospital":
        name = data.get("name")
        if not name:
            return Response({"error": "name required for hospital"}, status=400)

        user = User.objects.create(email=email, role=role)
        user.set_unusable_password()
        user.save()

        base_doc = {
            "email": email,
            "name": name,
            "role": role,
            "password": make_password(password),
            "organization_id": generate_organization_id(),
            "created_at": datetime.utcnow(),
        }

        organizations_col.insert_one(base_doc)

    # ---------- DOCTOR ----------
    elif role == "doctor":
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        specialization = data.get("specialization")
        hospital_id = data.get("hospital_id")

        if not all([first_name, last_name, specialization, hospital_id]):
            return Response({"error": "first_name, last_name, specialization, hospital_id required"}, status=400)

        # Validate hospital exists
        hospital = organizations_col.find_one({"organization_id": hospital_id})
        if not hospital:
            return Response({"error": "Invalid hospital selected"}, status=400)

        user = User.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        user.set_unusable_password()
        user.save()

        base_doc = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "specialization": specialization,
            "organization_id": hospital_id,
            "role": role,
            "password": make_password(password),
            "practitioner_id": generate_practitioner_id(),
            "created_at": datetime.utcnow(),
        }

        practitioners_col.insert_one(base_doc)

    # ---------- PATIENT ----------
    elif role == "patient":
        first_name = data.get("first_name")
        last_name = data.get("last_name")

        if not all([first_name, last_name]):
            return Response({"error": "first_name and last_name required"}, status=400)

        user = User.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        user.set_unusable_password()
        user.save()

        base_doc = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "password": make_password(password),
            "patient_id": generate_patient_id(),
            "profile_completed": False,
            "created_at": datetime.utcnow(),
        }

        patients_col.insert_one(base_doc)
    elif role == "loan_provider":
        name = data.get("name")

        user = User.objects.create(email=email, role=role)
        user.set_unusable_password()
        user.save()

        loan_providers_col.insert_one({
            "email": email,
            "name": name,
            "role": role,
            "password": make_password(password),
            "loan_provider_id": generate_loan_provider_id(),
            "created_at": datetime.utcnow()
        })

    else:
        return Response({"error": "Invalid role"}, status=400)

    return Response({"message": "Registered successfully", "role": role}, status=201)

@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    # Role based collection mapping
    if user.role == "patient":
        col = patients_col
    elif user.role == "doctor":
        col = practitioners_col
    elif user.role == "hospital":
        col = organizations_col
    elif user.role == "loan_provider":
        col = loan_providers_col
    else:
        return Response({"error": "Invalid role"}, status=400)

    doc = col.find_one({"email": email})

    if not doc or not check_password(password, doc["password"]):
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    })

