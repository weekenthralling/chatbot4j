# ChatBot4J

A modern, full-stack chatbot application built with **Spring Boot 3** (Java 21) backend and **React** (TypeScript) frontend. This application provides an intelligent conversational AI interface with support for multiple LLM providers, conversation management, and web search capabilities.

## 🚀 Features

### Core Functionality
- **Conversational AI**: Interactive chat interface with streaming responses
- **Multi-LLM Support**: Integration with OpenAI GPT models via LangChain4j
- **Conversation Management**: Create, store, and organize chat conversations
- **Real-time Streaming**: Server-sent events for real-time message delivery
- **Web Search Integration**: Enhanced responses with Tavily web search
- **File Upload Support**: Handle various file formats for context

### User Experience
- **Modern UI**: Responsive React interface with Ant Design components
- **Dark/Light Mode**: Adaptive UI themes
- **User Authentication**: OAuth2-based authentication system
- **Conversation History**: Persistent chat history with date-based organization
- **Share Functionality**: Share conversations with other users
- **Accessibility**: ARIA-compliant interface for screen readers

### Technical Features
- **RESTful API**: Well-documented REST endpoints with OpenAPI/Swagger
- **Database**: PostgreSQL with JPA/Hibernate ORM
- **Caching**: Redis integration for performance optimization
- **Containerized**: Docker support for easy deployment
- **CI/CD**: GitHub Actions workflows for automated testing and deployment

## 📋 Prerequisites

- **Java 21** (OpenJDK or Oracle JDK)
- **Node.js 18+** with npm/yarn
- **PostgreSQL 12+**
- **Redis 6+** (optional, for caching)
- **Docker** (optional, for containerized deployment)

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.0** - Application framework
- **Java 21** - Programming language
- **LangChain4j** - LLM integration and AI workflows
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **HikariCP** - Database connection pooling
- **SpringDoc OpenAPI** - API documentation
- **Maven** - Dependency management and build tool

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Markdown** - Markdown rendering with syntax highlighting

## 🏗️ Project Structure

```
chatbot4j/
├── src/main/java/dev/chatbot/          # Java backend source
│   ├── aiservice/                      # AI service integrations
│   ├── config/                         # Spring configuration
│   ├── controller/                     # REST API controllers
│   ├── domain/                         # JPA entities
│   ├── dto/                           # Data transfer objects
│   ├── repository/                     # Data access layer
│   ├── service/                        # Business logic
│   └── ChatBotApplication.java         # Main application class
├── src/main/resources/
│   ├── application.yaml                # Application configuration
│   └── static/                         # Built frontend assets
├── web/                                # React frontend source
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   ├── routes/                     # Page components
│   │   ├── store/                      # State management
│   │   ├── utils/                      # Utility functions
│   │   └── assets/                     # Static assets
│   ├── package.json                    # Node.js dependencies
│   └── vite.config.ts                  # Vite configuration
├── Dockerfile                          # Multi-stage Docker build
├── Makefile                           # Build automation
└── pom.xml                            # Maven configuration
```

## 🚦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/weekenthralling/chatbot4j.git
cd chatbot4j
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE chatbot4j;
CREATE USER chatbot WITH PASSWORD 'chatbot';
GRANT ALL PRIVILEGES ON DATABASE chatbot4j TO chatbot;
```

### 3. Environment Configuration

Create environment variables or modify `src/main/resources/application.yaml`:

```yaml
# Required Environment Variables
DB_URL=jdbc:postgresql://localhost:5432/chatbot4j
DB_USERNAME=chatbot
DB_PASSWORD=chatbot
LLM_API_KEY=your-openai-api-key
LLM_BASE_URL=https://api.openai.com/v1/
LLM_MODEL=gpt-4o-mini
TAVILY_API_KEY=your-tavily-api-key  # Optional, for web search
REDIS_HOST=localhost                # Optional, for caching
REDIS_PORT=6379
```

### 4. Build and Run

Using Make (recommended):

```bash
# Build the entire application
make build

# Run linting
make lint

# Format code
make format

# Run tests
make test
```

Or manually:

```bash
# Build and run backend
./mvnw clean package
java -jar target/chatbot4j-*.jar

# In another terminal, build and serve frontend
cd web
npm install
npm run build
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:7000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build the Docker image
docker build -t chatbot4j .

# Run with docker-compose (recommended)
docker-compose up -d
```

### Multi-stage Docker Build

The Dockerfile uses a multi-stage build process:

1. **Frontend Build**: Node.js Alpine image builds the React application
2. **Backend Build**: OpenJDK 21 image builds the Spring Boot JAR
3. **Runtime**: Lightweight OpenJDK 21 slim image runs the application

### Environment Variables for Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://your-db-host:5432/chatbot4j \
  -e DB_USERNAME=chatbot \
  -e DB_PASSWORD=your-password \
  -e LLM_API_KEY=your-openai-key \
  -e LLM_MODEL=gpt-4o-mini \
  chatbot4j
```

## 🔧 Development Workflow

### Backend Development

```bash
# Start the Spring Boot application in development mode
./mvnw spring-boot:run

# Run tests
./mvnw test

# Format code using Spotless
./mvnw spotless:apply

# Check code formatting
./mvnw spotless:check
```

### Frontend Development

```bash
cd web

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

### Code Quality

The project includes several code quality tools:

- **Backend**: Spotless (Java formatting), Maven compiler warnings
- **Frontend**: ESLint (linting), Prettier (formatting), TypeScript checking
- **CI/CD**: GitHub Actions for automated testing and quality checks

## 📚 API Documentation

### REST Endpoints

The application provides a RESTful API with the following main endpoints:

#### Conversations
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/{id}` - Get conversation details
- `DELETE /api/conversations/{id}` - Delete conversation

#### Messages  
- `GET /api/conversations/{id}/messages` - Get conversation messages
- `POST /api/conversations/{id}/messages` - Send new message
- `GET /api/conversations/{id}/messages/stream` - Stream messages (SSE)

#### User Management
- `GET /api/users/current` - Get current user information

### Interactive API Documentation

Access the Swagger UI at `http://localhost:8080/swagger-ui.html` for interactive API testing and detailed endpoint documentation.

## 🔒 Authentication

The application supports OAuth2-based authentication:

- Integration with oauth2-proxy for external authentication providers
- User information extracted from HTTP headers
- Session management with secure cookies
- Role-based access control (planned)

## 🌐 Configuration

### Application Configuration

Key configuration sections in `application.yaml`:

```yaml
chatbot:
  llm:
    base-url: ${LLM_BASE_URL}
    model-name: ${LLM_MODEL}
    api-key: ${LLM_API_KEY}
    temperature: 0.8
    max-tokens: 512
  embedding:
    base-url: ${EMBEDDING_BASE_URL}
  tavily:
    api-key: ${TAVILY_API_KEY}
```

### Database Configuration

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### Redis Configuration (Optional)

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
```

## 🚀 Production Deployment

### Prerequisites for Production

- Java 21 runtime environment
- PostgreSQL database
- Redis server (recommended)
- Reverse proxy (nginx/Apache)
- SSL certificates

### Production Configuration

1. **Set production profiles**: `spring.profiles.active=prod`
2. **Configure external database**: Use managed PostgreSQL service
3. **Set up Redis cluster**: For high availability
4. **Configure logging**: Use structured logging with log aggregation
5. **Set up monitoring**: Application metrics and health checks
6. **Security hardening**: Environment-specific security configurations

### Health Checks

The application provides health check endpoints:

- `GET /actuator/health` - Basic health status
- `GET /actuator/info` - Application information
- `GET /actuator/metrics` - Application metrics

## 🧪 Testing

### Running Tests

```bash
# Backend tests
./mvnw test

# Frontend tests  
cd web && npm test

# All tests via Make
make test
```

### Test Coverage

- **Backend**: JUnit 5 with Spring Boot Test
- **Frontend**: Jest with React Testing Library
- **Integration**: End-to-end testing planned

## 🐛 Troubleshooting

### Common Issues

#### Java Version Mismatch
**Error**: `release version 21 not supported`
**Solution**: Ensure Java 21 is installed and `JAVA_HOME` is set correctly

```bash
# Check Java version
java -version
javac -version

# Set JAVA_HOME (Linux/macOS)
export JAVA_HOME=/path/to/java21
```

#### Database Connection Issues
**Error**: Connection refused or authentication failed
**Solution**: 
1. Verify PostgreSQL is running
2. Check connection parameters in `application.yaml`
3. Ensure database and user exist

#### Frontend Build Issues
**Error**: Module not found or dependency issues
**Solution**:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

#### Port Conflicts
**Error**: Port already in use
**Solution**: Change ports in configuration:
- Backend: Modify `server.port` in `application.yaml`
- Frontend: Change port in `web/vite.config.ts`

### Performance Optimization

1. **Database**: Ensure proper indexing on frequently queried columns
2. **Redis**: Enable Redis for caching conversation data
3. **JVM**: Tune JVM parameters for production workloads
4. **Frontend**: Enable gzip compression and CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Run linting and tests: `make lint && make test`
5. Commit changes: `git commit -am 'Add some feature'`
6. Push to branch: `git push origin feature/your-feature`
7. Submit a Pull Request

### Code Style

- **Backend**: Use Spotless formatting (`make format`)
- **Frontend**: Follow ESLint and Prettier configurations
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangChain4j](https://github.com/langchain4j/langchain4j) - Java framework for LLM integration
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [React](https://reactjs.org/) - Frontend library
- [Ant Design](https://ant.design/) - UI component library
- [OpenAI](https://openai.com/) - Language model provider
- [Tavily](https://tavily.com/) - Web search API

## 📞 Support

For support and questions:

- Create an [Issue](https://github.com/weekenthralling/chatbot4j/issues)
- Check existing [Discussions](https://github.com/weekenthralling/chatbot4j/discussions)
- Review the [API Documentation](http://localhost:8080/swagger-ui.html)

---

**Built with ❤️ using Java 21, Spring Boot 3, and React**
