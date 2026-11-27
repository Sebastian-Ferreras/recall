# Recall

Aplicación de flashcards para organizar y repasar tarjetas de estudio por mazos.

## Stack

- **Backend:** ASP.NET Core Web API (.NET 10), EF Core, SQLite
- **Frontend:** HTML, JavaScript (módulos ES) y Tailwind CSS por CDN, sin paso de build

El CDN de Tailwind compila los estilos en el navegador; para producción se usaría su CLI.

## Funcionalidades

- **Mazos** (`/`): crear, editar y borrar mazos con confirmación, buscar por nombre o descripción y ordenar por recientes, nombre o cantidad de tarjetas
- **Tarjetas** (`/deck.html?id=1`): crear, editar y borrar tarjetas de un mazo, voltearlas para ver la respuesta, buscar y ordenar, y editar el mazo desde la misma pantalla
- Modo claro y oscuro, que sigue el del sistema y se recuerda entre visitas
- Estados de carga, error con reintento, vacío y sin resultados en cada pantalla

El enlace "Estudiar" apunta a `study.html`, que llega con el modo de repaso.

## Estructura

```
recall/
├── backend/     API en capas (Api, Application, Domain, Infrastructure)
└── frontend/    Archivos estáticos que sirve la API
    ├── assets/      Logo, favicon e iconos de la marca
    ├── css/
    │   ├── brand.css       Variables de color, sombras, giro de tarjetas y estilos compartidos
    │   └── components.css  Botones, campos, tarjetas e insignias
    ├── index.html   Mazos
    ├── deck.html    Tarjetas de un mazo
    └── js/
        ├── api.js       Llamadas a la API
        ├── ui.js        Utilidades de interfaz (toast, errores de campo, confirmación)
        ├── themeInit.js     Fija el tema antes de pintar para evitar el parpadeo
        ├── tailwindTheme.js Colores y modo oscuro de Tailwind, cargado antes del CDN
        ├── theme.js     Cambio entre modo claro y oscuro
        ├── deckForm.js  Formulario de mazo, compartido por las dos pantallas
        ├── decks.js     Pantalla de mazos
        └── deck.js      Pantalla de tarjetas
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

Desde `backend/`:

```
dotnet run --project Recall.Api
```

La app queda en http://localhost:5080 (Swagger en `/swagger`). La API sirve el frontend como archivos estáticos desde la carpeta `frontend/`, configurada en `Frontend:Path` de `appsettings.json`.

### Frontend por separado

Para servir el frontend aparte (`npx serve frontend` o Live Server):

1. Cambia `API_URL` en `frontend/js/api.js` a `http://localhost:5080/api`
2. Verifica que el origen del frontend esté en `Cors:Origins` de `appsettings.json` (por defecto `http://localhost:3000` y `http://127.0.0.1:5500`)

