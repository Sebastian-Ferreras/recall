namespace Recall.Domain.Entities;

public class Card
{
    public int Id { get; set; }
    public int DeckId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Deck Deck { get; set; } = null!;
}
