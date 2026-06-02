using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Common;
using EtkinlikProjesi.Api.Dtos.Event;
using EtkinlikProjesi.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
            ParticipantCount = 0,
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
    public async Task<IActionResult> GetApprovedEvents(
    [FromQuery] string? city,
    [FromQuery] string? district,
    [FromQuery] int? categoryId,
    [FromQuery] string? dateFilter,
    [FromQuery] bool? isPaid,
    [FromQuery] string? search,
    [FromQuery] string? sortBy,
    [FromQuery] bool? onlyAvailable,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        if (page <= 0)
        {
            page = 1;
        }

        if (pageSize <= 0)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var query = _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .Where(x => x.Status == "Approved")
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(x => EF.Functions.ILike(x.City, city));
        }

        if (!string.IsNullOrWhiteSpace(district))
        {
            query = query.Where(x => EF.Functions.ILike(x.District, district));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(x => x.EventCategoryId == categoryId.Value);
        }

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var nextWeek = today.AddDays(7);

        if (!string.IsNullOrWhiteSpace(dateFilter))
        {
            switch (dateFilter.ToLower())
            {
                case "today":
                    query = query.Where(x => x.StartDate >= today && x.StartDate < tomorrow);
                    break;

                case "tomorrow":
                    query = query.Where(x => x.StartDate >= tomorrow && x.StartDate < tomorrow.AddDays(1));
                    break;

                case "thisweek":
                    query = query.Where(x => x.StartDate >= today && x.StartDate < nextWeek);
                    break;

                case "upcoming":
                    query = query.Where(x => x.StartDate >= today);
                    break;
            }
        }

        if (isPaid.HasValue)
        {
            query = query.Where(x => x.IsPaid == isPaid.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchPattern = $"%{search}%";

            query = query.Where(x =>
                EF.Functions.ILike(x.Title, searchPattern) ||
                EF.Functions.ILike(x.Description, searchPattern) ||
                EF.Functions.ILike(x.LocationName, searchPattern) ||
                EF.Functions.ILike(x.Address, searchPattern) ||
                EF.Functions.ILike(x.OrganizerProfile.OrganizerName, searchPattern)
            );
        }

        if (onlyAvailable == true)
        {
            query = query.Where(x =>
                _context.EventParticipants.Count(p => p.EventId == x.Id && p.Status == "Joined") < x.Capacity
            );
        }

        query = sortBy?.ToLower() switch
        {
            "newest" => query.OrderByDescending(x => x.CreatedAt),

            "popular" => query.OrderByDescending(x =>
                _context.EventParticipants.Count(p => p.EventId == x.Id && p.Status == "Joined")),

            _ => query.OrderBy(x => x.StartDate)
        };

        var totalCount = await query.CountAsync();

        var events = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
                ParticipantCount = _context.EventParticipants.Count(p => p.EventId == x.Id && p.Status == "Joined"),
                IsPaid = x.IsPaid,
                Price = x.Price,
                CoverImageUrl = x.CoverImageUrl,
                Rules = x.Rules,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ApprovedAt = x.ApprovedAt
            })
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var response = new PagedResponse<EventResponse>
        {
            Items = events,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = page > 1,
            HasNextPage = page < totalPages
        };

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEventDetail(int id)
    {
        var eventItem = await _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == "Approved");

        if (eventItem == null)
        {
            return NotFound("Onaylı etkinlik bulunamadı.");
        }

        var participantCount = await _context.EventParticipants
            .CountAsync(x => x.EventId == eventItem.Id && x.Status == "Joined");

        var response = new EventResponse
        {
            Id = eventItem.Id,
            OrganizerProfileId = eventItem.OrganizerProfileId,
            OrganizerName = eventItem.OrganizerProfile.OrganizerName,
            EventCategoryId = eventItem.EventCategoryId,
            CategoryName = eventItem.EventCategory.Name,
            Title = eventItem.Title,
            Description = eventItem.Description,
            StartDate = eventItem.StartDate,
            EndDate = eventItem.EndDate,
            City = eventItem.City,
            District = eventItem.District,
            LocationName = eventItem.LocationName,
            Address = eventItem.Address,
            Latitude = eventItem.Latitude,
            Longitude = eventItem.Longitude,
            Capacity = eventItem.Capacity,
            ParticipantCount = participantCount,
            IsPaid = eventItem.IsPaid,
            Price = eventItem.Price,
            CoverImageUrl = eventItem.CoverImageUrl,
            Rules = eventItem.Rules,
            Status = eventItem.Status,
            CreatedAt = eventItem.CreatedAt,
            ApprovedAt = eventItem.ApprovedAt
        };

        return Ok(response);
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
                ParticipantCount = _context.EventParticipants.Count(p => p.EventId == x.Id && p.Status == "Joined"),
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
    [Authorize]
    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinEvent(int id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == "Approved");

        if (eventItem == null)
        {
            return NotFound("Onaylı etkinlik bulunamadı.");
        }

        var alreadyJoined = await _context.EventParticipants
            .AnyAsync(x => x.EventId == id && x.UserId == userId && x.Status == "Joined");

        if (alreadyJoined)
        {
            return BadRequest("Bu etkinliğe zaten katıldınız.");
        }

        var currentParticipantCount = await _context.EventParticipants
            .CountAsync(x => x.EventId == id && x.Status == "Joined");

        if (currentParticipantCount >= eventItem.Capacity)
        {
            return BadRequest("Etkinlik kontenjanı dolmuştur.");
        }

        var participant = new EventParticipant
        {
            EventId = id,
            UserId = userId,
            Status = "Joined",
            JoinedAt = DateTime.UtcNow
        };

        _context.EventParticipants.Add(participant);
        await _context.SaveChangesAsync();

        return Ok("Etkinliğe katılım başarılı.");
    }

    [Authorize]
    [HttpPost("{id}/leave")]
    public async Task<IActionResult> LeaveEvent(int id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var participant = await _context.EventParticipants
            .FirstOrDefaultAsync(x => x.EventId == id && x.UserId == userId && x.Status == "Joined");

        if (participant == null)
        {
            return NotFound("Bu etkinlik için aktif katılım kaydınız bulunamadı.");
        }

        participant.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok("Etkinlik katılımı iptal edildi.");
    }

    [Authorize]
    [HttpGet("my-joined-events")]
    public async Task<IActionResult> GetMyJoinedEvents()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var joinedEvents = await _context.EventParticipants
            .Include(x => x.Event)
                .ThenInclude(x => x.OrganizerProfile)
            .Include(x => x.Event)
                .ThenInclude(x => x.EventCategory)
            .Where(x => x.UserId == userId && x.Status == "Joined")
            .OrderBy(x => x.Event.StartDate)
            .Select(x => new EventResponse
            {
                Id = x.Event.Id,
                OrganizerProfileId = x.Event.OrganizerProfileId,
                OrganizerName = x.Event.OrganizerProfile.OrganizerName,
                EventCategoryId = x.Event.EventCategoryId,
                CategoryName = x.Event.EventCategory.Name,
                Title = x.Event.Title,
                Description = x.Event.Description,
                StartDate = x.Event.StartDate,
                EndDate = x.Event.EndDate,
                City = x.Event.City,
                District = x.Event.District,
                LocationName = x.Event.LocationName,
                Address = x.Event.Address,
                Latitude = x.Event.Latitude,
                Longitude = x.Event.Longitude,
                Capacity = x.Event.Capacity,
                ParticipantCount = _context.EventParticipants.Count(p => p.EventId == x.Event.Id && p.Status == "Joined"),
                IsPaid = x.Event.IsPaid,
                Price = x.Event.Price,
                CoverImageUrl = x.Event.CoverImageUrl,
                Rules = x.Event.Rules,
                Status = x.Event.Status,
                CreatedAt = x.Event.CreatedAt,
                ApprovedAt = x.Event.ApprovedAt
            })
            .ToListAsync();

        return Ok(joinedEvents);
    }

    [Authorize(Roles = "Organizer")]
    [HttpGet("{id}/participants")]
    public async Task<IActionResult> GetEventParticipants(int id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
            return Unauthorized("Kullanıcı bilgisi alınamadı.");

        var userId = int.Parse(userIdString);

        // Bu etkinlik bu organizatöre mi ait?
        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (organizerProfile == null)
            return BadRequest("Organizatör profiliniz bulunamadı.");

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
            return NotFound("Etkinlik bulunamadı veya bu etkinlik size ait değil.");

        var participants = await _context.EventParticipants
            .Include(x => x.User)
            .Where(x => x.EventId == id && x.Status == "Joined")
            .OrderBy(x => x.JoinedAt)
            .Select(x => new EventParticipantResponse
            {
                UserId = x.UserId,
                FullName = x.User.FullName,
                Email = x.User.Email,
                JoinedAt = x.JoinedAt
            })
            .ToListAsync();

        return Ok(participants);
    }

    [Authorize(Roles = "Organizer")]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelEvent(int id)
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

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı veya bu etkinliği iptal etme yetkiniz yok.");
        }

        if (eventItem.Status == "Cancelled")
        {
            return BadRequest("Bu etkinlik zaten iptal edilmiş.");
        }

        if (eventItem.Status == "Completed")
        {
            return BadRequest("Tamamlanmış etkinlik iptal edilemez.");
        }

        eventItem.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok("Etkinlik iptal edildi.");
    }

    [Authorize(Roles = "Organizer")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(int id, UpdateEventRequest request)
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

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı veya bu etkinliği güncelleme yetkiniz yok.");
        }

        if (eventItem.Status == "Cancelled")
        {
            return BadRequest("İptal edilmiş etkinlik güncellenemez.");
        }

        if (eventItem.Status == "Completed")
        {
            return BadRequest("Tamamlanmış etkinlik güncellenemez.");
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

        var currentParticipantCount = await _context.EventParticipants
            .CountAsync(x => x.EventId == eventItem.Id && x.Status == "Joined");

        if (request.Capacity < currentParticipantCount)
        {
            return BadRequest($"Kontenjan mevcut katılımcı sayısından küçük olamaz. Mevcut katılımcı: {currentParticipantCount}");
        }

        eventItem.EventCategoryId = request.EventCategoryId;
        eventItem.Title = request.Title;
        eventItem.Description = request.Description;
        eventItem.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        eventItem.EndDate = request.EndDate.HasValue
            ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc)
            : null;
        eventItem.City = request.City;
        eventItem.District = request.District;
        eventItem.LocationName = request.LocationName;
        eventItem.Address = request.Address;
        eventItem.Latitude = request.Latitude;
        eventItem.Longitude = request.Longitude;
        eventItem.Capacity = request.Capacity;
        eventItem.IsPaid = request.IsPaid;
        eventItem.Price = request.Price;
        eventItem.CoverImageUrl = request.CoverImageUrl;
        eventItem.Rules = request.Rules;

        // Güncellenen etkinlik tekrar admin onayına düşsün
        eventItem.Status = "Pending";
        eventItem.ApprovedAt = null;

        await _context.SaveChangesAsync();

        var response = new EventResponse
        {
            Id = eventItem.Id,
            OrganizerProfileId = eventItem.OrganizerProfileId,
            OrganizerName = organizerProfile.OrganizerName,
            EventCategoryId = eventItem.EventCategoryId,
            CategoryName = category.Name,
            Title = eventItem.Title,
            Description = eventItem.Description,
            StartDate = eventItem.StartDate,
            EndDate = eventItem.EndDate,
            City = eventItem.City,
            District = eventItem.District,
            LocationName = eventItem.LocationName,
            Address = eventItem.Address,
            Latitude = eventItem.Latitude,
            Longitude = eventItem.Longitude,
            Capacity = eventItem.Capacity,
            ParticipantCount = currentParticipantCount,
            IsPaid = eventItem.IsPaid,
            Price = eventItem.Price,
            CoverImageUrl = eventItem.CoverImageUrl,
            Rules = eventItem.Rules,
            Status = eventItem.Status,
            CreatedAt = eventItem.CreatedAt,
            ApprovedAt = eventItem.ApprovedAt
        };

        return Ok(response);
    }

    [Authorize(Roles = "Organizer")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteEvent(int id)
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

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı veya bu etkinliği tamamlama yetkiniz yok.");
        }

        if (eventItem.Status == "Completed")
        {
            return BadRequest("Bu etkinlik zaten tamamlanmış.");
        }

        if (eventItem.Status == "Cancelled")
        {
            return BadRequest("İptal edilmiş etkinlik tamamlandı yapılamaz.");
        }

        if (eventItem.Status == "Rejected")
        {
            return BadRequest("Reddedilmiş etkinlik tamamlandı yapılamaz.");
        }

        if (eventItem.Status == "Pending")
        {
            return BadRequest("Admin onayı bekleyen etkinlik tamamlandı yapılamaz.");
        }

        eventItem.Status = "Completed";

        await _context.SaveChangesAsync();

        return Ok("Etkinlik tamamlandı olarak işaretlendi.");
    }

    [Authorize(Roles = "Organizer")]
    [HttpPut("{eventId}/participants/{userId}/attended")]
    public async Task<IActionResult> MarkParticipantAsAttended(int eventId, int userId)
    {
        var organizerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(organizerUserIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var organizerUserId = int.Parse(organizerUserIdString);

        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == organizerUserId && x.Status == "Approved");

        if (organizerProfile == null)
        {
            return BadRequest("Onaylı organizatör profiliniz bulunamadı.");
        }

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == eventId && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı veya bu etkinliğin katılımcılarını yönetme yetkiniz yok.");
        }

        var participant = await _context.EventParticipants
            .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId);

        if (participant == null)
        {
            return NotFound("Katılımcı kaydı bulunamadı.");
        }

        if (participant.Status == "Cancelled")
        {
            return BadRequest("Katılımını iptal etmiş kullanıcı geldi olarak işaretlenemez.");
        }

        participant.Status = "Attended";

        await _context.SaveChangesAsync();

        return Ok("Katılımcı geldi olarak işaretlendi.");
    }

    [Authorize(Roles = "Organizer")]
    [HttpPut("{eventId}/participants/{userId}/no-show")]
    public async Task<IActionResult> MarkParticipantAsNoShow(int eventId, int userId)
    {
        var organizerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(organizerUserIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var organizerUserId = int.Parse(organizerUserIdString);

        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == organizerUserId && x.Status == "Approved");

        if (organizerProfile == null)
        {
            return BadRequest("Onaylı organizatör profiliniz bulunamadı.");
        }

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == eventId && x.OrganizerProfileId == organizerProfile.Id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı veya bu etkinliğin katılımcılarını yönetme yetkiniz yok.");
        }

        var participant = await _context.EventParticipants
            .FirstOrDefaultAsync(x => x.EventId == eventId && x.UserId == userId);

        if (participant == null)
        {
            return NotFound("Katılımcı kaydı bulunamadı.");
        }

        if (participant.Status == "Cancelled")
        {
            return BadRequest("Katılımını iptal etmiş kullanıcı gelmedi olarak işaretlenemez.");
        }

        participant.Status = "NoShow";

        await _context.SaveChangesAsync();

        return Ok("Katılımcı gelmedi olarak işaretlendi.");
    }
}