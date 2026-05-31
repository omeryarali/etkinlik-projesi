namespace EtkinlikProjesi.Api.Dtos.Event;

public class EventResponse
{
    public int Id { get; set; }

    public int OrganizerProfileId { get; set; }

    public string OrganizerName { get; set; } = string.Empty;

    public int EventCategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string LocationName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public int Capacity { get; set; }

    public bool IsPaid { get; set; }

    public decimal? Price { get; set; }

    public string CoverImageUrl { get; set; } = string.Empty;

    public string Rules { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }
}