from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.AutoField(primary_key=True)

    phone_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return self.username
