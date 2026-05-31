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
}