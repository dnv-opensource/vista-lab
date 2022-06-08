This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Running locally

Run the development server:

```bash
npm run dev
```

## Generate client

Prerequsities:

    * Java
    * Linux environment

If, and after making changes to a model in the API, make sure to run

```bash
npm run generate-client
```

This will automatically re-generate the client folder with updated models and apis.

When adding new controllers or apis, make sure to include them in <b>./apiConfig.ts -> VistaLabApi</b>
