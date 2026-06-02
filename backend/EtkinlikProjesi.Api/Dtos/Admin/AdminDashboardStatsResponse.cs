namespace EtkinlikProjesi.Api.Dtos.Admin;

public class AdminDashboardStatsResponse
{
    public int TotalUsers { get; set; }

    public int ActiveUsers { get; set; }

    public int PassiveUsers { get; set; }

    public int TotalOrganizers { get; set; }

    public int PendingOrganizers { get; set; }

    public int ApprovedOrganizers { get; set; }

    public int RejectedOrganizers { get; set; }

    public int SuspendedOrganizers { get; set; }

    public int TotalEvents { get; set; }

    public int PendingEvents { get; set; }

    public int ApprovedEvents { get; set; }

    public int RejectedEvents { get; set; }

    public int CancelledEvents { get; set; }

    public int CompletedEvents { get; set; }

    public int TotalParticipants { get; set; }

    public int JoinedParticipants { get; set; }

    public int CancelledParticipants { get; set; }

    public int AttendedParticipants { get; set; }

    public int NoShowParticipants { get; set; }
}