from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import RegisterSerializer, UserSerializer, LoginSerializer
from ..services import (
    register_user,
    UsernameAlreadyTaken,
    EmailAlreadyTaken,
    authenticate_user,
)
from ..tokens import create_access_token
from django.conf import settings


class RegisterView(APIView):
    @swagger_auto_schema(
        operation_description="Register a new user",
        tags=["Auth"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "email", "password"],
            properties={
                "username": openapi.Schema(
                    type=openapi.TYPE_STRING,
                ),
                "email": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                ),
                "first_name": openapi.Schema(
                    type=openapi.TYPE_STRING,
                ),
                "last_name": openapi.Schema(
                    type=openapi.TYPE_STRING,
                ),
                "phone_number": openapi.Schema(
                    type=openapi.TYPE_STRING,
                )
            },  
        ),
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                description="User created",
                example={
                    "id": 1,
                    "username": "username",
                    "email": "user@example.com",
                    "first_name": "FirstName",
                    "last_name": "LastName",
                    "phone_number": "+36201234567",
                },

            ),
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


class LoginView(APIView):
    @swagger_auto_schema(
        operation_description="Login and receive JWT in HttpOnly cookie",
        tags=["Auth"], 
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "password"],
            properties={
                "username": openapi.Schema(
                    type=openapi.TYPE_STRING,
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                ),
                "stay_logged_in": openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="If true, keep user logged in for a long time.",
                ),
            },
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "access_token": openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description="JWT access token (also set in HttpOnly cookie)",
                    ),
                    "token_type": openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example="Bearer",
                    ),
                },
            ),
            400: "Validation error",
            401: "Invalid credentials",
        },
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = authenticate_user(
            username=data["username"],
            password=data["password"],
        )

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        stay_logged_in = data.get("stay_logged_in", False)

        access_token = create_access_token(user, remember=stay_logged_in)

        resp_body = {
            "access_token": access_token,
            "token_type": "Bearer",
        }
        response = Response(resp_body, status=status.HTTP_200_OK)

        secure = not settings.DEBUG

        if not stay_logged_in:
            response.set_cookie(
                key="access_token",
                value=f"Bearer {access_token}",
                httponly=True,
                secure=secure,
                samesite="Lax",
                path="/",
            )
        else:
            response.set_cookie(
                key="access_token",
                value=f"Bearer {access_token}",
                httponly=True,
                secure=secure,
                samesite="Lax",
                max_age=60 * 60 * 24 * 30,
                path="/",
            )

        return response

class LogoutView(APIView):
    @swagger_auto_schema(
        operation_description="Logout by clearing JWT HttpOnly cookie",
        tags=["Auth"],
        responses={
            204: openapi.Response(description="Logged out"),
        },
    )
    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)


        response.delete_cookie(
            key="access_token",
            path="/",
            samesite="Lax",
        )

        return response
