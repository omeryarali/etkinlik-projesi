namespace EtkinlikProjesi.Api.Dtos.Event;

public class EventParticipantResponse
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}