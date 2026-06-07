using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EtkinlikProjesi.Api.Security;

public static class AppSecurity
{
    public const string PlaceholderJwtSecret = "CHANGE_THIS_SECRET_KEY";
    public const string TokenVersionClaim = "token_version";

    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    public static bool IsWeakJwtSecret(string? secretKey)
    {
        return string.IsNullOrWhiteSpace(secretKey) ||
               secretKey == PlaceholderJwtSecret ||
               secretKey.Length < 32;
    }

    public static string? ValidatePassword(string? password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return "Sifre bos olamaz.";
        }

        if (password.Length < 8)
        {
            return "Sifre en az 8 karakter olmalidir.";
        }

        if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
        {
            return "Sifre en az bir harf ve bir rakam icermelidir.";
        }

        return null;
    }

    public static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        return FindPostgresException(exception) is { SqlState: PostgresErrorCodes.UniqueViolation };
    }

    public static bool IsSerializationConflict(Exception exception)
    {
        var postgresException = FindPostgresException(exception);

        return postgresException?.SqlState is PostgresErrorCodes.SerializationFailure or PostgresErrorCodes.DeadlockDetected;
    }

    private static PostgresException? FindPostgresException(Exception? exception)
    {
        while (exception != null)
        {
            if (exception is PostgresException postgresException)
            {
                return postgresException;
            }

            exception = exception.InnerException;
        }

        return null;
    }
}
