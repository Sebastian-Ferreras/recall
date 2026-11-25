namespace Recall.Application.DTOs;

public record DeckDto(int Id, string Name, string? Description, int CardCount, DateTime CreatedAt);

public record CreateDeckRequest(string Name, string? Description);

public record UpdateDeckRequest(string Name, string? Description);
