namespace Recall.Application.DTOs;

public record CardDto(int Id, int DeckId, string Question, string Answer);

public record CreateCardRequest(string Question, string Answer);

public record UpdateCardRequest(string Question, string Answer);
