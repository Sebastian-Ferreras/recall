using Microsoft.Extensions.FileProviders;
using Recall.Api.Middleware;
using Recall.Application.Interfaces;
using Recall.Application.Services;
using Recall.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<IDeckService, DeckService>();
builder.Services.AddScoped<ICardService, CardService>();

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(corsOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// la ruta es relativa a backend/Recall.Api porque el frontend vive fuera del proyecto
var frontendPath = builder.Configuration["Frontend:Path"];
var frontendFullPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, frontendPath ?? ""));
if (string.IsNullOrEmpty(frontendPath) || !Directory.Exists(frontendFullPath))
{
    throw new InvalidOperationException($"No se encontro la carpeta del frontend en {frontendFullPath}");
}

var frontendProvider = new PhysicalFileProvider(frontendFullPath);

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontendProvider });
app.UseStaticFiles(new StaticFileOptions { FileProvider = frontendProvider });
app.MapControllers();

await app.Services.ApplyMigrationsAsync();

await app.RunAsync();
