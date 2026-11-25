using Recall.Application.DTOs;
using Recall.Application.Interfaces;
using Recall.Application.Mappings;
using Recall.Domain.Entities;

namespace Recall.Application.Services;

public class DeckService(IDeckRepository repository) : IDeckService
{
    public async Task<IReadOnlyList<DeckDto>> GetAllAsync(CancellationToken ct = default)
    {
        var decks = await repository.GetAllAsync(ct);
        return decks.Select(d => d.ToDto()).ToList();
    }

    public async Task<DeckDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var deck = await repository.GetByIdAsync(id, ct);
        return deck?.ToDto();
    }

    public async Task<DeckDto> CreateAsync(CreateDeckRequest request, CancellationToken ct = default)
    {
        var deck = new Deck
        {
            Name = request.Name.Trim(),
            Description = NormalizeDescription(request.Description),
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(deck, ct);
        return deck.ToDto();
    }

    public async Task<DeckDto?> UpdateAsync(int id, UpdateDeckRequest request, CancellationToken ct = default)
    {
        var deck = await repository.GetByIdAsync(id, ct);
        if (deck is null)
        {
            return null;
        }

        deck.Name = request.Name.Trim();
        deck.Description = NormalizeDescription(request.Description);

        await repository.UpdateAsync(deck, ct);
        return deck.ToDto();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var deck = await repository.GetByIdAsync(id, ct);
        if (deck is null)
        {
            return false;
        }

        await repository.DeleteAsync(deck, ct);
        return true;
    }

    private static string? NormalizeDescription(string? description)
    {
        return string.IsNullOrWhiteSpace(description) ? null : description.Trim();
    }
}
