-- ==========================================
-- MODULE 6: TAX + INVOICE + PAYMENT STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditTax
CREATE OR ALTER PROCEDURE USP_AddEditTax
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaxId INT, @TaxName NVARCHAR(50), @Percentage DECIMAL(5,2);

    SELECT 
        @TaxId = TaxId,
        @TaxName = TaxName,
        @Percentage = Percentage
    FROM OPENJSON(@JsonData)
    WITH (
        TaxId INT '$.TaxId',
        TaxName NVARCHAR(50) '$.TaxName',
        Percentage DECIMAL(5,2) '$.Percentage'
    );

    IF @TaxId = 0
    BEGIN
        IF EXISTS (SELECT 1 FROM Tracket_Master_Tax WHERE TaxName = @TaxName AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Tax name already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Tax (TaxName, TaxPercentage, IsActive, IsDeleted, CreatedDate)
        VALUES (@TaxName, @Percentage, 1, 0, GETDATE());

        SET @TaxId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Tax added successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Tax 
        SET TaxName = @TaxName, TaxPercentage = @Percentage, UpdatedDate = GETDATE()
        WHERE TaxId = @TaxId;

        SELECT 200 AS ResultStatus, 'Tax updated successfully.' AS ResultMessage;
    END

    SELECT TaxId, TaxName, TaxPercentage AS Percentage, IsActive 
    FROM Tracket_Master_Tax 
    WHERE TaxId = @TaxId;
END;
GO

-- 2. USP_GetTaxes
CREATE OR ALTER PROCEDURE USP_GetTaxes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TaxId, TaxName, TaxPercentage AS Percentage, IsActive 
    FROM Tracket_Master_Tax 
    WHERE IsDeleted = 0;
END;
GO

-- 3. USP_AddEditInvoice
CREATE OR ALTER PROCEDURE USP_AddEditInvoice
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InvoiceId INT, @BookingId INT, @BaseAmount DECIMAL(18,2), @TaxAmount DECIMAL(18,2), @TotalAmount DECIMAL(18,2),
            @InvoiceNumber NVARCHAR(50);

    SELECT 
        @InvoiceId = InvoiceId,
        @BookingId = BookingId,
        @BaseAmount = BaseAmount,
        @TaxAmount = TaxAmount,
        @TotalAmount = TotalAmount
    FROM OPENJSON(@JsonData)
    WITH (
        InvoiceId INT '$.InvoiceId',
        BookingId INT '$.BookingId',
        BaseAmount DECIMAL(18,2) '$.BaseAmount',
        TaxAmount DECIMAL(18,2) '$.TaxAmount',
        TotalAmount DECIMAL(18,2) '$.TotalAmount'
    );

    IF @InvoiceId = 0
    BEGIN
        SET @InvoiceNumber = 'INV-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

        INSERT INTO Tracket_Master_Invoice (InvoiceCode, BookingId, SubTotal, TaxAmount, DiscountAmount, GrandTotal, InvoiceStatus, CreatedDate, IsDeleted)
        VALUES (@InvoiceNumber, @BookingId, @BaseAmount, @TaxAmount, 0, @TotalAmount, 0, GETDATE(), 0);

        SET @InvoiceId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Invoice created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Invoice 
        SET SubTotal = @BaseAmount, TaxAmount = @TaxAmount, GrandTotal = @TotalAmount, UpdatedDate = GETDATE()
        WHERE InvoiceId = @InvoiceId;

        SELECT 200 AS ResultStatus, 'Invoice updated successfully.' AS ResultMessage;
    END

    SELECT 
        I.InvoiceId, 
        I.InvoiceCode AS InvoiceNumber, 
        I.BookingId, 
        B.BookingNo AS BookingReference, 
        B.BookingNo AS BookingNo, 
        B.BookingNo AS BookingNumber, 
        I.SubTotal AS BaseAmount, 
        I.SubTotal AS SubTotal, 
        I.TaxAmount, 
        I.GrandTotal AS TotalAmount, 
        I.InvoiceStatus AS Status, 
        I.CreatedDate,
        I.CreatedDate AS InvoiceDate
    FROM Tracket_Master_Invoice I
    INNER JOIN Tracket_Master_Booking B ON I.BookingId = B.BookingId
    WHERE I.InvoiceId = @InvoiceId;
END;
GO

-- 4. USP_GetInvoices
CREATE OR ALTER PROCEDURE USP_GetInvoices
    @UserId INT = NULL,
    @UserRole INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserRole = 1
    BEGIN
        -- SuperAdmin: get all invoices
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber, 
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0;
    END
    ELSE IF @UserRole = 2
    BEGIN
        -- Organizer: get invoices of their own events
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber, 
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0
          AND E.UserId = @UserId;
    END
    ELSE
    BEGIN
        -- Standard/Visitor or fallback: get invoices for bookings they made
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber, 
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0
          AND (@UserId IS NULL OR B.UserId = @UserId);
    END
END;
GO

-- 5. USP_AddPayment
CREATE OR ALTER PROCEDURE USP_AddPayment
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @TransactionReference NVARCHAR(100), @Amount DECIMAL(18,2), @PaymentMode NVARCHAR(50),
                @PaymentReference NVARCHAR(50), @PaymentId INT;

        SELECT 
            @BookingId = BookingId,
            @TransactionReference = TransactionReference,
            @Amount = Amount,
            @PaymentMode = PaymentMode
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            TransactionReference NVARCHAR(100) '$.TransactionReference',
            Amount DECIMAL(18,2) '$.Amount',
            PaymentMode NVARCHAR(50) '$.PaymentMode'
        );

        -- Fetch Invoice or generate if not present
        DECLARE @InvoiceId INT;
        SELECT @InvoiceId = InvoiceId FROM Tracket_Master_Invoice WHERE BookingId = @BookingId AND IsDeleted = 0;

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

            INSERT INTO Tracket_Master_Invoice (InvoiceCode, BookingId, UserId, SubTotal, TaxAmount, DiscountAmount, GrandTotal, InvoiceStatus, CreatedDate, IsDeleted)
            VALUES (@InvoiceNumber, @BookingId, @UserId, @SubTotal, @TaxAmt, @DiscAmount, @FinalAmt, 1, GETDATE(), 0);

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
            PaymentReferenceNo, BookingId, InvoiceId, TransactionId, Amount, TaxAmount, FinalAmount, PaymentMode, PaymentStatus, PaymentDate, IsDeleted, CreatedDate
        )
        VALUES (
            @PaymentReference, @BookingId, @InvoiceId, @TransactionReference, @Amount, ISNULL(@BookingTax, 0.00), ISNULL(@BookingFinal, @Amount), @PaymentMode, 1, GETDATE(), 0, GETDATE()
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
            'System'
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
GO

-- 6. USP_RefundPayment
CREATE OR ALTER PROCEDURE USP_RefundPayment
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @PaymentId INT, @Amount DECIMAL(18,2), @Reason NVARCHAR(255);

        SELECT 
            @PaymentId = PaymentId,
            @Amount = Amount,
            @Reason = Reason
        FROM OPENJSON(@JsonData)
        WITH (
            PaymentId INT '$.PaymentId',
            Amount DECIMAL(18,2) '$.Amount',
            Reason NVARCHAR(255) '$.Reason'
        );

        IF EXISTS (SELECT 1 FROM Tracket_Master_Payment WHERE PaymentId = @PaymentId AND IsDeleted = 0)
        BEGIN
            UPDATE Tracket_Master_Payment SET PaymentStatus = 'REFUNDED' WHERE PaymentId = @PaymentId;

            -- In a real scenario, logs are added to Tracket_Log_Payment
            COMMIT TRANSACTION;
            SELECT 200 AS ResultStatus, 'Payment refunded successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            SELECT 404 AS ResultStatus, 'Payment transaction not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
        END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 7. USP_GetNotifications
CREATE OR ALTER PROCEDURE USP_GetNotifications
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        N.Notification_Id AS NotificationId,
        N.Notification_Public_Id AS NotificationPublicId,
        N.Subject,
        N.Message_Body AS MessageBody,
        N.Status,
        N.Created_At AS CreatedAt,
        N.Is_Active AS IsActive
    FROM Tracket_Master_Notification N
    INNER JOIN Tracket_Master_User U ON N.User_Public_Id = U.UniqueScanCode
    WHERE U.UserId = @UserId AND N.Is_Deleted = 0
    ORDER BY N.Created_At DESC;
END;
GO

-- 8. USP_MarkNotificationAsRead
CREATE OR ALTER PROCEDURE USP_MarkNotificationAsRead
    @NotificationId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Tracket_Master_Notification
    SET Status = 'READ',
        Updated_At = GETDATE()
    WHERE Notification_Id = @NotificationId;

    SELECT 200 AS ResultStatus, 'Notification marked as read.' AS ResultMessage;
END;
GO

-- 9. USP_RecordFailedPayment
CREATE OR ALTER PROCEDURE USP_RecordFailedPayment
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @TransactionReference NVARCHAR(100), @Amount DECIMAL(18,2), @PaymentMode NVARCHAR(50);
        
        SELECT 
            @BookingId = BookingId,
            @TransactionReference = TransactionReference,
            @Amount = Amount,
            @PaymentMode = PaymentMode
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            TransactionReference NVARCHAR(100) '$.TransactionReference',
            Amount DECIMAL(18,2) '$.Amount',
            PaymentMode NVARCHAR(50) '$.PaymentMode'
        );
        
        -- Fetch Invoice or generate if not present
        DECLARE @InvoiceId INT;
        SELECT @InvoiceId = InvoiceId FROM Tracket_Master_Invoice WHERE BookingId = @BookingId AND IsDeleted = 0;

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

            INSERT INTO Tracket_Master_Invoice (InvoiceCode, BookingId, UserId, SubTotal, TaxAmount, DiscountAmount, GrandTotal, InvoiceStatus, CreatedDate, IsDeleted)
            VALUES (@InvoiceNumber, @BookingId, @UserId, @SubTotal, @TaxAmt, @DiscAmount, @FinalAmt, 0, GETDATE(), 0);

            SET @InvoiceId = SCOPE_IDENTITY();
        END
        
        DECLARE @PaymentReference NVARCHAR(50) = 'PAY-FAIL-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));
        
        -- Insert failed payment record (PaymentStatus = 0 for Failed)
        INSERT INTO Tracket_Master_Payment (
            PaymentReferenceNo, BookingId, InvoiceId, TransactionId, Amount, TaxAmount, FinalAmount, PaymentMode, PaymentStatus, PaymentDate, IsDeleted, CreatedDate
        )
        VALUES (
            @PaymentReference, @BookingId, @InvoiceId, @TransactionReference, @Amount, 0.00, @Amount, @PaymentMode, 0, GETDATE(), 0, GETDATE()
        );
        
        -- Queue Notification for Payment Failed
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
            'Payment Failed - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', your payment attempt of INR ' + CAST(@Amount AS VARCHAR) + ' for booking reference ' + B.BookingNo + ' has failed. Please check your funds or payment method and try again.',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;
        
        COMMIT TRANSACTION;
        SELECT 200 AS ResultStatus, 'Failed payment recorded and notification queued.' AS ResultMessage;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO
