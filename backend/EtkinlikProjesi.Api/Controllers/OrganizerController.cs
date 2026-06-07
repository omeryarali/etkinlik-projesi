using System.Security.Claims;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Organizer;
using EtkinlikProjesi.Api.Models;
using EtkinlikProjesi.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EtkinlikProjesi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizerController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrganizerController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply(CreateOrganizerProfileRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        var existingProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (existingProfile != null)
        {
            return BadRequest("Zaten bir organizator basvurunuz/profiliniz var.");
        }

        if (string.IsNullOrWhiteSpace(request.OrganizerName) ||
            string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.District))
        {
            return BadRequest("Organizator adi, telefon, sehir ve ilce zorunludur.");
        }

        var organizerProfile = new OrganizerProfile
        {
            UserId = userId,
            OrganizerName = request.OrganizerName.Trim(),
            OrganizerType = request.OrganizerType?.Trim() ?? string.Empty,
            Description = request.Description?.Trim() ?? string.Empty,
            PhoneNumber = request.PhoneNumber.Trim(),
            InstagramUrl = request.InstagramUrl?.Trim() ?? string.Empty,
            City = request.City.Trim(),
            District = request.District.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.OrganizerProfiles.Add(organizerProfile);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (AppSecurity.IsUniqueConstraintViolation(exception))
        {
            return BadRequest("Zaten bir organizator basvurunuz/profiliniz var.");
        }

        var response = new OrganizerProfileResponse
        {
            Id = organizerProfile.Id,
            UserId = organizerProfile.UserId,
            OrganizerName = organizerProfile.OrganizerName,
            OrganizerType = organizerProfile.OrganizerType,
            Description = organizerProfile.Description,
            PhoneNumber = organizerProfile.PhoneNumber,
            InstagramUrl = organizerProfile.InstagramUrl,
            City = organizerProfile.City,
            District = organizerProfile.District,
            Status = organizerProfile.Status,
            RejectionReason = organizerProfile.RejectionReason,
            CreatedAt = organizerProfile.CreatedAt,
            ApprovedAt = organizerProfile.ApprovedAt
        };

        return Ok(response);
    }

    [Authorize]
    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var profile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return NotFound("Organizator profiliniz bulunamadi.");
        }

        var response = new OrganizerProfileResponse
        {
            Id = profile.Id,
            UserId = profile.UserId,
            OrganizerName = profile.OrganizerName,
            OrganizerType = profile.OrganizerType,
            Description = profile.Description,
            PhoneNumber = profile.PhoneNumber,
            InstagramUrl = profile.InstagramUrl,
            City = profile.City,
            District = profile.District,
            Status = profile.Status,
            RejectionReason = profile.RejectionReason,
            CreatedAt = profile.CreatedAt,
            ApprovedAt = profile.ApprovedAt
        };

        return Ok(response);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateOrganizerProfileRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var profile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return NotFound("Organizator profiliniz bulunamadi.");
        }

        if (profile.Status == "Suspended")
        {
            return BadRequest("Askiya alinmis organizator profili guncellenemez.");
        }

        if (string.IsNullOrWhiteSpace(request.OrganizerName) ||
            string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.District))
        {
            return BadRequest("Organizator adi, telefon, sehir ve ilce zorunludur.");
        }

        profile.OrganizerName = request.OrganizerName.Trim();
        profile.OrganizerType = request.OrganizerType?.Trim() ?? string.Empty;
        profile.Description = request.Description?.Trim() ?? string.Empty;
        profile.PhoneNumber = request.PhoneNumber.Trim();
        profile.InstagramUrl = request.InstagramUrl?.Trim() ?? string.Empty;
        profile.City = request.City.Trim();
        profile.District = request.District.Trim();

        if (profile.Status == "Approved")
        {
            profile.Status = "Pending";
            profile.ApprovedAt = null;

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user != null && user.Role == "Organizer")
            {
                user.Role = "Participant";
                user.TokenVersion++;
            }
        }

        await _context.SaveChangesAsync();

        var response = new OrganizerProfileResponse
        {
            Id = profile.Id,
            UserId = profile.UserId,
            OrganizerName = profile.OrganizerName,
            OrganizerType = profile.OrganizerType,
            Description = profile.Description,
            PhoneNumber = profile.PhoneNumber,
            InstagramUrl = profile.InstagramUrl,
            City = profile.City,
            District = profile.District,
            Status = profile.Status,
            RejectionReason = profile.RejectionReason,
            CreatedAt = profile.CreatedAt,
            ApprovedAt = profile.ApprovedAt
        };

        return Ok(response);
    }
}
