-- ============================================================
-- USP_CheckSeatAvailability
-- Returns seat availability info for a given event + slot.
--
-- Result Set 1: Summary row mapped to SeatAvailabilityResponse:
--               EventId, SlotId, TotalCapacity, BookedSeats, AvailableSeats
-- Result Set 2: List of booked seat numbers (SeatNo strings)
--
-- Strategy:
--   1. Reads total seat capacity from the event slot.
--   2. Gets booked seat numbers from Tracket_Master_Booking_Attendee
--      where the booking is active (not cancelled) for this event+slot.
--   3. Also checks Tracket_Master_Event_Zone_Seat.IsBooked as a fallback.
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_CheckSeatAvailability', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_CheckSeatAvailability;
GO

CREATE PROCEDURE dbo.USP_CheckSeatAvailability
    @EventId INT,
    @SlotId  INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Collect booked seat numbers from attendees for active bookings on this event+slot
    DECLARE @BookedSeats TABLE (SeatNo NVARCHAR(50));

    -- Method 1: From Booking Attendees (most reliable — actual seat assignments)
    INSERT INTO @BookedSeats (SeatNo)
    SELECT DISTINCT BA.SeatNo
    FROM Tracket_Master_Booking B
    INNER JOIN Tracket_Master_Booking_Attendee BA
        ON  BA.BookingId    = B.BookingId
        AND BA.IsDeleted    = 0
    WHERE B.EventId         = @EventId
      AND B.SlotId          = @SlotId
      AND B.IsDeleted       = 0
      AND B.BookingStatus  <> 4           -- 4 = Cancelled
      AND BA.SeatNo IS NOT NULL
      AND BA.SeatNo <> '';

    -- Method 2: From Zone Seat table (direct IsBooked flag — catches any gaps)
    INSERT INTO @BookedSeats (SeatNo)
    SELECT DISTINCT ZONS.SeatNumber
    FROM Tracket_Master_Event_Zone_Seat ZONS
    WHERE ZONS.EventId      = @EventId
      AND ZONS.IsBooked     = 1
      AND ZONS.IsDeleted    = 0
      AND ZONS.SeatNumber IS NOT NULL
      AND ZONS.SeatNumber <> ''
      AND ZONS.SeatNumber NOT IN (SELECT SeatNo FROM @BookedSeats); -- avoid duplicates

    -- -------------------------------------------------------
    -- Result Set 1: Summary (maps to SeatAvailabilityResponse)
    -- -------------------------------------------------------
    SELECT
        @EventId                        AS EventId,
        @SlotId                         AS SlotId,
        ISNULL(ES.Capacity, 0)          AS TotalCapacity,
        (SELECT COUNT(*) FROM @BookedSeats) AS BookedSeats,
        ISNULL(ES.Capacity, 0) - (SELECT COUNT(*) FROM @BookedSeats) AS AvailableSeats
    FROM Tracket_Master_Event_Slot ES
    WHERE ES.SlotId    = @SlotId
      AND ES.IsDeleted = 0;

    -- -------------------------------------------------------
    -- Result Set 2: Booked seat number strings
    -- -------------------------------------------------------
    SELECT SeatNo FROM @BookedSeats;
END;
GO

PRINT 'USP_CheckSeatAvailability created successfully.';
GO
