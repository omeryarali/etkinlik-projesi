using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EtkinlikProjesi.Api.Migrations
{
    /// <inheritdoc />
    public partial class SecurityHardening : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrganizerProfiles_UserId",
                table: "OrganizerProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EventParticipants_EventId",
                table: "EventParticipants");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TokenVersion",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                UPDATE "Users"
                SET "NormalizedEmail" = LOWER(TRIM("Email"))
                WHERE "NormalizedEmail" = '';
                """);

            migrationBuilder.Sql("""
                WITH duplicate_participants AS (
                    SELECT
                        "Id",
                        ROW_NUMBER() OVER (
                            PARTITION BY "EventId", "UserId"
                            ORDER BY "JoinedAt" DESC, "Id" DESC
                        ) AS row_number
                    FROM "EventParticipants"
                )
                DELETE FROM "EventParticipants" participant
                USING duplicate_participants duplicate
                WHERE participant."Id" = duplicate."Id"
                  AND duplicate.row_number > 1;
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM "Users"
                        GROUP BY "NormalizedEmail"
                        HAVING COUNT(*) > 1
                    ) THEN
                        RAISE EXCEPTION 'Duplicate user email values detected. Clean Users table before applying SecurityHardening migration.';
                    END IF;
                END
                $$;
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM "OrganizerProfiles"
                        GROUP BY "UserId"
                        HAVING COUNT(*) > 1
                    ) THEN
                        RAISE EXCEPTION 'Duplicate organizer profiles detected for the same user. Clean OrganizerProfiles before applying SecurityHardening migration.';
                    END IF;
                END
                $$;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizerProfiles_UserId",
                table: "OrganizerProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipants_EventId_UserId",
                table: "EventParticipants",
                columns: new[] { "EventId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_OrganizerProfiles_UserId",
                table: "OrganizerProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EventParticipants_EventId_UserId",
                table: "EventParticipants");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TokenVersion",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizerProfiles_UserId",
                table: "OrganizerProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipants_EventId",
                table: "EventParticipants",
                column: "EventId");
        }
    }
}
