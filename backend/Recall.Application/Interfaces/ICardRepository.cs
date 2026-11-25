using Recall.Domain.Entities;

namespace Recall.Application.Interfaces;

public interface ICardRepository
{
    Task<IReadOnlyList<Card>> GetByDeckIdAsync(int deckId, CancellationToken ct = default);
    Task<Card?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Card> AddAsync(Card card, CancellationToken ct = default);
    Task UpdateAsync(Card card, CancellationToken ct = default);
    Task DeleteAsync(Card card, CancellationToken ct = default);
}
