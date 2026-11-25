using System.ComponentModel.DataAnnotations;

namespace Recall.Application.DTOs;

public record DeckDto(int Id, string Name, string? Description, int CardCount, DateTime CreatedAt);

public record CreateDeckRequest(
    [Required, MaxLength(100)] string Name,
    [MaxLength(500)] string? Description);

public record UpdateDeckRequest(
    [Required, MaxLength(100)] string Name,
    [MaxLength(500)] string? Description);
