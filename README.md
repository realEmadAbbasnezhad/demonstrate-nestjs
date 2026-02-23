# Demonstrate NestJS - Notice Searching E-Commerce Backend

A comprehensive demonstration backend project for a notice searching application - an e-commerce platform focusing on product catalog and search capabilities without order and checkout functionality. Built with NestJS microservices architecture, featuring dual API gateways (RESTful & GraphQL) and multiple database technologies.

## 🎯 Project Overview

This project showcases modern backend development practices using NestJS microservices architecture. It implements a notice searching system with advanced search capabilities, dual API gateways, and multiple database integrations. The system is designed to demonstrate best practices in microservices communication, data persistence strategies, and API design patterns.

## ✨ Features

- 🏗️ **Microservices Architecture** - Modular services with clear separation of concerns
- 🛒 **E-Commerce Core** - Product catalog and advanced search without order/checkout
- 🔍 **Advanced Search** - Elasticsearch-powered notice searching with full-text capabilities
- 🌐 **Dual API Gateways** - Both RESTful and GraphQL endpoints for flexible client integration
- 🗄️ **Multi-Database Support** - PostgreSQL for relational data, MongoDB for documents, Elasticsearch for search
- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 📊 **Prisma ORM** - Type-safe database access with migrations and schema management
- 📝 **API Documentation** - Integrated Swagger/OpenAPI documentation for REST endpoints
- 🧪 **Testing** - Comprehensive unit and integration tests
- 🐳 **Docker Support** - Containerized database services for easy setup

## 🛠️ Tech Stack

### Core Framework
- **NestJS** - A progressive Node.js framework for building efficient, reliable and scalable server-side applications. Built with TypeScript and combines elements of OOP, FP, and FRP.

### API Gateways
- **RESTful API** - Traditional REST endpoints with Swagger documentation for easy testing and integration
- **GraphQL** - Flexible query language using Apollo Server for efficient data fetching and real-time capabilities

### Databases
- **PostgreSQL** - Powerful open-source relational database for structured data with ACID compliance
- **MongoDB** - NoSQL document database for flexible schema design and handling unstructured data
- **Elasticsearch** - Distributed search and analytics engine for full-text search, logging, and real-time analytics

### ORM & Data Management
- **Prisma** - Next-generation ORM providing type-safe database access, automated migrations, and intuitive data modeling

### Language & Runtime
- **TypeScript** - Strongly typed superset of JavaScript providing enhanced IDE support, type safety, and better maintainability
- **Node.js** - JavaScript runtime built on Chrome's V8 engine for building fast and scalable network applications

### Microservices Communication
- **NestJS Microservices** - Built-in support for TCP, Redis, NATS, RabbitMQ, and other transport layers

### Security
- **JWT (JSON Web Tokens)** - Secure authentication mechanism for stateless API authentication
- **Helmet** - Express middleware for setting security-related HTTP headers
- **Class Validator** - Decorator-based validation for DTO classes

### Caching
- **Cache Manager** - Multi-layer caching solution with Redis adapter for improved performance
- **Redis** - In-memory data structure store used as cache and message broker

### Development Tools
- **ESLint** - Static code analysis tool for identifying problematic patterns and enforcing code quality
- **Prettier** - Opinionated code formatter for consistent code style
- **Jest** - Delightful JavaScript testing framework with focus on simplicity

### Documentation
- **Swagger/OpenAPI** - API documentation specification with interactive UI for testing endpoints

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/realEmadAbbasnezhad/demonstrate-nestjs.git
cd demonstrate-nestjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Database Services

Run Docker Compose to start PostgreSQL, MongoDB, Elasticsearch, and Redis:

```bash
docker-compose up -d
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory based on `template.env` and configure your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/demonstrate"
MONGODB_URI="mongodb://localhost:27017/demonstrate"
ELASTICSEARCH_NODE="http://localhost:9200"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="3600"

# Microservices Ports
AUTH_SERVICE_PORT=3001
CATALOG_SERVICE_PORT=3002
GATEWAY_REST_PORT=3000
GATEWAY_GRAPHQL_PORT=3003
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

### 6. Start the Services

You need to run all microservices in separate terminal windows:

**Terminal 1 - Auth Service:**
```bash
npm run start-auth:dev
```

**Terminal 2 - Catalog Service:**
```bash
npm run start-catalog:dev
```

**Terminal 3 - REST Gateway:**
```bash
npm run start-gateway-rest:dev
```

**Terminal 4 - GraphQL Gateway:**
```bash
npm run start-gateway-graphql:dev
```

### 7. Access the Application

- **REST API Documentation:** http://localhost:8080/swagger
- **GraphQL Playground:** http://localhost:8081/graphql
- **REST Gateway:** http://localhost:8080
- **GraphQL Gateway:** http://localhost:8081/graphql

## 🧪 Running Tests

### Unit Tests

Run all unit tests:

```bash
npm test
```

### Watch Mode

Run tests in watch mode for development:

```bash
npm run test:watch
```

### Coverage Report

Generate test coverage report:

```bash
npm run test:cov
```

## 🏗️ Project Structure

```
demonstrate-nestjs/
├── apps/
│   ├── auth/                 # Authentication microservice
│   ├── catalog/              # Catalog microservice
│   ├── order/                # Order microservice
│   ├── gateway-rest/         # RESTful API gateway
│   └── gateway-graphql/      # GraphQL API gateway
├── libs/
│   ├── common/               # Shared utilities and helpers
│   ├── common-gateway/       # Gateway-specific shared code
│   ├── common-microservice/  # Microservice-specific shared code
│   └── contracts/            # Shared interfaces and DTOs
└── prisma/                   # Prisma schema definitions
```

## 🔧 Available Scripts

- `npm run build` - Build all services for production
- `npm run format` - Format code using Prettier
- `npm run lint` - Lint and fix code using ESLint
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run start-auth:dev` - Start auth microservice in development mode
- `npm run start-catalog:dev` - Start catalog microservice in development mode
- `npm run start-gateway-rest:dev` - Start REST gateway in development mode
- `npm run start-gateway-graphql:dev` - Start GraphQL gateway in development mode

## 🔐 Authentication

The system uses JWT-based authentication. To access protected endpoints:

1. Register or login to get a JWT token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Roles

- **ADMIN** - Full access to all resources
- **CUSTOMER** - Access to own resources and public endpoints
- **ANONYMOUS** - Limited access to public endpoints

## 📚 API Documentation

### REST API

Access the Swagger UI at http://localhost:8080/swagger for interactive API documentation.

Key endpoints:
- `/auth` - Authentication and user management
- `/products` - Product catalog operations
- `/cart` - Shopping cart management
- `/orders` - Order operations

### GraphQL API

Access the GraphQL Playground at http://localhost:8081/graphql for interactive query testing.

Example queries and mutations are available in the playground.

## 🏢 Microservices

### Auth Service
Handles user authentication, authorization, and user management. Manages JWT token generation and validation.

### Catalog Service
Manages product catalog, including CRUD operations and search functionality powered by Elasticsearch.

### Order Service
Handles cart management and order operations (without checkout/payment functionality).

### REST Gateway
Provides RESTful API endpoints with Swagger documentation. Acts as the entry point for REST clients.

### GraphQL Gateway
Provides GraphQL API with schema stitching from multiple microservices. Offers flexible querying capabilities.
