using Microsoft.EntityFrameworkCore;
using Recall.Application.Interfaces;
using Recall.Domain.Entities;
using Recall.Infrastructure.Persistence;

namespace Recall.Infrastructure.Repositories;

public class CardRepository(AppDbContext db) : ICardRepository
{
    public async Task<IReadOnlyList<Card>> GetByDeckIdAsync(int deckId, CancellationToken ct = default)
    {
        return await db.Cards
            .AsNoTracking()
            .Where(c => c.DeckId == deckId)
            .OrderBy(c => c.Id)
            .ToListAsync(ct);
    }

    // Con tracking: update y delete reutilizan la entidad devuelta
    public async Task<Card?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Cards.FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<Card> AddAsync(Card card, CancellationToken ct = default)
    {
        db.Cards.Add(card);
        await db.SaveChangesAsync(ct);
        return card;
    }

    public async Task UpdateAsync(Card card, CancellationToken ct = default)
    {
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Card card, CancellationToken ct = default)
    {
        db.Cards.Remove(card);
        await db.SaveChangesAsync(ct);
    }
}
