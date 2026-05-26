# Phylax SDK

Monorepo scaffold awal untuk proyek `Phylax SDK` di Arbitrum Sepolia.

## Struktur Folder

```text
phylax-sdk/
|-- contracts/
|   |-- src/
|   |-- test/
|   `-- foundry.toml
|-- agent-backend/
|   |-- src/
|   |   |-- phylax-sdk/
|   |   |-- mock-ai/
|   |   `-- server.ts
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- web/
|   |-- app/
|   |-- src/
|   |   |-- components/
|   |   `-- views/
|   |-- next-env.d.ts
|   |-- next.config.ts
|   |-- package.json
|   `-- tsconfig.json
|-- package.json
|-- pnpm-workspace.yaml
`-- README.md
```

## Workspace

Repo ini memakai `pnpm workspace`, jadi install dependency cukup sekali dari root:

```bash
pnpm install
```

Command dasar:

```bash
pnpm dev:web
pnpm dev:backend
pnpm dev
```

## Catatan

- `web/` adalah package frontend utama. Di dalamnya nanti menampung landing page, docs, dan owner dashboard/app.
- `web/` sekarang memakai `Next.js App Router` dan berjalan di port `3000` saat mode development.
- `agent-backend/` tetap berdiri sendiri di root monorepo dan tidak digabung ke package `web/`.
- `agent-backend/src/phylax-sdk`, `agent-backend/src/mock-ai`, `contracts/src`, `contracts/test`, dan `web/src/views` saat ini masih berupa placeholder dengan `.gitkeep`.
- Belum ada implementasi smart contract atau SDK baru yang ditambahkan; struktur saat ini masih scaffold awal.
