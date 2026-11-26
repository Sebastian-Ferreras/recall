using Recall.Application.DTOs;
using Recall.Domain.Entities;

namespace Recall.Application.Mappings;

public static class DeckMappings
{
    public static DeckDto ToDto(this Deck deck)
    {
        return new DeckDto(deck.Id, deck.Name, deck.Description, deck.Cards.Count, deck.CreatedAt);
    }
}
