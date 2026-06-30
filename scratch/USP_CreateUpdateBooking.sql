CREATE PROCEDURE [dbo].[USP_CreateUpdateBooking]
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
            @BookingId = ISNULL(BookingId_P, BookingId_C),
            @BookingRId = ISNULL(BookingRId_P, BookingRId_C),
            @EventId = ISNULL(EventId_P, EventId_C),
            @SlotId = ISNULL(SlotId_P, SlotId_C),
            @ZoneId = ISNULL(ZoneId_P, ZoneId_C),
            @UserId = ISNULL(UserId_P, UserId_C),
            @TotalTickets = ISNULL(TotalTickets_P, TotalTickets_C),
            @BookingStatus = ISNULL(ISNULL(BookingStatus_P, BookingStatus_C), 0),
            @PaymentStatus = ISNULL(ISNULL(PaymentStatus_P, PaymentStatus_C), 0),
            @BookingTypeId = ISNULL(BookingTypeId_P, BookingTypeId_C),
            @TicketTypeId = NULLIF(ISNULL(TicketTypeId_P, TicketTypeId_C), 0),
            @PassTypeId = NULLIF(ISNULL(PassTypeId_P, PassTypeId_C), 0),
            @PromoCodeId = NULLIF(ISNULL(PromoCodeId_P, PromoCodeId_C), 0),
            @AddOnIds = ISNULL(AddOnIds_P, AddOnIds_C),
            @CreatedBy = ISNULL(CreatedBy_P, CreatedBy_C),
            @CreatedFrom = ISNULL(CreatedFrom_P, CreatedFrom_C),
            @UpdatedBy = ISNULL(UpdatedBy_P, UpdatedBy_C),
            @UpdatedFrom = ISNULL(UpdatedFrom_P, UpdatedFrom_C)
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId_P INT '$.BookingId',
            BookingId_C INT '$.bookingId',
            BookingRId_P NVARCHAR(50) '$.BookingRId',
            BookingRId_C NVARCHAR(50) '$.bookingRId',
            EventId_P INT '$.EventId',
            EventId_C INT '$.eventId',
            SlotId_P INT '$.SlotId',
            SlotId_C INT '$.slotId',
            ZoneId_P INT '$.ZoneId',
            ZoneId_C INT '$.zoneId',
            UserId_P INT '$.UserId',
            UserId_C INT '$.userId',
            TotalTickets_P INT '$.TotalTickets',
            TotalTickets_C INT '$.totalTickets',
            BookingStatus_P INT '$.BookingStatus',
            BookingStatus_C INT '$.bookingStatus',
            PaymentStatus_P INT '$.PaymentStatus',
            PaymentStatus_C INT '$.paymentStatus',
            BookingTypeId_P INT '$.BookingTypeId',
            BookingTypeId_C INT '$.bookingTypeId',
            TicketTypeId_P INT '$.TicketTypeId',
            TicketTypeId_C INT '$.ticketTypeId',
            PassTypeId_P INT '$.PassTypeId',
            PassTypeId_C INT '$.passTypeId',
            PromoCodeId_P INT '$.PromoCodeId',
            PromoCodeId_C INT '$.promoCodeId',
            AddOnIds_P NVARCHAR(MAX) '$.AddOnIds' AS JSON,
            AddOnIds_C NVARCHAR(MAX) '$.addOnIds' AS JSON,
            CreatedBy_P NVARCHAR(200) '$.CreatedBy',
            CreatedBy_C NVARCHAR(200) '$.createdBy',
            CreatedFrom_P NVARCHAR(100) '$.CreatedFrom',
            CreatedFrom_C NVARCHAR(100) '$.createdFrom',
            UpdatedBy_P NVARCHAR(200) '$.UpdatedBy',
            UpdatedBy_C NVARCHAR(200) '$.updatedBy',
            UpdatedFrom_P NVARCHAR(100) '$.UpdatedFrom',
            UpdatedFrom_C NVARCHAR(100) '$.updatedFrom'
        );

        -- Extract selected slot tables safely
        DECLARE @Slots TABLE (SlotId INT);
        INSERT INTO @Slots (SlotId)
        SELECT value FROM OPENJSON(@JsonData, '$.SelectedSlotIds') WITH (value INT '$')
        UNION
        SELECT value FROM OPENJSON(@JsonData, '$.selectedSlotIds') WITH (value INT '$');

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
        SELECT value FROM OPENJSON(@JsonData, '$.AddOnIds') WITH (value INT '$')
        UNION
        SELECT value FROM OPENJSON(@JsonData, '$.addOnIds') WITH (value INT '$');

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
        FROM (
            SELECT 
                ISNULL(AttendeeName_P, AttendeeName_C) AS AttendeeName,
                ISNULL(Email_P, Email_C) AS Email,
                ISNULL(PhoneNumber_P, PhoneNumber_C) AS PhoneNumber,
                ISNULL(SeatNo_P, SeatNo_C) AS SeatNo
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName_P NVARCHAR(100) '$.AttendeeName',
                AttendeeName_C NVARCHAR(100) '$.attendeeName',
                Email_P NVARCHAR(100) '$.Email',
                Email_C NVARCHAR(100) '$.email',
                PhoneNumber_P NVARCHAR(20) '$.PhoneNumber',
                PhoneNumber_C NVARCHAR(20) '$.phoneNumber',
                SeatNo_P NVARCHAR(50) '$.SeatNo',
                SeatNo_C NVARCHAR(50) '$.seatNo'
            )
            UNION ALL
            SELECT 
                ISNULL(AttendeeName_P, AttendeeName_C) AS AttendeeName,
                ISNULL(Email_P, Email_C) AS Email,
                ISNULL(PhoneNumber_P, PhoneNumber_C) AS PhoneNumber,
                ISNULL(SeatNo_P, SeatNo_C) AS SeatNo
            FROM OPENJSON(@JsonData, '$.attendees')
            WITH (
                AttendeeName_P NVARCHAR(100) '$.AttendeeName',
                AttendeeName_C NVARCHAR(100) '$.attendeeName',
                Email_P NVARCHAR(100) '$.Email',
                Email_C NVARCHAR(100) '$.email',
                PhoneNumber_P NVARCHAR(20) '$.PhoneNumber',
                PhoneNumber_C NVARCHAR(20) '$.phoneNumber',
                SeatNo_P NVARCHAR(50) '$.SeatNo',
                SeatNo_C NVARCHAR(50) '$.seatNo'
            )
        ) A
        WHERE SeatNo IS NOT NULL AND SeatNo <> '';

        -- Sync Physical seat tracking layouts
        UPDATE Tracket_Master_Event_Zone_Seat
        SET IsBooked = CASE WHEN @BookingStatus = 1 THEN 1 ELSE 0 END,
            SeatStatus = CASE WHEN @BookingStatus = 1 THEN 'Booked' ELSE 'Hold' END,
            BookingId = @BookingId
        WHERE EventId = @EventId AND ZoneId = @ZoneId
          AND SeatNumber IN (
              SELECT ISNULL(SeatNo_P, SeatNo_C)
              FROM OPENJSON(@JsonData, '$.Attendees')
              WITH (
                  SeatNo_P NVARCHAR(50) '$.SeatNo',
                  SeatNo_C NVARCHAR(50) '$.seatNo'
              )
              UNION
              SELECT ISNULL(SeatNo_P, SeatNo_C)
              FROM OPENJSON(@JsonData, '$.attendees')
              WITH (
                  SeatNo_P NVARCHAR(50) '$.SeatNo',
                  SeatNo_C NVARCHAR(50) '$.seatNo'
              )
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
            ISNULL(V_Status.Description, CAST(B.BookingStatus AS NVARCHAR(50))) AS BookingStatus,
            B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Status ON V_Status.CategoryId = (
            SELECT CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'BOOKING_STATUS'
        ) AND V_Status.AdditionalField = CAST(B.BookingStatus AS NVARCHAR(50))
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


