# Project: myfintonic

## Project Overview

This project is a personal finance application designed to track a variety of assets, including index funds, fixed-term deposits, robo-advisors, stocks, and current accounts. The backend is being built with Node.js and TypeScript, with plans for containerization using Docker and future CI/CD integration.

The project is in its very early stages. The detailed requirements, including the database schema, API endpoints, and phased implementation plan, are documented in `Requireds_Myfintonic.md`. The current `main.ts` is a simple placeholder.

## Technologies

- **Backend:** Node.js, TypeScript, Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Containerization:** Docker, Docker Compose

## Building and Running

While the project is not yet fully set up, the following commands are intended for use:

- **Running with Docker (recommended):**

  ```bash
  # TODO: This will be the command once Docker is configured.
  docker-compose up
  ```

- **Running the development server (inside the container or once dependencies are installed locally):**

  ```bash
  # TODO: This will be the command once package.json is configured.
  npm run dev
  ```

- **Running the main file directly (for quick tests):**

  ```bash
  # You will need ts-node installed globally or as a dev dependency.
  npm install -g ts-node
  ts-node main.ts
  ```

- **Compiling TypeScript:**
  ```bash
  # You will need typescript installed globally or as a dev dependency.
  npm install -g typescript
  tsc
  ```

## Development Conventions

The project follows a GitFlow-like branching model enforced by GitHub Actions:

- **Feature Development:** New features should be developed in branches named `feature/<feature-name>`. These branches must be merged into the `develop` branch via a pull request.
- **Releases:** The `develop` branch is merged into the `master` branch to create a new release.
- **Hotfixes:** Urgent fixes for the production version should be developed in branches named `hotfix/<fix-name>`. These branches are merged directly into the `master` branch.

All pull requests to `master` must come from `develop` or a `hotfix/*` branch.
