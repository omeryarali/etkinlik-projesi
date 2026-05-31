namespace EtkinlikProjesi.Api.Models;

public class OrganizerProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public string OrganizerName { get; set; } = string.Empty;

    public string OrganizerType { get; set; } = "Individual";

    public string Description { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string InstagramUrl { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string Status { get; set; } = "Pending";

    public string RejectionReason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedAt { get; set; }
}