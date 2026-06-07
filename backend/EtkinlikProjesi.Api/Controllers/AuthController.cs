using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Auth;
using EtkinlikProjesi.Api.Models;
using EtkinlikProjesi.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EtkinlikProjesi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Ad soyad, e-posta ve sifre zorunludur.");
        }

        if (!MailAddress.TryCreate(request.Email, out _))
        {
            return BadRequest("Gecerli bir e-posta adresi giriniz.");
        }

        var passwordValidationMessage = AppSecurity.ValidatePassword(request.Password);

        if (passwordValidationMessage != null)
        {
            return BadRequest(passwordValidationMessage);
        }

        var normalizedEmail = AppSecurity.NormalizeEmail(request.Email);

        var emailExists = await _context.Users
            .AnyAsync(x => x.NormalizedEmail == normalizedEmail);

        if (emailExists)
        {
            return BadRequest("Bu e-posta adresi zaten kayitli.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Participant",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (AppSecurity.IsUniqueConstraintViolation(exception))
        {
            return BadRequest("Bu e-posta adresi zaten kayitli.");
        }

        var token = GenerateJwtToken(user);

        return Ok(CreateAuthResponse(user, token));
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("E-posta ve sifre zorunludur.");
        }

        var normalizedEmail = AppSecurity.NormalizeEmail(request.Email);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail);

        if (user == null)
        {
            return BadRequest("E-posta veya sifre hatali.");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            return BadRequest("E-posta veya sifre hatali.");
        }

        if (!user.IsActive)
        {
            return BadRequest("Kullanici hesabi aktif degil.");
        }

        var token = GenerateJwtToken(user);

        return Ok(CreateAuthResponse(user, token));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        return Ok(CreateAuthResponse(user));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest("Ad soyad alani bos olamaz.");
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty;
        user.ProfileImageUrl = request.ProfileImageUrl?.Trim() ?? string.Empty;

        await _context.SaveChangesAsync();

        var response = new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.ProfileImageUrl,
            user.Role,
            user.IsActive,
            user.CreatedAt
        };

        return Ok(response);
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanici bilgisi alinamadi.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanici bulunamadi.");
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return BadRequest("Mevcut sifre bos olamaz.");
        }

        var passwordValidationMessage = AppSecurity.ValidatePassword(request.NewPassword);

        if (passwordValidationMessage != null)
        {
            return BadRequest(passwordValidationMessage);
        }

        var currentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);

        if (!currentPasswordValid)
        {
            return BadRequest("Mevcut sifre hatali.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.TokenVersion++;

        await _context.SaveChangesAsync();

        return Ok("Sifre basariyla guncellendi.");
    }

    private AuthResponse CreateAuthResponse(User user, string token = "")
    {
        return new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = token
        };
    }

    private string GenerateJwtToken(User user)
    {
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var secretKey = _configuration["Jwt:SecretKey"];

        if (AppSecurity.IsWeakJwtSecret(secretKey) && !HttpContext.RequestServices
                .GetRequiredService<IWebHostEnvironment>()
                .IsDevelopment())
        {
            throw new InvalidOperationException("JWT SecretKey guvensiz veya eksik.");
        }

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException("JWT SecretKey bulunamadi.");
        }

        var tokenLifetimeHours = _configuration.GetValue("Jwt:TokenLifetimeHours", 12);

        if (tokenLifetimeHours <= 0)
        {
            tokenLifetimeHours = 12;
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new(AppSecurity.TokenVersionClaim, user.TokenVersion.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(tokenLifetimeHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
