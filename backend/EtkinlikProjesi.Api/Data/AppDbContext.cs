using EtkinlikProjesi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EtkinlikProjesi.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<OrganizerProfile> OrganizerProfiles { get; set; }

    public DbSet<EventCategory> EventCategories { get; set; }

    public DbSet<Event> Events { get; set; }

    public DbSet<EventParticipant> EventParticipants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User - OrganizerProfile ilişkisi
        modelBuilder.Entity<OrganizerProfile>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // OrganizerProfile - Event ilişkisi
        modelBuilder.Entity<Event>()
            .HasOne(x => x.OrganizerProfile)
            .WithMany()
            .HasForeignKey(x => x.OrganizerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // EventCategory - Event ilişkisi
        modelBuilder.Entity<Event>()
            .HasOne(x => x.EventCategory)
            .WithMany()
            .HasForeignKey(x => x.EventCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Event - EventParticipant ilişkisi
        modelBuilder.Entity<EventParticipant>()
            .HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        // User - EventParticipant ilişkisi
        modelBuilder.Entity<EventParticipant>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}