#  E-Commerce Backend REST API

A scalable, secure, and production-ready E-Commerce Backend REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Designed with role-based access control, Razorpay payment processing, cart/wishlist synchronization, automated emails, and image uploads.

---

##  Features

- ** Authentication & Authorization**:
  - Secure JWT-based authentication (Access & Refresh tokens).
  - Role-Based Access Control (RBAC) supporting `User` and `Admin` permissions.
  - Password encryption using `bcrypt`.
  - Email verification & password reset flows powered by `Nodemailer`.

- ** Product Management**:
  - Complete product CRUD operations.
  - Product search, category filtering, and trending product curation.
  - Image file uploads with validation using `Multer`.

- ** Cart & Wishlist (Favourites)**:
  - Persistent shopping cart with real-time item count badges.
  - Client-to-server cart and wishlist state synchronization.
  - Quantity adjustments and cart clearance.

- **Order & Payment Gateway Integration**:
  - Full order lifecycle tracking (status updates, user order history).
  - **Razorpay** integration: Server-side order creation, HMAC signature verification, and webhook handling.

- ** Admin Dashboard & Analytics**:
  - Aggregated metrics and reporting for sales, orders, and user growth.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcrypt`
- **Payments**: [Razorpay](https://razorpay.com/)
- **File Handling**: `multer`
- **Mailing**: `nodemailer`
- **Development Tooling**: `tsx`, `nodemon`, `tsc`

---

##  Project Structure

```text
├── src/
│   ├── config/             # Database connection, environment config
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/        # Request handlers & business logic
│   │   ├── cart.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── interfaces/         # TypeScript contracts & interfaces
│   ├── middlerware/        # Auth, role check, multer file uploads
│   │   ├── auth.middleware.ts
│   │   └── multer.ts
│   ├── models/             # Mongoose schemas & data models
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── routes/             # Express API routes
│   │   ├── cart.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   ├── app.ts              # Express application setup
│   └── server.ts           # Server bootstrap entry point
├── uploads/                # Uploaded product assets
├── .env                    # Environment variables (git-ignored)
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# SMTP Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="Store Support" <no-reply@yourstore.com>
```

---

##  Getting Started

### Clone the repository
```bash
git clone "https://github.com/faizan2807/E-Commerce-Backend"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Overview

### 👤 Authentication & Users (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/signup` | Register a new user | Public |
| `POST` | `/login` | User login & token generation | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `POST` | `/verifyEmail` | Verify email address | Public |
| `POST` | `/newpassword` | Reset password | Public |
| `GET` | `/:_id` | Get user profile | Authenticated |
| `PUT` | `/:_id` | Update profile | Authenticated |
| `PATCH`| `/address/:_id` | Add/update address | Authenticated |
| `GET` | `/` | Get all users | Admin |
| `DELETE` | `/:_id` | Delete user | Admin |

###  Products (`/api/product`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Get all products | Public |
| `GET` | `/trending` | Get trending products | Public |
| `GET` | `/category/:category` | Filter products by category | Public |
| `GET` | `/search` | Search products by keyword | Public |
| `GET` | `/:_id` | Get product details | Public |
| `POST` | `/post-product` | Add product (with image upload) | Admin |
| `PUT` | `/update/:_id` | Update product details | Admin |
| `DELETE` | `/:_id` | Delete product | Admin |
| `GET` | `/favourite/:userId` | Get user favourites | Authenticated |
| `POST` | `/favourite/sync` | Sync wishlist | Authenticated |

### 🛒 Cart (`/api/cart`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` or `/:userId` | Retrieve user cart items | Authenticated |
| `GET` | `/count` | Total item count badge | Authenticated |
| `POST` | `/add` | Add product to cart | Authenticated |
| `POST` | `/sync` | Sync local cart to server | Authenticated |
| `PUT` | `/update/:productId` | Update item quantity | Authenticated |
| `DELETE`| `/remove/:productId` | Remove product from cart | Authenticated |
| `DELETE`| `/clear` | Clear full cart | Authenticated |

###  Orders (`/api/order`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/:userId` | Create a new order | Authenticated |
| `GET` | `/:userId` | Get all orders of a user | Authenticated |
| `GET` | `/:userId/:orderId` | Get order detail | Authenticated |
| `PATCH`| `/status/:orderId` | Update delivery/order status | Admin |

###  Payments (`/api/payment`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/key` | Fetch Razorpay Public Key | Authenticated |
| `POST` | `/create-order` | Create order in Razorpay | Authenticated |
| `POST` | `/verify` | Verify payment signature & capture order | Authenticated |
| `POST` | `/webhook` | Handle payment webhook events | Public |

###  Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Fetch sales, order counts & overview data | Admin |

---

##  Security Best Practices Implemented

- Passwords hashed using one-way salt hashing with `bcrypt`.
- Protected routes using JWT bearer tokens and RBAC middleware.
- Signature verification (HMAC SHA-256) on Razorpay payment callbacks to prevent tampering.
- Multer file-type and size validation with custom error handling.
- Environment variables centralized and isolated through config modules.

---

##  License
ISC

