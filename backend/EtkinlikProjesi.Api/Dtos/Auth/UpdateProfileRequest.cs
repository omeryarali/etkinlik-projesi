namespace EtkinlikProjesi.Api.Dtos.Auth;

public class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string ProfileImageUrl { get; set; } = string.Empty;
}