# Tic Tac Toe - Szakdolgozat Projekt

Ez a repository tartalmazza a Tic Tac Toe (Amőba) játék modern webes implementációjának forráskódját. A projekt célja egy teljes értékű webalkalmazás bemutatása, amely szétválasztott backend és frontend architektúrát használ.

## Technológiák

A projekt az alábbi technológiákra épül:

- **Backend:** Python, Django, Django REST Framework
- **Frontend:** TypeScript, React, Vite, Tailwind CSS
- **Adatbázis:** PostgreSQL
- **Konténerizáció:** Docker, Docker Compose

## Előfeltételek

A projekt futtatásához szükséges szoftverek:

- **Ajánlott:** [Docker Desktop](https://www.docker.com/products/docker-desktop) (tartalmazza a Docker Compose-t is).
- **Manuális futtatás esetén:**
    - Python 3.8 vagy újabb
    - Node.js 18 vagy újabb
    - npm (Node Package Manager)

## Telepítés és Futtatás

### 1. Környezeti változók beállítása

A projekt indítása előtt létre kell hozni a környezeti változókat tartalmazó fájlt. A gyökérkönyvtárban található egy minta fájl:

```bash
cp .env.example .env
```
Nyisd meg a `.env` fájlt, és ellenőrizd a beállításokat (pl. adatbázis jelszavak). Fejlesztéshez az alapértelmezett értékek általában megfelelőek.

### 2. Futtatás Dockerrel (Ajánlott módszer)

Ez a legegyszerűbb módja az alkalmazás elindításának, mivel minden függőséget és szolgáltatást (beleértve az adatbázist is) automatikusan kezel.

1. Nyiss egy terminált a projekt gyökérkönyvtárában.
2. Építsd fel és indítsd el a konténereket:
   ```bash
   docker-compose up --build
   ```
3. A folyamat végén az alkalmazás elérhető lesz a böngészőben:
   - **Frontend (Játék):** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Admin felület:** [http://localhost:8000/admin](http://localhost:8000/admin)

A leállításhoz nyomj `Ctrl+C`-t, vagy futtasd a `docker-compose down` parancsot egy másik terminálban.

### 3. Manuális Futtatás (Fejlesztéshez)

Ha komponensenként szeretnéd futtatni az alkalmazást:

#### Backend (Django)

1. Lépj a backend könyvtárba:
   ```bash
   cd backend
   ```
2. Hozz létre és aktiválj egy virtuális környezetet:
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Telepítsd a függőségeket:
   ```bash
   pip install -r requirements.txt
   ```
4. Futtasd az adatbázis migrációkat:
   ```bash
   python manage.py migrate
   ```
5. Indítsd el a fejlesztői szervert:
   ```bash
   python manage.py runserver
   ```

#### Frontend (React)

1. Nyiss egy új terminált, és lépj a frontend könyvtárba:
   ```bash
   cd frontend
   ```
2. Telepítsd a csomagokat:
   ```bash
   npm install
   ```
3. Indítsd el a frontend szervert:
   ```bash
   npm run dev
   ```

## Adminisztráció

Adminisztrátor felhasználó létrehozása (Docker futtatás esetén):

```bash
docker-compose exec backend python manage.py createsuperuser
```

Manuális futtatás esetén (aktív venv-vel):

```bash
python manage.py createsuperuser
```

Ezután bejelentkezhetsz a `/admin` felületen a megadott adatokkal.
