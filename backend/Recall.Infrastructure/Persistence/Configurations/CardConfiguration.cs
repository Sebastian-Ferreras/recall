using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recall.Domain.Entities;

namespace Recall.Infrastructure.Persistence.Configurations;

public class CardConfiguration : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Question).IsRequired().HasMaxLength(500);
        builder.Property(c => c.Answer).IsRequired().HasMaxLength(1000);
    }
}
