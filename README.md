# Recall

Aplicación de flashcards para organizar y repasar tarjetas de estudio por mazos.

## Stack

- **Backend:** ASP.NET Core Web API (.NET 10), EF Core, SQLite
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS

## Estructura

```
recall/
├── backend/     API en capas (Api, Application, Domain, Infrastructure)
├── frontend/    Aplicación Next.js
└── docs/        Documentación (flujo de Git, decisiones)
```

## Ejecución

**Backend** (desde `backend/`):

```
dotnet run --project Recall.Api
```

La API queda en http://localhost:5080 (Swagger en `/swagger`).

**Frontend** (desde `frontend/`):

```
npm install
npm run dev
```

La app queda en http://localhost:3000. Copia `.env.example` a `.env.local` si necesitas cambiar la URL de la API.

