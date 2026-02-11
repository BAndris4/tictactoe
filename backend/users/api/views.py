from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    LoginSerializer,
    FriendshipSerializer,
    FriendRequestActionSerializer,
    PublicUserSerializer
)
from ..services import (
    register_user,
    UsernameAlreadyTaken,
    EmailAlreadyTaken,
    authenticate_user,
    send_friend_request,
    respond_to_friend_request,
    unfriend_user,
    block_user,
    send_password_reset_email
)
from ..tokens import (
    create_access_token, 
    get_user_from_access_token, 
    TokenExpired, 
    InvalidToken
)
from ..selectors import (
    get_pending_friend_requests,
    get_friends_list
)

from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


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
                gender=data.get("gender", "M"),
                avatar_config=data.get("avatar_config"),
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

class MeView(APIView):
    @swagger_auto_schema(
        operation_description="Update current authenticated user",
        tags=["User"],
        request_body=UserSerializer,
        responses={
            200: UserSerializer,
            400: "Validation error",
            401: "Not authenticated",
        },
    )
    def patch(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def get_authenticated_user(self, request):
        raw_token = None
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header[len("Bearer ") :]
        if raw_token is None:
            cookie_val = request.COOKIES.get("access_token")
            if cookie_val:
                raw_token = cookie_val[len("Bearer ") :] if cookie_val.startswith("Bearer ") else cookie_val
        
        if raw_token is None:
            return None, Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            return get_user_from_access_token(raw_token), None
        except (TokenExpired, InvalidToken):
            return None, Response({"detail": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)

    @swagger_auto_schema(
        operation_description="Get current authenticated user from JWT",
        tags=["User"],
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                description="Current authenticated user",
                example={
                    "id": 1,
                    "username": "username",
                    "email": "user@example.com",
                    "first_name": "FirstName",
                    "last_name": "LastName",
                    "phone_number": "+36201234567",
                },
            ),
            401: "Not authenticated or invalid/expired token",
        },
    )
    def get(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

class BaseFriendView(APIView):
    def get_authenticated_user(self, request):
        raw_token = None
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header[len("Bearer ") :]
        if raw_token is None:
            cookie_val = request.COOKIES.get("access_token")
            if cookie_val:
                raw_token = cookie_val[len("Bearer ") :] if cookie_val.startswith("Bearer ") else cookie_val
        
        if raw_token is None:
            return None, Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            return get_user_from_access_token(raw_token), None
        except (TokenExpired, InvalidToken):
            return None, Response({"detail": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)

class FriendRequestView(BaseFriendView):
    def post(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        username = request.data.get("username")
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            friendship = send_friend_request(from_user=user, to_username=username)
            return Response(FriendshipSerializer(friendship).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PendingFriendRequestsView(BaseFriendView):
    def get(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        requests = get_pending_friend_requests(user)
        return Response(FriendshipSerializer(requests, many=True).data)

class FriendRequestActionView(BaseFriendView):
    def patch(self, request, pk):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        serializer = FriendRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            friendship = respond_to_friend_request(
                friendship_id=pk, 
                user=user, 
                status=serializer.validated_data['status']
            )
            return Response(FriendshipSerializer(friendship).data)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FriendsListView(BaseFriendView):
    def get(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        friends = get_friends_list(user)
        return Response(UserSerializer(friends, many=True).data)

class UnfriendView(BaseFriendView):
    def delete(self, request, username):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        try:
            unfriend_user(user=user, target_username=username)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class BlockUserView(BaseFriendView):
    def post(self, request):
        user, error = self.get_authenticated_user(request)
        if error: return error
        
        username = request.data.get("username")
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            friendship = block_user(user=user, target_username=username)
            return Response(FriendshipSerializer(friendship).data)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class UserProfileView(APIView):
    @swagger_auto_schema(
        operation_description="Get public profile of a user",
        tags=["User"],
        responses={
            200: PublicUserSerializer,
            404: "User not found",
        },
    )
    def get(self, request, username):
        from django.shortcuts import get_object_or_404
        
        target_user = get_object_or_404(User, username=username)
        
        # Context is needed for mutual friends check in serializer
        serializer = PublicUserSerializer(target_user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmailCheckView(APIView):
    @swagger_auto_schema(
        operation_description="Check if an email is already taken",
        tags=["Auth"],
        manual_parameters=[
            openapi.Parameter(
                'email', 
                openapi.IN_QUERY, 
                description="Email address to check", 
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "available": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                }
            ),
            400: "Email parameter is missing",
        },
    )
    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"detail": "Email parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(email=email).exists()
        return Response({"available": not exists}, status=status.HTTP_200_OK)


class UsernameCheckView(APIView):
    @swagger_auto_schema(
        operation_description="Check if a username is already taken",
        tags=["Auth"],
        manual_parameters=[
            openapi.Parameter(
                'username', 
                openapi.IN_QUERY, 
                description="Username to check", 
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "available": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                }
            ),
            400: "Username parameter is missing",
        },
    )
    def get(self, request):
        username = request.query_params.get("username")
        if not username:
            return Response({"detail": "Username parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(username=username).exists()
        return Response({"available": not exists}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    @swagger_auto_schema(
        operation_description="Request a password reset email",
        tags=["Auth"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
            },
        ),
        responses={
            200: "Email sent if user exists",
            400: "Email is required",
        },
    )
    def post(self, request):
        from ..models import PasswordResetToken
        # from ..services import send_password_reset_email # Already imported at top now
        
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            # Create token
            token_obj = PasswordResetToken.objects.create(user=user)
            # Send email
            send_password_reset_email(email, str(token_obj.token))
        
        # Always return 200 to prevent email enumeration
        return Response({"detail": "If an account exists with this email, a reset link has been sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    @swagger_auto_schema(
        operation_description="Reset password using a token",
        tags=["Auth"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["token", "new_password"],
            properties={
                "token": openapi.Schema(type=openapi.TYPE_STRING),
                "new_password": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            },
        ),
        responses={
            200: "Password reset successful",
            400: "Invalid or expired token",
        },
    )
    def post(self, request):
        from ..models import PasswordResetToken
        
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        
        if not token or not new_password:
            return Response({"detail": "Token and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token_obj = PasswordResetToken.objects.get(token=token)
            if not token_obj.is_valid():
                return Response({"detail": "Token has expired or already been used."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            user = token_obj.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            token_obj.is_used = True
            token_obj.save()
            
            return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        except (PasswordResetToken.DoesNotExist, ValueError):
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
