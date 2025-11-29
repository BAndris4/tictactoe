import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

ADMIN_USER = os.getenv("POSTGRES_USER")
ADMIN_PASSWORD = os.getenv("POSTGRES_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")

DB_NAME = os.getenv("DB_NAME")
APP_USER = os.getenv("DB_USER")
APP_PASSWORD = os.getenv("DB_PASSWORD")

conn = psycopg2.connect(
    dbname="postgres",
    user=ADMIN_USER,
    password=ADMIN_PASSWORD,
    host=HOST,
    port=PORT,
)
conn.autocommit = True
cur = conn.cursor()

try:
    cur.execute(f"CREATE USER {APP_USER} WITH PASSWORD %s;", (APP_PASSWORD,))
    print("User created")
except Exception:
    print("User already exists")


try:
    cur.execute(f"CREATE DATABASE {DB_NAME} OWNER {APP_USER};")
    print("Database created")
except Exception:
    print("Database already exists")


cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {APP_USER};")

cur.close()
conn.close()

conn2 = psycopg2.connect(
    dbname=DB_NAME,
    user=ADMIN_USER, 
    password=ADMIN_PASSWORD,
    host=HOST,
    port=PORT,
)
conn2.autocommit = True
cur2 = conn2.cursor()

cur2.execute(f"GRANT ALL ON SCHEMA public TO {APP_USER};")

try:
    cur2.execute(f"ALTER SCHEMA public OWNER TO {APP_USER};")
except Exception:
    pass

cur2.close()
conn2.close()

print("Database setup done (permissions OK)")
