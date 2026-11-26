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

## API

### Mazos

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/decks` | `200` con la lista de mazos ordenada por nombre |
| GET | `/api/decks/{id}` | `200` con el mazo, o `404` |
| POST | `/api/decks` | `201` con el mazo creado y el header `Location`, o `400` |
| PUT | `/api/decks/{id}` | `200` con el mazo actualizado, `400` o `404` |
| DELETE | `/api/decks/{id}` | `204`, o `404` |

El nombre es obligatorio y admite hasta 100 caracteres. La descripción es opcional y admite hasta 500; si llega en blanco se guarda como `null`.

Ejemplo de cuerpo para `POST /api/decks`:

```json
{
  "name": "Inglés básico",
  "description": "Vocabulario de uso diario"
}
```

### Tarjetas

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/decks/{deckId}/cards` | `200` con las tarjetas del mazo en orden de creación, o `404` si el mazo no existe |
| GET | `/api/cards/{id}` | `200` con la tarjeta, o `404` |
| POST | `/api/decks/{deckId}/cards` | `201` con la tarjeta creada y el header `Location`, `400` o `404` si el mazo no existe |
| PUT | `/api/cards/{id}` | `200` con la tarjeta actualizada, `400` o `404` |
| DELETE | `/api/cards/{id}` | `204`, o `404` |

La pregunta es obligatoria y admite hasta 500 caracteres. La respuesta es obligatoria y admite hasta 1000. Ambas se guardan sin espacios al inicio ni al final. Al eliminar un mazo se eliminan también sus tarjetas.

Ejemplo de cuerpo para `POST /api/decks/{id}/cards`:

```json
{
  "question": "¿Cómo se dice 'gracias' en inglés?",
  "answer": "Thank you"
}
```

Las peticiones de ejemplo para probar la API están en la carpeta `http/` (extensión REST Client de VS Code).

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

