using Microsoft.EntityFrameworkCore;
using Recall.Application.Interfaces;
using Recall.Domain.Entities;
using Recall.Infrastructure.Persistence;

namespace Recall.Infrastructure.Repositories;

public class DeckRepository(AppDbContext db) : IDeckRepository
{
    public async Task<IReadOnlyList<Deck>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Decks
            .AsNoTracking()
            .Include(d => d.Cards)
            .OrderBy(d => d.Name)
            .ToListAsync(ct);
    }

    // Con tracking: update y delete reutilizan la entidad devuelta
    public async Task<Deck?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Decks
            .Include(d => d.Cards)
            .FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public async Task<Deck> AddAsync(Deck deck, CancellationToken ct = default)
    {
        db.Decks.Add(deck);
        await db.SaveChangesAsync(ct);
        return deck;
    }

    public async Task UpdateAsync(Deck deck, CancellationToken ct = default)
    {
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Deck deck, CancellationToken ct = default)
    {
        db.Decks.Remove(deck);
        await db.SaveChangesAsync(ct);
    }
}
