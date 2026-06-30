
-- 5. USP_AddPayment
ALTER PROCEDURE USP_AddPayment
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @TransactionReference NVARCHAR(100), @Amount DECIMAL(18,2), @PaymentMode NVARCHAR(50),
                @PaymentReference NVARCHAR(50), @PaymentId INT, @CreatedByUser NVARCHAR(200);

        SELECT 
            @BookingId = COALESCE(BookingId, bookingId),
            @TransactionReference = COALESCE(TransactionReference, transactionReference),
            @Amount = COALESCE(Amount, amount),
            @PaymentMode = COALESCE(PaymentMode, paymentMode),
            @CreatedByUser = COALESCE(CreatedBy, createdBy)
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            bookingId INT '$.bookingId',
            TransactionReference NVARCHAR(100) '$.TransactionReference',
            transactionReference NVARCHAR(100) '$.transactionReference',
            Amount DECIMAL(18,2) '$.Amount',
            amount DECIMAL(18,2) '$.amount',
            PaymentMode NVARCHAR(50) '$.PaymentMode',
            paymentMode NVARCHAR(50) '$.paymentMode',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            createdBy NVARCHAR(200) '$.createdBy'
        );

        -- Fetch Invoice or generate if not present
        DECLARE @InvoiceId INT;
        SELECT @InvoiceId = InvoiceId FROM Tracket_Master_Invoice WHERE BookingId = @BookingId AND IsDeleted = 0;

        DECLARE @CreatedBy NVARCHAR(200);
        -- Use the passed-in user email; fall back to booking's own CreatedBy if blank
        SET @CreatedBy = CASE WHEN ISNULL(@CreatedByUser, '') <> '' THEN @CreatedByUser
                              ELSE (SELECT CreatedBy FROM Tracket_Master_Booking WHERE BookingId = @BookingId)
                         END;

        IF @InvoiceId IS NULL
        BEGIN
            DECLARE @InvoiceNumber NVARCHAR(50), @UserId INT, @SubTotal DECIMAL(18,2), @TaxAmt DECIMAL(18,2), @DiscAmount DECIMAL(18,2), @FinalAmt DECIMAL(18,2);

            SELECT 
                @UserId = UserId,
                @SubTotal = TotalAmount,
                @TaxAmt = TaxAmount,
                @DiscAmount = DiscountAmount,
                @FinalAmt = FinalAmount
            FROM Tracket_Master_Booking
            WHERE BookingId = @BookingId;

            SET @InvoiceNumber = 'INV-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

            INSERT INTO Tracket_Master_Invoice (InvoiceCode, BookingId, UserId, SubTotal, TaxAmount, DiscountAmount, GrandTotal, InvoiceStatus, CreatedDate, IsDeleted, CreatedBy)
            VALUES (@InvoiceNumber, @BookingId, @UserId, @SubTotal, @TaxAmt, @DiscAmount, @FinalAmt, 1, GETDATE(), 0, @CreatedBy);

            SET @InvoiceId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            -- Update existing Invoice status to Paid (1 = PAID)
            UPDATE Tracket_Master_Invoice SET InvoiceStatus = 1 WHERE InvoiceId = @InvoiceId;
        END

        SET @PaymentReference = 'PAY-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

        DECLARE @BookingTax DECIMAL(18,2), @BookingFinal DECIMAL(18,2);
        SELECT @BookingTax = TaxAmount, @BookingFinal = FinalAmount FROM Tracket_Master_Booking WHERE BookingId = @BookingId;

        INSERT INTO Tracket_Master_Payment (
            PaymentReferenceNo, BookingId, InvoiceId, TransactionId, Amount, TaxAmount, FinalAmount, PaymentMode, PaymentStatus, PaymentDate, IsDeleted, CreatedDate, CreatedBy, CreatedFrom
        )
        VALUES (
            @PaymentReference, @BookingId, @InvoiceId, @TransactionReference, @Amount, ISNULL(@BookingTax, 0.00), ISNULL(@BookingFinal, @Amount), @PaymentMode, 1, GETDATE(), 0, GETDATE(), @CreatedBy, 'WebUI'
        );

        SET @PaymentId = SCOPE_IDENTITY();

        -- Update Booking status to Confirmed (1 = Success/Confirmed) and clear hold expiry
        UPDATE Tracket_Master_Booking SET BookingStatus = 1, HoldExpiryTime = NULL WHERE BookingId = @BookingId;

        -- Update Seat Status to Booked and IsBooked = 1
        UPDATE Tracket_Master_Event_Zone_Seat
        SET IsBooked = 1,
            SeatStatus = 'Booked'
        WHERE BookingId = @BookingId;

        -- Generate passes automatically for attendees
        INSERT INTO Tracket_Master_Pass (BookingId, AttendeeId, BookingDateId, PassNo, QRCode, SeatNo, PassStatus, IsUsed, IsDeleted, CreatedDate, CreatedBy)
        SELECT 
            @BookingId,
            A.AttendeeId,
            BD.BookingDateId,
            'PASS-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12)),
            'QR-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8)),
            A.SeatNo,
            1, -- Active
            0, -- Not used
            0,
            GETDATE(),
            ISNULL(@CreatedBy, 'System')
        FROM Tracket_Master_Booking_Attendee A
        CROSS JOIN Tracket_Master_Booking_Date BD
        WHERE A.BookingId = @BookingId 
          AND BD.BookingId = @BookingId
          AND A.IsDeleted = 0
          AND BD.IsDeleted = 0
          AND NOT EXISTS (
              SELECT 1 FROM Tracket_Master_Pass P 
              WHERE P.AttendeeId = A.AttendeeId 
                AND P.BookingDateId = BD.BookingDateId 
                AND P.IsDeleted = 0
          );

        -- Queue notifications
        -- 1. Payment Successful
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'PAYMENT',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Payment Successful - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', your payment of INR ' + CAST(B.FinalAmount AS VARCHAR) + ' was successful for booking reference ' + B.BookingNo + ' (Transaction Reference: ' + @TransactionReference + ').',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;

        -- 2. Booking Confirmed
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
            'Booking Confirmed - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', your booking for event ' + E.EventName + ' has been confirmed successfully.',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        -- 3. Passes Generated
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'PASS',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Passes Generated - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', entry passes for event ' + E.EventName + ' have been generated and are ready in your account under My Passes.',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        COMMIT TRANSACTION;
        SELECT 201 AS ResultStatus, 'Payment completed successfully.' AS ResultMessage;

        SELECT PaymentId, PaymentReferenceNo AS PaymentReference, BookingId, TransactionId AS TransactionReference, Amount, PaymentMode, PaymentStatus, PaymentDate
        FROM Tracket_Master_Payment
        WHERE PaymentId = @PaymentId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;

