from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("patient","Patient"),
        ("doctor","Doctor"),
        ("hospital","Hospital"),
        ("loan_provider","Loan Provider"),  # ✅ added
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()



class LoanProvider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="loan_provider_profile")
    company_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name


class LoanRequest(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    )

    RISK_CHOICES = (
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    )

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loan_requests")
    loan_provider = models.ForeignKey(LoanProvider, on_delete=models.CASCADE, related_name="received_requests")

    loan_id = models.CharField(max_length=20, unique=True)
    required_amount = models.PositiveIntegerField()
    approved_amount = models.PositiveIntegerField(null=True, blank=True)

    risk = models.CharField(max_length=10, choices=RISK_CHOICES)
    risk_score = models.IntegerField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Pending")

    loan_purpose = models.CharField(max_length=100)
    medical_reason = models.TextField()
    treatment_type = models.CharField(max_length=50)
    preferred_tenure = models.PositiveIntegerField()

    hospital_name = models.CharField(max_length=100)
    hospital_location = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

