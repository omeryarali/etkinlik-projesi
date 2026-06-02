using System.Security.Claims;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Organizer;
using EtkinlikProjesi.Api.Models;
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
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        var existingProfile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (existingProfile != null)
        {
            return BadRequest("Zaten bir organizatör başvurunuz/profiliniz var.");
        }

        if (string.IsNullOrWhiteSpace(request.OrganizerName) ||
            string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.District))
        {
            return BadRequest("Organizatör adı, telefon, şehir ve ilçe zorunludur.");
        }

        var organizerProfile = new OrganizerProfile
        {
            UserId = userId,
            OrganizerName = request.OrganizerName,
            OrganizerType = request.OrganizerType,
            Description = request.Description,
            PhoneNumber = request.PhoneNumber,
            InstagramUrl = request.InstagramUrl,
            City = request.City,
            District = request.District,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.OrganizerProfiles.Add(organizerProfile);
        await _context.SaveChangesAsync();

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
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var profile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return NotFound("Organizatör profiliniz bulunamadı.");
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
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var profile = await _context.OrganizerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return NotFound("Organizatör profiliniz bulunamadı.");
        }

        if (profile.Status == "Suspended")
        {
            return BadRequest("Askıya alınmış organizatör profili güncellenemez.");
        }

        if (string.IsNullOrWhiteSpace(request.OrganizerName) ||
            string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.District))
        {
            return BadRequest("Organizatör adı, telefon, şehir ve ilçe zorunludur.");
        }

        profile.OrganizerName = request.OrganizerName;
        profile.OrganizerType = request.OrganizerType;
        profile.Description = request.Description;
        profile.PhoneNumber = request.PhoneNumber;
        profile.InstagramUrl = request.InstagramUrl;
        profile.City = request.City;
        profile.District = request.District;

        /*
         * Güvenlik mantığı:
         * Eğer organizatör daha önce onaylandıysa ve profil bilgilerini değiştiriyorsa
         * tekrar admin kontrolüne düşmesi daha güvenli olur.
         */
        if (profile.Status == "Approved")
        {
            profile.Status = "Pending";
            profile.ApprovedAt = null;

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user != null && user.Role == "Organizer")
            {
                user.Role = "Participant";
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