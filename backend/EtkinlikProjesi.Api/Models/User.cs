namespace EtkinlikProjesi.Api.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string NormalizedEmail { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string ProfileImageUrl { get; set; } = string.Empty;

    public string Role { get; set; } = "Participant";

    public bool IsActive { get; set; } = true;

    public int TokenVersion { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
