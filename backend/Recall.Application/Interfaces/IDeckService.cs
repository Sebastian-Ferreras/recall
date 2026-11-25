using Recall.Application.DTOs;

namespace Recall.Application.Interfaces;

public interface IDeckService
{
    Task<IReadOnlyList<DeckDto>> GetAllAsync(CancellationToken ct = default);
    Task<DeckDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<DeckDto> CreateAsync(CreateDeckRequest request, CancellationToken ct = default);
    Task<DeckDto?> UpdateAsync(int id, UpdateDeckRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
