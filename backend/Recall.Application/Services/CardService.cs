using Recall.Application.DTOs;
using Recall.Application.Interfaces;
using Recall.Application.Mappings;
using Recall.Domain.Entities;

namespace Recall.Application.Services;

public class CardService(ICardRepository cards, IDeckRepository decks) : ICardService
{
    public async Task<IReadOnlyList<CardDto>?> GetByDeckAsync(int deckId, CancellationToken ct = default)
    {
        if (!await decks.ExistsAsync(deckId, ct))
        {
            return null;
        }

        var list = await cards.GetByDeckIdAsync(deckId, ct);
        return list.Select(c => c.ToDto()).ToList();
    }

    public async Task<CardDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var card = await cards.GetByIdAsync(id, ct);
        return card?.ToDto();
    }

    public async Task<CardDto?> CreateAsync(int deckId, CreateCardRequest request, CancellationToken ct = default)
    {
        if (!await decks.ExistsAsync(deckId, ct))
        {
            return null;
        }

        var card = new Card
        {
            DeckId = deckId,
            Question = request.Question.Trim(),
            Answer = request.Answer.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await cards.AddAsync(card, ct);
        return card.ToDto();
    }

    public async Task<CardDto?> UpdateAsync(int id, UpdateCardRequest request, CancellationToken ct = default)
    {
        var card = await cards.GetByIdAsync(id, ct);
        if (card is null)
        {
            return null;
        }

        card.Question = request.Question.Trim();
        card.Answer = request.Answer.Trim();

        await cards.UpdateAsync(card, ct);
        return card.ToDto();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var card = await cards.GetByIdAsync(id, ct);
        if (card is null)
        {
            return false;
        }

        await cards.DeleteAsync(card, ct);
        return true;
    }
}
