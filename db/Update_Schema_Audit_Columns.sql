-- Alter audit columns from BIGINT to NVARCHAR(200) to support storing user emails
ALTER TABLE Tracket_Master_Booking_Attendee ALTER COLUMN CreatedBy NVARCHAR(200) NULL;
ALTER TABLE Tracket_Master_Booking_Attendee ALTER COLUMN UpdatedBy NVARCHAR(200) NULL;
ALTER TABLE Tracket_Master_Group_Booking ALTER COLUMN CreatedBy NVARCHAR(200) NULL;
ALTER TABLE Tracket_Master_Group_Booking ALTER COLUMN UpdatedBy NVARCHAR(200) NULL;
