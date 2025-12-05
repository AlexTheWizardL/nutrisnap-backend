# NestJS Boilerplate

A comprehensive NestJS starter boilerplate with TypeORM, PostgreSQL, JWT & Google OAuth authentication, email support with templates, and Docker integration.

## Features

- **Authentication**
  - JWT-based authentication
  - Google OAuth 2.0 (optional)
  - Password hashing with bcrypt
  - Protected routes with guards
  - Role-based access control (RBAC)

- **Database**
  - TypeORM integration
  - PostgreSQL support
  - Migration support
  - Entity separation from DTOs

- **Email Service**
  - @nestjs-modules/mailer integration
  - Handlebars templates
  - Multi-language support (EN, UK)
  - Welcome, password reset, and email verification templates

- **API Documentation**
  - Swagger/OpenAPI integration
  - Interactive API docs at `/api/docs`

- **Code Quality**
  - TypeScript
  - ESLint configuration
  - Prettier formatting
  - Class-validator for DTOs

- **Docker**
  - Docker Compose setup
  - PostgreSQL service
  - MailCatcher for email testing
  - Adminer for database management

## Project Structure

```
src/
├── modules/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # DTOs (signup.request.dto.ts, login.response.dto.ts, etc.)
│   │   ├── strategies/      # Passport strategies (JWT, Google)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── user/                # User management module
│   │   ├── dto/            # DTOs (create-user.request.dto.ts, user.response.dto.ts, etc.)
│   │   ├── entities/       # TypeORM entities
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── mail/               # Email service module
│   │   ├── templates/      # Email templates (en/, uk/)
│   │   ├── mail.service.ts
│   │   └── mail.module.ts
│   ├── database/           # Database configuration
│   │   ├── migrations/     # TypeORM migrations
│   │   ├── data-source.ts  # Data source configuration
│   │   └── database.module.ts
│   ├── shared/             # Shared utilities
│   │   ├── decorators/     # Custom decorators (@CurrentUser, @Roles, @Public)
│   │   ├── guards/         # Guards (JwtAuthGuard, RolesGuard)
│   │   ├── enums/          # Enums (UserRole, AuthProvider)
│   │   ├── exceptions/     # Custom exceptions
│   │   ├── interfaces/     # Interfaces
│   │   └── shared.module.ts
│   └── config/             # Configuration files
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── jwt.config.ts
│       ├── google.config.ts
│       └── mail.config.ts
├── types/                  # TypeScript type definitions
├── app.module.ts
└── main.ts
```

## Prerequisites

- Node.js 22.16.0+ (see `.nvmrc`)
- npm package manager
- Docker & Docker Compose (optional, for containerized development)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nestjs-boilerplate
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

For **local development**:

```env
# Application
NODE_ENV=development
APP_PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=root

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Mail
MAIL_HOST=localhost
MAIL_PORT=1025
```

For **Docker development**, the `.env` file is already configured correctly with:

```env
DATABASE_HOST=postgres  # Points to the postgres service
MAIL_HOST=mailcatcher  # Points to the mailcatcher service
```

## Running the Application

### Local Development

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Docker Development

```bash
# Start all services (build and run)
npm run docker:up

# Or directly with docker compose
docker compose up --build

# Start in detached mode
docker compose up -d

# Stop services
npm run docker:down
# Or
docker compose down
```

The application will be available at:

- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Adminer (DB): http://localhost:8080
- MailCatcher: http://localhost:1080

## Database Migrations

The application uses TypeORM migrations for database schema management.

### Local Development

```bash
# Generate migration from entity changes
npm run migrations:generate MigrationName

# Create empty migration
npm run migrations:create src/modules/database/migrations/MigrationName

# Run migrations
npm run migrations:run

# Revert last migration
npm run migrations:revert
```

### Docker Development

For manual migration management in Docker:

```bash
# Run migrations manually
docker compose exec api npm run migrations:run

# Revert migrations
docker compose exec api npm run migrations:revert
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID (Admin/Moderator)
- `POST /api/users` - Create new user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Authentication & Authorization

### JWT Authentication

All endpoints except those marked with `@Public()` decorator require JWT authentication.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Role-Based Access Control

The application supports three roles:

- `admin` - Full access to all endpoints
- `moderator` - Limited administrative access
- `user` - Standard user access

Use the `@Roles()` decorator to protect endpoints:

```typescript
@Roles(UserRole.ADMIN)
@Get()
async findAll() {
  // Only admins can access this endpoint
}
```

### Public Endpoints

Use the `@Public()` decorator to allow unauthenticated access:

```typescript
@Public()
@Post('login')
async login() {
  // Anyone can access this endpoint
}
```

## Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Set authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Update `.env` file:

```env
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Email Templates

Email templates are located in `src/modules/mail/templates/` with support for multiple languages.

### Available Templates

- `welcome.hbs` - Welcome email for new users
- `password-reset.hbs` - Password reset email
- `email-verification.hbs` - Email verification

### Adding New Languages

1. Create a new folder in `src/modules/mail/templates/` (e.g., `fr/`)
2. Copy templates from an existing language folder
3. Translate the content
4. Update the `getSubject()` method in `MailService`

### Sending Emails

```typescript
await this.mailService.sendWelcomeEmail(
  user.email,
  user.firstName,
  'uk', // Optional locale
);
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

| Variable               | Description                          | Default                 |
| ---------------------- | ------------------------------------ | ----------------------- |
| `NODE_ENV`             | Environment (development/production) | `development`           |
| `APP_PORT`             | Application port                     | `3001`                  |
| `APP_URL`              | Application URL                      | `http://localhost:3001` |
| `DATABASE_HOST`        | PostgreSQL host                      | `localhost`             |
| `DATABASE_PORT`        | PostgreSQL port                      | `5432`                  |
| `DATABASE_USERNAME`    | Database username                    | `root`                  |
| `DATABASE_PASSWORD`    | Database password                    | `secret`                |
| `DATABASE_NAME`        | Database name                        | `root`                  |
| `DATABASE_LOGGING`     | Enable SQL logging                   | `true`                  |
| `JWT_SECRET`           | JWT secret key                       | -                       |
| `JWT_EXPIRES_IN`       | JWT expiration time                  | `7d`                    |
| `GOOGLE_AUTH_ENABLED`  | Enable Google OAuth                  | `false`                 |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | -                       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | -                       |
| `GOOGLE_CALLBACK_URL`  | Google OAuth callback URL            | -                       |
| `MAIL_HOST`            | SMTP host                            | `mailcatcher`           |
| `MAIL_PORT`            | SMTP port                            | `1025`                  |
| `MAIL_SECURE`          | Use TLS                              | `false`                 |
| `MAIL_USER`            | SMTP username                        | -                       |
| `MAIL_PASSWORD`        | SMTP password                        | -                       |
| `MAIL_FROM_NAME`       | Sender name                          | `NestJS Boilerplate`    |
| `MAIL_FROM_EMAIL`      | Sender email                         | `noreply@example.com`   |
| `DEFAULT_LOCALE`       | Default language                     | `en`                    |

## Docker Services

### PostgreSQL

- Port: 5432
- Username: root (configurable)
- Password: secret (configurable)
- Database: root (configurable)

### MailCatcher

- SMTP Port: 1025
- Web Interface: http://localhost:1080

### Adminer

- Web Interface: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: root
- Database: root

## Best Practices

### DTOs

- Separate request and response DTOs
- Use naming convention: `*.request.dto.ts`, `*.response.dto.ts`
- Always use class-validator decorators
- Don't use entities as DTOs

### Services

- Keep business logic in services
- Inject dependencies through constructor
- Use async/await for asynchronous operations

### Controllers

- Keep controllers thin
- Delegate logic to services
- Use Swagger decorators for documentation
- Transform entities to DTOs before returning

### Security

- Never commit `.env` file
- Use strong JWT secrets
- Hash passwords before storing
- Validate all user inputs
- Use guards and decorators for authorization

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
