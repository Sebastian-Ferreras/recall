using Microsoft.AspNetCore.Mvc;
using Recall.Application.DTOs;
using Recall.Application.Interfaces;

namespace Recall.Api.Controllers;

[ApiController]
[Route("api/decks")]
public class DecksController(IDeckService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DeckDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DeckDto>>> GetAll(CancellationToken ct)
    {
        return Ok(await service.GetAllAsync(ct));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DeckDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeckDto>> GetById(int id, CancellationToken ct)
    {
        var deck = await service.GetByIdAsync(id, ct);
        return deck is null ? NotFound() : Ok(deck);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DeckDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DeckDto>> Create(CreateDeckRequest request, CancellationToken ct)
    {
        var deck = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = deck.Id }, deck);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(DeckDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeckDto>> Update(int id, UpdateDeckRequest request, CancellationToken ct)
    {
        var deck = await service.UpdateAsync(id, request, ct);
        return deck is null ? NotFound() : Ok(deck);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        return await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
    }
}
