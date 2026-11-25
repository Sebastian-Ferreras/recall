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
}
