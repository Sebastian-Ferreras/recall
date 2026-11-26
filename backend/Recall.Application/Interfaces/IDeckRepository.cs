using Recall.Domain.Entities;

namespace Recall.Application.Interfaces;

public interface IDeckRepository
{
    Task<IReadOnlyList<Deck>> GetAllAsync(CancellationToken ct = default);
    Task<Deck?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    Task<Deck> AddAsync(Deck deck, CancellationToken ct = default);
    Task UpdateAsync(Deck deck, CancellationToken ct = default);
    Task DeleteAsync(Deck deck, CancellationToken ct = default);
}
