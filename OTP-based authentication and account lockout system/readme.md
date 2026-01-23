
# 📘 Express.js Authentication with OTP and Account Locking

## 📌 Overview

This project demonstrates a simple authentication system using **Node.js, Express.js, bcrypt, and JWT**.
It includes the following features:

* User Registration
* User Login with Password
* OTP (One-Time Password) Generation & Verification
* JWT Authentication Token
* Failed OTP attempt tracking
* Temporary Account Lockout

---

## ⚙️ Tech Stack

* **Node.js** (Runtime)
* **Express.js** (Server Framework)
* **bcryptjs** (Password Hashing)
* **jsonwebtoken (JWT)** (Token-based Authentication)

---

## 📂 API Endpoints

### 1️⃣ **Register User**

**Endpoint:** `POST /register`

#### Request Body:

```json
{
  "name": "john-wick",
  "email": "john@email.com",
  "password": "123456"
}
```

#### Workflow:

* Checks if a user with the given email already exists.
* Hashes the password with `bcrypt`.
* Stores user in the in-memory `users` array.

#### Responses:

* ✅ **201 Created** → User registered successfully.
* ❌ **400 Bad Request** → User already exists.
* ❌ **500 Internal Server Error** → Unexpected error.

---

### 2️⃣ **Login User**

**Endpoint:** `POST /login`

#### Request Body:

```json
{
  "email": "john@email.com",
  "password": "123456"
}
```

#### Workflow:

* Checks if user exists.
* Compares the entered password with the hashed password.
* If account is locked → rejects login.
* If valid → generates a **4-digit OTP**, stores it with an expiry (1 minute).
* Sends OTP via **console log** (simulating email/SMS).

#### Responses:

* ✅ **200 OK** → "OTP sent. Check your console."
* ❌ **404 Not Found** → User does not exist or wrong password.
* ❌ **400 Bad Request** → Account locked until specified time.
* ❌ **500 Internal Server Error** → Unexpected error.

---

### 3️⃣ **Verify OTP**

**Endpoint:** `POST /verify-otp`

#### Request Body:

```json
{
  "email": "john@email.com",
  "otp": "1234"
}
```

#### Workflow:

* Checks if OTP exists and is not expired.
* If account is locked → rejects request.
* If OTP matches → issues a **JWT token** (valid for 1 hour).
* If OTP is incorrect:

  * Increments `failedAttempts`.
  * If failed attempts ≥ 3 → locks account for **3 minutes**.

#### Responses:

* ✅ **200 OK** → Returns JWT token.
* ❌ **400 Bad Request** → OTP expired or account locked.
* ❌ **404 Not Found** → Incorrect OTP.
* ❌ **500 Internal Server Error** → Unexpected error.

---

## 🔑 JWT Authentication

* JWT is signed using the secret key:

  ```js
  const JWT_SECRET = 'RANDOMBYTE321@123';
  ```
* Token Payload includes:

  ```json
  {
    "email": "user@email.com",
    "name": "john-wick",
    "iat": 1690000000,
    "exp": 1690003600
  }
  ```

---

## 🚨 Edge Cases & Handling

1. **User already exists** → Registration blocked.
2. **Incorrect password** → Login blocked.
3. **OTP expired** → Requires re-login.
4. **OTP incorrect** → Increases failed attempts counter.
5. **3 wrong OTP attempts** → Account locked for 3 minutes.
6. **Login during lockout** → Request rejected until lock expires.
7. **Successful OTP verification** → Resets failed attempts, clears OTP, unlocks account, issues JWT.

---

## 🧪 Example Test Flow

1. **Register** a new user.
2. **Login** with correct credentials → OTP sent to console.
3. **Verify OTP**:

   * ✅ Correct OTP → Receive JWT token.
   * ❌ Wrong OTP (x3) → Account locked for 3 mins.
4. **Retry login during lockout** → Rejected.
5. After lock expires → User can login again.

---

