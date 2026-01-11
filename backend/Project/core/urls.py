from django.urls import path
from .views import apply_for_loan, get_profile,build_fhir_patient, delete_shared_profile, loan_detail, loan_provider_requests, login, patient_fhir_profiles, patient_loans, patient_shared_profiles, register, get_profile, share_profile, update_loan_status,  update_profile , get_recipients, doctor_shared_profiles, hospital_shared_profiles, respond_to_loan_plan, loan_provider_analytics




urlpatterns = [
    path("auth/register/", register),
    path("auth/login/", login),
    path("profile/", get_profile),
    path("profile/update/", update_profile),
    path("share-profile/", share_profile),
    path("recipients/", get_recipients),
    path("doctor/shared-profiles/", doctor_shared_profiles),
    path("hospital/shared-profiles/", hospital_shared_profiles),
    path("patient/shared-profiles/", patient_shared_profiles),
    path("share-profile/<str:shared_id>/", delete_shared_profile),
    path("patient/fhir-profiles/", patient_fhir_profiles),
    path("loan/apply/", apply_for_loan),
    path("loan/provider/analytics/", loan_provider_analytics),

    


]
