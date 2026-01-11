from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client.healthcare

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
