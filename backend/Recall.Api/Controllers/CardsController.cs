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

    [HttpGet("decks/{deckId:int}/study")]
    [ProducesResponseType(typeof(IReadOnlyList<CardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CardDto>>> GetStudy(int deckId, CancellationToken ct)
    {
        var cards = await service.GetStudyCardsAsync(deckId, ct);
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

    [HttpPost("decks/{deckId:int}/cards")]
    [ProducesResponseType(typeof(CardDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CardDto>> Create(int deckId, CreateCardRequest request, CancellationToken ct)
    {
        var card = await service.CreateAsync(deckId, request, ct);
        return card is null ? NotFound() : CreatedAtAction(nameof(GetById), new { id = card.Id }, card);
    }

    [HttpPut("cards/{id:int}")]
    [ProducesResponseType(typeof(CardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CardDto>> Update(int id, UpdateCardRequest request, CancellationToken ct)
    {
        var card = await service.UpdateAsync(id, request, ct);
        return card is null ? NotFound() : Ok(card);
    }

    [HttpDelete("cards/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        return await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
    }
}
