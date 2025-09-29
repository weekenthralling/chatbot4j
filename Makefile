.PHONY: build lint format # always run

# Detect OS and choose appropriate Maven wrapper command
# ifeq ($(OS),Windows_NT)
#     MVN_CMD := ./mvnw.cmd
# else
#     MVN_CMD := ./mvnw
# endif

build:
	mvn --version
	mvn -U -T12C clean package -DskipTests

# Analyze code for errors, potential issues, and coding standard violations.
# Reports problems but does not modify the code.
lint:
	mvn -T12C -Pspotless spotless:check
	cd web && make lint

# Automatically format the code to conform to a style guide.
# Modifies the code to ensure consistent formatting.
format:
	mvn -T12C -Pspotless spotless:apply
	cd web && make format

# Run unit tests to verify code functionality and correctness.
# Ensures that the code behaves as expected and helps catch regressions.
test:
	mvn -T12C test
	cd web && make test
