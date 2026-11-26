using Recall.Application.DTOs;
using Recall.Domain.Entities;

namespace Recall.Application.Mappings;

public static class CardMappings
{
    public static CardDto ToDto(this Card card)
    {
        return new CardDto(card.Id, card.DeckId, card.Question, card.Answer);
    }
}
