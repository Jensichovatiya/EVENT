-- ==========================================
-- MODULE 5: BOOKING MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_CreateUpdateBooking
CREATE OR ALTER PROCEDURE [dbo].[USP_CreateUpdateBooking]
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @EventId INT, @SlotId INT, @ZoneId INT, @UserId INT, @TotalTickets INT, @TotalAmount DECIMAL(18,2), @TaxAmount DECIMAL(18,2),
                @DiscountAmount DECIMAL(18,2), @FinalAmount DECIMAL(18,2), @BookingStatus INT, @HoldExpiryTime DATETIME,
                @BookingNo NVARCHAR(50), @BookingRId NVARCHAR(50),
                @CreatedBy NVARCHAR(200), @CreatedFrom NVARCHAR(100), @UpdatedBy NVARCHAR(200), @UpdatedFrom NVARCHAR(100);

        SELECT 
            @BookingId = BookingId,
            @BookingRId = BookingRId,
            @EventId = EventId,
            @SlotId = SlotId,
            @ZoneId = ZoneId,
            @UserId = UserId,
            @TotalTickets = TotalTickets,
            @TotalAmount = TotalAmount,
            @DiscountAmount = ISNULL(DiscountAmount, 0.00),
            @BookingStatus = ISNULL(BookingStatus, 0),
            @CreatedBy = CreatedBy,
            @CreatedFrom = CreatedFrom,
            @UpdatedBy = UpdatedBy,
            @UpdatedFrom = UpdatedFrom
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            BookingRId NVARCHAR(50) '$.BookingRId',
            EventId INT '$.EventId',
            SlotId INT '$.SlotId',
            ZoneId INT '$.ZoneId',
            UserId INT '$.UserId',
            TotalTickets INT '$.TotalTickets',
            TotalAmount DECIMAL(18,2) '$.TotalAmount',
            DiscountAmount DECIMAL(18,2) '$.DiscountAmount',
            BookingStatus INT '$.BookingStatus',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom',
            UpdatedBy NVARCHAR(200) '$.UpdatedBy',
            UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
        );

        -- Load slots from JSON or fallback to @SlotId
        DECLARE @Slots TABLE (SlotId INT);
        INSERT INTO @Slots (SlotId)
        SELECT value 
        FROM OPENJSON(@JsonData, '$.SelectedSlotIds')
        WITH (value INT '$');

        IF NOT EXISTS (SELECT 1 FROM @Slots)
        BEGIN
            INSERT INTO @Slots (SlotId) VALUES (@SlotId);
        END

        DECLARE @FirstSlotId INT;
        SELECT TOP 1 @FirstSlotId = SlotId FROM @Slots;

        -- Calculate tax dynamically from Tracket_Master_Tax
        DECLARE @TaxPercentage DECIMAL(18,2) = 0.00;
        SELECT @TaxPercentage = ISNULL(SUM(TaxPercentage), 0.00) 
        FROM Tracket_Master_Tax 
        WHERE IsActive = 1 AND IsDeleted = 0;

        IF @TaxPercentage > 0
        BEGIN
            SET @TaxAmount = @TotalAmount * (@TaxPercentage / 100.0);
        END
        ELSE
        BEGIN
            SET @TaxAmount = 0.00;
        END

        SET @FinalAmount = @TotalAmount + @TaxAmount - @DiscountAmount;

        IF @BookingId = 0 AND @BookingRId IS NOT NULL AND @BookingRId <> ''
        BEGIN
            SELECT @BookingId = BookingId 
            FROM Tracket_Master_Booking 
            WHERE BookingRId = @BookingRId AND IsDeleted = 0;
        END

        SET @BookingRId = ISNULL(NULLIF(@BookingRId, ''), LOWER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')));

        -- Capacity check for each slot
        IF EXISTS (
            SELECT 1
            FROM @Slots S
            CROSS APPLY (
                SELECT 
                    Capacity,
                    (SELECT ISNULL(SUM(B.TotalTickets), 0) 
                     FROM Tracket_Master_Booking B 
                     INNER JOIN Tracket_Master_Booking_Date BD ON B.BookingId = BD.BookingId
                     WHERE BD.SlotId = S.SlotId AND BD.IsDeleted = 0 AND B.BookingStatus <> 4 AND B.IsDeleted = 0) AS Booked
                FROM Tracket_Master_Event_Slot 
                WHERE SlotId = S.SlotId AND IsDeleted = 0
            ) C
            WHERE (C.Capacity - C.Booked) < @TotalTickets
        )
        BEGIN
            SELECT 400 AS ResultStatus, 'Insufficient ticket capacity available for one or more selected slots.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @BookingId IS NULL OR @BookingId = 0
        BEGIN
            -- Seat conflict check
            IF EXISTS (
                SELECT 1 
                FROM @Slots S
                INNER JOIN Tracket_Master_Booking_Date BD ON BD.SlotId = S.SlotId
                INNER JOIN Tracket_Master_Booking B ON B.BookingId = BD.BookingId
                INNER JOIN Tracket_Master_Booking_Attendee BA ON B.BookingId = BA.BookingId
                WHERE B.BookingStatus <> 4 
                  AND B.IsDeleted = 0 
                  AND BD.IsDeleted = 0
                  AND BA.IsDeleted = 0
                  AND BA.SeatNo IN (
                      SELECT SeatNo 
                      FROM OPENJSON(@JsonData, '$.Attendees')
                      WITH (SeatNo NVARCHAR(50) '$.SeatNo')
                  )
            )
            BEGIN
                SELECT 400 AS ResultStatus, 'One or more selected seats are already booked.' AS ResultMessage;
                ROLLBACK TRANSACTION;
                RETURN;
            END

            IF @BookingStatus = 0
            BEGIN
                SET @HoldExpiryTime = DATEADD(minute, 10, GETDATE());
            END

            SET @BookingNo = 'BK-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

            INSERT INTO Tracket_Master_Booking (
                BookingNo, BookingRId, EventId, SlotId, UserId, TotalTickets, TotalAmount, TaxAmount,
                DiscountAmount, FinalAmount, BookingStatus, HoldExpiryTime, BookingDate, IsDeleted,
                CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @BookingNo, @BookingRId, @EventId, @FirstSlotId, @UserId, @TotalTickets, @TotalAmount, @TaxAmount,
                @DiscountAmount, @FinalAmount, @BookingStatus, @HoldExpiryTime, GETDATE(), 0,
                @CreatedBy, GETDATE(), @CreatedFrom
            );

            SET @BookingId = SCOPE_IDENTITY();

            -- Populate Tracket_Master_Booking_Date for each slot
            INSERT INTO Tracket_Master_Booking_Date (BookingId, EventDate, SlotId, IsDeleted, CreatedDate)
            SELECT @BookingId, ES.EventDate, S.SlotId, 0, GETDATE()
            FROM @Slots S
            INNER JOIN Tracket_Master_Event_Slot ES ON S.SlotId = ES.SlotId;

            -- Populate Tracket_Master_Group_Booking if group booking is allowed
            DECLARE @AllowGroupBooking BIT = 0;
            SELECT @AllowGroupBooking = AllowGroupBooking FROM Tracket_Master_Event WHERE EventId = @EventId;
            IF @AllowGroupBooking = 1
            BEGIN
                INSERT INTO Tracket_Master_Group_Booking (BookingId, GroupName, TotalMembers, IsActive, IsDeleted, CreatedBy, CreatedDate)
                VALUES (@BookingId, 'Group Booking', @TotalTickets, 1, 0, @UserId, GETDATE());
            END

            -- Queue Seat Hold Created / Booking Created Notification
            INSERT INTO Tracket_Master_Notification (
                Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
            )
            SELECT 
                NEWID(),
                'BOOKING',
                CAST(SUBSTRING(@BookingRId, 1, 8) + '-' + SUBSTRING(@BookingRId, 9, 4) + '-' + SUBSTRING(@BookingRId, 13, 4) + '-' + SUBSTRING(@BookingRId, 17, 4) + '-' + SUBSTRING(@BookingRId, 21, 12) AS uniqueidentifier),
                U.UniqueScanCode,
                'EMAIL',
                U.EmailId,
                'Booking Created - Ref: ' + @BookingNo,
                'Dear ' + U.Name + ', your booking reference ' + @BookingNo + ' has been created and your seats are held for 10 minutes. Please complete your payment.',
                'QUEUED',
                0,
                GETDATE(),
                1,
                0
            FROM Tracket_Master_User U
            WHERE U.UserId = @UserId;

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, SeatNo, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, SeatNo, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(100) '$.AttendeeName',
                Email NVARCHAR(100) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber',
                SeatNo NVARCHAR(50) '$.SeatNo'
            );

            -- Update seat status and IsBooked in Tracket_Master_Event_Zone_Seat
            UPDATE Tracket_Master_Event_Zone_Seat
            SET IsBooked = CASE WHEN @BookingStatus = 1 THEN 1 ELSE 0 END,
                SeatStatus = CASE WHEN @BookingStatus = 1 THEN 'Booked' ELSE 'Hold' END,
                BookingId = @BookingId
            WHERE EventId = @EventId
              AND ZoneId = @ZoneId
              AND SeatNumber IN (
                  SELECT SeatNo 
                  FROM OPENJSON(@JsonData, '$.Attendees')
                  WITH (SeatNo NVARCHAR(50) '$.SeatNo')
              )
              AND IsDeleted = 0;

            COMMIT TRANSACTION;
            SELECT 201 AS ResultStatus, 'Booking created successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            -- Seat conflict check for modifications (excluding current booking)
            IF EXISTS (
                SELECT 1 
                FROM @Slots S
                INNER JOIN Tracket_Master_Booking_Date BD ON BD.SlotId = S.SlotId
                INNER JOIN Tracket_Master_Booking B ON B.BookingId = BD.BookingId
                INNER JOIN Tracket_Master_Booking_Attendee BA ON B.BookingId = BA.BookingId
                WHERE B.BookingStatus <> 4 
                  AND B.BookingId <> @BookingId
                  AND B.IsDeleted = 0 
                  AND BD.IsDeleted = 0
                  AND BA.IsDeleted = 0
                  AND BA.SeatNo IN (
                      SELECT SeatNo 
                      FROM OPENJSON(@JsonData, '$.Attendees')
                      WITH (SeatNo NVARCHAR(50) '$.SeatNo')
                  )
            )
            BEGIN
                SELECT 400 AS ResultStatus, 'One or more selected seats are already booked.' AS ResultMessage;
                ROLLBACK TRANSACTION;
                RETURN;
            END

            UPDATE Tracket_Master_Booking
            SET 
                BookingRId = @BookingRId,
                SlotId = @FirstSlotId,
                TotalTickets = @TotalTickets, 
                TotalAmount = @TotalAmount,
                TaxAmount = @TaxAmount,
                DiscountAmount = @DiscountAmount,
                FinalAmount = @FinalAmount,
                UpdatedBy = @UpdatedBy,
                UpdatedDate = GETDATE(),
                UpdatedFrom = @UpdatedFrom
            WHERE BookingId = @BookingId;

            -- Reset previous booking dates
            UPDATE Tracket_Master_Booking_Date SET IsDeleted = 1 WHERE BookingId = @BookingId;

            -- Re-insert booking dates
            INSERT INTO Tracket_Master_Booking_Date (BookingId, EventDate, SlotId, IsDeleted, CreatedDate)
            SELECT @BookingId, ES.EventDate, S.SlotId, 0, GETDATE()
            FROM @Slots S
            INNER JOIN Tracket_Master_Event_Slot ES ON S.SlotId = ES.SlotId;

            -- Update group booking
            DECLARE @UpdateAllowGroupBooking BIT = 0;
            SELECT @UpdateAllowGroupBooking = AllowGroupBooking FROM Tracket_Master_Event WHERE EventId = @EventId;
            
            IF @UpdateAllowGroupBooking = 1
            BEGIN
                IF EXISTS (SELECT 1 FROM Tracket_Master_Group_Booking WHERE BookingId = @BookingId)
                BEGIN
                    UPDATE Tracket_Master_Group_Booking
                    SET TotalMembers = @TotalTickets, IsActive = 1, IsDeleted = 0, UpdatedBy = @UserId, UpdatedDate = GETDATE()
                    WHERE BookingId = @BookingId;
                END
                ELSE
                BEGIN
                    INSERT INTO Tracket_Master_Group_Booking (BookingId, GroupName, TotalMembers, IsActive, IsDeleted, CreatedBy, CreatedDate)
                    VALUES (@BookingId, 'Group Booking', @TotalTickets, 1, 0, @UserId, GETDATE());
                END
            END
            ELSE
            BEGIN
                UPDATE Tracket_Master_Group_Booking
                SET IsActive = 0, IsDeleted = 1, UpdatedBy = @UserId, UpdatedDate = GETDATE()
                WHERE BookingId = @BookingId;
            END

            UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;

            -- Reset previous seats for this booking back to available
            UPDATE Tracket_Master_Event_Zone_Seat
            SET IsBooked = 0,
                SeatStatus = 'Available',
                BookingId = NULL
            WHERE BookingId = @BookingId;

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, SeatNo, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, SeatNo, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(100) '$.AttendeeName',
                Email NVARCHAR(100) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber',
                SeatNo NVARCHAR(50) '$.SeatNo'
            );

            -- Update new seat status and IsBooked in Tracket_Master_Event_Zone_Seat
            UPDATE Tracket_Master_Event_Zone_Seat
            SET IsBooked = CASE WHEN @BookingStatus = 1 THEN 1 ELSE 0 END,
                SeatStatus = CASE WHEN @BookingStatus = 1 THEN 'Booked' ELSE 'Hold' END,
                BookingId = @BookingId
            WHERE EventId = @EventId
              AND ZoneId = @ZoneId
              AND SeatNumber IN (
                  SELECT SeatNo 
                  FROM OPENJSON(@JsonData, '$.Attendees')
                  WITH (SeatNo NVARCHAR(50) '$.SeatNo')
              )
              AND IsDeleted = 0;

            COMMIT TRANSACTION;
            SELECT 200 AS ResultStatus, 'Booking updated successfully.' AS ResultMessage;
        END

        SELECT 
            B.BookingId, B.BookingRId, B.BookingNo, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount,
            B.DiscountAmount, B.FinalAmount, B.BookingStatus, B.BookingDate,
            B.CreatedBy, B.CreatedDate, B.CreatedFrom, B.UpdatedBy, B.UpdatedDate, B.UpdatedFrom
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber, SeatNo 
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
            B.BookingId, B.BookingRId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount, B.DiscountAmount, B.FinalAmount, B.BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId AND B.IsDeleted = 0;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber, SeatNo, BookingId 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            B.BookingId, B.BookingRId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount, B.DiscountAmount, B.FinalAmount, B.BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.IsDeleted = 0;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber, SeatNo, BookingId 
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

    DECLARE @BookingId INT, @BookingRId NVARCHAR(50), @Reason NVARCHAR(255);

    SELECT 
        @BookingId = BookingId,
        @BookingRId = BookingRId,
        @Reason = Reason
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        BookingRId NVARCHAR(50) '$.BookingRId',
        Reason NVARCHAR(255) '$.Reason'
    );

    IF @BookingId = 0 AND @BookingRId IS NOT NULL AND @BookingRId <> ''
    BEGIN
        SELECT @BookingId = BookingId 
        FROM Tracket_Master_Booking 
        WHERE BookingRId = @BookingRId AND IsDeleted = 0;
    END

    IF EXISTS (SELECT 1 FROM Tracket_Master_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Booking 
        SET BookingStatus = 4 
        WHERE BookingId = @BookingId;

        -- Update seat status and IsBooked in Tracket_Master_Event_Zone_Seat
        UPDATE Tracket_Master_Event_Zone_Seat
        SET IsBooked = 0,
            SeatStatus = 'Available',
            BookingId = NULL
        WHERE BookingId = @BookingId;

        UPDATE Tracket_Master_Booking_Date
        SET IsDeleted = 1
        WHERE BookingId = @BookingId;

        UPDATE Tracket_Master_Group_Booking
        SET IsActive = 0, IsDeleted = 1
        WHERE BookingId = @BookingId;

        -- Queue Booking Cancelled Notification
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'BOOKING',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Booking Cancelled - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', your booking reference ' + B.BookingNo + ' has been cancelled, and the held seats have been released.',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;

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

    -- Self-clean: sweep expired holds before checking availability
    EXEC USP_SweepExpiredHolds;

    DECLARE @Capacity INT, @Booked INT;
    SELECT @Capacity = Capacity FROM Tracket_Master_Event_Slot WHERE SlotId = @SlotId AND IsDeleted = 0;
    
    SELECT @Booked = ISNULL(SUM(B.TotalTickets), 0) 
    FROM Tracket_Master_Booking B
    INNER JOIN Tracket_Master_Booking_Date BD ON B.BookingId = BD.BookingId
    WHERE BD.SlotId = @SlotId 
      AND B.IsDeleted = 0 
      AND BD.IsDeleted = 0
      AND (
          B.BookingStatus = 1 -- Confirmed
          OR (B.BookingStatus = 0 AND B.HoldExpiryTime > GETDATE()) -- Active Hold
      );

    SELECT 
        @EventId AS EventId,
        @SlotId AS SlotId,
        ISNULL(@Capacity, 0) AS TotalCapacity,
        ISNULL(@Booked, 0) AS BookedSeats,
        (ISNULL(@Capacity, 0) - ISNULL(@Booked, 0)) AS AvailableSeats;

    SELECT DISTINCT BA.SeatNo 
    FROM Tracket_Master_Booking B
    INNER JOIN Tracket_Master_Booking_Date BD ON B.BookingId = BD.BookingId
    INNER JOIN Tracket_Master_Booking_Attendee BA ON B.BookingId = BA.BookingId
    WHERE BD.SlotId = @SlotId 
      AND B.IsDeleted = 0 
      AND BD.IsDeleted = 0
      AND BA.IsDeleted = 0 
      AND (
          B.BookingStatus = 1 -- Confirmed / Success
          OR (B.BookingStatus = 0 AND B.HoldExpiryTime > GETDATE()) -- Active Hold
      )
      AND BA.SeatNo IS NOT NULL 
      AND BA.SeatNo <> '';
END;
GO

-- 5. USP_SweepExpiredHolds
CREATE OR ALTER PROCEDURE USP_SweepExpiredHolds
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Get expired bookings
        DECLARE @ExpiredBookings TABLE (BookingId INT, BookingRId NVARCHAR(50), BookingNo NVARCHAR(50), UserId INT);
        
        INSERT INTO @ExpiredBookings (BookingId, BookingRId, BookingNo, UserId)
        SELECT BookingId, BookingRId, BookingNo, UserId
        FROM Tracket_Master_Booking
        WHERE BookingStatus = 0 AND HoldExpiryTime < GETDATE() AND IsDeleted = 0;
        
        IF EXISTS (SELECT 1 FROM @ExpiredBookings)
        BEGIN
            -- Release seat holds in Event Zone Seat
            UPDATE ZS
            SET ZS.IsBooked = 0,
                ZS.SeatStatus = 'Available',
                ZS.BookingId = NULL
            FROM Tracket_Master_Event_Zone_Seat ZS
            INNER JOIN @ExpiredBookings EB ON ZS.BookingId = EB.BookingId;
            
            -- Update booking status to Cancelled (4 = Cancelled / Expired)
            UPDATE B
            SET B.BookingStatus = 4,
                B.UpdatedDate = GETDATE(),
                B.UpdatedFrom = 'Sweeper Job'
            FROM Tracket_Master_Booking B
            INNER JOIN @ExpiredBookings EB ON B.BookingId = EB.BookingId;
            
            UPDATE BD
            SET BD.IsDeleted = 1
            FROM Tracket_Master_Booking_Date BD
            INNER JOIN @ExpiredBookings EB ON BD.BookingId = EB.BookingId;

            UPDATE GB
            SET GB.IsActive = 0, GB.IsDeleted = 1
            FROM Tracket_Master_Group_Booking GB
            INNER JOIN @ExpiredBookings EB ON GB.BookingId = EB.BookingId;
            
            -- Queue Seat Hold Expired notifications
            INSERT INTO Tracket_Master_Notification (
                Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
            )
            SELECT 
                NEWID(),
                'BOOKING',
                CAST(SUBSTRING(EB.BookingRId, 1, 8) + '-' + SUBSTRING(EB.BookingRId, 9, 4) + '-' + SUBSTRING(EB.BookingRId, 13, 4) + '-' + SUBSTRING(EB.BookingRId, 17, 4) + '-' + SUBSTRING(EB.BookingRId, 21, 12) AS uniqueidentifier),
                U.UniqueScanCode,
                'EMAIL',
                U.EmailId,
                'Seat Hold Expired - Ref: ' + EB.BookingNo,
                'Dear ' + U.Name + ', your 10-minute seat hold for booking reference ' + EB.BookingNo + ' has expired. The seats have been released back to general availability.',
                'QUEUED',
                0,
                GETDATE(),
                1,
                0
            FROM @ExpiredBookings EB
            INNER JOIN Tracket_Master_User U ON EB.UserId = U.UserId;
        END
        
        COMMIT TRANSACTION;
        SELECT 200 AS ResultStatus, 'Expired holds swept successfully.' AS ResultMessage;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

