namespace EtkinlikProjesi.Api.Dtos.Organizer;

public class OrganizerProfileResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string OrganizerName { get; set; } = string.Empty;

    public string OrganizerType { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string InstagramUrl { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string RejectionReason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }
}