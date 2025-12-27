# Tic Tac Toe Projekt

Egy klasszikus Amőba (Tic Tac Toe) játék Django backenddel és React frontenddel.

## Build és futtatás

### Docker használatával (Ajánlott)

A legegyszerűbb módja a futtatásnak a Docker Compose:

1. Másold le a `.env.example` fájlt `.env` néven és töltsd ki a szükséges adatokkal:
   ```bash
   cp .env.example .env
   ```
2. Buildeld és indítsd el a konténereket:
   ```bash
   docker-compose up --build
   ```

A frontend a `http://localhost:5173`, a backend pedig a `http://localhost:8000` címen lesz elérhető.

---

### Manuális futtatás

#### Backend
1. Navigálj a `backend` mappába.
2. Hozz létre egy virtuális környezetet:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Telepítsd a függőségeket:
   ```bash
   pip install -r requirements.txt
   ```
4. Migrációk futtatása és szerver indítása:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

#### Frontend
1. Navigálj a `frontend` mappába.
2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```
3. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```
