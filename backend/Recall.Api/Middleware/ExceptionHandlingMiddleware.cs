using Microsoft.AspNetCore.Mvc;

namespace Recall.Api.Middleware;

public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception) when (!context.Response.HasStarted)
        {
            logger.LogError(exception, "Error no controlado en {Method} {Path}", context.Request.Method, context.Request.Path);

            var (status, title) = exception is BadHttpRequestException
                ? (StatusCodes.Status400BadRequest, "Solicitud invalida")
                : (StatusCodes.Status500InternalServerError, "Error interno del servidor");

            var problem = new ProblemDetails { Status = status, Title = title };
            problem.Extensions["traceId"] = context.TraceIdentifier;

            // el mensaje de la excepcion puede filtrar detalles internos, solo se expone en desarrollo
            if (environment.IsDevelopment())
            {
                problem.Detail = exception.Message;
            }

            context.Response.Clear();
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(problem, options: null, contentType: "application/problem+json");
        }
    }
}
