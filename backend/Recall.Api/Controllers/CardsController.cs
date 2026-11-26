using Microsoft.AspNetCore.Mvc;
using Recall.Application.DTOs;
using Recall.Application.Interfaces;

namespace Recall.Api.Controllers;

[ApiController]
[Route("api")]
public class CardsController(ICardService service) : ControllerBase
{
    [HttpGet("decks/{deckId:int}/cards")]
    [ProducesResponseType(typeof(IReadOnlyList<CardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CardDto>>> GetByDeck(int deckId, CancellationToken ct)
    {
        var cards = await service.GetByDeckAsync(deckId, ct);
        return cards is null ? NotFound() : Ok(cards);
    }

    [HttpGet("cards/{id:int}")]
    [ProducesResponseType(typeof(CardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CardDto>> GetById(int id, CancellationToken ct)
    {
        var card = await service.GetByIdAsync(id, ct);
        return card is null ? NotFound() : Ok(card);
    }
}
