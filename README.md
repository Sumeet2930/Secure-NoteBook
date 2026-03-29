# 🛡️ Secure Notebook - MERN Stack

![Build Status](https://05c3-125-16-189-245.ngrok-free.app/buildStatus/icon?job=Secure-NoteBook)

A secure, containerized full-stack application for managing personal notes with built-in encryption and sharing capabilities.

## 🚀 Features

- **Authentication**: Secure registration and login using JSON Web Tokens (JWT) and HTTP-only cookies.
- **Encrypted Notes**: Protect your sensitive information with custom passcodes (hashed using `bcrypt`).
- **File Sharing**: Share notes with other users via email with an automatic 24-hour expiration.
- **Automated Cleanup**: Background process to periodically remove expired shared files.
- **CI/CD Integration**: Jenkins pipeline ready for automated builds and deployments.
- **Containerized**: Fully orchestrated with Docker and Docker Compose.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT, BCrypt, Cookie-parser.
- **DevOps**: Docker, Docker Compose, Jenkins.

## 📁 Project Structure

```text
Secure-NoteBook/
├── backend/            # Express server and API logic
│   ├── middleware/     # Authentication middleware
│   ├── models/        # Mongoose schemas (User, File)
│   ├── server.js      # Main server entry point
│   └── Dockerfile     # Backend container configuration
├── frontend/           # React frontend (Vite)
│   ├── src/           # Component and page logic
│   └── Dockerfile     # Frontend container configuration
├── docker-compose.yml  # Orchestrates full stack (App + DB)
└── Jenkinsfile         # CI/CD pipeline definition
```

## ⚙️ Setup & Running

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. **Clone the repository**:
   ```bash
    git clone https://github.com/Sumeet2930/Secure-NoteBook
    cd Secure-NoteBook
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `backend/` directory with:
   ```env
   PORT=5050
   MONGO_URI=mongodb://mongodb:27017/Secure-Notebook-docker
   JWT_SECRET=your_secret_key
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Access the App**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5050

## 🧪 API Endpoints (Summary)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Authenticate user & get cookie |
| GET | `/api/files` | Get all files for the user |
| POST | `/api/upload` | Upload a new note (with optional encryption) |
| POST | `/api/shareFile` | Share a note with another user |
| DELETE | `/api/files/:id` | Delete a specific note |

## 👷 Jenkins Pipeline

The project includes a `Jenkinsfile` that automates:
1. Building Docker images.
2. Pushing images to a registry (if configured).
3. Deployment steps.

---
