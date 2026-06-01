using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Admin;
using EtkinlikProjesi.Api.Dtos.Organizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EtkinlikProjesi.Api.Dtos.Event;

namespace EtkinlikProjesi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("organizers")]
    public async Task<IActionResult> GetOrganizers([FromQuery] string? status)
    {
        var query = _context.OrganizerProfiles
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var organizers = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrganizerProfileResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                OrganizerName = x.OrganizerName,
                OrganizerType = x.OrganizerType,
                Description = x.Description,
                PhoneNumber = x.PhoneNumber,
                InstagramUrl = x.InstagramUrl,
                City = x.City,
                District = x.District,
                Status = x.Status,
                RejectionReason = x.RejectionReason,
                CreatedAt = x.CreatedAt,
                ApprovedAt = x.ApprovedAt
            })
            .ToListAsync();

        return Ok(organizers);
    }

    [HttpGet("organizers/pending")]
    public async Task<IActionResult> GetPendingOrganizers()
    {
        var pendingOrganizers = await _context.OrganizerProfiles
            .Where(x => x.Status == "Pending")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrganizerProfileResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                OrganizerName = x.OrganizerName,
                OrganizerType = x.OrganizerType,
                Description = x.Description,
                PhoneNumber = x.PhoneNumber,
                InstagramUrl = x.InstagramUrl,
                City = x.City,
                District = x.District,
                Status = x.Status,
                RejectionReason = x.RejectionReason,
                CreatedAt = x.CreatedAt,
                ApprovedAt = x.ApprovedAt
            })
            .ToListAsync();

        return Ok(pendingOrganizers);
    }

    [HttpPut("organizers/{id}/approve")]
    public async Task<IActionResult> ApproveOrganizer(int id)
    {
        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.Id == id);

        if (organizerProfile == null)
        {
            return NotFound("Organizatör başvurusu bulunamadı.");
        }

        if (organizerProfile.Status == "Approved")
        {
            return BadRequest("Bu organizatör zaten onaylanmış.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == organizerProfile.UserId);

        if (user == null)
        {
            return NotFound("Başvuruya ait kullanıcı bulunamadı.");
        }

        organizerProfile.Status = "Approved";
        organizerProfile.RejectionReason = string.Empty;
        organizerProfile.ApprovedAt = DateTime.UtcNow;

        user.Role = "Organizer";

        await _context.SaveChangesAsync();

        return Ok("Organizatör başvurusu onaylandı.");
    }

    [HttpPut("organizers/{id}/reject")]
    public async Task<IActionResult> RejectOrganizer(int id, RejectOrganizerRequest request)
    {
        var organizerProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.Id == id);

        if (organizerProfile == null)
        {
            return NotFound("Organizatör başvurusu bulunamadı.");
        }

        if (organizerProfile.Status == "Approved")
        {
            return BadRequest("Onaylanmış organizatör doğrudan reddedilemez.");
        }

        organizerProfile.Status = "Rejected";
        organizerProfile.RejectionReason = request.RejectionReason;
        organizerProfile.ApprovedAt = null;

        await _context.SaveChangesAsync();

        return Ok("Organizatör başvurusu reddedildi.");
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents([FromQuery] string? status)
    {
        var query = _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var events = await query
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

    [HttpGet("events/pending")]
    public async Task<IActionResult> GetPendingEvents()
    {
        var pendingEvents = await _context.Events
            .Include(x => x.OrganizerProfile)
            .Include(x => x.EventCategory)
            .Where(x => x.Status == "Pending")
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

        return Ok(pendingEvents);
    }

    [HttpPut("events/{id}/approve")]
    public async Task<IActionResult> ApproveEvent(int id)
    {
        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı.");
        }

        if (eventItem.Status == "Approved")
        {
            return BadRequest("Bu etkinlik zaten onaylanmış.");
        }

        eventItem.Status = "Approved";
        eventItem.ApprovedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok("Etkinlik onaylandı.");
    }

    [HttpPut("events/{id}/reject")]
    public async Task<IActionResult> RejectEvent(int id)
    {
        var eventItem = await _context.Events
            .FirstOrDefaultAsync(x => x.Id == id);

        if (eventItem == null)
        {
            return NotFound("Etkinlik bulunamadı.");
        }

        if (eventItem.Status == "Approved")
        {
            return BadRequest("Onaylanmış etkinlik doğrudan reddedilemez.");
        }

        eventItem.Status = "Rejected";
        eventItem.ApprovedAt = null;

        await _context.SaveChangesAsync();

        return Ok("Etkinlik reddedildi.");
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(x => x.Role == role);
        }

        var users = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminUserResponse
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                ProfileImageUrl = x.ProfileImageUrl,
                Role = x.Role,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        if (user.IsActive)
        {
            return BadRequest("Kullanıcı zaten aktif.");
        }

        user.IsActive = true;

        await _context.SaveChangesAsync();

        return Ok("Kullanıcı aktif hale getirildi.");
    }

    [HttpPut("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        if (!user.IsActive)
        {
            return BadRequest("Kullanıcı zaten pasif.");
        }

        user.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok("Kullanıcı pasif hale getirildi.");
    }
}