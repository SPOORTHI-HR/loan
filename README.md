# FinTech Micro-Lending Platform (Simulation)

A production-quality simulated micro-lending platform built with React, Node.js, and PostgreSQL.

## Features

- **User Roles**: Applicants, Loan Officers, Risk Analysts, Admins.
- **Loan Lifecycle**: Application -> Under Review -> Approved/Rejected -> Active -> Closed/Defaulted.
- **Credit Scoring**: Automatic score calculation based on income, DTI, and history.
- **Dashboard**: Role-specific dashboards with Analytics (Charts).
- **Security**: JWT Authentication, Role-Based Access Control (RBAC).
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Node.js, Express, Prisma, PostgreSQL, Docker.

## Project Structure

- `frontend/`: React application (Vite).
- `backend/`: Node.js Express API.
- `docker-compose.yml`: Orchestration for App and DB.

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.

### Installation & Run

1. Clone the repository (if not already).
2. Run the application:

```bash
docker-compose up --build
```

3. Wait for the containers to start. The backend performs database migration and seeding automatically on startup.
4. Access the application:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

## Default Credentials

The system is pre-seeded with the following users (Password for all: `password123`):

| Role           | Email                 | Password    |
|----------------|-----------------------|-------------|
| **Admin**      | `admin@fintech.com`   | `password123` |
| **Loan Officer**| `officer@fintech.com`| `password123` |
| **Risk Analyst**| `analyst@fintech.com`| `password123` |
| **Applicant**  | `alice@test.com`      | `password123` |
| **Applicant**  | `bob@test.com`        | `password123` |

## Architecture

- **Frontend**: Single Page Application (SPA) using React Context for auth state. Uses Recharts for analytics.
- **Backend**: RESTful API with Layered Architecture (Controller-Service-Repository).
- **Database**: PostgreSQL with Prisma ORM.

## Key Workflows

1. **Apply for Loan**: Log in as Applicant -> Click "Apply" -> Fill details.
2. **Review Loan**: Log in as Loan Officer -> See "APPLIED" loans -> Review details -> Approve/Reject.
3. **View Analytics**: Log in as Admin or Risk Analyst -> View Dashboard charts.
