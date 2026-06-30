$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

# Drop trigger if exists
$dropSql = @"
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Tracket_Master_Booking_Date_Insert')
BEGIN
    DROP TRIGGER [dbo].[TR_Tracket_Master_Booking_Date_Insert];
END
"@
$cmd.CommandText = $dropSql
$cmd.ExecuteNonQuery()
Write-Output "Successfully checked and dropped trigger if it existed."

# Create trigger
$createSql = @"
CREATE TRIGGER [dbo].[TR_Tracket_Master_Booking_Date_Insert]
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

$cmd.CommandText = $createSql
$cmd.ExecuteNonQuery()
Write-Output "Successfully created trigger TR_Tracket_Master_Booking_Date_Insert."

$conn.Close()
