using System.ComponentModel.DataAnnotations;

namespace Recall.Application.DTOs;

public record CardDto(int Id, int DeckId, string Question, string Answer);

public record CreateCardRequest(
    [Required, MaxLength(500)] string Question,
    [Required, MaxLength(1000)] string Answer);

public record UpdateCardRequest(
    [Required, MaxLength(500)] string Question,
    [Required, MaxLength(1000)] string Answer);
