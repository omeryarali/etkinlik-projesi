using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Models;
using EtkinlikProjesi.Api.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"];

if (AppSecurity.IsWeakJwtSecret(jwtSecretKey) && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException("Production ortami icin guclu bir Jwt:SecretKey tanimlanmalidir.");
}

var configuredCorsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray() ?? Array.Empty<string>();

var developmentCorsOrigins = new[]
{
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "http://localhost:8081",
    "https://localhost:8081",
    "http://127.0.0.1:8081",
    "https://127.0.0.1:8081",
    "http://localhost:19006",
    "https://localhost:19006",
    "http://127.0.0.1:19006",
    "https://127.0.0.1:19006"
};

var allowedCorsOrigins = builder.Environment.IsDevelopment() && configuredCorsOrigins.Length == 0
    ? developmentCorsOrigins
    : configuredCorsOrigins;

if (!builder.Environment.IsDevelopment() && allowedCorsOrigins.Length == 0)
{
    throw new InvalidOperationException("Production ortami icin Cors:AllowedOrigins ayarlanmalidir.");
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "BiKatil API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT token girin. Ornek: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy.WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Cok fazla istek gonderildi. Lutfen biraz sonra tekrar deneyin." },
            cancellationToken);
    };

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientIdentifier(context),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            $"{GetClientIdentifier(context)}:{context.Request.Path}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 8,
                Window = TimeSpan.FromMinutes(5),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey ?? string.Empty)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userIdClaim = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleClaim = context.Principal?.FindFirstValue(ClaimTypes.Role);
            var tokenVersionClaim = context.Principal?.FindFirstValue(AppSecurity.TokenVersionClaim);

            if (!int.TryParse(userIdClaim, out var userId) || !int.TryParse(tokenVersionClaim, out var tokenVersion))
            {
                context.Fail("Token icerigi gecersiz.");
                return;
            }

            var dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

            var user = await dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null || !user.IsActive)
            {
                context.Fail("Kullanici oturumu aktif degil.");
                return;
            }

            if (!string.Equals(user.Role, roleClaim, StringComparison.Ordinal))
            {
                context.Fail("Kullanici rolu guncel degil.");
                return;
            }

            if (user.TokenVersion != tokenVersion)
            {
                context.Fail("Oturum gecersiz kilinmis.");
            }
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    if (AppSecurity.IsWeakJwtSecret(jwtSecretKey))
    {
        app.Logger.LogWarning("Development ortaminda zayif JWT anahtari kullaniyorsunuz. Yayin oncesi degistirin.");
    }
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
    await EnsureBootstrapAdminAsync(dbContext, builder.Configuration);
}

app.UseCors("ClientApps");
app.UseRateLimiter();

app.MapGet("/", () => "BiKatil API calisiyor.");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static string GetClientIdentifier(HttpContext context)
{
    var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

    if (!string.IsNullOrWhiteSpace(forwardedFor))
    {
        return forwardedFor.Split(',')[0].Trim();
    }

    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

static async Task EnsureBootstrapAdminAsync(AppDbContext dbContext, IConfiguration configuration)
{
    var bootstrapSection = configuration.GetSection("BootstrapAdmin");
    var fullName = bootstrapSection["FullName"]?.Trim();
    var email = bootstrapSection["Email"]?.Trim();
    var password = bootstrapSection["Password"];
    var phoneNumber = bootstrapSection["PhoneNumber"]?.Trim() ?? string.Empty;

    if (string.IsNullOrWhiteSpace(fullName) ||
        string.IsNullOrWhiteSpace(email) ||
        string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    var passwordValidationMessage = AppSecurity.ValidatePassword(password);

    if (passwordValidationMessage != null)
    {
        throw new InvalidOperationException($"Bootstrap admin sifresi gecersiz: {passwordValidationMessage}");
    }

    var normalizedEmail = AppSecurity.NormalizeEmail(email);

    var user = await dbContext.Users
        .FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail);

    if (user == null)
    {
        dbContext.Users.Add(new User
        {
            FullName = fullName,
            Email = email,
            NormalizedEmail = normalizedEmail,
            PhoneNumber = phoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
        return;
    }

    var shouldSave = false;
    var shouldInvalidateSessions = false;

    if (string.IsNullOrWhiteSpace(user.NormalizedEmail) || user.NormalizedEmail != normalizedEmail)
    {
        user.NormalizedEmail = normalizedEmail;
        shouldSave = true;
    }

    if (string.IsNullOrWhiteSpace(user.Email))
    {
        user.Email = email;
        shouldSave = true;
    }

    if (string.IsNullOrWhiteSpace(user.FullName))
    {
        user.FullName = fullName;
        shouldSave = true;
    }

    if (string.IsNullOrWhiteSpace(user.PhoneNumber) && !string.IsNullOrWhiteSpace(phoneNumber))
    {
        user.PhoneNumber = phoneNumber;
        shouldSave = true;
    }

    if (!user.IsActive)
    {
        user.IsActive = true;
        shouldSave = true;
        shouldInvalidateSessions = true;
    }

    if (!string.Equals(user.Role, "Admin", StringComparison.Ordinal))
    {
        user.Role = "Admin";
        shouldSave = true;
        shouldInvalidateSessions = true;
    }

    if (shouldInvalidateSessions)
    {
        user.TokenVersion++;
    }

    if (shouldSave)
    {
        await dbContext.SaveChangesAsync();
    }
}
