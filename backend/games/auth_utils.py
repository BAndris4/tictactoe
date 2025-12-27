from rest_framework import status
from rest_framework.response import Response
from users.tokens import get_user_from_access_token, TokenExpired, InvalidToken

def get_user_from_request(request):
    raw_token = None
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        raw_token = auth_header[len("Bearer ") :]

    if raw_token is None:
        cookie_val = request.COOKIES.get("access_token")
        if cookie_val:
            if cookie_val.startswith("Bearer "):
                raw_token = cookie_val[len("Bearer ") :]
            else:
                raw_token = cookie_val

    if raw_token is None:
        return None, Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = get_user_from_access_token(raw_token)
        return user, None
    except TokenExpired:
        return None, Response({"detail": "Token expired."}, status=status.HTTP_401_UNAUTHORIZED)
    except InvalidToken:
        return None, Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
