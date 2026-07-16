# KT Asset Management System

A full-stack web application for tracking company hardware assets through their lifecycle — from creation to issue, return, and scrap.

## Features

- **Employee Master** — Add/Edit/View employees with filters for active/inactive and search
- **Asset Category Master** — Manage hardware types (Laptop, Mobile, Drill Machine, etc.)
- **Asset Master** — Add/Edit/View assets with filters by category, search by make/model/serial number
- **Stock View** — Bird's eye view of assets in stock with category-wise totals
- **Issue Asset** — Issue an asset to an employee with issue date tracking
- **Return Asset** — Return an asset with reason capture (Upgrade, Repair, Resignation, Transfer, Damaged, Other)
- **Scrap Asset** — Mark assets as obsolete (hidden from all pages except reports)
- **Asset History** — Full lifecycle timeline of any asset from creation to scrap
- **Swagger API Docs** — Interactive API documentation at `/api-docs`

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Views:** Jade (Pug)
- **UI:** Bootstrap 5, Bootstrap Icons
- **Tables:** DataTables.net
- **API Docs:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Auth:** Session-based (express-session + connect-pg-simple + bcryptjs)

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [PostgreSQL](https://www.postgresql.org/) (v12+)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd KT_Telematic
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kt_asset_management
DB_USER=postgres
DB_PASSWORD=your_password
SESSION_SECRET=your-secret-key
PORT=3000
```

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE kt_asset_management;"
```

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will automatically:
- Sync all database tables
- Seed a default admin user

### 6. Access the application

- **Web App:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api-docs

### Default Login

- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
KT_Telematic/
├── app.js                  # Express app entry point
├── config/
│   └── database.js         # PostgreSQL/Sequelize config
├── models/
│   ├── index.js            # Sequelize init + associations
│   ├── User.js
│   ├── Employee.js
│   ├── AssetCategory.js
│   ├── Asset.js
│   ├── AssetAssignment.js
│   └── AssetScrap.js
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── categories.js
│   ├── assets.js
│   ├── assignments.js
│   ├── scraps.js
│   ├── reports.js
│   └── api/                # JSON API routes (Swagger documented)
│       ├── auth.js
│       ├── employees.js
│       ├── categories.js
│       ├── assets.js
│       ├── assignments.js
│       ├── scraps.js
│       └── reports.js
├── views/                  # Jade templates
│   ├── layout.jade
│   ├── auth/
│   ├── employees/
│   ├── categories/
│   ├── assets/
│   ├── assignments/
│   ├── scraps/
│   └── reports/
├── public/
│   ├── css/style.css
│   └── js/app.js
├── middleware/
│   └── auth.js
├── seeders/
│   └── default-admin.js
└── package.json
```

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Login accounts |
| `employees` | Company employees (code, name, email, phone, department, designation, branch, status) |
| `asset_categories` | Hardware types (Laptop, Mobile, etc.) |
| `assets` | All company assets (serial number, name, category, make, model, condition, status) |
| `asset_assignments` | Issue/return tracking (asset, employee, dates, return reason) |
| `asset_scraps` | Scrap records (asset, date, reason) |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Get employee |
| PUT | `/api/employees/:id` | Update employee |

### Asset Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List all assets |
| POST | `/api/assets` | Create asset |
| GET | `/api/assets/:id` | Get asset |
| PUT | `/api/assets/:id` | Update asset |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| POST | `/api/assignments/issue` | Issue asset to employee |
| POST | `/api/assignments/return` | Return asset from employee |

### Scraps
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scraps` | Scrap an asset |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/stock` | Stock view with category totals |
| GET | `/api/reports/asset-history/:id` | Full asset lifecycle history |

## License

ISC
