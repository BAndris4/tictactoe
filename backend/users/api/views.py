from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status
from users.api.serializers import UserSerializer  # Import UserSerializer
from users.api.serializers import RegisterSerializer  # Import RegisterSerializer
from users.services import register_user  # Import register_user function
from users.services import UsernameAlreadyTaken, EmailAlreadyTaken  # Import custom exceptions

class RegisterView(APIView):
    @swagger_auto_schema(
        tags=["Users"],
        operation_description="Register a new user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "email", "password"],
            properties={
                "username": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example="username",
                ),
                "email": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    example="user@example.com",
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                    example="password",
                ),
                "first_name": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example="FirstName",
                ),
                "last_name": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example="LastName",
                ),
                "phone_number": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example="+36301234567",
                ),
            },
        ),
        responses={
            201: UserSerializer,
            400: "Validation error",
        },
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            user = register_user(
                username=data["username"],
                email=data["email"],
                password=data["password"],
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                phone_number=data.get("phone_number"),
            )
        except UsernameAlreadyTaken:
            return Response(
                {"detail": "Username already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except EmailAlreadyTaken:
            return Response(
                {"detail": "Email already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
