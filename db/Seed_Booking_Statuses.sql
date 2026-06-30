USE EVENT_Master;
GO

-- 1. Insert Category for BookingStatus if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'BOOKING_STATUS')
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES ('BOOKING_STATUS', 'Booking Status', 1, 'system', GETDATE(), 'Migration');
END

-- 2. Insert Values for BookingStatus if they don't exist
DECLARE @StatusCatId INT;
SELECT @StatusCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'BOOKING_STATUS';

IF @StatusCatId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @StatusCatId AND AdditionalField = '0')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@StatusCatId, 'Pending', '0', 1, 'system', GETDATE(), 'Migration');

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @StatusCatId AND AdditionalField = '1')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@StatusCatId, 'Confirmed', '1', 1, 'system', GETDATE(), 'Migration');

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @StatusCatId AND AdditionalField = '2')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@StatusCatId, 'Cancelled', '2', 1, 'system', GETDATE(), 'Migration');

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @StatusCatId AND AdditionalField = '4')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@StatusCatId, 'Expired', '4', 1, 'system', GETDATE(), 'Migration');
END
GO
