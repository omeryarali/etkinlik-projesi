using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Admin;
using EtkinlikProjesi.Api.Dtos.Organizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}