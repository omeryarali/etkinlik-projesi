namespace EtkinlikProjesi.Api.Dtos.Organizer;

public class CreateOrganizerProfileRequest
{
    public string OrganizerName { get; set; } = string.Empty;

    public string OrganizerType { get; set; } = "Individual";

    public string Description { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string InstagramUrl { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;
}