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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    email = request.user.email
    role = request.user.role

    col = patients_col if role == "patient" else practitioners_col if role == "doctor" else organizations_col
    profile = col.find_one({"email": email}, {"_id": 0})

    return Response(profile or {"email": email, "profile_completed": False})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    email = request.user.email
    role = request.user.role
    data = request.data

    first_name = data.get("first_name") or data.get("firstName")
    last_name = data.get("last_name") or data.get("lastName")

    col = patients_col if role == "patient" else practitioners_col if role == "doctor" else organizations_col

    col.update_one(
        {"email": email},
        {"$set": {
            "first_name": first_name,
            "last_name": last_name,
            "phone": data.get("phone"),
            "dob": data.get("dob"),
            "gender": data.get("gender"),
            "address": data.get("address"),
            "city": data.get("city"),
            "state": data.get("state"),
            "zip": data.get("zip"),
            "profile_completed": True,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )

    return Response({"message": "Profile updated successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_shared_profiles(request):
    user = request.user

    patient = patients_col.find_one({"email": user.email})
    if not patient:
        return Response({"message": "Patient not found"}, status=404)

    profiles = list(shared_profiles_col.find(
        {"patient_id": patient["patient_id"]},
        {"_id": 0}
    ))

    return Response(profiles)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_fhir_profiles(request):
    user = request.user

    # ---------- PATIENT ----------
    if user.role == "patient":
        patient = patients_col.find_one({"email": user.email})
        if not patient:
            return Response({"error": "Patient not found"}, status=404)

        fhir_docs = list(fhir_patients_col.find(
            {"patient_id": patient["patient_id"]},
            {"_id": 0}
        ))
        return Response(fhir_docs)

    # ---------- DOCTOR ----------
    elif user.role == "doctor":
        doctor = practitioners_col.find_one({"email": user.email})
        if not doctor:
            return Response({"error": "Doctor not found"}, status=404)

        shared_ids = [
            s["shared_id"] for s in shared_profiles_col.find(
                {"practitioner_id": doctor["practitioner_id"]}
            )
        ]

        fhir_docs = list(fhir_patients_col.find(
            {"shared_id": {"$in": shared_ids}},
            {"_id": 0}
        ))
        return Response(fhir_docs)

    # ---------- HOSPITAL ----------
    elif user.role == "hospital":
        org = organizations_col.find_one({"email": user.email})
        if not org:
            return Response({"error": "Hospital not found"}, status=404)

        shared_ids = [
            s["shared_id"] for s in shared_profiles_col.find(
                {"organization_id": org["organization_id"]}
            )
        ]

        fhir_docs = list(fhir_patients_col.find(
            {"shared_id": {"$in": shared_ids}},
            {"_id": 0}
        ))
        return Response(fhir_docs)

    else:
        return Response({"error": "Not authorized"}, status=403)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_shared_profile(request, shared_id):
    user = request.user

    # Ensure only the patient who created it can delete it
    profile = shared_profiles_col.find_one({"shared_id": shared_id})

    if not profile:
        return Response({"error": "Shared profile not found"}, status=404)

    if profile["patient_email"] != user.email:
        return Response({"error": "Not allowed"}, status=403)

    # Delete from shared profiles
    shared_profiles_col.delete_one({"shared_id": shared_id})

    # Delete from FHIR collection (if exists)
    fhir_patients_col.delete_one({"shared_id": shared_id})

    return Response({"message": "Shared profile deleted successfully"}, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_shared_profiles(request):
    doc = practitioners_col.find_one({"email": request.user.email})

    profiles = list(shared_profiles_col.find(
        {"practitioner_id": doc["practitioner_id"]},
        {"_id": 0}
    ))

    return Response(profiles)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_recipients(request):
    doctors = list(practitioners_col.find({}, {"_id": 0, "practitioner_id": 1, "first_name": 1, "last_name": 1}))
    hospitals = list(organizations_col.find({}, {"_id": 0, "organization_id": 1, "name": 1}))
    loan_providers = list(loan_providers_col.find({}, {"_id": 0, "loan_provider_id": 1, "name": 1}))

    return Response({
        "doctors": doctors,
        "hospitals": hospitals,
        "loan_providers": loan_providers
    })
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def share_profile(request):
    data = request.data
    user = request.user

    patient = patients_col.find_one({"email": user.email})
    if not patient:
        return Response({"message": "Patient not found"}, status=404)

    shared_id = f"SHARE-{random.randint(100000,999999)}"

    shared_doc = {
        "shared_id": shared_id,
        "patient_email": user.email,
        "patient_id": patient["patient_id"],
        "patient_name": patient["first_name"],
        "gender": patient.get("gender"),
        "dob": patient.get("dob"),
        "phone": patient.get("phone"),
        "address": patient.get("address"),
        "city": patient.get("city"),

        "blood_group": data.get("blood_group"),
        "allergies": data.get("allergies"),
        "illness_reason": data.get("illness_reason"),

        "organization_id": data.get("organization_id"),
        "practitioner_id": data.get("practitioner_id"),

        # 🔑 NEW FLAG
        "fhir_converted": False,

        "shared_at": datetime.utcnow()
    }

    # 1️⃣ Save shared profile
    shared_profiles_col.insert_one(shared_doc)

    # 2️⃣ Fetch doctor & hospital
    practitioner = practitioners_col.find_one(
        {"practitioner_id": data.get("practitioner_id")}
    )
    organization = organizations_col.find_one(
        {"organization_id": data.get("organization_id")}
    )

    # 3️⃣ Convert to FHIR automatically
    fhir_patient = build_fhir_patient(
        patient,
        practitioner,
        organization,
        data.get("illness_reason")
    )

    # 4️⃣ Store FHIR resource
    fhir_patients_col.insert_one({
        "shared_id": shared_id,
        "patient_id": patient["patient_id"],
        "fhir_resource": fhir_patient,
        "created_at": datetime.utcnow()
    })

    # 5️⃣ Mark conversion as done
    shared_profiles_col.update_one(
        {"shared_id": shared_id},
        {"$set": {"fhir_converted": True}}
    )

    return Response(
        {"message": "Profile shared and converted to FHIR successfully"},
        status=201
    )

import uuid
from datetime import datetime

def build_fhir_patient(patient, practitioner, organization, visit_reason):
    patient_fhir_id = f"pat-{uuid.uuid4()}"

    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": []
    }

    # 1️⃣ Patient
    patient_resource = {
        "resourceType": "Patient",
        "id": patient_fhir_id,
        "name": [{
            "family": patient.get("last_name"),
            "given": [patient.get("first_name")]
        }],
        "gender": patient.get("gender"),
        "birthDate": str(patient.get("dob")),
        "telecom": [{
            "system": "phone",
            "value": patient.get("phone")
        }] if patient.get("phone") else [],
        "address": [{
            "city": patient.get("city"),
            "state": patient.get("state"),
            "postalCode": patient.get("zip"),
            "country": "India"
        }]
    }

    bundle["entry"].append({"resource": patient_resource})

    # 2️⃣ Known Allergies (only if provided)
    allergies = patient.get("allergies") or []
    if isinstance(allergies, str):
        allergies = [a.strip() for a in allergies.split(",") if a.strip()]

    for allergy in allergies:
        allergy_resource = {
            "resourceType": "AllergyIntolerance",
            "patient": {"reference": f"Patient/{patient_fhir_id}"},
            "code": {"text": allergy}
        }
        bundle["entry"].append({"resource": allergy_resource})

    # 3️⃣ Blood Group Observation
    if patient.get("blood_group"):
        blood_resource = {
            "resourceType": "Observation",
            "status": "final",
            "code": {"text": "Blood group"},
            "subject": {"reference": f"Patient/{patient_fhir_id}"},
            "valueCodeableConcept": {"text": patient.get("blood_group")}
        }
        bundle["entry"].append({"resource": blood_resource})

    # 4️⃣ Visit Reason Observation
    if visit_reason:
        visit_resource = {
            "resourceType": "Observation",
            "status": "final",
            "code": {"text": "Visit Reason"},
            "subject": {"reference": f"Patient/{patient_fhir_id}"},
            "valueString": visit_reason
        }
        bundle["entry"].append({"resource": visit_resource})

    return bundle








# =======================
# LOAN MANAGEMENT MODULE
# =======================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
import uuid

from .db import (
    loan_requests_col,
    loan_providers_col,
    patients_col
)

# -----------------------
# Risk Calculation Engine
# -----------------------

def calculate_risk_score(data):
    score = 0

    required_amount = int(data.get("required_amount", 0))
    income = int(data.get("monthly_income", 0))
    tenure = int(data.get("preferred_tenure", 1)) # avoid div by zero

    # EMI Calculation
    emi = required_amount / tenure

    # Income vs Loan Amount (EMI)
    if emi > income * 0.5:
        score += 40
    elif emi > income * 0.3:
        score += 20

    # Existing Loans
    if data.get("existing_loans") == "yes":
        score += 20

    # Insurance
    if data.get("insurance_available") == "no" or data.get("existing_insurance") == "no":
        score += 15

    # Tenure
    if tenure >= 36:
        score += 20
    elif tenure >= 24:
        score += 10

    # Treatment Type
    treatment = data.get("treatment_type", "").lower()
    if any(word in treatment for word in ["surgery", "emergency", "dialysis"]):
        score += 15
    else:
        score += 5

    # Final Risk Decision
    if score > 60:
        return "HIGH", score
    elif score > 30:
        return "MEDIUM", score
    else:
        return "LOW", score


# -----------------------
# Suggested Amount Logic
# -----------------------

def suggested_amount(required, risk):
    if risk == "Low":
        return required
    if risk == "Medium":
        return int(required * 0.7)
    if risk == "High":
        return int(required * 0.4)
    return 0
# -----------------------
# Loan Provider Dashboard
# -----------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def loan_provider_requests(request):
    provider = loan_providers_col.find_one({"email": request.user.email})
    if not provider:
        return Response({"error": "Unauthorized"}, status=403)

    loans = list(loan_requests_col.find(
        {"loan_provider_id": provider["loan_provider_id"]},
        {
            "_id": 0,
            "loan_id": 1,
            "patient_name": 1,
            "required_amount": 1,
            "risk": 1,
            "risk_score": 1,
            "loan_purpose": 1,
            "status": 1,
            "created_at": 1
        }
    ))

    return Response(loans)


# -----------------------
# Loan Detail + Suggested Amount
# -----------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def loan_detail(request, loan_id):
    provider = loan_providers_col.find_one({"email": request.user.email})
    loan = loan_requests_col.find_one(
        {"loan_id": loan_id, "loan_provider_id": provider["loan_provider_id"]},
        {"_id": 0}
    )

    if not loan:
        return Response({"error": "Loan not found"}, status=404)

    loan["suggested_amount"] = suggested_amount(
        loan["required_amount"], loan["risk"]
    )

    return Response(loan)


# -----------------------
# Approve / Reject Loan
# -----------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_loan_status(request):
    provider = loan_providers_col.find_one({"email": request.user.email})
    if not provider:
        return Response({"error": "Unauthorized"}, status=403)

    loan_id = request.data.get("loan_id")
    status_value = request.data.get("status")
    approved_amount = int(request.data.get("approved_amount", 0))

    loan = loan_requests_col.find_one(
        {"loan_id": loan_id, "loan_provider_id": provider["loan_provider_id"]}
    )

    if not loan:
        return Response({"error": "Loan not found"}, status=404)

    if status_value == "Approved":
        if approved_amount <= 0 or approved_amount > loan["required_amount"]:
            return Response({"error": "Invalid approved amount"}, status=400)

        loan_requests_col.update_one(
            {"loan_id": loan_id},
            {"$set": {
                "status": "Approved",
                "approved_amount": approved_amount,
                "approved_by": provider["loan_provider_id"],
                "approved_at": datetime.utcnow()
            }}
        )

    elif status_value == "Rejected":
        loan_requests_col.update_one(
            {"loan_id": loan_id},
            {"$set": {
                "status": "Rejected",
                "rejected_by": provider["loan_provider_id"],
                "rejected_at": datetime.utcnow()
            }}
        )

    else:
        return Response({"error": "Invalid status"}, status=400)

    return Response({"message": f"Loan {status_value}"})


# -----------------------
# Patient Loan Status
# -----------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_loans(request):
    patient = patients_col.find_one({"email": request.user.email})
    if not patient:
        return Response({"error": "Patient not found"}, status=404)

    loans = list(loan_requests_col.find(
        {"patient_id": patient["patient_id"]},
        {"_id": 0}
    ))

    return Response(loans)       



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hospital_shared_profiles(request):
    org = organizations_col.find_one({"email": request.user.email})

    profiles = list(shared_profiles_col.find(
        {"organization_id": org["organization_id"]},
        {"_id": 0}
    ))

    return Response(profiles)