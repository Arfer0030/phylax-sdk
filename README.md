# Phylax SDK

Monorepo scaffold awal untuk proyek `Phylax SDK` di Arbitrum Sepolia.

## Struktur Folder

```text
phylax-sdk/
├─ contracts/
│  ├─ src/
│  ├─ test/
│  └─ foundry.toml
├─ agent-backend/
│  ├─ src/
│  │  ├─ phylax-sdk/
│  │  ├─ mock-ai/
│  │  └─ server.ts
│  ├─ .env.example
│  ├─ package.json
│  └─ tsconfig.json
├─ dashboard/
│  ├─ src/
│  │  ├─ components/
│  │  └─ views/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ vite.config.ts
├─ package.json
├─ pnpm-workspace.yaml
└─ README.md
```

## Workspace

Repo ini memakai `pnpm workspace`, jadi install dependency cukup sekali dari root:

```bash
pnpm install
```

Command dasar:

```bash
pnpm dev:dashboard
pnpm dev:backend
pnpm dev
```

## Catatan

- `dashboard/` saat ini mempertahankan starter frontend yang sudah ada di repo agar struktur awal tetap bisa langsung dipakai.
- `agent-backend/src/phylax-sdk`, `agent-backend/src/mock-ai`, `contracts/src`, `contracts/test`, dan `dashboard/src/views` masih berupa placeholder dengan `.gitkeep`.
- Belum ada implementasi smart contract atau SDK baru yang ditambahkan; perubahan turn ini hanya merapikan struktur awal monorepo.
