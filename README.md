<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="frontend/assets/logo-horizontal-dark.svg">
  <img src="frontend/assets/logo-horizontal.svg" alt="Recall" width="320">
</picture>

**Flashcards para organizar y repasar tus tarjetas de estudio por mazos.**

![.NET 10](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)
![EF Core](https://img.shields.io/badge/EF%20Core-SQLite-003B57?logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-CDN-06B6D4?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-m%C3%B3dulos%20ES-F7DF1E?logo=javascript&logoColor=black)
![Git Flow](https://img.shields.io/badge/Git%20Flow-main%20%C2%B7%20qa%20%C2%B7%20dev-F05032?logo=git&logoColor=white)

[Inicio rápido](#inicio-rápido) · [Datos de prueba](#datos-de-prueba) · [Flujo de Git](#flujo-de-git)

</div>

---

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Stack](#stack)
3. [Inicio rápido](#inicio-rápido)
4. [Datos de prueba](#datos-de-prueba)
5. [Arquitectura](#arquitectura)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Frontend por separado](#frontend-por-separado)
8. [Flujo de Git](#flujo-de-git)

---

## Funcionalidades

| Pantalla | Ruta | Qué se puede hacer |
|---|---|---|
| **Mazos** | `/` | Crear, editar y borrar mazos con confirmación, buscar por nombre o descripción y ordenar por recientes, nombre o cantidad de tarjetas |
| **Tarjetas** | `/deck.html?id=1` | Crear, editar y borrar tarjetas, voltearlas para ver la respuesta, buscar, ordenar y editar el mazo desde la misma pantalla |
| **Repaso** | `/study.html?id=1` | Tarjetas en orden aleatorio, voltear cada una y marcarla como sabida o fallada, ver el resultado y repetir el repaso completo o solo las falladas |

Además:

- **Teclado en el repaso:** `Espacio` voltea la tarjeta, `1` la marca como no sabida y `2` como sabida
- **Modo claro y oscuro:** sigue el del sistema y se recuerda entre visitas
- **Estados completos:** carga, error con reintento, vacío y sin resultados en cada pantalla
- **Animaciones:** giro de las tarjetas y transición al cambiar de página, que respetan `prefers-reduced-motion`

> El resultado del repaso se calcula en el navegador y no se guarda.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core Web API (.NET 10) |
| Acceso a datos | Entity Framework Core con migraciones |
| Base de datos | SQLite |
| Documentación de la API | Swagger (`/swagger`) |
| Frontend | HTML, JavaScript (módulos ES) y Tailwind CSS por CDN, sin framework ni paso de build |

El CDN de Tailwind compila los estilos en el navegador; para producción se usaría su CLI.

## Inicio rápido

**Requisitos:** [.NET 10 SDK](https://dotnet.microsoft.com/download). No hace falta instalar nada más: la base de datos se crea sola y el frontend no tiene dependencias.

```powershell
git clone https://github.com/Sebastian-Ferreras/recall.git
cd recall/backend
dotnet run --project Recall.Api
```

La app queda en **http://localhost:5080** y Swagger en **http://localhost:5080/swagger**. La API sirve el frontend como archivos estáticos desde la carpeta `frontend/`, configurada en `Frontend:Path` de `appsettings.json`, así que todo corre con un solo comando. La base SQLite (`recall.db`) se crea sola al iniciar, no hay que ejecutar nada más. Las peticiones de ejemplo para probar la API están en `http/` (extensión REST Client de VS Code).

## Datos de prueba

Con la API corriendo, en otra terminal y desde la raíz del repositorio:

```powershell
.\scripts\seed.ps1
```

Crea siete mazos con 50 tarjetas: **Git Flow de Recall**, **Funcionalidades de Recall** y **Stack tecnologico de Recall** (el propio proyecto), **Ingles basico**, **Capitales del mundo**, un mazo con textos largos y caracteres especiales, y un mazo vacío para ver ese estado. Recarga http://localhost:5080 para verlos.

- Si la base ya tiene mazos, el script se detiene; con `-Force` agrega los datos igualmente
- Si la API corre en otro puerto: `.\scripts\seed.ps1 -BaseUrl http://localhost:5000`
- Si PowerShell bloquea la ejecución de scripts: `powershell -ExecutionPolicy Bypass -File .\scripts\seed.ps1`
- Para empezar de cero, detén la API y borra `backend/Recall.Api/recall.db`; al iniciar de nuevo se recrea vacía

## Arquitectura

El backend usa capas ligeras con la dependencia siempre hacia adentro:

```
Recall.Api  ───►  Recall.Application  ───►  Recall.Domain
    │                           ▲
    └──►  Recall.Infrastructure ┘
```

- La API **nunca expone entidades**, solo DTOs
- La lógica vive en los **servicios**; los controllers son delgados
- Los métodos asíncronos llevan sufijo `Async` y reciben `CancellationToken`
- Un `Deck` tiene muchas `Card` (relación 1:N con borrado en cascada)

El frontend vive en `frontend/`, separado del backend, y solo se comunica con la API por HTTP. Todas las llamadas pasan por `js/api.js`, y el contenido que escribe el usuario se pinta con `textContent`, nunca con `innerHTML`.

## Estructura del proyecto

```
recall/
├── backend/     API en capas (Api, Application, Domain, Infrastructure)
├── frontend/    Archivos estáticos que sirve la API
├── scripts/     seed.ps1, datos de prueba
└── http/        Peticiones de ejemplo para REST Client
```

<details>
<summary><b>Estructura del backend</b></summary>

```
backend/
├── Recall.slnx
├── Recall.Api/                 Punto de entrada HTTP
│   ├── Controllers/            DecksController, CardsController (delgados)
│   ├── Middleware/             Manejo global de errores en JSON
│   ├── Program.cs              Configuración, CORS, Swagger y archivos estáticos
│   └── appsettings.json
├── Recall.Application/         Casos de uso, sin dependencias de infraestructura
│   ├── DTOs/                   Lo que entra y sale de la API
│   ├── Interfaces/             Contratos de servicios y repositorios
│   ├── Mappings/               Entidad ↔ DTO
│   └── Services/               DeckService, CardService (la lógica)
├── Recall.Domain/              Entidades puras
│   └── Entities/               Deck, Card
└── Recall.Infrastructure/      Acceso a datos
    ├── Persistence/            AppDbContext y configuraciones de EF Core
    ├── Repositories/           DeckRepository, CardRepository
    ├── Migrations/             Migraciones de la base SQLite
    └── DependencyInjection.cs  Registro de servicios y repositorios
```

</details>

<details>
<summary><b>Estructura del frontend</b></summary>

```
frontend/
├── index.html        Mazos
├── deck.html         Tarjetas de un mazo
├── study.html        Repaso de un mazo
├── assets/           Logo, favicon e iconos de la marca
├── css/
│   ├── brand.css         Variables de color, sombras, giro de tarjetas y estilos compartidos
│   └── components.css    Botones, campos, tarjetas e insignias
└── js/
    ├── api.js            Llamadas a la API
    ├── ui.js             Utilidades de interfaz (toast, errores de campo, confirmación)
    ├── themeInit.js      Fija el tema antes de pintar para evitar el parpadeo
    ├── tailwindTheme.js  Colores y modo oscuro de Tailwind, cargado antes del CDN
    ├── theme.js          Cambio entre modo claro y oscuro
    ├── pageTransition.js Animación de salida al cambiar de página
    ├── deckForm.js       Formulario de mazo, compartido por las pantallas
    ├── decks.js          Pantalla de mazos
    ├── deck.js           Pantalla de tarjetas
    └── study.js          Pantalla de repaso
```

</details>

## Frontend por separado

Para servir el frontend aparte (`npx serve frontend` o Live Server):

1. Cambia `API_URL` en `frontend/js/api.js` a `http://localhost:5080/api`
2. Verifica que el origen del frontend esté en `Cors:Origins` de `appsettings.json` (por defecto `http://localhost:3000` y `http://127.0.0.1:5500`)

## Flujo de Git

El proyecto sigue Git Flow con tres ramas permanentes y una rama de trabajo por cada funcionalidad:

```
dev  ──► feature/*  ──► PR 1 a dev
                    ──► PR 2 a qa
                    ──► PR 3 a main

main ──► hotfix/*   ──► 3 PRs: dev, qa y main
```

| Rama | Uso | Sale de | Se integra en |
|---|---|---|---|
| `main` | Código estable | | |
| `qa` | Verificación previa a `main` | | |
| `dev` | Integración de las funcionalidades | | |
| `feature/*` | Una funcionalidad | `dev` | `dev`, `qa` y `main` |
| `hotfix/*` | Corrección urgente | `main` | `dev`, `qa` y `main` |

- Cada rama abre **tres Pull Requests**, cerrados con *merge commit*, y las ramas no se borran después del merge
- Nunca se hace commit directo a `main`, `qa` ni `dev`
