using Recall.Application.DTOs;

namespace Recall.Application.Interfaces;

public interface ICardService
{
    Task<IReadOnlyList<CardDto>?> GetByDeckAsync(int deckId, CancellationToken ct = default);
    Task<CardDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CardDto?> CreateAsync(int deckId, CreateCardRequest request, CancellationToken ct = default);
    Task<CardDto?> UpdateAsync(int id, UpdateCardRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
