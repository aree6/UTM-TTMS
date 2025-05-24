----------
### **Step 1: Install dependencies**
```bash
npm install
```
----------
### **Step 2: Generate `COOKIE_SECRET`**
Run this and copy the output:
```bash
node -e "console.log(require('crypto').randomUUID())"
```
----------
### **Step 3: Generate `SESSION_ENCRYPTION_KEY`**
Run this and copy the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
----------
###  **Step 4: Navigate to the backend directory and create the `.env` file**
#### Mac / Linux / Git Bash on Windows:
```bash
cd UTM-TTMS-main/SECJ3104-TTMS-Backend-main && touch .env
```
----------
### **Step 5: Create the `.env` file**
Create a `.env` file manually at the root of your project, or use this command to start one:
```bash
touch .env
```
Then open it in a text editor (VS Code, for example):
And paste the following, replacing the placeholder values and pasting the generated secrets from **Step 2** and **Step 3**:
```
####### The host of the MySQL database (usually localhost or your DB server address)
DB_HOST=localhost

####### The username to login to the MySQL database
DB_USER=root

####### The password to login to the MySQL database
DB_PASSWORD=your_password

####### The name of the database to use (must match the database you create)
DB_NAME=my_database

####### The matric number for scraping data from upstream API
SCRAPER_MATRIC_NO=your_matric_no

####### The password for scraping data from upstream API
SCRAPER_PASSWORD=your_scraper_password

####### The secret used to sign cookies — paste the UUID generated from step 2 here
COOKIE_SECRET=your_generated_cookie_secret_here

####### The key used to encrypt user sessions — paste the key generated from step 3 here
SESSION_ENCRYPTION_KEY=your_generated_encryption_key_here

####### The host of the upstream API (URL for the API you’re scraping data from)
TTMS_UPSTREAM_HOST=https://upstream.example.com

####### The port number your server will listen on, defaults to 3000 if not set
SERVER_PORT=3000
```
----------
### **Step 6: Push database schema with Drizzle**
```bash
npx drizzle-kit push
```
----------
### **Step 7: Run the server**
```bash
npm start
```
----------