
-- 9. USP_CreateUpdateAdvancedBooking
ALTER   PROCEDURE [dbo].[USP_CreateUpdateAdvancedBooking]
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId BIGINT, @BookingRId NVARCHAR(50), @EventId BIGINT, @UserId BIGINT, 
                @TotalTickets INT, @TotalAmount DECIMAL(18,2), @DiscountAmount DECIMAL(18,2),
                @BookingStatus INT, @IsGroupBooking BIT, @GroupName NVARCHAR(200),
                @CreatedBy NVARCHAR(200), @CreatedFrom NVARCHAR(100);

        SELECT 
            @BookingId = BookingId,
            @BookingRId = BookingRId,
            @EventId = EventId,
            @UserId = UserId,
            @TotalTickets = TotalTickets,
            @TotalAmount = TotalAmount,
            @DiscountAmount = ISNULL(DiscountAmount, 0.00),
            @BookingStatus = ISNULL(BookingStatus, 0),
            @IsGroupBooking = ISNULL(IsGroupBooking, 0),
            @GroupName = GroupName,
            @CreatedBy = CreatedBy,
            @CreatedFrom = CreatedFrom
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId BIGINT '$.BookingId',
            BookingRId NVARCHAR(50) '$.BookingRId',
            EventId BIGINT '$.EventId',
            UserId BIGINT '$.UserId',
            TotalTickets INT '$.TotalTickets',
            TotalAmount DECIMAL(18,2) '$.TotalAmount',
            DiscountAmount DECIMAL(18,2) '$.DiscountAmount',
            BookingStatus INT '$.BookingStatus',
            IsGroupBooking BIT '$.IsGroupBooking',
            GroupName NVARCHAR(200) '$.GroupName',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom'
        );

        -- Validate booking limits
        DECLARE @ValidationStatus INT, @ValidationMsg NVARCHAR(MAX);
        CREATE TABLE #ValResult (ValStatus INT, ValMsg NVARCHAR(MAX));
        
        INSERT INTO #ValResult
        EXEC USP_ValidateBookingLimit @EventId, @UserId, @TotalTickets;
        
        SELECT @ValidationStatus = ValStatus, @ValidationMsg = ValMsg FROM #ValResult;
        DROP TABLE #ValResult;

        IF @ValidationStatus <> 200
        BEGIN
            SELECT @ValidationStatus AS ResultStatus, @ValidationMsg AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Handle single API Add/Edit
        IF @BookingId = 0 AND @BookingRId IS NOT NULL AND @BookingRId <> ''
        BEGIN
            SELECT @BookingId = BookingId 
            FROM Tracket_Master_Booking 
            WHERE BookingRId = @BookingRId AND IsDeleted = 0;
        END

        SET @BookingRId = ISNULL(NULLIF(@BookingRId, ''), LOWER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')));

        -- Calculate tax dynamically
        DECLARE @TaxPercentage DECIMAL(18,2) = 0.00, @TaxAmount DECIMAL(18,2) = 0.00, @FinalAmount DECIMAL(18,2) = 0.00;
        SELECT @TaxPercentage = ISNULL(SUM(TaxPercentage), 0.00) FROM Tracket_Master_Tax WHERE IsActive = 1 AND IsDeleted = 0;
        SET @TaxAmount = @TotalAmount * (@TaxPercentage / 100.0);
        SET @FinalAmount = @TotalAmount + @TaxAmount - @DiscountAmount;

        DECLARE @BookingNo NVARCHAR(100);
        DECLARE @SeatLockMinutes INT = 10;
        SELECT @SeatLockMinutes = ISNULL(SeatLockMinutes, 10) FROM Tracket_Master_Event WHERE EventId = @EventId;

        -- Create or update base Booking
        IF @BookingId IS NULL OR @BookingId = 0
        BEGIN
            SET @BookingNo = 'BK-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

            INSERT INTO Tracket_Master_Booking (
                BookingNo, BookingRId, EventId, SlotId, UserId, TotalTickets, TotalAmount, TaxAmount,
                DiscountAmount, FinalAmount, BookingStatus, HoldExpiryTime, BookingDate, IsDeleted,
                CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @BookingNo, @BookingRId, @EventId, 
                ISNULL((SELECT TOP 1 SlotId FROM OPENJSON(@JsonData, '$.BookingDates') WITH (SlotId BIGINT '$.SlotId')), 0),
                @UserId, @TotalTickets, @TotalAmount, @TaxAmount, @DiscountAmount, @FinalAmount, @BookingStatus,
                DATEADD(minute, @SeatLockMinutes, GETDATE()), GETDATE(), 0,
                @CreatedBy, GETDATE(), @CreatedFrom
            );

            SET @BookingId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            SELECT @BookingNo = BookingNo FROM Tracket_Master_Booking WHERE BookingId = @BookingId;

            UPDATE Tracket_Master_Booking
            SET 
                TotalTickets = @TotalTickets,
                TotalAmount = @TotalAmount,
                TaxAmount = @TaxAmount,
                DiscountAmount = @DiscountAmount,
                FinalAmount = @FinalAmount,
                BookingStatus = @BookingStatus,
                HoldExpiryTime = CASE WHEN @BookingStatus = 0 THEN DATEADD(minute, @SeatLockMinutes, GETDATE()) ELSE NULL END,
                UpdatedBy = @CreatedBy,
                UpdatedDate = GETDATE(),
                UpdatedFrom = @CreatedFrom
            WHERE BookingId = @BookingId;

            -- Cleanup child tables for rebuild
            UPDATE Tracket_Master_Booking_Date SET IsDeleted = 1 WHERE BookingId = @BookingId;
            UPDATE Tracket_Master_Booking_Seat SET IsDeleted = 1 WHERE BookingId = @BookingId;
            UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;
            UPDATE Tracket_Master_Group_Booking SET IsDeleted = 1 WHERE BookingId = @BookingId;
        END

        -- Insert Group Booking details if applicable
        IF @IsGroupBooking = 1
        BEGIN
            INSERT INTO Tracket_Master_Group_Booking (BookingId, GroupName, TotalMembers, IsActive, IsDeleted, CreatedBy, CreatedDate)
            VALUES (@BookingId, @GroupName, @TotalTickets, 1, 0, @CreatedBy, GETDATE());
        END

        -- Rebuild Booking Dates and Seats
        -- Temp Table to process dates and seats
        CREATE TABLE #TempDates (TempDateId INT IDENTITY(1,1), SlotId BIGINT, EventDate DATE);
        INSERT INTO #TempDates (SlotId, EventDate)
        SELECT SlotId, EventDate
        FROM OPENJSON(@JsonData, '$.BookingDates')
        WITH (
            SlotId BIGINT '$.SlotId',
            EventDate DATE '$.EventDate'
        );

        DECLARE @DateIdx INT = 1, @MaxDateIdx INT;
        SELECT @MaxDateIdx = MAX(TempDateId) FROM #TempDates;

        WHILE @DateIdx <= @MaxDateIdx
        BEGIN
            DECLARE @SlotIdLoop BIGINT, @EventDateLoop DATE, @BookingDateIdLoop BIGINT;
            SELECT @SlotIdLoop = SlotId, @EventDateLoop = EventDate FROM #TempDates WHERE TempDateId = @DateIdx;

            -- Create Booking Date
            INSERT INTO Tracket_Master_Booking_Date (BookingId, EventDate, SlotId, IsDeleted)
            VALUES (@BookingId, @EventDateLoop, @SlotIdLoop, 0);
            SET @BookingDateIdLoop = SCOPE_IDENTITY();

            -- Create seats and attendees for this date
            INSERT INTO Tracket_Master_Booking_Seat (BookingId, BookingDateId, SeatId, ZoneId, LockedTill, IsConfirmed, IsDeleted)
            SELECT 
                @BookingId,
                @BookingDateIdLoop,
                A.SeatId,
                A.ZoneId,
                CASE WHEN @BookingStatus = 1 THEN NULL ELSE DATEADD(minute, @SeatLockMinutes, GETDATE()) END,
                CASE WHEN @BookingStatus = 1 THEN 1 ELSE 0 END,
                0
            FROM OPENJSON(@JsonData)
            WITH (
                BookingDates NVARCHAR(MAX) AS JSON
            )
            CROSS APPLY OPENJSON(BookingDates)
            WITH (
                SlotId BIGINT '$.SlotId',
                EventDate DATE '$.EventDate',
                Attendees NVARCHAR(MAX) AS JSON
            ) AD
            CROSS APPLY OPENJSON(AD.Attendees)
            WITH (
                SeatId BIGINT '$.SeatId',
                ZoneId BIGINT '$.ZoneId'
            ) A
            WHERE AD.SlotId = @SlotIdLoop AND AD.EventDate = @EventDateLoop;

            -- Create Attendees referencing the booking date
            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, SeatNo, BookingDateId, SeatId, ZoneId, AttendeeType, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
            SELECT 
                @BookingId,
                A.AttendeeName,
                A.Email,
                A.PhoneNumber,
                A.SeatNo,
                @BookingDateIdLoop,
                A.SeatId,
                A.ZoneId,
                A.AttendeeType,
                0,
                @CreatedBy,
                GETDATE(),
                @CreatedFrom
            FROM OPENJSON(@JsonData)
            WITH (
                BookingDates NVARCHAR(MAX) AS JSON
            )
            CROSS APPLY OPENJSON(BookingDates)
            WITH (
                SlotId BIGINT '$.SlotId',
                EventDate DATE '$.EventDate',
                Attendees NVARCHAR(MAX) AS JSON
            ) AD
            CROSS APPLY OPENJSON(AD.Attendees)
            WITH (
                AttendeeName NVARCHAR(100) '$.AttendeeName',
                Email NVARCHAR(100) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber',
                SeatId BIGINT '$.SeatId',
                SeatNo NVARCHAR(50) '$.SeatNo',
                ZoneId BIGINT '$.ZoneId',
                AttendeeType NVARCHAR(50) '$.AttendeeType'
            ) A
            WHERE AD.SlotId = @SlotIdLoop AND AD.EventDate = @EventDateLoop;

            SET @DateIdx = @DateIdx + 1;
        END

        DROP TABLE #TempDates;

        -- Queue seat lock notifications for temporary holds
        IF @BookingStatus = 0
        BEGIN
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
                'Booking Hold Created - Ref: ' + @BookingNo,
                'Dear ' + U.Name + ', your seats are locked for ' + CAST(@SeatLockMinutes AS VARCHAR) + ' minutes. Please complete payment to confirm your booking.',
                'QUEUED',
                0,
                GETDATE(),
                1,
                0
            FROM Tracket_Master_User U
            WHERE U.UserId = @UserId;
        END

        COMMIT TRANSACTION;
        SELECT CASE WHEN @BookingStatus = 1 THEN 201 ELSE 200 END AS ResultStatus, 'Booking processed successfully.' AS ResultMessage;

        -- Output booking overview
        SELECT 
            B.BookingId, B.BookingRId, B.BookingNo, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount,
            B.DiscountAmount, B.FinalAmount, B.BookingStatus, B.BookingDate, B.HoldExpiryTime
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;

