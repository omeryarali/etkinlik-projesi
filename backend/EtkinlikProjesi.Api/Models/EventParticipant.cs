namespace EtkinlikProjesi.Api.Models;

public class EventParticipant
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public Event Event { get; set; } = null!;

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public string Status { get; set; } = "Joined";

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}