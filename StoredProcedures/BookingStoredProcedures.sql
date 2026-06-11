-- ==========================================
-- MODULE 5: BOOKING MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_CreateUpdateBooking
CREATE OR ALTER PROCEDURE USP_CreateUpdateBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @EventId INT, @SlotId INT, @UserId INT, @TotalTickets INT, @TotalAmount DECIMAL(18,2),
                @BookingReference NVARCHAR(50);

        SELECT 
            @BookingId = BookingId,
            @EventId = EventId,
            @SlotId = SlotId,
            @UserId = UserId,
            @TotalTickets = TotalTickets,
            @TotalAmount = TotalAmount
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            EventId INT '$.EventId',
            SlotId INT '$.SlotId',
            UserId INT '$.UserId',
            TotalTickets INT '$.TotalTickets',
            TotalAmount DECIMAL(18,2) '$.TotalAmount'
        );

        -- Availability check
        DECLARE @Capacity INT, @Booked INT;
        SELECT @Capacity = Capacity FROM Tracket_Master_Event_Slot WHERE SlotId = @SlotId AND IsDeleted = 0;
        
        SELECT @Booked = ISNULL(SUM(TotalTickets), 0) 
        FROM Tracket_Master_Booking 
        WHERE SlotId = @SlotId AND BookingStatus <> 'CANCELLED' AND IsDeleted = 0;

        IF @BookingId = 0
        BEGIN
            IF (@Capacity - @Booked) < @TotalTickets
            BEGIN
                SELECT 400 AS ResultStatus, 'Insufficient ticket capacity available.' AS ResultMessage;
                ROLLBACK TRANSACTION;
                RETURN;
            END

            SET @BookingReference = 'BK-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

            INSERT INTO Tracket_Master_Booking (BookingReference, EventId, SlotId, UserId, TotalTickets, TotalAmount, BookingStatus, BookingDate, IsDeleted)
            VALUES (@BookingReference, @EventId, @SlotId, @UserId, @TotalTickets, @TotalAmount, 'CONFIRMED', GETDATE(), 0);

            SET @BookingId = SCOPE_IDENTITY();

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, AttendeeName, Email, PhoneNumber, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(100) '$.AttendeeName',
                Email NVARCHAR(100) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber'
            );

            COMMIT TRANSACTION;
            SELECT 201 AS ResultStatus, 'Booking created successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            UPDATE Tracket_Master_Booking
            SET TotalTickets = @TotalTickets, TotalAmount = @TotalAmount
            WHERE BookingId = @BookingId;

            UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, AttendeeName, Email, PhoneNumber, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(100) '$.AttendeeName',
                Email NVARCHAR(100) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber'
            );

            COMMIT TRANSACTION;
            SELECT 200 AS ResultStatus, 'Booking updated successfully.' AS ResultMessage;
        END

        SELECT 
            B.BookingId, B.BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.TotalAmount, B.BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        SELECT AttendeeId, AttendeeName, Email, PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 2. USP_GetBookings
CREATE OR ALTER PROCEDURE USP_GetBookings
    @BookingId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @BookingId IS NOT NULL
    BEGIN
        SELECT 
            B.BookingId, B.BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.TotalAmount, B.BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId AND B.IsDeleted = 0;

        SELECT AttendeeId, AttendeeName, Email, PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            B.BookingId, B.BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.TotalAmount, B.BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.IsDeleted = 0;

        SELECT BookingId, AttendeeId, AttendeeName, Email, PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE IsDeleted = 0;
    END
END;
GO

-- 3. USP_CancelBooking
CREATE OR ALTER PROCEDURE USP_CancelBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId INT, @Reason NVARCHAR(255);

    SELECT 
        @BookingId = BookingId,
        @Reason = Reason
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        Reason NVARCHAR(255) '$.Reason'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Booking 
        SET BookingStatus = 'CANCELLED' 
        WHERE BookingId = @BookingId;

        -- Log cancellation logic (can write to Tracket_Log_Booking if present)
        SELECT 200 AS ResultStatus, 'Booking cancelled successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Booking not found.' AS ResultMessage;
    END
END;
GO

-- 4. USP_CheckSeatAvailability
CREATE OR ALTER PROCEDURE USP_CheckSeatAvailability
    @EventId INT,
    @SlotId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Capacity INT, @Booked INT;
    SELECT @Capacity = Capacity FROM Tracket_Master_Event_Slot WHERE SlotId = @SlotId AND IsDeleted = 0;
    
    SELECT @Booked = ISNULL(SUM(TotalTickets), 0) 
    FROM Tracket_Master_Booking 
    WHERE SlotId = @SlotId AND BookingStatus <> 'CANCELLED' AND IsDeleted = 0;

    SELECT 
        @EventId AS EventId,
        @SlotId AS SlotId,
        ISNULL(@Capacity, 0) AS TotalCapacity,
        ISNULL(@Booked, 0) AS BookedSeats,
        (ISNULL(@Capacity, 0) - ISNULL(@Booked, 0)) AS AvailableSeats;
END;
GO
