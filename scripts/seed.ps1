param(
    [string]$BaseUrl = "http://localhost:5080",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$api = "$BaseUrl/api"

function Add-Deck($name, $description, $cards) {
    $body = @{ name = $name; description = $description } | ConvertTo-Json
    $deck = Invoke-RestMethod -Method Post -Uri "$api/decks" -ContentType "application/json" -Body $body
    foreach ($card in $cards) {
        $body = @{ question = $card[0]; answer = $card[1] } | ConvertTo-Json
        Invoke-RestMethod -Method Post -Uri "$api/decks/$($deck.id)/cards" -ContentType "application/json" -Body $body | Out-Null
    }
    Write-Host "Mazo '$name' con $($cards.Count) tarjetas"
}

try {
    $existing = Invoke-RestMethod -Uri "$api/decks"
} catch {
    Write-Host "No se pudo conectar con la API en $BaseUrl, inicia la API primero"
    exit 1
}

if ($existing.Count -gt 0 -and -not $Force) {
    Write-Host "La base ya tiene $($existing.Count) mazos, usa -Force para agregar los datos de prueba igualmente"
    exit 1
}

Add-Deck "Ingles basico" "Vocabulario de uso diario" @(
    @("How do you say 'gracias' in English?", "Thank you"),
    @("How do you say 'por favor'?", "Please"),
    @("How do you say 'buenos dias'?", "Good morning"),
    @("How do you say 'hasta luego'?", "See you later"),
    @("How do you say 'lo siento'?", "I'm sorry"),
    @("How do you say 'de nada'?", "You're welcome"),
    @("How do you say 'cuanto cuesta'?", "How much is it?"),
    @("How do you say 'no entiendo'?", "I don't understand"),
    @("How do you say 'donde esta el bano'?", "Where is the bathroom?"),
    @("How do you say 'mucho gusto'?", "Nice to meet you")
)

Add-Deck "Git Flow de Recall" "Ramas, Pull Requests y commits de este proyecto" @(
    @("Que ramas permanentes tiene el proyecto?", "main, qa y dev"),
    @("De que rama sale una rama feature?", "De dev"),
    @("De que rama sale una rama hotfix?", "De main"),
    @("Cuantos Pull Requests abre cada rama?", "Tres: uno hacia dev, otro hacia qa y otro hacia main"),
    @("Que tipo de merge se usa en los Pull Requests?", "Merge commit, no squash ni rebase"),
    @("Se borran las ramas despues del merge?", "No, la tarea cuenta las ramas y por eso se conservan"),
    @("Se puede hacer commit directo a main, qa o dev?", "Nunca, todo entra por Pull Request desde una rama feature o hotfix"),
    @("Que formato tienen los mensajes de commit?", "tipo: descripcion en espanol, en presente y sin punto final. Por ejemplo: feat: agrega filtro de mazos por nombre"),
    @("Que tipos de commit se usan?", "feat, fix, chore, docs, refactor y test"),
    @("Cuantos Pull Requests suma el proyecto en total?", "21: siete ramas con tres Pull Requests cada una, cuando el minimo exigido es 15")
)

Add-Deck "Funcionalidades de Recall" "Lo que se puede hacer en la aplicacion" @(
    @("Que se puede hacer en la pantalla de mazos?", "Crear, editar y borrar mazos con confirmacion, buscarlos por nombre o descripcion y ordenarlos por recientes, nombre o cantidad de tarjetas"),
    @("Que se puede hacer en la pantalla de tarjetas?", "Crear, editar y borrar tarjetas de un mazo, voltearlas para ver la respuesta, buscar, ordenar y editar el mazo"),
    @("Como funciona el modo de repaso?", "Muestra las tarjetas del mazo en orden aleatorio; se voltea cada una y se marca como sabida o fallada"),
    @("Que teclas se usan en el repaso?", "Espacio voltea la tarjeta, 1 la marca como no sabida y 2 como sabida"),
    @("Que muestra el repaso al terminar?", "El porcentaje de aciertos, las tarjetas sabidas y las que faltan por repasar"),
    @("Se guarda el progreso del repaso?", "No, el resultado se calcula en el navegador y no se guarda en la base de datos"),
    @("Que opciones hay al terminar un repaso?", "Repetir todo el mazo con un orden nuevo o repasar solo las tarjetas falladas"),
    @("Que pasa con las tarjetas al borrar un mazo?", "Se borran tambien, porque la relacion es en cascada"),
    @("Que limites de longitud tienen los campos?", "Nombre del mazo 100, descripcion 500, pregunta 500 y respuesta 1000 caracteres"),
    @("Cuando se usa el modo oscuro?", "Sigue el tema del sistema y se recuerda entre visitas; se puede cambiar con el boton de la cabecera"),
    @("Tiene usuarios o inicio de sesion?", "No, la version 1.0 no tiene autenticacion")
)

Add-Deck "Stack tecnologico de Recall" "Tecnologias y arquitectura del proyecto" @(
    @("Con que se construye el backend?", "ASP.NET Core Web API sobre .NET 10"),
    @("Que acceso a datos usa?", "Entity Framework Core con migraciones"),
    @("Que base de datos usa?", "SQLite, en el archivo recall.db; las migraciones se aplican solas al iniciar la API"),
    @("Con que se construye el frontend?", "HTML, JavaScript con modulos ES y Tailwind CSS por CDN, sin framework ni paso de build"),
    @("Quien sirve el frontend?", "La propia API, como archivos estaticos desde la carpeta frontend, para que todo corra con un solo dotnet run"),
    @("Que capas tiene el backend?", "Api, Application, Domain e Infrastructure, con la dependencia siempre hacia adentro"),
    @("Que entidades tiene el dominio?", "Deck y Card, con una relacion de uno a muchos y borrado en cascada"),
    @("La API expone las entidades?", "No, solo DTOs"),
    @("Como se devuelven los errores?", "Como JSON application/problem+json (RFC 7807), con status, title y traceId"),
    @("Donde se documenta la API?", "En Swagger, en la ruta /swagger"),
    @("En que puerto corre la aplicacion?", "En http://localhost:5080")
)

Add-Deck "Capitales del mundo" "Una capital por pais" @(
    @("Capital de Francia", "Paris"),
    @("Capital de Japon", "Tokio"),
    @("Capital de Brasil", "Brasilia"),
    @("Capital de Australia", "Canberra"),
    @("Capital de Canada", "Ottawa"),
    @("Capital de Egipto", "El Cairo")
)

Add-Deck "Texto largo y caracteres especiales" "Mazo para revisar como se ven los textos extensos y el escape de HTML en la interfaz" @(
    @("<img src=x onerror=alert(1)>", "<b>Este texto se muestra tal cual, no como HTML</b>"),
    @("Una pregunta muy larga para comprobar que la tarjeta no se desborda, que el texto se corta donde corresponde y que sigue siendo legible en pantallas pequenas aunque ocupe varias lineas de la ficha", "Una respuesta igualmente larga que describe con bastante detalle un concepto cualquiera, repitiendo ideas para ocupar espacio y comprobar que el desplazamiento de la ficha funciona y que la barra de desplazamiento respeta el tema claro y oscuro de la aplicacion durante el repaso.")
)

Add-Deck "Mazo vacio" "Sin tarjetas, para ver el estado vacio" @()

Write-Host "Listo, abre $BaseUrl"
