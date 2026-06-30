$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

# 1. Update USP_CreateUpdateBooking Stored Procedure
$spSql = @"
ALTER PROCEDURE [dbo].[USP_CreateUpdateBooking]
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Existing core parameters
        DECLARE @BookingId INT, @EventId INT, @SlotId INT, @ZoneId INT, @UserId INT, @TotalTickets INT, 
                @BookingStatus INT, @PaymentStatus INT, @HoldExpiryTime DATETIME,
                @BookingNo NVARCHAR(50), @BookingRId NVARCHAR(50),
                @CreatedBy NVARCHAR(200), @CreatedFrom NVARCHAR(100), @UpdatedBy NVARCHAR(200), @UpdatedFrom NVARCHAR(100);
        
        -- New Flow Architecture relational references
        DECLARE @BookingTypeId INT, @TicketTypeId INT, @PassTypeId INT, @PromoCodeId INT, @AddOnIds NVARCHAR(MAX);
        
        -- Dynamic financial calculation variables
        DECLARE @BaseTicketAmount DECIMAL(18,2) = 0.00,
                @AddOnTotalAmount DECIMAL(18,2) = 0.00,
                @GrossSubtotal DECIMAL(18,2) = 0.00,
                @DiscountAmount DECIMAL(18,2) = 0.00,
                @TaxAmount DECIMAL(18,2) = 0.00,
                @FeeAmount DECIMAL(18,2) = 0.00,
                @FinalAmount DECIMAL(18,2) = 0.00;

        -- 1. EXTRACT PROPERTY ROOT PATH FROM JSON DATA
        SELECT 
            @BookingId = BookingId,
            @BookingRId = BookingRId,
            @EventId = EventId,
            @SlotId = SlotId,
            @ZoneId = ZoneId,
            @UserId = UserId,
            @TotalTickets = TotalTickets,
            @BookingStatus = ISNULL(BookingStatus, 0),
            @PaymentStatus = ISNULL(PaymentStatus, 0),
            @BookingTypeId = BookingTypeId,
            @TicketTypeId = NULLIF(TicketTypeId, 0),
            @PassTypeId = NULLIF(PassTypeId, 0),
            @PromoCodeId = NULLIF(PromoCodeId, 0),
            @AddOnIds = AddOnIds,
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
            BookingStatus INT '$.BookingStatus',
            PaymentStatus INT '$.PaymentStatus',
            BookingTypeId INT '$.BookingTypeId',
            TicketTypeId INT '$.TicketTypeId',
            PassTypeId INT '$.PassTypeId',
            PromoCodeId INT '$.PromoCodeId',
            AddOnIds NVARCHAR(MAX) '$.AddOnIds',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom',
            UpdatedBy NVARCHAR(200) '$.UpdatedBy',
            UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
        );

        -- Extract selected slot tables safely
        DECLARE @Slots TABLE (SlotId INT);
        INSERT INTO @Slots (SlotId)
        SELECT value FROM OPENJSON(@JsonData, '$.SelectedSlotIds') WITH (value INT '$');

        IF NOT EXISTS (SELECT 1 FROM @Slots)
        BEGIN
            INSERT INTO @Slots (SlotId) VALUES (@SlotId);
        END

        DECLARE @FirstSlotId INT;
        SELECT TOP 1 @FirstSlotId = SlotId FROM @Slots;

        -- 2. SECURE SERVER-SIDE BASE RATE & ADD-ON CALCULATIONS
        
        -- If Booking Type is a Ticket (1)
        IF @BookingTypeId = 1 AND @TicketTypeId IS NOT NULL 
        BEGIN
            SELECT @BaseTicketAmount = ISNULL(Price, 0.00) * @TotalTickets 
            FROM [EVENT_Master].[dbo].[Tracket_Master_Event_Ticket]
            WHERE TicketId = @TicketTypeId AND IsDeleted = 0; 
        END
        -- If Booking Type is a Pass (2)
        ELSE IF @BookingTypeId = 2
        BEGIN
            SELECT @BaseTicketAmount = ISNULL(TicketPrice, 0.00) * @TotalTickets
            FROM [EVENT_Master].[dbo].[Tracket_Master_Event_Slot]
            WHERE SlotId = @FirstSlotId AND IsDeleted = 0;
        END

        -- Optional placeholder for specific layout pricing structures
        DECLARE @ZonePremium DECIMAL(18,2) = 0.00;

        -- Flatten JSON array mapping for AddOn item processing
        DECLARE @SelectedAddOns TABLE (AddOnId INT);
        INSERT INTO @SelectedAddOns (AddOnId)
        SELECT value FROM OPENJSON(@JsonData, '$.AddOnIds') WITH (value INT '$');

        SELECT @AddOnTotalAmount = ISNULL(SUM(Price), 0.00)
        FROM [EVENT_Master].[dbo].[Tracket_Master_Event_AddOn]
        WHERE AddOnId IN (SELECT AddOnId FROM @SelectedAddOns) AND IsActive = 1 AND IsDeleted = 0;

        -- Compile Initial Subtotal Base Matrix
        SET @GrossSubtotal = @BaseTicketAmount + @ZonePremium + @AddOnTotalAmount;

        -- 3. VALIDATE PROMO ENGINE RULES
        IF @PromoCodeId IS NOT NULL
        BEGIN
            DECLARE @DiscountValue DECIMAL(18,2), @DiscountTypeId INT, @MaxDiscount DECIMAL(18,2);
            SELECT 
                @DiscountValue = DiscountValue, 
                @DiscountTypeId = DiscountTypeId,
                @MaxDiscount = MaxDiscountAmount
            FROM [EVENT_Master].[dbo].[Tracket_Master_Event_PromoCode]
            WHERE PromoCodeId = @PromoCodeId AND IsActive = 1 AND IsDeleted = 0;

            IF @DiscountTypeId = 1 -- Fixed Standard Currency Drop
            BEGIN
                SET @DiscountAmount = @DiscountValue;
            END
            ELSE IF @DiscountTypeId = 2 -- Dynamic Percentage Scale Drop
            BEGIN
                SET @DiscountAmount = @GrossSubtotal * (@DiscountValue / 100.0);
                IF @MaxDiscount > 0 AND @DiscountAmount > @MaxDiscount SET @DiscountAmount = @MaxDiscount;
            END
        END

        -- 4. PROCESS EVENT FEES AND TAX CONSTRAINTS
        SELECT @FeeAmount = ISNULL(SUM(CASE 
            WHEN FeeTypeId = 1 THEN Amount 
            WHEN FeeTypeId = 2 THEN (@GrossSubtotal - @DiscountAmount) * (Amount / 100.0) 
            ELSE 0.00 END), 0.00)
        FROM [EVENT_Master].[dbo].[Tracket_Master_Event_Fee]
        WHERE EventId = @EventId AND IsActive = 1 AND IsDeleted = 0 AND IsIncludedInPrice = 0;

        DECLARE @TaxPercentage DECIMAL(18,2) = 0.00;
        SELECT @TaxPercentage = ISNULL(SUM(MT.TaxPercentage), 0.00) 
        FROM [EVENT_Master].[dbo].[Tracket_Master_Event_Tax] ET
        INNER JOIN Tracket_Master_Tax MT ON ET.TaxId = MT.TaxId
        WHERE ET.EventId = @EventId AND ET.IsActive = 1 AND ET.IsDeleted = 0 AND ET.IsIncludedInPrice = 0;

        SET @TaxAmount = (@GrossSubtotal - @DiscountAmount) * (@TaxPercentage / 100.0);

        -- Apply Final Total Aggregations
        SET @FinalAmount = (@GrossSubtotal - @DiscountAmount) + @TaxAmount + @FeeAmount;

        -- 5. CAPACITY CONFLICT ASSURANCES
        IF EXISTS (
            SELECT 1 FROM @Slots S
            CROSS APPLY (
                SELECT Capacity,
                       (SELECT ISNULL(SUM(B.TotalTickets), 0) FROM Tracket_Master_Booking B 
                        INNER JOIN Tracket_Master_Booking_Date BD ON B.BookingId = BD.BookingId
                        WHERE BD.SlotId = S.SlotId AND BD.IsDeleted = 0 AND B.BookingStatus <> 4 AND B.IsDeleted = 0) AS Booked
                FROM Tracket_Master_Event_Slot WHERE SlotId = S.SlotId AND IsDeleted = 0
            ) C WHERE (C.Capacity - C.Booked) < @TotalTickets
        )
        BEGIN
            SELECT 400 AS ResultStatus, 'Insufficient ticket capacity available for selected criteria.' AS ResultMessage;
            ROLLBACK TRANSACTION; RETURN;
        END

        SET @BookingRId = ISNULL(NULLIF(@BookingRId, ''), LOWER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')));

        -- 6. PERFORM SAVE OPERATIONS
        IF @BookingId IS NULL OR @BookingId = 0
        BEGIN
            SET @BookingNo = 'BK-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));
            IF @BookingStatus = 0 SET @HoldExpiryTime = DATEADD(minute, 10, GETDATE());

            INSERT INTO Tracket_Master_Booking (
                BookingNo, EventId, SlotId, UserId, TotalTickets, TotalAmount, TaxAmount, DiscountAmount, FinalAmount,
                BookingStatus, PaymentStatus, BookingDate, HoldExpiryTime, IsDeleted, BookingRId, BookingTypeId, 
                TicketTypeId, PassTypeId, PromoCodeId, AddOnIds, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @BookingNo, @EventId, @FirstSlotId, @UserId, @TotalTickets, @GrossSubtotal, @TaxAmount, @DiscountAmount, @FinalAmount,
                @BookingStatus, @PaymentStatus, GETDATE(), @HoldExpiryTime, 0, @BookingRId, @BookingTypeId,
                @TicketTypeId, @PassTypeId, @PromoCodeId, @AddOnIds, @CreatedBy, GETDATE(), @CreatedFrom
            );

            SET @BookingId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE Tracket_Master_Booking
            SET 
                TotalTickets = @TotalTickets, TotalAmount = @GrossSubtotal, TaxAmount = @TaxAmount, 
                DiscountAmount = @DiscountAmount, FinalAmount = @FinalAmount, BookingStatus = @BookingStatus, 
                PaymentStatus = @PaymentStatus, BookingTypeId = @BookingTypeId, TicketTypeId = @TicketTypeId, 
                PassTypeId = @PassTypeId, PromoCodeId = @PromoCodeId, AddOnIds = @AddOnIds,
                UpdatedBy = @UpdatedBy, UpdatedDate = GETDATE(), UpdatedFrom = @UpdatedFrom
            WHERE BookingId = @BookingId;
        END

        -- 7. CLEAN & UPDATE RELATIONAL SEAT MAPS AND ATTENDEES
        UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;
        
        INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, SeatNo, IsDeleted)
        SELECT @BookingId, AttendeeName, Email, PhoneNumber, SeatNo, 0
        FROM OPENJSON(@JsonData, '$.Attendees')
        WITH (
            AttendeeName NVARCHAR(100) '$.AttendeeName',
            Email NVARCHAR(100) '$.Email',
            PhoneNumber NVARCHAR(20) '$.PhoneNumber',
            SeatNo NVARCHAR(50) '$.SeatNo'
        );

        -- Sync Physical seat tracking layouts
        UPDATE Tracket_Master_Event_Zone_Seat
        SET IsBooked = CASE WHEN @BookingStatus = 1 THEN 1 ELSE 0 END,
            SeatStatus = CASE WHEN @BookingStatus = 1 THEN 'Booked' ELSE 'Hold' END,
            BookingId = @BookingId
        WHERE EventId = @EventId AND ZoneId = @ZoneId
          AND SeatNumber IN (
              SELECT SeatNo FROM OPENJSON(@JsonData, '$.Attendees') WITH (SeatNo NVARCHAR(50) '$.SeatNo')
          ) AND IsDeleted = 0;

        COMMIT TRANSACTION;

        -- Result Set 1: Status
        SELECT 200 AS ResultStatus, 'Booking compiled successfully.' AS ResultMessage;

        -- Result Set 2: Booking data (mapped to BookingResponse)
        SELECT
            B.BookingId,
            B.BookingRId,
            B.BookingNo AS BookingReference,
            B.EventId,
            E.EventName,
            B.SlotId,
            B.UserId,
            B.TotalTickets,
            B.TotalAmount,
            CAST(B.BookingStatus AS NVARCHAR(50)) AS BookingStatus,
            B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        -- Result Set 3: Attendees (mapped to AttendeeResponse)
        SELECT
            A.AttendeeId,
            A.BookingId,
            A.FullName AS AttendeeName,
            A.Email,
            A.MobileNo AS PhoneNumber,
            A.SeatNo
        FROM Tracket_Master_Booking_Attendee A
        WHERE A.BookingId = @BookingId AND A.IsDeleted = 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
"@

$cmd.CommandText = $spSql
$cmd.ExecuteNonQuery()
Write-Output "Successfully updated stored procedure USP_CreateUpdateBooking."

# 2. Fix the DB Trigger TR_Tracket_Master_Booking_Date_Insert
$triggerSql = @"
ALTER TRIGGER [dbo].[TR_Tracket_Master_Booking_Date_Insert]
ON [dbo].[Tracket_Master_Booking]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[Tracket_Master_Booking_Date] (BookingId, EventDate, SlotId, IsDeleted, CreatedDate)
    SELECT 
        i.BookingId,
        CAST(s.StartDate AS DATE),
        i.SlotId,
        0,
        GETDATE()
    FROM inserted i
    INNER JOIN [dbo].[Tracket_Master_Event_Slot] s ON i.SlotId = s.SlotId;
END;
"@

$cmd.CommandText = $triggerSql
$cmd.ExecuteNonQuery()
Write-Output "Successfully updated database trigger TR_Tracket_Master_Booking_Date_Insert."

$conn.Close()
