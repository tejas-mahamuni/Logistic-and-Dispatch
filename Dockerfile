# ==============================================================================
# Multi-stage Dockerfile for ShipXpress (Logistic and Dispatch Management System)
# Packages React 19 Frontend + Spring Boot 3 Backend into a Single Optimized Image
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY v2/frontend/package*.json ./
RUN npm ci

COPY v2/frontend ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Unified Backend Fat-JAR
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

COPY v2/backend/pom.xml ./
# Pre-fetch dependencies for fast cached builds
RUN mvn dependency:go-offline -B || true

COPY v2/backend/src ./src
# Copy compiled frontend assets into Spring Boot's static classpath directory
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/

RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 3: Lightweight Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=backend-builder /app/backend/target/Logistic-and-Dispatch-*.jar app.jar

# Render passes dynamic port via PORT environment variable
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
