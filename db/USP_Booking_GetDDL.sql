-- ============================================================
-- USP_Booking_GetDDL
-- Altered to get EventId dynamically from Tracket_Master_Event_Zone_Asset
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_Booking_GetDDL', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_Booking_GetDDL;
GO

CREATE PROCEDURE dbo.USP_Booking_GetDDL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        -- Status
        SELECT
            200 AS ResultStatus,
            'Booking dropdowns fetched successfully.' AS ResultMessage;

        -------------------------------------------------------------
        -- Table 1 : Event Slots
        -------------------------------------------------------------
        SELECT
            S.SlotId AS Value,

            E.EventName + ' - ' +
            ISNULL(S.SlotName, 'Slot') +
            ' (' +
            CONVERT(VARCHAR(10), S.StartDate, 105) +
            ' ' +
            LEFT(CONVERT(VARCHAR(8), S.StartTime, 108), 5) +
            ' - ' +
            LEFT(CONVERT(VARCHAR(8), S.EndTime, 108), 5) +
            ')' AS Label,

            S.SlotId,
            S.EventId,
            E.EventName,

            S.StartDate,
            S.EndDate,

            CONVERT(VARCHAR(8), S.StartTime, 108) AS StartTime,
            CONVERT(VARCHAR(8), S.EndTime, 108) AS EndTime,

            S.SlotName,
            S.Capacity,
            S.BookedSeats,
            S.AvailableSeats,
            S.TicketPrice,
            S.EventMode,
            S.Timezone,
            S.AllDay

        FROM Tracket_Master_Event_Slot S WITH (NOLOCK)
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK)
            ON E.EventId = S.EventId

        WHERE
            S.IsDeleted = 0
            AND E.IsDeleted = 0

        ORDER BY
            E.EventName,
            S.StartDate,
            S.StartTime;

        -------------------------------------------------------------
        -- Table 2 : Zones (EventId mapped via Zone Asset allocations)
        -------------------------------------------------------------
        SELECT DISTINCT
            Z.ZoneId,
            Z.ZoneName,
            Z.SeatPrice,
            Z.Capacity,
            Z.BlueprintId,
            EZA.EventId

        FROM Tracket_Master_Event_Zone Z WITH (NOLOCK)
        INNER JOIN Tracket_Master_Event_Zone_Asset EZA WITH (NOLOCK)
            ON Z.ZoneId = EZA.ZoneId AND EZA.IsDeleted = 0

        WHERE
            Z.IsActive = 1
            AND Z.IsDeleted = 0

        ORDER BY
            Z.ZoneName;

    END TRY
    BEGIN CATCH

        SELECT
            ERROR_NUMBER() AS ResultStatus,
            ERROR_MESSAGE() AS ResultMessage;

    END CATCH
END;
GO

PRINT 'USP_Booking_GetDDL altered successfully.';
GO
