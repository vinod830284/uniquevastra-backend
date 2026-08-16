<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# uniquevastra-backend



# 🚀 UniqueVastra Master Command Reference & Cheat Sheet

Quick reference guide for running, building, testing, and managing all components of the UniqueVastra platform (Backend REST API, Admin Web App, React Native Mobile App, Database, and Maestro E2E Testing).

---

## 📌 Port Allocation Summary

| Service | Port | Local URL | Description |
| :--- | :--- | :--- | :--- |
| **NestJS Backend REST API** | **`3000`** | `http://localhost:3000/api/v1` | Core REST API for Auth, Catalog, Cart, Orders, Payments |
| **Swagger API Documentation** | **`3000`** | `http://localhost:3000/api/docs` | Interactive Swagger API docs & endpoint testing |
| **Admin Web App (Vite/React)** | **`3001`** | `http://localhost:3001` | Admin portal for products, inventory, categories & orders |
| **Mobile Metro Bundler** | **`8081`** | `http://localhost:8081` | React Native Metro packager & bundler |
| **Prisma Studio (Web DB GUI)** | **`5555`** | `http://localhost:5555` | Visual browser database editor |
| **PostgreSQL Database** | **`5432`** | `localhost:5432` | Primary relational database |

---

## ⚙️ 1. NestJS Backend Commands (`backend/`)

Run commands inside the `/Users/vinodkumar/Desktop/uniquevastra/backend` directory:

```bash
# Navigate to backend directory
cd backend

# Start NestJS Development Server (with auto-reload)
npm run start:dev

# Start NestJS Production Server
npm run start:prod

# Build NestJS Production Bundle
npm run build

# Open Prisma Studio (Browser Visual Database GUI)
npx prisma studio

# Seed Database with Initial Categories, Admin & Products
npm run seed

# Run Prisma Database Migrations
npx prisma migrate dev

# Sync Prisma Schema with Database without migrations
npx prisma db push

# Generate Prisma Client Types
npx prisma generate
```

---

## 💻 2. Admin Web Application Commands (`admin/`)

Run commands inside the `/Users/vinodkumar/Desktop/uniquevastra/admin` directory:

```bash
# Navigate to admin directory
cd admin

# Start Vite Development Server (http://localhost:3001)
npm run dev

# Typecheck & Build Production Bundle (Vite)
npm run build

# Preview Production Build locally
npm run preview
```

---

## 📱 3. React Native Mobile Application Commands (`uniquevastra/`)

Run commands inside the `/Users/vinodkumar/Desktop/uniquevastra/uniquevastra` directory:

```bash
# Navigate to mobile directory
cd uniquevastra

# Start Metro Bundler
yarn start
# or
npm start

# Start Metro Bundler with clean cache reset
yarn start --reset-cache

# Launch iOS App on iOS Simulator (macOS)
npx react-native run-ios

# Launch Android App on Android Emulator / Physical Device
npx react-native run-android

# Run TypeScript Static Code Check
npx tsc --noEmit
```

---

## 🧪 4. Maestro Automated Mobile E2E Testing Commands (`uniquevastra/`)

Maestro automated tests are located in `uniquevastra/.maestro/`:

```bash
# Navigate to mobile directory
cd uniquevastra

# Run Complete Purchase End-to-End Smoke Test Flow
maestro test .maestro/regression/complete_purchase.yaml

# Run Authentication Test Flows
maestro test .maestro/auth/login.yaml
maestro test .maestro/auth/signup.yaml
maestro test .maestro/auth/invalid_login.yaml
maestro test .maestro/auth/logout.yaml

# Run Product Test Flows
maestro test .maestro/products/product_list.yaml

# Run Cart Test Flows
maestro test .maestro/cart/add_to_cart.yaml
```

---

## 🔍 5. Port Inspection & Process Management (macOS)

```bash
# Check all active ports used by UniqueVastra
lsof -i :3000,3001,8081,5432,5555

# Check specific port (e.g. 3000)
lsof -i :3000

# Kill process running on a specific port (e.g. if port 3000 is stuck)
kill -9 $(lsof -ti :3000)

# Kill process on Admin port 3001
kill -9 $(lsof -ti :3001)

# Kill process on Metro port 8081
kill -9 $(lsof -ti :8081)
```

---

## 🔑 6. Seeded Test Credentials

### Admin Login
- **URL**: `http://localhost:3001`
- **Email**: `superadmin@uniquevastra.com`
- **Password**: `SuperAdmin@123`

### Customer Login
- **App**: Mobile App
- **Email**: `customer@uniquevastra.com`
- **Password**: `CustomerPass@123`

