# All-in-one production image: Angular SPA + Spring Boot API
FROM node:22-alpine AS frontend-build
WORKDIR /ui
COPY frontend/airbook-ui/package.json ./
COPY frontend/airbook-ui/angular.json frontend/airbook-ui/tsconfig.json frontend/airbook-ui/tsconfig.app.json ./
COPY frontend/airbook-ui/src ./src
RUN npm install && npm run build

FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
COPY --from=frontend-build /ui/dist/airbook-ui/browser ./src/main/resources/static
RUN apk add --no-cache maven && mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -Xmx512m"
COPY --from=backend-build /app/target/airbook-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
