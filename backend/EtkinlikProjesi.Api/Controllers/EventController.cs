using System.Security.Claims;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Event;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EtkinlikProjesi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Organizer")]
    [HttpPost]
    public async Task<IActionResult> CreateEvent(CreateEventRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Status == "Approved");

        if (organizerProfile == null)
        {
            return BadRequest("Onaylı organizatör profiliniz bulunamadı.");
        }

        var category = await _context.EventCategories
            .FirstOrDefaultAsync(x => x.Id == request.EventCategoryId && x.IsActive);

        if (category == null)
        {
            return BadRequest("Geçerli bir etkinlik kategorisi seçilmelidir.");
        }

        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.District) ||
            string.IsNullOrWhiteSpace(request.LocationName) ||
            request.StartDate == default)
        {
            return BadRequest("Başlık, şehir, ilçe, konum adı ve başlangıç tarihi zorunludur.");
        }

        if (request.Capacity <= 0)
        {
            return BadRequest("Kontenjan 0'dan büyük olmalıdır.");
        }

        if (request.IsPaid && (!request.Price.HasValue || request.Price.Value <= 0))
        {
            return BadRequest("Ücretli etkinliklerde fiyat 0'dan büyük olmalıdır.");
        }

        var newEvent = new Models.Event
        {
            OrganizerProfileId = organizerProfile.Id,
            EventCategoryId = request.EventCategoryId,
            Title = request.Title,
            Description = request.Description,

            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = request.EndDate.HasValue
        ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc)
        : null,

            City = request.City,
            District = request.District,
            LocationName = request.LocationName,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Capacity = request.Capacity,
            IsPaid = request.IsPaid,
            Price = request.Price,
            CoverImageUrl = request.CoverImageUrl,
            Rules = request.Rules,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();

        var response = new EventResponse
        {
            Id = newEvent.Id,
            OrganizerProfileId = newEvent.OrganizerProfileId,
            OrganizerName = organizerProfile.OrganizerName,
            EventCategoryId = newEvent.EventCategoryId,
            CategoryName = category.Name,
            Title = newEvent.Title,
            Description = newEvent.Description,
            StartDate = newEvent.StartDate,
            EndDate = newEvent.EndDate,
            City = newEvent.City,
            District = newEvent.District,
            LocationName = newEvent.LocationName,
            Address = newEvent.Address,
            Latitude = newEvent.Latitude,
            Longitude = newEvent.Longitude,
            Capacity = newEvent.Capacity,
            IsPaid = newEvent.IsPaid,
            Price = newEvent.Price,
            CoverImageUrl = newEvent.CoverImageUrl,
            Rules = newEvent.Rules,
            Status = newEvent.Status,
            CreatedAt = newEvent.CreatedAt,
            ApprovedAt = newEvent.ApprovedAt
        };

        return Ok(response);
    }

    [HttpGet("approved")]
    public async Task<IActionResult> GetApprovedEvents()
    {
        var events = await _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .Where(x => x.Status == "Approved")
            .OrderBy(x => x.StartDate)
            .Select(x => new EventResponse
            {
                Id = x.Id,
                OrganizerProfileId = x.OrganizerProfileId,
                OrganizerName = x.OrganizerProfile.OrganizerName,
                EventCategoryId = x.EventCategoryId,
                CategoryName = x.EventCategory.Name,
                Title = x.Title,
                Description = x.Description,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                City = x.City,
                District = x.District,
                LocationName = x.LocationName,
                Address = x.Address,
                Latitude = x.Latitude,
                Longitude = x.Longitude,
                Capacity = x.Capacity,
                IsPaid = x.IsPaid,
                Price = x.Price,
                CoverImageUrl = x.CoverImageUrl,
                Rules = x.Rules,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ApprovedAt = x.ApprovedAt
            })
            .ToListAsync();

        return Ok(events);
    }

    [Authorize(Roles = "Organizer")]
    [HttpGet("my-events")]
    public async Task<IActionResult> GetMyEvents()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (organizerProfile == null)
        {
            return BadRequest("Organizatör profiliniz bulunamadı.");
        }

        var events = await _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .Where(x => x.OrganizerProfileId == organizerProfile.Id)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new EventResponse
            {
                Id = x.Id,
                OrganizerProfileId = x.OrganizerProfileId,
                OrganizerName = x.OrganizerProfile.OrganizerName,
                EventCategoryId = x.EventCategoryId,
                CategoryName = x.EventCategory.Name,
                Title = x.Title,
                Description = x.Description,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                City = x.City,
                District = x.District,
                LocationName = x.LocationName,
                Address = x.Address,
                Latitude = x.Latitude,
                Longitude = x.Longitude,
                Capacity = x.Capacity,
                IsPaid = x.IsPaid,
                Price = x.Price,
                CoverImageUrl = x.CoverImageUrl,
                Rules = x.Rules,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ApprovedAt = x.ApprovedAt
            })
            .ToListAsync();

        return Ok(events);
    }
}