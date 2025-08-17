# cisc474-project-starter

A repo that you can fork to make new projects

# Setup

- Clone this repo
- NVM and the right version of Node
  - Install Node.
  - Make sure you have at least version 22.12.\*, not lower. Run `node -v` to check your version.
  - Windows: You can have multiple versions of Node using NVM: <https://github.com/coreybutler/nvm-windows>
  - Mac: You can get NVM to manage multiple versions: https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script
  - Either way, use `nvm list` and `nvm use` to switch between Node versions, and make sure you get onto a version 22.12.\* or higher.
- Install dependencies
  - `cd` into your cloned project directory
  - Run `npm install` to install the project dependencies
- Run your site
  - `npm run dev`
- Docker:
  - Install Docker Desktop from <https://www.docker.com/products/docker-desktop>

# Deployment

- Frontend:
  - Vercel: https://vercel.com/
  - Directions:
    - Create a Vercel account using your Github
    - Import your forked repository
    - Make sure you are happy with the Project Name
    - In the "Root Directory" field, use `apps/web` (do NOT use `apps/docs`)
    - Click "Deploy"
    - You can now access your deployed site at the provided URL
- Database:
  - SupaBase Free Tier: https://supabase.com/
  - Directions:
    - Start a new project on the Free Tier
    - Login using your Github
    - Create a new organization:
      - Name: Your choice, e.g., `CISC474 F25 Projects` (you can change this later)
      - Type: `Educational`
      - Price: `Free - $0/month`
    - Create a new project:
      - Organization: Choose your previously selected organization
      - Project name: Name according to assignment, e.g., `acbart lms`
      - Database Password: Click the "Generate Password" text, then make sure you securely record the password (e.g., with your browser's automatic password saving features) because you will need it in the next step.
      - Region: `East US (North Virginia)`
    - You can now get your connection details for this database. Click the "Connect" button at the top of the window, and get the direct connection string. Note that the text `YOUR-PASSWORD` will be in the connection string, and you have to replace it with your Supabase password. You will need the connection string for the next step.
- Backend:
  - Render: https://render.com/
  - Directions:
    - Sign in to Render using your Github and create an account
    - Create a new workspace, name it something appropriate for this project
    - Fill out the survey information about how you will use it, as you see fit
    - Choose to make a new Web Service
    - Connect to Github as your Git Provider
    - Select the repository you want to deploy
    - Choose "Virginia (US East)" for your Region (not critical)
    - For your Root Directory, use `apps/api`
    - For Instance Type, choose "Free $0/month"
    - In the Environment Variables, add the following:
      - `DATABASE_URL`: The connection string for your database from the Supabase dashboard
    - Click the Deploy button

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
