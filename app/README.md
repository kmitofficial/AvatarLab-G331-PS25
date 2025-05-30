# System Setup

## What You Need First
- **Node.js** (v16+) - JavaScript runtime
- **PostgreSQL** - Database system  
- **Redis** - Cache memory system

## Step 1: Install Project Dependencies

Navigate to the app folder and install required packages:
```bash
cd app
npm i
```

## Step 2: Setup Redis (Cache Memory)

Redis runs on **default port 6379** and must be running for the app to work.

### For Windows:
```bash
choco install redis-64
redis-server
```

### For Ubuntu:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```
**Test if Redis works:** `redis-cli ping` (should return "PONG")

## Step 3: Setup Database

We provide a pre-made database with all the data you need at:
**`assets/database/mybackup.sql`**

### Using pgAdmin (Graphical Interface):
1. Open pgAdmin
2. Create a new database 
3. Right-click your database → **Restore**
4. Choose file: `assets/database/backup.sql`
5. Click restore

### Using Command Line:
```bash
createdb your_database_name
psql -U your_username -d your_database_name -f assets/database/backup.sql
```

## Step 4: Run the Application

### For Development (recommended for beginners):
```bash
npm run dev
```

### For Production (if you have .next folder):
```bash
npm start
```

### To Build and Run:
```bash
npm run build
npm start
```

## Step 5: Run Redis Worker (Important!)

**You need TWO terminals running at the same time:**

**Terminal 1** - Main application:
```bash
npm run dev
```

**Terminal 2** - Redis worker:
```bash
npm run worker
```

## Open Your Browser
Use any modern browser: **Chrome, Firefox, Safari, or Edge**

---

**⚠️ Important Notes:**
- Keep both terminals running
- Redis must be running before starting the app
- If something breaks, check if Redis is running: `redis-cli ping`