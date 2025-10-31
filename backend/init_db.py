import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(dbname="postgres", user=os.getenv("POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), host=os.getenv("DB_HOST"), port=os.getenv("DB_PORT"))
conn.autocommit = True
cur = conn.cursor()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

try:
    cur.execute(f"CREATE DATABASE {db_name};")
except:
    print("Database already exists")

try:
    cur.execute(f"CREATE USER {db_user} WITH PASSWORD '{db_password}';")
except:
    print("User already exists")

cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};")
cur.close()
conn.close()
print("Database setup done")
