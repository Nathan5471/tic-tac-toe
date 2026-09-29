#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  sleep 2
done
echo "PostgreSQL is ready!"

echo "Running Prisma migrations..."
pnpm prisma migrate deploy
echo "Prisma migrations completed!"

echo "Starting the server..."
node dist/index.mjs