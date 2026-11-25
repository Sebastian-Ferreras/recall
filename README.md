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

## Base de datos

La base SQLite (`recall.db`) se crea sola al iniciar la API, que aplica las migraciones pendientes. No hace falta ejecutar nada a mano.

Para agregar una migración nueva (desde `backend/`):

```
dotnet ef migrations add <Nombre> --project Recall.Infrastructure --startup-project Recall.Api
```

## Errores

Los errores se devuelven como JSON en formato `application/problem+json` (RFC 7807), con `status`, `title` y `traceId`. Aplica a los 400, 404 y 500. En desarrollo, los 500 incluyen además `detail` con el mensaje de la excepción.

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

