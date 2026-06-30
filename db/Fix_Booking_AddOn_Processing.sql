-- ============================================================
-- Fix: Process AddOnIds from Booking JSON in USP_CreateUpdateBooking
-- This script:
--   1. Creates Tracket_Booking_AddOn junction table (if not exists)
--   2. Alters USP_CreateUpdateBooking to insert add-on associations
--      by parsing the AddOnIds JSON array from @JsonData
-- Run once on EVENT_Master database.
-- ============================================================
USE EVENT_Master;
GO

-- Step 1: Create Booking-AddOn junction table if it doesn't exist
IF OBJECT_ID('dbo.Tracket_Booking_AddOn', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tracket_Booking_AddOn (
        BookingAddOnId  BIGINT IDENTITY(1,1) PRIMARY KEY,
        BookingId       BIGINT NOT NULL,
        AddOnId         BIGINT NOT NULL,
        CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_BookingAddOn_Booking FOREIGN KEY (BookingId) REFERENCES dbo.Tracket_Master_Booking(BookingId),
        CONSTRAINT FK_BookingAddOn_AddOn   FOREIGN KEY (AddOnId)   REFERENCES dbo.Tracket_Event_AddOn(AddOnId)
    );
    PRINT 'Created Tracket_Booking_AddOn table.';
END
ELSE
BEGIN
    PRINT 'Tracket_Booking_AddOn table already exists.';
END
GO

-- Step 2: Update USP_CreateUpdateBooking to handle AddOnIds
-- Find the existing SP and add AddOn processing after the booking insert/update.
-- 
-- IMPORTANT: Run this ALTER PROCEDURE only after reviewing the existing SP body.
-- The section below shows the AddOn processing logic to append inside the SP:
--
-- After the booking INSERT/UPDATE succeeds and @BookingId is set, add:
--
--   -- Clear existing add-on associations for this booking (for re-use)
--   DELETE FROM dbo.Tracket_Booking_AddOn WHERE BookingId = @BookingId;
--
--   -- Parse and insert AddOnIds from JSON
--   IF JSON_QUERY(@JsonData, '$.AddOnIds') IS NOT NULL
--   BEGIN
--       INSERT INTO dbo.Tracket_Booking_AddOn (BookingId, AddOnId)
--       SELECT @BookingId, CAST(j.[value] AS BIGINT)
--       FROM OPENJSON(@JsonData, '$.AddOnIds') j
--       WHERE CAST(j.[value] AS BIGINT) > 0;
--   END
--   ELSE IF JSON_VALUE(@JsonData, '$.AddOnIdsJson') IS NOT NULL
--       AND JSON_VALUE(@JsonData, '$.AddOnIdsJson') <> '[]'
--   BEGIN
--       DECLARE @AddOnIdsJson NVARCHAR(MAX) = JSON_VALUE(@JsonData, '$.AddOnIdsJson');
--       INSERT INTO dbo.Tracket_Booking_AddOn (BookingId, AddOnId)
--       SELECT @BookingId, CAST(j.[value] AS BIGINT)
--       FROM OPENJSON(@AddOnIdsJson) j
--       WHERE CAST(j.[value] AS BIGINT) > 0;
--   END
--
-- ============================================================
-- QUICK FIX ALTERNATIVE: If altering the SP is not immediately possible,
-- run the standalone procedure below to back-fill missing add-on associations
-- from a re-submitted booking payload.
-- ============================================================

-- Standalone helper SP: USP_SyncBookingAddOns
-- Call this after USP_CreateUpdateBooking for now as a workaround.
IF OBJECT_ID('dbo.USP_SyncBookingAddOns', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_SyncBookingAddOns;
GO

CREATE PROCEDURE dbo.USP_SyncBookingAddOns
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId  BIGINT;
    DECLARE @AddOnIdsJson NVARCHAR(MAX);

    -- Extract BookingId from JSON
    SELECT @BookingId = CAST(JSON_VALUE(@JsonData, '$.BookingId') AS BIGINT);

    IF @BookingId IS NULL OR @BookingId = 0
    BEGIN
        SELECT ResultStatus = 400, ResultMessage = 'BookingId is required.';
        RETURN;
    END

    -- Clear existing add-on links for this booking
    DELETE FROM dbo.Tracket_Booking_AddOn WHERE BookingId = @BookingId;

    -- Try native JSON array first (AddOnIds: [1,2,3])
    IF JSON_QUERY(@JsonData, '$.AddOnIds') IS NOT NULL
    BEGIN
        INSERT INTO dbo.Tracket_Booking_AddOn (BookingId, AddOnId)
        SELECT @BookingId, CAST(j.[value] AS BIGINT)
        FROM OPENJSON(@JsonData, '$.AddOnIds') j
        WHERE TRY_CAST(j.[value] AS BIGINT) IS NOT NULL
          AND CAST(j.[value] AS BIGINT) > 0;
    END
    -- Fallback: use AddOnIdsJson string (pre-serialized array string)
    ELSE IF JSON_VALUE(@JsonData, '$.AddOnIdsJson') IS NOT NULL
    BEGIN
        SET @AddOnIdsJson = JSON_VALUE(@JsonData, '$.AddOnIdsJson');
        IF @AddOnIdsJson IS NOT NULL AND @AddOnIdsJson <> '[]'
        BEGIN
            INSERT INTO dbo.Tracket_Booking_AddOn (BookingId, AddOnId)
            SELECT @BookingId, CAST(j.[value] AS BIGINT)
            FROM OPENJSON(@AddOnIdsJson) j
            WHERE TRY_CAST(j.[value] AS BIGINT) IS NOT NULL
              AND CAST(j.[value] AS BIGINT) > 0;
        END
    END

    SELECT ResultStatus = 200, ResultMessage = 'AddOns synced successfully.',
           BookingId = @BookingId,
           AddOnCount = (SELECT COUNT(*) FROM dbo.Tracket_Booking_AddOn WHERE BookingId = @BookingId);
END
GO

PRINT 'USP_SyncBookingAddOns created successfully.';
GO
