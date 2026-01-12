from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]

# client = MongoClient("mongodb://localhost:27017/")
# db = client.healthcare

# Core collections
patients_col = db.patients
practitioners_col = db.practitioners


organizations_col = db.organizations
shared_profiles_col = db.shared_profiles

# FHIR storage
fhir_patients_col = db.fhir_patients

# Loan module
loan_providers_col = db.loan_providers
loan_requests_col = db.loan_requests   # <-- REQUIRED
