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

        INSERT INTO Tracket_Master_Tax (TaxName, Percentage, IsActive, IsDeleted)
        VALUES (@TaxName, @Percentage, 1, 0);

        SET @TaxId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Tax added successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Tax 
        SET TaxName = @TaxName, Percentage = @Percentage 
        WHERE TaxId = @TaxId;

        SELECT 200 AS ResultStatus, 'Tax updated successfully.' AS ResultMessage;
    END

    SELECT TaxId, TaxName, Percentage, IsActive 
    FROM Tracket_Master_Tax 
    WHERE TaxId = @TaxId;
END;
GO

-- 2. USP_GetTaxes
CREATE OR ALTER PROCEDURE USP_GetTaxes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TaxId, TaxName, Percentage, IsActive 
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

        INSERT INTO Tracket_Master_Invoice (InvoiceNumber, BookingId, BaseAmount, TaxAmount, TotalAmount, Status, CreatedDate, IsDeleted)
        VALUES (@InvoiceNumber, @BookingId, @BaseAmount, @TaxAmount, @TotalAmount, 'UNPAID', GETDATE(), 0);

        SET @InvoiceId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Invoice created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Invoice 
        SET BaseAmount = @BaseAmount, TaxAmount = @TaxAmount, TotalAmount = @TotalAmount 
        WHERE InvoiceId = @InvoiceId;

        SELECT 200 AS ResultStatus, 'Invoice updated successfully.' AS ResultMessage;
    END

    SELECT 
        I.InvoiceId, I.InvoiceNumber, I.BookingId, B.BookingReference, I.BaseAmount, I.TaxAmount, I.TotalAmount, I.Status, I.CreatedDate
    FROM Tracket_Master_Invoice I
    INNER JOIN Tracket_Master_Booking B ON I.BookingId = B.BookingId
    WHERE I.InvoiceId = @InvoiceId;
END;
GO

-- 4. USP_GetInvoices
CREATE OR ALTER PROCEDURE USP_GetInvoices
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        I.InvoiceId, I.InvoiceNumber, I.BookingId, B.BookingReference, I.BaseAmount, I.TaxAmount, I.TotalAmount, I.Status, I.CreatedDate
    FROM Tracket_Master_Invoice I
    INNER JOIN Tracket_Master_Booking B ON I.BookingId = B.BookingId
    WHERE I.IsDeleted = 0;
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

        SET @PaymentReference = 'PAY-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

        INSERT INTO Tracket_Master_Payment (PaymentReference, BookingId, TransactionReference, Amount, PaymentMode, PaymentStatus, PaymentDate, IsDeleted)
        VALUES (@PaymentReference, @BookingId, @TransactionReference, @Amount, @PaymentMode, 'SUCCESS', GETDATE(), 0);

        SET @PaymentId = SCOPE_IDENTITY();

        -- Update Invoice status to Paid if applicable
        UPDATE Tracket_Master_Invoice SET Status = 'PAID' WHERE BookingId = @BookingId;

        COMMIT TRANSACTION;
        SELECT 201 AS ResultStatus, 'Payment completed successfully.' AS ResultMessage;

        SELECT PaymentId, PaymentReference, BookingId, TransactionReference, Amount, PaymentMode, PaymentStatus, PaymentDate
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
