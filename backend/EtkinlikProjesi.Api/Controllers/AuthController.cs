using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Auth;
using EtkinlikProjesi.Api.Models;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Ad soyad, e-posta ve şifre zorunludur.");
        }

        var emailExists = await _context.Users
            .AnyAsync(x => x.Email.ToLower() == request.Email.ToLower());

        if (emailExists)
        {
            return BadRequest("Bu e-posta adresi zaten kayıtlı.");
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Participant",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        var response = new AuthResponse
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

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == request.Email.ToLower());

        if (user == null)
        {
            return BadRequest("E-posta veya şifre hatalı.");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            return BadRequest("E-posta veya şifre hatalı.");
        }

        if (!user.IsActive)
        {
            return BadRequest("Kullanıcı hesabı aktif değil.");
        }

        var token = GenerateJwtToken(user);

        var response = new AuthResponse
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

        return Ok(response);
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        var response = new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = string.Empty
        };

        return Ok(response);
    }

    [HttpPut("profile")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest("Ad soyad alanı boş olamaz.");
        }

        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.ProfileImageUrl = request.ProfileImageUrl;

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
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized("Kullanıcı bilgisi alınamadı.");
        }

        var userId = int.Parse(userIdString);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return BadRequest("Mevcut şifre boş olamaz.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Yeni şifre boş olamaz.");
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest("Yeni şifre en az 6 karakter olmalıdır.");
        }

        var currentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);

        if (!currentPasswordValid)
        {
            return BadRequest("Mevcut şifre hatalı.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _context.SaveChangesAsync();

        return Ok("Şifre başarıyla güncellendi.");
    }

    private string GenerateJwtToken(User user)
    {
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var secretKey = _configuration["Jwt:SecretKey"];

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new Exception("JWT SecretKey bulunamadı.");
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}