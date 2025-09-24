

# Copilot Instructions for Chatbot4j Repository

## Project Overview

**Chatbot4j** is a modern full-stack intelligent chatbot application, built with **Spring Boot 3** (Java 21) for the backend and **React 19** (TypeScript) for the frontend. It supports multi-LLM integration, conversation management, real-time streaming responses, web search, sharing, and multimodal input.

### Tech Stack
- **Backend**: Spring Boot 3.5.0, Java 21, LangChain4j, PostgreSQL, Spring Data JPA, HikariCP, SpringDoc OpenAPI
- **Frontend**: React 19, TypeScript, Vite, Ant Design, Tailwind CSS, Zustand, React Router, React Markdown
- **Testing**: JUnit 5 (backend), Jest + React Testing Library (frontend)
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Containerization**: Multi-stage Docker build

### Directory Structure
```
chatbot4j/
├── src/main/java/dev/chatbot/          # Java backend source
│   ├── aiservice/                      # AI service integrations
│   ├── config/                         # Spring configuration
│   ├── controller/                     # REST API controllers
│   ├── domain/                         # JPA entities
│   ├── dto/                            # Data transfer objects
│   ├── repository/                     # Data access layer
│   ├── service/                        # Business logic
│   └── ChatBotApplication.java         # Main application entry point
├── src/main/resources/
│   ├── application.yaml                # Backend configuration file
│   └── static/                         # Frontend build output
├── web/                                # React frontend source
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   ├── routes/                     # Page-level components and routing
│   │   ├── store/                      # State management
│   │   ├── utils/                      # Utility functions
│   │   └── assets/                     # Static assets
│   ├── public/                         # Vite static files
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.ts                  # Vite configuration
│   ├── eslint.config.js                # ESLint configuration
│   ├── tailwind.config.js              # TailwindCSS configuration
│   └── tsconfig.json                   # TypeScript configuration
├── Dockerfile                          # Docker build script
├── Makefile                            # Build automation
└── pom.xml                             # Maven configuration
```

## Environment Setup & Installation

### Prerequisites
- **Java 21** (backend)
- **Node.js LTS v22+** (frontend)
- **Yarn 4.9.2** (recommended, managed via corepack)
- **PostgreSQL 12+** (database)
- **Docker** (optional, for containerized deployment)

### Database Initialization
```sql
CREATE DATABASE chatbot4j;
CREATE USER chatbot WITH PASSWORD 'chatbot';
GRANT ALL PRIVILEGES ON DATABASE chatbot4j TO chatbot;
```

### Environment Variable Configuration
Configure via environment variables or `src/main/resources/application.yaml`:
```yaml
# Example environment variables
DB_URL=jdbc:postgresql://localhost:5432/chatbot4j
DB_USERNAME=chatbot
DB_PASSWORD=chatbot
LLM_API_KEY=your-openai-api-key
LLM_BASE_URL=https://api.openai.com/v1/
LLM_MODEL=gpt-4o-mini
TAVILY_API_KEY=your-tavily-api-key  # Optional, for web search
```

### Backend Startup
```bash
mvn spring-boot:run
# or
mvn clean package && java -jar target/chatbot4j-*.jar
```

### Frontend Installation & Startup
> ⚠️ Frontend dependency installation may fail due to network/CDN issues. Prefer yarn; use npm as fallback.

**Yarn (Recommended)**
```bash
cd web
corepack enable
yarn install --immutable
yarn dev  # http://localhost:7000
```

**npm (Fallback)**
```bash
cd web
npm install --legacy-peer-deps
npm run dev
```

### Common Development Commands
```bash
# Backend
mvn test                # Run unit tests
mvn spotless:apply      # Format code
mvn spotless:check      # Check formatting

# Frontend
cd web
yarn lint               # Lint code
yarn format             # Auto-format code
yarn test               # Run frontend tests
yarn build              # Production build
yarn dev                # Hot-reload development server
```

### One-Click Build & Test
```bash
make build      # Build fullstack app
make lint       # Lint backend & frontend
make format     # Format backend & frontend
make test       # Run all tests
```

## Running & Accessing the Application

**Recommended Development Workflow:**
```bash
# Terminal 1: Backend
mvn spring-boot:run
# Terminal 2: Frontend
cd web && corepack enable && yarn dev
```

- Frontend: http://localhost:7000
- Backend API Docs: http://localhost:8080/swagger-ui.html

## CI/CD & Quality Assurance

- **GitHub Actions**: Automated lint, test, build
- **API CI**: `.github/workflows/backend-ci.yaml` (Java 21, mvn lint/test)
- **Web CI**: `.github/workflows/web-ci.yml` (Node.js LTS, yarn lint/test/build)

## Common Issues & Solutions

### Java Version Mismatch
**Error**: `release version 21 not supported`
**Solution**: Ensure Java 21 is installed and `JAVA_HOME` is set
```bash
java -version
export JAVA_HOME=/path/to/java21
```

### Database Connection Failure
**Error**: Connection refused or authentication failed
**Solution**:
1. Check PostgreSQL is running
2. Check `application.yaml` configuration
3. Ensure database and user are created

### Frontend Dependency/Build Failure
**Error**: Missing dependencies, CDN timeout
**Solution**:
```bash
cd web
rm -rf node_modules yarn.lock
yarn install
```

### Port Conflict
**Error**: Port already in use
**Solution**:
- Backend: Change `server.port` in `application.yaml`
- Frontend: Change port in `web/vite.config.ts`

## Code Style & Contribution

- Backend: Spotless formatting, recommended `make format`
- Frontend: ESLint/Prettier, TypeScript checks
- Commits: Follow conventional commit messages
- Documentation: Update README for major changes

## Additional Notes

- **API Docs**: Swagger UI at http://localhost:8080/swagger-ui.html
- **Health Checks**: `/actuator/health`, `/actuator/info`, `/actuator/metrics`
- **Production Deployment**: Docker recommended, see README

---
For more help, see the README or ask in Issues/Discussions.
