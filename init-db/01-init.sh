#!/bin/bash
# PostgreSQL initialization script for ChatBot4j
# This script runs when the PostgreSQL container starts for the first time

set -e

echo "Initializing ChatBot4j database..."

# The database and user are already created by the environment variables
# This script can be used for additional initialization if needed

# Example: Create additional indexes, extensions, or initial data
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
#     -- Add any additional database setup here
# EOSQL

echo "ChatBot4j database initialization completed!"