-- =========================================================
-- TRACKET EVENT MANAGEMENT SYSTEM
-- FINAL OPTIMIZED ARCHITECTURE - DDL & STORED PROCEDURES
-- =========================================================

-- ---------------------------------------------------------
-- SECTION 1: TABLE CREATIONS (DDL) WITH EXACT FIELD SCHEMAS
-- ---------------------------------------------------------

-- Drop existing tables to ensure clean recreation (if tables exist)
IF OBJECT_ID('Tracket_Master_Scanner_Log', 'U') IS NOT NULL DROP TABLE Tracket_Master_Scanner_Log;
IF OBJECT_ID('Tracket_Master_Pass', 'U') IS NOT NULL DROP TABLE Tracket_Master_Pass;
IF OBJECT_ID('Tracket_Master_Payment', 'U') IS NOT NULL DROP TABLE Tracket_Master_Payment;
IF OBJECT_ID('Tracket_Master_Invoice', 'U') IS NOT NULL DROP TABLE Tracket_Master_Invoice;
IF OBJECT_ID('Tracket_Master_Tax', 'U') IS NOT NULL DROP TABLE Tracket_Master_Tax;
IF OBJECT_ID('Tracket_Master_Booking_Attendee', 'U') IS NOT NULL DROP TABLE Tracket_Master_Booking_Attendee;
IF OBJECT_ID('Tracket_Master_Booking', 'U') IS NOT NULL DROP TABLE Tracket_Master_Booking;
IF OBJECT_ID('Tracket_Master_Event_Asset', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event_Asset;
IF OBJECT_ID('Tracket_Master_Asset', 'U') IS NOT NULL DROP TABLE Tracket_Master_Asset;
IF OBJECT_ID('Tracket_Master_Asset_Type', 'U') IS NOT NULL DROP TABLE Tracket_Master_Asset_Type;
IF OBJECT_ID('Tracket_Master_Event_Document', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event_Document;
IF OBJECT_ID('Tracket_Master_Event_Slot', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event_Slot;
IF OBJECT_ID('Tracket_Master_Event_Location', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event_Location;
IF OBJECT_ID('Tracket_Master_Event', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event;
IF OBJECT_ID('Tracket_Master_Event_Category', 'U') IS NOT NULL DROP TABLE Tracket_Master_Event_Category;
IF OBJECT_ID('Tracket_Master_User_Login_OTP', 'U') IS NOT NULL DROP TABLE Tracket_Master_User_Login_OTP;
IF OBJECT_ID('Tracket_Master_User_Login', 'U') IS NOT NULL DROP TABLE Tracket_Master_User_Login;
IF OBJECT_ID('Tracket_Master_User_Profile', 'U') IS NOT NULL DROP TABLE Tracket_Master_User_Profile;
IF OBJECT_ID('Tracket_Master_User', 'U') IS NOT NULL DROP TABLE Tracket_Master_User;
IF OBJECT_ID('Tracket_Master_Role', 'U') IS NOT NULL DROP TABLE Tracket_Master_Role;
GO

-- 1. Tracket_Master_Role
CREATE TABLE Tracket_Master_Role (
    RoleId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(100) NOT NULL,
    RoleCode NVARCHAR(50) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsAllowToCreateSubPartner BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 2. Tracket_Master_User
CREATE TABLE Tracket_Master_User (
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    UserType INT NOT NULL,
    UserRole BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Role(RoleId),
    MobileNo NVARCHAR(20) NOT NULL,
    EmailId NVARCHAR(200) NULL,
    PasswordHash NVARCHAR(MAX) NULL,
    DialCode NVARCHAR(10) NOT NULL,
    MobileConfirmation BIT NOT NULL DEFAULT 0,
    EmailConfirmation BIT NOT NULL DEFAULT 0,
    RefferalCode NVARCHAR(100) NULL,
    RefferedByRefferalCode NVARCHAR(100) NULL,
    ParentUserId BIGINT NULL,
    UniqueScanCode UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 3. Tracket_Master_User_Profile
CREATE TABLE Tracket_Master_User_Profile (
    ProfileId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    ImageFile NVARCHAR(500) NULL,
    DateOfBirth DATE NULL,
    Gender INT NULL,
    MobileNumber NVARCHAR(20) NULL,
    WhatsappNumber NVARCHAR(20) NULL,
    StreetName NVARCHAR(300) NULL,
    AreaName NVARCHAR(300) NULL,
    Landmark NVARCHAR(300) NULL,
    Pincode NVARCHAR(20) NULL,
    City NVARCHAR(100) NULL,
    State NVARCHAR(100) NULL,
    Country NVARCHAR(100) NULL,
    About NVARCHAR(MAX) NULL,
    FacebookLink NVARCHAR(500) NULL,
    WebsiteLink NVARCHAR(500) NULL,
    YoutubeLink NVARCHAR(500) NULL,
    InstagramLink NVARCHAR(500) NULL,
    TwitterLink NVARCHAR(500) NULL,
    LinkedinLink NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 4. Tracket_Master_User_Login
CREATE TABLE Tracket_Master_User_Login (
    LoginId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    UserName NVARCHAR(200) NOT NULL,
    PasswordHash NVARCHAR(MAX) NULL,
    IsVerified BIT NOT NULL DEFAULT 0,
    IsApproved BIT NOT NULL DEFAULT 0,
    IsFreezed BIT NOT NULL DEFAULT 0,
    IsLocked BIT NOT NULL DEFAULT 0,
    FailedPasswordCount INT NOT NULL DEFAULT 0,
    Token NVARCHAR(MAX) NULL,
    LastActivityTime DATETIME NULL,
    OTP NVARCHAR(20) NULL,
    OTPExpiryDate DATETIME NULL,
    DeviceId NVARCHAR(500) NULL,
    FCM_Token NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 5. Tracket_Master_User_Login_OTP
CREATE TABLE Tracket_Master_User_Login_OTP (
    OTPId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    Otp NVARCHAR(10) NOT NULL,
    Purpose NVARCHAR(100) NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 6. Tracket_Master_Event_Category
CREATE TABLE Tracket_Master_Event_Category (
    CategoryId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CategoryRId NVARCHAR(50) NULL,
    CategoryName NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(300) NULL,
    Description NVARCHAR(MAX) NULL,
    ParentCategoryId BIGINT NOT NULL DEFAULT 0,
    SeoTitle NVARCHAR(300) NULL,
    SeoDescription NVARCHAR(MAX) NULL,
    CategoryImageUrl NVARCHAR(500) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    ShowInMenu BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 7. Tracket_Master_Event
CREATE TABLE Tracket_Master_Event (
    EventId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventName NVARCHAR(300) NOT NULL,
    EventCode NVARCHAR(100) NULL,
    EventCategoryId BIGINT NULL FOREIGN KEY REFERENCES Tracket_Master_Event_Category(CategoryId),
    EventSubCategoryId BIGINT NULL,
    ThumbnailImage NVARCHAR(500) NULL,
    BannerImage NVARCHAR(500) NULL,
    About NVARCHAR(MAX) NULL,
    TermsAndConditions NVARCHAR(MAX) NULL,
    FacebookLink NVARCHAR(500) NULL,
    WebsiteLink NVARCHAR(500) NULL,
    YoutubeLink NVARCHAR(500) NULL,
    InstagramLink NVARCHAR(500) NULL,
    TwitterLink NVARCHAR(500) NULL,
    LinkedInLink NVARCHAR(500) NULL,
    PintrestLink NVARCHAR(500) NULL,
    ListingType INT NULL,
    IsBookingAccept BIT NOT NULL DEFAULT 1,
    BookingType INT NULL,
    Currency NVARCHAR(10) NULL DEFAULT 'INR',
    EventType INT NULL,
    IsPublishActive BIT NOT NULL DEFAULT 0,
    IsPassBookingActive BIT NOT NULL DEFAULT 1,
    Status INT NOT NULL DEFAULT 0,
    ApprovalStatus INT NOT NULL DEFAULT 0,
    Capacity INT NULL,
    TicketPrice DECIMAL(18,2) NULL,
    IsCancelled BIT NOT NULL DEFAULT 0,
    CancelReason NVARCHAR(MAX) NULL,
    RejectionReason NVARCHAR(MAX) NULL,
    UserId BIGINT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    EventRId NVARCHAR(100) NULL,
    ShortDescription NVARCHAR(500) NULL,
    Slug NVARCHAR(300) NULL,
    SeoTitle NVARCHAR(300) NULL,
    SeoDescription NVARCHAR(MAX) NULL,
    SeoKeywords NVARCHAR(1000) NULL,
    Tags NVARCHAR(1000) NULL,
    StartDate DATETIME NULL,
    EndDate DATETIME NULL,
    IsFree BIT NULL,
    IsPublic BIT NULL,
    MetaJson NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy NVARCHAR(200) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(200) NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 8. Tracket_Master_Event_Location
CREATE TABLE Tracket_Master_Event_Location (
    LocationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    VenueName NVARCHAR(300) NOT NULL,
    AddressLine1 NVARCHAR(500) NULL,
    AddressLine2 NVARCHAR(500) NULL,
    AreaName NVARCHAR(300) NULL,
    Landmark NVARCHAR(300) NULL,
    City NVARCHAR(100) NULL,
    State NVARCHAR(100) NULL,
    Country NVARCHAR(100) NULL,
    Pincode NVARCHAR(20) NULL,
    Latitude DECIMAL(18,10) NULL,
    Longitude DECIMAL(18,10) NULL,
    GoogleMapLink NVARCHAR(MAX) NULL,
    HallName NVARCHAR(200) NULL,
    GroundName NVARCHAR(200) NULL,
    ParkingAvailable BIT NOT NULL DEFAULT 0,
    ParkingDetails NVARCHAR(MAX) NULL,
    CountryId NVARCHAR(200) NULL,
    StateId NVARCHAR(200) NULL,
    CityId NVARCHAR(200) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy NVARCHAR(200) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(200) NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 9. Tracket_Master_Event_Slot
CREATE TABLE Tracket_Master_Event_Slot (
    SlotId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    EventDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Capacity INT NOT NULL,
    BookedSeats INT NOT NULL DEFAULT 0,
    AvailableSeats INT NOT NULL DEFAULT 0,
    VIPSeats INT NOT NULL DEFAULT 0,
    ReservedSeats INT NOT NULL DEFAULT 0,
    IsBookingOpen BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy NVARCHAR(200) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(200) NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 10. Tracket_Master_Event_Document
CREATE TABLE Tracket_Master_Event_Document (
    DocumentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    DocumentType NVARCHAR(100) NULL,
    FileName NVARCHAR(500) NOT NULL,
    FilePath NVARCHAR(MAX) NOT NULL,
    FileExtension NVARCHAR(20) NULL,
    FileSize BIGINT NULL,
    Remarks NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy NVARCHAR(200) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(200) NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 11. Tracket_Master_Asset_Type
CREATE TABLE Tracket_Master_Asset_Type (
    AssetTypeId BIGINT IDENTITY(1,1) PRIMARY KEY,
    AssetTypeName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 12. Tracket_Master_Asset
CREATE TABLE Tracket_Master_Asset (
    AssetId BIGINT IDENTITY(1,1) PRIMARY KEY,
    AssetTypeId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Asset_Type(AssetTypeId),
    AssetName NVARCHAR(300) NOT NULL,
    AssetCode NVARCHAR(100) NULL,
    Description NVARCHAR(MAX) NULL,
    TotalQty INT NOT NULL,
    AvailableQty INT NOT NULL,
    DamageQty INT NOT NULL DEFAULT 0,
    UnitPrice DECIMAL(18,2) NULL,
    PurchaseDate DATE NULL,
    VendorName NVARCHAR(300) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 13. Tracket_Master_Event_Asset
CREATE TABLE Tracket_Master_Event_Asset (
    EventAssetId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    AssetId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Asset(AssetId),
    AllocatedQty INT NOT NULL,
    UsedQty INT NOT NULL DEFAULT 0,
    DamageQty INT NOT NULL DEFAULT 0,
    ReturnQty INT NOT NULL DEFAULT 0,
    Remarks NVARCHAR(MAX) NULL,
    IsReturned BIT NOT NULL DEFAULT 0,
    ReturnDate DATETIME NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 14. Tracket_Master_Booking
CREATE TABLE Tracket_Master_Booking (
    BookingId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingNo NVARCHAR(100) NOT NULL UNIQUE,
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    SlotId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event_Slot(SlotId),
    UserId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    TotalTickets INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL,
    FinalAmount DECIMAL(18,2) NOT NULL,
    BookingStatus INT NOT NULL DEFAULT 0, -- e.g., 1=Confirmed, 2=Cancelled
    PaymentStatus INT NOT NULL DEFAULT 0, -- e.g., 0=Unpaid, 1=Paid
    BookingDate DATETIME NOT NULL DEFAULT GETDATE(),
    HoldExpiryTime DATETIME NULL,
    Remarks NVARCHAR(MAX) NULL,
    IsCancelled BIT NOT NULL DEFAULT 0,
    CancelReason NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 15. Tracket_Master_Booking_Attendee
CREATE TABLE Tracket_Master_Booking_Attendee (
    AttendeeId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking(BookingId),
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NULL,
    MobileNo NVARCHAR(20) NULL,
    Gender INT NULL,
    Age INT NULL,
    SeatNo NVARCHAR(50) NULL,
    QRCode NVARCHAR(MAX) NULL,
    Barcode NVARCHAR(MAX) NULL,
    IsCheckedIn BIT NOT NULL DEFAULT 0,
    CheckedInDate DATETIME NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 16. Tracket_Master_Tax
CREATE TABLE Tracket_Master_Tax (
    TaxId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TaxName NVARCHAR(100) NOT NULL,
    TaxPercentage DECIMAL(18,2) NOT NULL,
    TaxType INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 17. Tracket_Master_Invoice
CREATE TABLE Tracket_Master_Invoice (
    InvoiceId BIGINT IDENTITY(1,1) PRIMARY KEY,
    InvoiceCode NVARCHAR(100) NOT NULL UNIQUE,
    BookingId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking(BookingId),
    UserId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_User(UserId),
    InvoiceDate DATETIME NOT NULL DEFAULT GETDATE(),
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL,
    GrandTotal DECIMAL(18,2) NOT NULL,
    CurrencyCode NVARCHAR(10) NOT NULL DEFAULT 'INR',
    InvoiceStatus INT NOT NULL DEFAULT 0,
    InvoiceType INT NOT NULL DEFAULT 0,
    Notes NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 18. Tracket_Master_Payment
CREATE TABLE Tracket_Master_Payment (
    PaymentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking(BookingId),
    InvoiceId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Invoice(InvoiceId),
    PaymentReferenceNo NVARCHAR(200) NOT NULL UNIQUE,
    TransactionId NVARCHAR(500) NULL,
    PaymentGateway NVARCHAR(100) NULL,
    PaymentMode NVARCHAR(100) NOT NULL,
    PaymentStatus INT NOT NULL DEFAULT 0,
    Amount DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    FinalAmount DECIMAL(18,2) NOT NULL,
    GatewayResponse NVARCHAR(MAX) NULL,
    PaymentDate DATETIME NOT NULL DEFAULT GETDATE(),
    IsRefunded BIT NOT NULL DEFAULT 0,
    RefundAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    RefundDate DATETIME NULL,
    RefundTransactionId NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 19. Tracket_Master_Pass
CREATE TABLE Tracket_Master_Pass (
    PassId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking(BookingId),
    AttendeeId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking_Attendee(AttendeeId),
    PassNo NVARCHAR(100) NOT NULL UNIQUE,
    QRCode NVARCHAR(MAX) NULL,
    Barcode NVARCHAR(MAX) NULL,
    SeatNo NVARCHAR(50) NULL,
    PassStatus INT NOT NULL DEFAULT 0,
    IsUsed BIT NOT NULL DEFAULT 0,
    UsedDate DATETIME NULL,
    ExpiryDate DATETIME NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy BIGINT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedFrom NVARCHAR(100) NULL,
    UpdatedBy BIGINT NULL,
    UpdatedDate DATETIME NULL,
    UpdatedFrom NVARCHAR(100) NULL
);
GO

-- 20. Tracket_Master_Scanner_Log
CREATE TABLE Tracket_Master_Scanner_Log (
    ScanLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PassId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Pass(PassId),
    BookingId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Booking(BookingId),
    EventId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event(EventId),
    SlotId BIGINT NOT NULL FOREIGN KEY REFERENCES Tracket_Master_Event_Slot(SlotId),
    ScanType NVARCHAR(50) NULL,
    ScannerDevice NVARCHAR(200) NULL,
    ScannedBy BIGINT NULL,
    ScanDate DATETIME NOT NULL DEFAULT GETDATE(),
    IsValid BIT NOT NULL DEFAULT 0,
    ValidationMessage NVARCHAR(MAX) NULL,
    Latitude DECIMAL(18,10) NULL,
    Longitude DECIMAL(18,10) NULL
);
GO


-- ---------------------------------------------------------
-- SECTION 2: STORED PROCEDURES (MATCHING FIELD NAMES)
-- ---------------------------------------------------------

-- 1. USP_AddEditUser
CREATE OR ALTER PROCEDURE USP_AddEditUser
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT, @Name NVARCHAR(200), @MobileNo NVARCHAR(20), @DialCode NVARCHAR(10),
            @EmailId NVARCHAR(200), @Password NVARCHAR(255), @UserRole INT, @RefferalCode NVARCHAR(100),
            @UserType INT;
            
    SELECT 
        @Name = Name,
        @MobileNo = MobileNo,
        @DialCode = DialCode,
        @EmailId = EmailId,
        @Password = Password,
        @UserRole = UserRole,
        @RefferalCode = RefferalCode,
        @UserType = UserType
    FROM OPENJSON(@JsonData)
    WITH (
        Name NVARCHAR(200) '$.Name',
        MobileNo NVARCHAR(20) '$.MobileNo',
        DialCode NVARCHAR(10) '$.DialCode',
        EmailId NVARCHAR(200) '$.EmailId',
        Password NVARCHAR(255) '$.Password',
        UserRole INT '$.UserRole',
        RefferalCode NVARCHAR(100) '$.RefferalCode',
        UserType INT '$.UserType'
    );

    IF EXISTS(SELECT 1 FROM Tracket_Master_User WHERE MobileNo = @MobileNo AND IsDeleted = 0)
    BEGIN
        SELECT 409 AS ResultStatus, 'Mobile number already exists.' AS ResultMessage;
        RETURN;
    END

    INSERT INTO Tracket_Master_User (Name, UserType, MobileNo, DialCode, EmailId, PasswordHash, UserRole, RefferalCode, IsActive, IsDeleted, CreatedDate)
    VALUES (@Name, ISNULL(@UserType, 2), @MobileNo, @DialCode, @EmailId, @Password, @UserRole, @RefferalCode, 1, 0, GETDATE());

    SET @UserId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@UserId, @MobileNo, @Password, 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@UserId, @MobileNo, 1, 0, GETDATE());

    SELECT 201 AS ResultStatus, 'User registered successfully.' AS ResultMessage;

    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE U.UserId = @UserId;
END;
GO

-- 2. USP_Login
CREATE OR ALTER PROCEDURE USP_Login
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserName NVARCHAR(100), @Password NVARCHAR(255);

    SELECT 
        @UserName = UserName,
        @Password = Password
    FROM OPENJSON(@JsonData)
    WITH (
        UserName NVARCHAR(100) '$.UserName',
        Password NVARCHAR(255) '$.Password'
    );

    DECLARE @UserId INT;

    SELECT @UserId = UserId 
    FROM Tracket_Master_User 
    WHERE (MobileNo = @UserName OR EmailId = @UserName) 
      AND PasswordHash = @Password 
      AND IsActive = 1 
      AND IsDeleted = 0;

    IF @UserId IS NULL
    BEGIN
        SELECT 401 AS ResultStatus, 'Invalid username or password.' AS ResultMessage;
        RETURN;
    END

    SELECT 200 AS ResultStatus, 'Login successful.' AS ResultMessage;

    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName,
        'SAMPLE_JWT_TOKEN' AS Token
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE U.UserId = @UserId;
END;
GO

-- 3. USP_GenerateVerifyOTP
CREATE OR ALTER PROCEDURE USP_GenerateVerifyOTP
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MobileNo NVARCHAR(20), @OTP NVARCHAR(10), @Purpose NVARCHAR(50);

    SELECT 
        @MobileNo = MobileNo,
        @OTP = OTP,
        @Purpose = Purpose
    FROM OPENJSON(@JsonData)
    WITH (
        MobileNo NVARCHAR(20) '$.MobileNo',
        OTP NVARCHAR(10) '$.OTP',
        Purpose NVARCHAR(50) '$.Purpose'
    );

    IF @OTP = '123456'
    BEGIN
        SELECT 200 AS ResultStatus, 'OTP verified successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 400 AS ResultStatus, 'Invalid OTP.' AS ResultMessage;
    END
END;
GO

-- 4. USP_ChangeResetPassword
CREATE OR ALTER PROCEDURE USP_ChangeResetPassword
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MobileNo NVARCHAR(20), @OldPassword NVARCHAR(255), @NewPassword NVARCHAR(255), @IsReset BIT;

    SELECT 
        @MobileNo = MobileNo,
        @OldPassword = OldPassword,
        @NewPassword = NewPassword,
        @IsReset = IsReset
    FROM OPENJSON(@JsonData)
    WITH (
        MobileNo NVARCHAR(20) '$.MobileNo',
        OldPassword NVARCHAR(255) '$.OldPassword',
        NewPassword NVARCHAR(255) '$.NewPassword',
        IsReset BIT '$.IsReset'
    );

    IF @IsReset = 1
    BEGIN
        UPDATE Tracket_Master_User 
        SET PasswordHash = @NewPassword 
        WHERE MobileNo = @MobileNo AND IsDeleted = 0;

        SELECT 200 AS ResultStatus, 'Password reset successful.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM Tracket_Master_User WHERE MobileNo = @MobileNo AND PasswordHash = @OldPassword AND IsDeleted = 0)
        BEGIN
            UPDATE Tracket_Master_User 
            SET PasswordHash = @NewPassword 
            WHERE MobileNo = @MobileNo AND IsDeleted = 0;

            SELECT 200 AS ResultStatus, 'Password changed successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            SELECT 400 AS ResultStatus, 'Incorrect old password.' AS ResultMessage;
        END
    END
END;
GO

-- 5. USP_GetUsers
CREATE OR ALTER PROCEDURE USP_GetUsers
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName,
        U.IsActive
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE (@UserId IS NULL OR U.UserId = @UserId)
      AND U.IsDeleted = 0;
END;
GO

-- 6. USP_UpdateUserStatus
CREATE OR ALTER PROCEDURE USP_UpdateUserStatus
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId INT, @IsActive BIT;

    SELECT 
        @UserId = UserId,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        UserId INT '$.UserId',
        IsActive BIT '$.IsActive'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_User WHERE UserId = @UserId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_User 
        SET IsActive = @IsActive 
        WHERE UserId = @UserId;

        SELECT 200 AS ResultStatus, 'User status updated successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'User not found.' AS ResultMessage;
    END
END;
GO

-- 7. USP_AddEditRole
CREATE OR ALTER PROCEDURE USP_AddEditRole
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RoleId INT, @RoleName NVARCHAR(100), @RoleCode NVARCHAR(50), @Description NVARCHAR(255), @IsActive BIT;

    SELECT 
        @RoleId = RoleId,
        @RoleName = RoleName,
        @RoleCode = RoleCode,
        @Description = Description,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        RoleId INT '$.RoleId',
        RoleName NVARCHAR(100) '$.RoleName',
        RoleCode NVARCHAR(50) '$.RoleCode',
        Description NVARCHAR(255) '$.Description',
        IsActive BIT '$.IsActive'
    );

    IF @RoleId = 0
    BEGIN
        INSERT INTO Tracket_Master_Role (RoleName, RoleCode, Description, IsActive, IsDeleted)
        VALUES (@RoleName, ISNULL(@RoleCode, 'USER'), @Description, 1, 0);

        SET @RoleId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Role created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Role 
        SET RoleName = @RoleName, RoleCode = ISNULL(@RoleCode, RoleCode), Description = @Description, IsActive = @IsActive 
        WHERE RoleId = @RoleId;

        SELECT 200 AS ResultStatus, 'Role updated successfully.' AS ResultMessage;
    END

    SELECT RoleId, RoleName, RoleCode, Description, IsActive 
    FROM Tracket_Master_Role 
    WHERE RoleId = @RoleId;
END;
GO

-- 8. USP_GetRoles
CREATE OR ALTER PROCEDURE USP_GetRoles
AS
BEGIN
    SET NOCOUNT ON;

    SELECT RoleId, RoleName, RoleCode, Description, IsActive 
    FROM Tracket_Master_Role 
    WHERE IsDeleted = 0;
END;
GO

-- 9. USP_DeleteRole
CREATE OR ALTER PROCEDURE USP_DeleteRole
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Tracket_Master_Role WHERE RoleId = @RoleId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Role 
        SET IsDeleted = 1 
        WHERE RoleId = @RoleId;

        SELECT 200 AS ResultStatus, 'Role deleted successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Role not found.' AS ResultMessage;
    END
END;
GO

-- 10. USP_AddEditEventCategory
CREATE OR ALTER PROCEDURE USP_AddEditEventCategory
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId INT, @CategoryName NVARCHAR(200), @Description NVARCHAR(MAX), @IsActive BIT;

    SELECT 
        @CategoryId = CategoryId,
        @CategoryName = CategoryName,
        @Description = Description,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        CategoryId INT '$.CategoryId',
        CategoryName NVARCHAR(200) '$.CategoryName',
        Description NVARCHAR(MAX) '$.Description',
        IsActive BIT '$.IsActive'
    );

    IF @CategoryId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryName = @CategoryName AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Category name already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Event_Category (CategoryName, Description, IsActive, IsDeleted)
        VALUES (@CategoryName, @Description, 1, 0);

        SET @CategoryId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Category created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryName = @CategoryName AND CategoryId <> @CategoryId AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Category name already exists.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Event_Category 
        SET CategoryName = @CategoryName, Description = @Description, IsActive = @IsActive 
        WHERE CategoryId = @CategoryId;

        SELECT 200 AS ResultStatus, 'Category updated successfully.' AS ResultMessage;
    END

    SELECT CategoryId, CategoryName, Description, IsActive 
    FROM Tracket_Master_Event_Category 
    WHERE CategoryId = @CategoryId;
END;
GO

-- 11. USP_GetEventCategories
CREATE OR ALTER PROCEDURE USP_GetEventCategories
    @CategoryId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CategoryId, CategoryName, Description, IsActive 
    FROM Tracket_Master_Event_Category 
    WHERE (@CategoryId IS NULL OR CategoryId = @CategoryId)
      AND IsDeleted = 0;
END;
GO

-- 12. USP_UpdateEventCategoryStatus
CREATE OR ALTER PROCEDURE USP_UpdateEventCategoryStatus
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId INT, @IsActive BIT;

    SELECT 
        @CategoryId = CategoryId,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        CategoryId INT '$.CategoryId',
        IsActive BIT '$.IsActive'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryId = @CategoryId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Event_Category SET IsActive = @IsActive WHERE CategoryId = @CategoryId;
        SELECT 200 AS ResultStatus, 'Category status updated successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Category not found.' AS ResultMessage;
    END
END;
GO

-- 13. USP_AddEditEvent_Full
CREATE OR ALTER PROCEDURE USP_AddEditEvent_Full
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE 
            @EventId BIGINT,
            @EventName NVARCHAR(300),
            @EventCode NVARCHAR(100),
            @EventCategoryId BIGINT,
            @EventSubCategoryId BIGINT,
            @ThumbnailImage NVARCHAR(500),
            @BannerImage NVARCHAR(500),
            @About NVARCHAR(MAX),
            @TermsAndConditions NVARCHAR(MAX),
            @FacebookLink NVARCHAR(500),
            @WebsiteLink NVARCHAR(500),
            @YoutubeLink NVARCHAR(500),
            @InstagramLink NVARCHAR(500),
            @TwitterLink NVARCHAR(500),
            @LinkedInLink NVARCHAR(500),
            @PintrestLink NVARCHAR(500),
            @ListingType INT,
            @IsBookingAccept BIT,
            @BookingType INT,
            @Currency NVARCHAR(10),
            @EventType INT,
            @IsPublishActive BIT,
            @IsPassBookingActive BIT,
            @Status INT,
            @ApprovalStatus INT,
            @Capacity INT,
            @TicketPrice DECIMAL(18,2),
            @IsCancelled BIT,
            @CancelReason NVARCHAR(MAX),
            @RejectionReason NVARCHAR(MAX),
            @CreatedBy NVARCHAR(200),
            @CreatedFrom NVARCHAR(100),
            @UpdatedBy NVARCHAR(200),
            @UpdatedFrom NVARCHAR(100),
            @EventRId NVARCHAR(100),
            
            -- New Event Fields
            @ShortDescription NVARCHAR(500),
            @UserId BIGINT,
            @Slug NVARCHAR(300),
            @SeoTitle NVARCHAR(300),
            @SeoDescription NVARCHAR(MAX),
            @SeoKeywords NVARCHAR(1000),
            @Tags NVARCHAR(1000),
            @StartDate DATETIME,
            @EndDate DATETIME,
            @IsFree BIT,
            @IsPublic BIT,
            @MetaJson NVARCHAR(MAX),

            -- Location Info
            @LocationId BIGINT,
            @LocationName NVARCHAR(300),
            @Address NVARCHAR(MAX),
            @VenueName NVARCHAR(300),
            @AddressLine1 NVARCHAR(500),
            @AddressLine2 NVARCHAR(500),
            @AreaName NVARCHAR(300),
            @Landmark NVARCHAR(300),
            @Pincode NVARCHAR(20),
            @Latitude DECIMAL(18,10),
            @Longitude DECIMAL(18,10),
            @GoogleMapLink NVARCHAR(MAX),
            @HallName NVARCHAR(200),
            @GroundName NVARCHAR(200),
            @ParkingAvailable BIT,
            @ParkingDetails NVARCHAR(MAX),
            @CountryId NVARCHAR(100),
            @StateId NVARCHAR(100),
            @CityId NVARCHAR(100);

        SELECT 
            @EventId = EventId,
            @EventName = EventName,
            @EventCode = EventCode,
            @EventCategoryId = EventCategoryId,
            @EventSubCategoryId = EventSubCategoryId,
            @ThumbnailImage = ThumbnailImage,
            @BannerImage = BannerImage,
            @About = About,
            @TermsAndConditions = TermsAndConditions,
            @FacebookLink = FacebookLink,
            @WebsiteLink = WebsiteLink,
            @YoutubeLink = YoutubeLink,
            @InstagramLink = InstagramLink,
            @TwitterLink = TwitterLink,
            @LinkedInLink = LinkedInLink,
            @PintrestLink = PintrestLink,
            @ListingType = ListingType,
            @IsBookingAccept = IsBookingAccept,
            @BookingType = BookingType,
            @Currency = Currency,
            @EventType = EventType,
            @IsPublishActive = IsPublishActive,
            @IsPassBookingActive = IsPassBookingActive,
            @Status = Status,
            @ApprovalStatus = ApprovalStatus,
            @Capacity = Capacity,
            @TicketPrice = TicketPrice,
            @IsCancelled = IsCancelled,
            @CancelReason = CancelReason,
            @RejectionReason = RejectionReason,
            @CreatedBy = CreatedBy,
            @CreatedFrom = CreatedFrom,
            @UpdatedBy = UpdatedBy,
            @UpdatedFrom = UpdatedFrom,
            @EventRId = EventRId,
            
            -- New Event fields
            @ShortDescription = ShortDescription,
            @UserId = UserId,
            @Slug = Slug,
            @SeoTitle = SeoTitle,
            @SeoDescription = SeoDescription,
            @SeoKeywords = SeoKeywords,
            @Tags = Tags,
            @StartDate = StartDate,
            @EndDate = EndDate,
            @IsFree = IsFree,
            @IsPublic = IsPublic,
            @MetaJson = MetaJson,

            -- Location
            @LocationId = LocationId,
            @LocationName = LocationName,
            @Address = Address,
            @VenueName = VenueName,
            @AddressLine1 = AddressLine1,
            @AddressLine2 = AddressLine2,
            @AreaName = AreaName,
            @Landmark = Landmark,
            @Pincode = Pincode,
            @Latitude = Latitude,
            @Longitude = Longitude,
            @GoogleMapLink = GoogleMapLink,
            @HallName = HallName,
            @GroundName = GroundName,
            @ParkingAvailable = ParkingAvailable,
            @ParkingDetails = ParkingDetails,
            @CountryId = CountryId,
            @StateId = StateId,
            @CityId = CityId
        FROM OPENJSON(@JsonData)
        WITH (
            EventId BIGINT '$.EventId',
            EventName NVARCHAR(300) '$.EventName',
            EventCode NVARCHAR(100) '$.EventCode',
            EventCategoryId BIGINT '$.CategoryId',
            EventSubCategoryId BIGINT '$.EventSubCategoryId',
            ThumbnailImage NVARCHAR(500) '$.ThumbnailImage',
            BannerImage NVARCHAR(500) '$.BannerImage',
            About NVARCHAR(MAX) '$.About',
            TermsAndConditions NVARCHAR(MAX) '$.TermsAndConditions',
            FacebookLink NVARCHAR(500) '$.FacebookLink',
            WebsiteLink NVARCHAR(500) '$.WebsiteLink',
            YoutubeLink NVARCHAR(500) '$.YoutubeLink',
            InstagramLink NVARCHAR(500) '$.InstagramLink',
            TwitterLink NVARCHAR(500) '$.TwitterLink',
            LinkedInLink NVARCHAR(500) '$.LinkedInLink',
            PintrestLink NVARCHAR(500) '$.PintrestLink',
            ListingType INT '$.ListingType',
            IsBookingAccept BIT '$.IsBookingAccept',
            BookingType INT '$.BookingType',
            Currency NVARCHAR(10) '$.Currency',
            EventType INT '$.EventType',
            IsPublishActive BIT '$.IsPublishActive',
            IsPassBookingActive BIT '$.IsPassBookingActive',
            Status INT '$.Status',
            ApprovalStatus INT '$.ApprovalStatus',
            Capacity INT '$.Capacity',
            TicketPrice DECIMAL(18,2) '$.TicketPrice',
            IsCancelled BIT '$.IsCancelled',
            CancelReason NVARCHAR(MAX) '$.CancelReason',
            RejectionReason NVARCHAR(MAX) '$.RejectionReason',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom',
            UpdatedBy NVARCHAR(200) '$.UpdatedBy',
            UpdatedFrom NVARCHAR(100) '$.UpdatedFrom',
            EventRId NVARCHAR(100) '$.EventRId',
            
            -- New Event DTO mappings
            ShortDescription NVARCHAR(500) '$.ShortDescription',
            UserId BIGINT '$.UserId',
            Slug NVARCHAR(300) '$.Slug',
            SeoTitle NVARCHAR(300) '$.SeoTitle',
            SeoDescription NVARCHAR(MAX) '$.SeoDescription',
            SeoKeywords NVARCHAR(1000) '$.SeoKeywords',
            Tags NVARCHAR(1000) '$.Tags',
            StartDate DATETIME '$.StartDate',
            EndDate DATETIME '$.EndDate',
            IsFree BIT '$.IsFree',
            IsPublic BIT '$.IsPublic',
            MetaJson NVARCHAR(MAX) '$.MetaJson',

            -- Location
            LocationId BIGINT '$.LocationId',
            LocationName NVARCHAR(300) '$.LocationName',
            Address NVARCHAR(MAX) '$.Address',
            VenueName NVARCHAR(300) '$.VenueName',
            AddressLine1 NVARCHAR(500) '$.AddressLine1',
            AddressLine2 NVARCHAR(500) '$.AddressLine2',
            AreaName NVARCHAR(300) '$.AreaName',
            Landmark NVARCHAR(300) '$.Landmark',
            Pincode NVARCHAR(20) '$.Pincode',
            Latitude DECIMAL(18,10) '$.Latitude',
            Longitude DECIMAL(18,10) '$.Longitude',
            GoogleMapLink NVARCHAR(MAX) '$.GoogleMapLink',
            HallName NVARCHAR(200) '$.HallName',
            GroundName NVARCHAR(200) '$.GroundName',
            ParkingAvailable BIT '$.ParkingAvailable',
            ParkingDetails NVARCHAR(MAX) '$.ParkingDetails',
            CountryId NVARCHAR(100) '$.CountryId',
            StateId NVARCHAR(100) '$.StateId',
            CityId NVARCHAR(100) '$.CityId'
        );

        -- Fallback
        IF @About IS NULL OR @About = ''
        BEGIN
            SELECT @About = Description FROM OPENJSON(@JsonData) WITH (Description NVARCHAR(MAX) '$.Description');
        END

        -- Location Compatibility Fallback
        IF @VenueName IS NULL OR @VenueName = ''
            SET @VenueName = @LocationName;
        IF @AddressLine1 IS NULL OR @AddressLine1 = ''
            SET @AddressLine1 = @Address;

        -- Look up @UserId by email if it is null/zero since @CreatedBy is now the user's email
        IF @UserId IS NULL OR @UserId = 0
        BEGIN
            SELECT TOP 1 @UserId = UserId FROM Tracket_Master_User WHERE EmailId = @CreatedBy AND IsDeleted = 0;
            IF @UserId IS NULL OR @UserId = 0
                SELECT TOP 1 @UserId = UserId FROM Tracket_Master_User WHERE Name = @CreatedBy AND IsDeleted = 0;
        END

        IF @EventRId IS NULL OR @EventRId = ''
        BEGIN
            SET @EventRId = 'EVT-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12));
        END

        IF @EventId = 0
        BEGIN
            INSERT INTO Tracket_Master_Event (
                EventRId, EventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
                About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
                TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
                Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
                Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, UserId,
                ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
                IsFree, IsPublic, MetaJson, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @EventRId, @EventName, @EventCode, @EventCategoryId, @EventSubCategoryId, @ThumbnailImage, @BannerImage, 
                @About, @TermsAndConditions, @FacebookLink, @WebsiteLink, @YoutubeLink, @InstagramLink, 
                @TwitterLink, @LinkedInLink, @PintrestLink, @ListingType, ISNULL(@IsBookingAccept, 1), @BookingType, 
                ISNULL(@Currency, 'INR'), @EventType, ISNULL(@IsPublishActive, 0), ISNULL(@IsPassBookingActive, 1), 
                ISNULL(@Status, 0), ISNULL(@ApprovalStatus, 0), @Capacity, @TicketPrice, ISNULL(@IsCancelled, 0), 
                @CancelReason, @RejectionReason, @UserId,
                @ShortDescription, @Slug, @SeoTitle, @SeoDescription, @SeoKeywords, @Tags, @StartDate, @EndDate,
                ISNULL(@IsFree, 0), ISNULL(@IsPublic, 1), @MetaJson,
                0, @CreatedBy, GETDATE(), @CreatedFrom
            );

            SET @EventId = SCOPE_IDENTITY();

            INSERT INTO Tracket_Master_Event_Location (
                EventId, VenueName, AddressLine1, AddressLine2, AreaName, Landmark, Pincode, Latitude, Longitude, GoogleMapLink, HallName, GroundName, ParkingAvailable, ParkingDetails, CountryId, StateId, CityId,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @EventId, @VenueName, @AddressLine1, @AddressLine2, @AreaName, @Landmark, @Pincode, @Latitude, @Longitude, @GoogleMapLink, @HallName, @GroundName, ISNULL(@ParkingAvailable, 0), @ParkingDetails, @CountryId, @StateId, @CityId,
                0, @CreatedBy, GETDATE(), @CreatedFrom
            );

            -- Process Slots
            INSERT INTO Tracket_Master_Event_Slot (
                EventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, SlotDate, CAST(StartTime AS TIME), CAST(EndTime AS TIME), Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                0, @CreatedBy, GETDATE(), @CreatedFrom
            FROM OPENJSON(@JsonData, '$.Slots')
            WITH (
                SlotDate DATE '$.SlotDate',
                StartTime NVARCHAR(50) '$.StartTime',
                EndTime NVARCHAR(50) '$.EndTime',
                Capacity INT '$.Capacity',
                SlotName NVARCHAR(100) '$.SlotName',
                TicketPrice DECIMAL(18,2) '$.TicketPrice',
                GenderRestriction NVARCHAR(20) '$.GenderRestriction',
                AgeRestriction INT '$.AgeRestriction'
            );

            -- Process Documents
            INSERT INTO Tracket_Master_Event_Document (
                EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, DocumentName, RelativePath, ISNULL(IsPrimary, 0), ISNULL(DisplayOrder, 0), ThumbnailPath,
                0, @CreatedBy, GETDATE(), @CreatedFrom
            FROM OPENJSON(@JsonData, '$.Documents')
            WITH (
                DocumentName NVARCHAR(500) '$.DocumentName',
                RelativePath NVARCHAR(MAX) '$.RelativePath',
                IsPrimary BIT '$.IsPrimary',
                DisplayOrder INT '$.DisplayOrder',
                ThumbnailPath NVARCHAR(500) '$.ThumbnailPath'
            );

            COMMIT TRANSACTION;
            SELECT 201 AS ResultStatus, 'Event created successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            UPDATE Tracket_Master_Event
            SET 
                EventName = @EventName,
                EventCode = @EventCode,
                EventCategoryId = @EventCategoryId,
                EventSubCategoryId = @EventSubCategoryId,
                ThumbnailImage = @ThumbnailImage,
                BannerImage = @BannerImage,
                About = @About,
                TermsAndConditions = @TermsAndConditions,
                FacebookLink = @FacebookLink,
                WebsiteLink = @WebsiteLink,
                YoutubeLink = @YoutubeLink,
                InstagramLink = @InstagramLink,
                TwitterLink = @TwitterLink,
                LinkedInLink = @LinkedInLink,
                PintrestLink = @PintrestLink,
                ListingType = @ListingType,
                IsBookingAccept = ISNULL(@IsBookingAccept, IsBookingAccept),
                BookingType = @BookingType,
                Currency = ISNULL(@Currency, Currency),
                EventType = @EventType,
                IsPublishActive = ISNULL(@IsPublishActive, IsPublishActive),
                IsPassBookingActive = ISNULL(@IsPassBookingActive, IsPassBookingActive),
                Status = ISNULL(@Status, Status),
                ApprovalStatus = ISNULL(@ApprovalStatus, ApprovalStatus),
                Capacity = @Capacity,
                TicketPrice = @TicketPrice,
                IsCancelled = ISNULL(@IsCancelled, IsCancelled),
                CancelReason = @CancelReason,
                UserId = @UserId,
                ShortDescription = @ShortDescription,
                Slug = @Slug,
                SeoTitle = @SeoTitle,
                SeoDescription = @SeoDescription,
                SeoKeywords = @SeoKeywords,
                Tags = @Tags,
                StartDate = @StartDate,
                EndDate = @EndDate,
                IsFree = ISNULL(@IsFree, IsFree),
                IsPublic = ISNULL(@IsPublic, IsPublic),
                MetaJson = @MetaJson,
                UpdatedBy = @UpdatedBy,
                UpdatedDate = GETDATE(),
                UpdatedFrom = @UpdatedFrom
            WHERE EventId = @EventId;

            UPDATE Tracket_Master_Event_Location
            SET 
                VenueName = @VenueName, 
                AddressLine1 = @AddressLine1, 
                AddressLine2 = @AddressLine2,
                AreaName = @AreaName,
                Landmark = @Landmark,
                Pincode = @Pincode,
                Latitude = @Latitude, 
                Longitude = @Longitude,
                GoogleMapLink = @GoogleMapLink,
                HallName = @HallName,
                GroundName = @GroundName,
                ParkingAvailable = ISNULL(@ParkingAvailable, ParkingAvailable),
                ParkingDetails = @ParkingDetails,
                CountryId = @CountryId,
                StateId = @StateId,
                CityId = @CityId,
                UpdatedBy = @UpdatedBy,
                UpdatedDate = GETDATE(),
                UpdatedFrom = @UpdatedFrom
            WHERE EventId = @EventId;

            -- Merging slots: soft delete old slots and insert/update new ones
            UPDATE Tracket_Master_Event_Slot SET IsDeleted = 1 WHERE EventId = @EventId;

            INSERT INTO Tracket_Master_Event_Slot (
                EventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, SlotDate, CAST(StartTime AS TIME), CAST(EndTime AS TIME), Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                0, @UpdatedBy, GETDATE(), @UpdatedFrom
            FROM OPENJSON(@JsonData, '$.Slots')
            WITH (
                SlotDate DATE '$.SlotDate',
                StartTime NVARCHAR(50) '$.StartTime',
                EndTime NVARCHAR(50) '$.EndTime',
                Capacity INT '$.Capacity',
                SlotName NVARCHAR(100) '$.SlotName',
                TicketPrice DECIMAL(18,2) '$.TicketPrice',
                GenderRestriction NVARCHAR(20) '$.GenderRestriction',
                AgeRestriction INT '$.AgeRestriction'
            );

            -- Mark old documents as deleted
            UPDATE Tracket_Master_Event_Document SET IsDeleted = 1 WHERE EventId = @EventId;

            INSERT INTO Tracket_Master_Event_Document (
                EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, DocumentName, RelativePath, ISNULL(IsPrimary, 0), ISNULL(DisplayOrder, 0), ThumbnailPath,
                0, @UpdatedBy, GETDATE(), @UpdatedFrom
            FROM OPENJSON(@JsonData, '$.Documents')
            WITH (
                DocumentName NVARCHAR(500) '$.DocumentName',
                RelativePath NVARCHAR(MAX) '$.RelativePath',
                IsPrimary BIT '$.IsPrimary',
                DisplayOrder INT '$.DisplayOrder',
                ThumbnailPath NVARCHAR(500) '$.ThumbnailPath'
            );

            COMMIT TRANSACTION;
            SELECT 200 AS ResultStatus, 'Event updated successfully.' AS ResultMessage;
        END

        -- Return Event Info with all columns
        SELECT 
            E.EventId, E.EventRId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId;

        -- Return Slots
        SELECT SlotId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE EventId = @EventId AND IsDeleted = 0;

        -- Return Documents
        SELECT DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE EventId = @EventId AND IsDeleted = 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 14. USP_GetEvents
CREATE OR ALTER PROCEDURE USP_GetEvents
    @EventId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @EventId IS NOT NULL
    BEGIN
        SELECT 
            E.EventId, E.EventRId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId AND E.IsDeleted = 0;

        SELECT SlotId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE EventId = @EventId AND IsDeleted = 0;

        SELECT DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE EventId = @EventId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            E.EventId, E.EventRId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.IsDeleted = 0;

        SELECT EventId, SlotId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE IsDeleted = 0;

        SELECT EventId, DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE IsDeleted = 0;
    END
END;
GO

-- 15. USP_UpdateEventStatus
CREATE OR ALTER PROCEDURE USP_UpdateEventStatus
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventId INT, @IsActive BIT;

    SELECT 
        @EventId = EventId,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        EventId INT '$.EventId',
        IsActive BIT '$.IsActive'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Event WHERE EventId = @EventId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Event SET IsPublishActive = @IsActive WHERE EventId = @EventId;
        SELECT 200 AS ResultStatus, 'Event status updated successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Event not found.' AS ResultMessage;
    END
END;
GO

-- 16. USP_DeleteEventItem
CREATE OR ALTER PROCEDURE USP_DeleteEventItem
    @ItemId INT,
    @Type NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Type = 'SLOT'
    BEGIN
        UPDATE Tracket_Master_Event_Slot SET IsDeleted = 1 WHERE SlotId = @ItemId;
        SELECT 200 AS ResultStatus, 'Slot deleted successfully.' AS ResultMessage;
    END
    ELSE IF @Type = 'DOCUMENT'
    BEGIN
        UPDATE Tracket_Master_Event_Document SET IsDeleted = 1 WHERE DocumentId = @ItemId;
        SELECT 200 AS ResultStatus, 'Document deleted successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 400 AS ResultStatus, 'Invalid item type.' AS ResultMessage;
    END
END;
GO

-- 17. USP_DuplicateEvent
CREATE OR ALTER PROCEDURE USP_DuplicateEvent
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE 
            @EventId INT, 
            @EventRId NVARCHAR(100),
            @NewEventName NVARCHAR(150), 
            @NewEventId INT,
            @NewEventRId NVARCHAR(100),
            @CreatedBy NVARCHAR(200),
            @CreatedFrom NVARCHAR(100);

        SELECT 
            @EventId = EventId,
            @EventRId = EventRId,
            @NewEventName = NewEventName,
            @CreatedBy = CreatedBy,
            @CreatedFrom = CreatedFrom
        FROM OPENJSON(@JsonData)
        WITH (
            EventId INT '$.EventId',
            EventRId NVARCHAR(100) '$.EventRId',
            NewEventName NVARCHAR(150) '$.NewEventName',
            CreatedBy NVARCHAR(200) '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom'
        );

        -- Fallback if EventId is 0 or NULL
        IF (@EventId IS NULL OR @EventId = 0) AND (@EventRId IS NOT NULL AND @EventRId <> '')
        BEGIN
            SELECT @EventId = EventId FROM Tracket_Master_Event WHERE EventRId = @EventRId AND IsDeleted = 0;
        END

        IF NOT EXISTS(SELECT 1 FROM Tracket_Master_Event WHERE EventId = @EventId AND IsDeleted = 0)
        BEGIN
            SELECT 404 AS ResultStatus, 'Source event not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Generate new EventRId
        SET @NewEventRId = 'EVT-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12));

        -- Duplicate Base Event
        INSERT INTO Tracket_Master_Event (
            EventRId, EventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
            About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
            TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
            Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
            Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, UserId, 
            ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
            IsFree, IsPublic, MetaJson, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
        )
        SELECT 
            @NewEventRId, @NewEventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
            About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
            TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
            Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
            Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, UserId, 
            ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
            IsFree, IsPublic, MetaJson, 0, ISNULL(@CreatedBy, CreatedBy), GETDATE(), ISNULL(@CreatedFrom, 'WebUI')
        FROM Tracket_Master_Event 
        WHERE EventId = @EventId;

        SET @NewEventId = SCOPE_IDENTITY();

        -- Duplicate Location
        INSERT INTO Tracket_Master_Event_Location (
            EventId, VenueName, AddressLine1, AddressLine2, AreaName, Landmark, Pincode, Latitude, Longitude, GoogleMapLink, HallName, GroundName, ParkingAvailable, ParkingDetails, CountryId, StateId, CityId,
            IsDeleted, CreatedBy, CreatedDate, CreatedFrom
        )
        SELECT 
            @NewEventId, VenueName, AddressLine1, AddressLine2, AreaName, Landmark, Pincode, Latitude, Longitude, GoogleMapLink, HallName, GroundName, ParkingAvailable, ParkingDetails, CountryId, StateId, CityId,
            0, ISNULL(@CreatedBy, CreatedBy), GETDATE(), ISNULL(@CreatedFrom, 'WebUI')
        FROM Tracket_Master_Event_Location
        WHERE EventId = @EventId AND IsDeleted = 0;

        -- Duplicate Slots
        INSERT INTO Tracket_Master_Event_Slot (
            EventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
            IsDeleted, CreatedBy, CreatedDate, CreatedFrom
        )
        SELECT 
            @NewEventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
            0, ISNULL(@CreatedBy, CreatedBy), GETDATE(), ISNULL(@CreatedFrom, 'WebUI')
        FROM Tracket_Master_Event_Slot
        WHERE EventId = @EventId AND IsDeleted = 0;

        -- Duplicate Documents
        INSERT INTO Tracket_Master_Event_Document (
            EventId, DocumentType, FileName, FilePath, FileExtension, FileSize, Remarks, IsPrimary, DisplayOrder, ThumbnailPath,
            IsDeleted, CreatedBy, CreatedDate, CreatedFrom
        )
        SELECT 
            @NewEventId, DocumentType, FileName, FilePath, FileExtension, FileSize, Remarks, IsPrimary, DisplayOrder, ThumbnailPath,
            0, ISNULL(@CreatedBy, CreatedBy), GETDATE(), ISNULL(@CreatedFrom, 'WebUI')
        FROM Tracket_Master_Event_Document
        WHERE EventId = @EventId AND IsDeleted = 0;

        COMMIT TRANSACTION;
        SELECT 201 AS ResultStatus, 'Event duplicated successfully.' AS ResultMessage;

        SELECT 
            E.EventId, E.EventRId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @NewEventId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 18. USP_GetEventAnalytics
CREATE OR ALTER PROCEDURE USP_GetEventAnalytics
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        (SELECT COUNT(1) FROM Tracket_Master_Event WHERE IsDeleted = 0) AS TotalEvents,
        (SELECT COUNT(1) FROM Tracket_Master_Event WHERE IsPublishActive = 1 AND IsDeleted = 0) AS ActiveEvents,
        (SELECT COUNT(1) FROM Tracket_Master_Event_Slot WHERE IsDeleted = 0) AS TotalSlots,
        (SELECT ISNULL(SUM(Capacity), 0) FROM Tracket_Master_Event_Slot WHERE IsDeleted = 0) AS TotalCapacity;
END;
GO

-- 19. USP_AddEditAssetType
CREATE OR ALTER PROCEDURE USP_AddEditAssetType
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetTypeId INT, @TypeName NVARCHAR(200), @Description NVARCHAR(MAX);

    SELECT 
        @AssetTypeId = AssetTypeId,
        @TypeName = TypeName,
        @Description = Description
    FROM OPENJSON(@JsonData)
    WITH (
        AssetTypeId INT '$.AssetTypeId',
        TypeName NVARCHAR(200) '$.TypeName',
        Description NVARCHAR(MAX) '$.Description'
    );

    IF @AssetTypeId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset_Type WHERE AssetTypeName = @TypeName AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset type already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Asset_Type (AssetTypeName, Description, IsDeleted)
        VALUES (@TypeName, @Description, 0);

        SET @AssetTypeId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset type created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset_Type WHERE AssetTypeName = @TypeName AND AssetTypeId <> @AssetTypeId AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset type already exists.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset_Type 
        SET AssetTypeName = @TypeName, Description = @Description 
        WHERE AssetTypeId = @AssetTypeId;

        SELECT 200 AS ResultStatus, 'Asset type updated successfully.' AS ResultMessage;
    END

    SELECT AssetTypeId, AssetTypeName AS TypeName, Description 
    FROM Tracket_Master_Asset_Type 
    WHERE AssetTypeId = @AssetTypeId;
END;
GO

-- 20. USP_GetAssetTypes
CREATE OR ALTER PROCEDURE USP_GetAssetTypes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT AssetTypeId, AssetTypeName AS TypeName, Description 
    FROM Tracket_Master_Asset_Type 
    WHERE IsDeleted = 0;
END;
GO

-- 21. USP_AddEditAsset
CREATE OR ALTER PROCEDURE USP_AddEditAsset
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetId INT, @AssetName NVARCHAR(300), @AssetTypeId INT, @SerialNumber NVARCHAR(100), @TotalQuantity INT;

    SELECT 
        @AssetId = AssetId,
        @AssetName = AssetName,
        @AssetTypeId = AssetTypeId,
        @SerialNumber = SerialNumber,
        @TotalQuantity = TotalQuantity
    FROM OPENJSON(@JsonData)
    WITH (
        AssetId INT '$.AssetId',
        AssetName NVARCHAR(300) '$.AssetName',
        AssetTypeId INT '$.AssetTypeId',
        SerialNumber NVARCHAR(100) '$.SerialNumber',
        TotalQuantity INT '$.TotalQuantity'
    );

    IF @AssetId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset WHERE AssetCode = @SerialNumber AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset with serial number already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Asset (AssetName, AssetTypeId, AssetCode, TotalQty, AvailableQty, IsDeleted)
        VALUES (@AssetName, @AssetTypeId, @SerialNumber, @TotalQuantity, @TotalQuantity, 0);

        SET @AssetId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset registered successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Asset 
        SET AssetName = @AssetName, AssetTypeId = @AssetTypeId, AssetCode = @SerialNumber, 
            TotalQty = @TotalQuantity, AvailableQty = @TotalQuantity - (TotalQty - AvailableQty)
        WHERE AssetId = @AssetId;

        SELECT 200 AS ResultStatus, 'Asset updated successfully.' AS ResultMessage;
    END

    SELECT A.AssetId, A.AssetName, A.AssetTypeId, T.AssetTypeName AS TypeName, A.AssetCode AS SerialNumber, A.TotalQty AS TotalQuantity, A.AvailableQty AS AvailableQuantity
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.AssetId = @AssetId;
END;
GO

-- 22. USP_GetAssets
CREATE OR ALTER PROCEDURE USP_GetAssets
AS
BEGIN
    SET NOCOUNT ON;

    SELECT A.AssetId, A.AssetName, A.AssetTypeId, T.AssetTypeName AS TypeName, A.AssetCode AS SerialNumber, A.TotalQty AS TotalQuantity, A.AvailableQty AS AvailableQuantity
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.IsDeleted = 0;
END;
GO

-- 23. USP_AllocateReturnAsset
CREATE OR ALTER PROCEDURE USP_AllocateReturnAsset
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetId INT, @EventId INT, @Quantity INT, @ActionType NVARCHAR(50);

    SELECT 
        @AssetId = AssetId,
        @EventId = EventId,
        @Quantity = Quantity,
        @ActionType = ActionType
    FROM OPENJSON(@JsonData)
    WITH (
        AssetId INT '$.AssetId',
        EventId INT '$.EventId',
        Quantity INT '$.Quantity',
        ActionType NVARCHAR(50) '$.ActionType'
    );

    IF @ActionType = 'ALLOCATE'
    BEGIN
        DECLARE @Avail INT;
        SELECT @Avail = AvailableQty FROM Tracket_Master_Asset WHERE AssetId = @AssetId;

        IF @Avail < @Quantity
        BEGIN
            SELECT 400 AS ResultStatus, 'Insufficient assets available.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset SET AvailableQty = AvailableQty - @Quantity WHERE AssetId = @AssetId;

        IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Asset WHERE EventId = @EventId AND AssetId = @AssetId)
        BEGIN
            UPDATE Tracket_Master_Event_Asset SET AllocatedQty = AllocatedQty + @Quantity WHERE EventId = @EventId AND AssetId = @AssetId;
        END
        ELSE
        BEGIN
            INSERT INTO Tracket_Master_Event_Asset (EventId, AssetId, AllocatedQty, IsDeleted)
            VALUES (@EventId, @AssetId, @Quantity, 0);
        END

        SELECT 200 AS ResultStatus, 'Asset allocated successfully.' AS ResultMessage;
    END
    ELSE IF @ActionType = 'RETURN'
    BEGIN
        DECLARE @Allocated INT;
        SELECT @Allocated = AllocatedQty FROM Tracket_Master_Event_Asset WHERE EventId = @EventId AND AssetId = @AssetId;

        IF @Allocated < @Quantity
        BEGIN
            SELECT 400 AS ResultStatus, 'Cannot return more assets than allocated.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset SET AvailableQty = AvailableQty + @Quantity WHERE AssetId = @AssetId;
        UPDATE Tracket_Master_Event_Asset SET AllocatedQty = AllocatedQty - @Quantity WHERE EventId = @EventId AND AssetId = @AssetId;

        SELECT 200 AS ResultStatus, 'Asset returned successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 400 AS ResultStatus, 'Invalid action type.' AS ResultMessage;
    END
END;
GO

-- 24. USP_GetAssetInventory
CREATE OR ALTER PROCEDURE USP_GetAssetInventory
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        A.AssetId,
        A.AssetName,
        T.AssetTypeName AS TypeName,
        A.TotalQty AS TotalQuantity,
        (A.TotalQty - A.AvailableQty) AS AllocatedQuantity,
        A.AvailableQty AS AvailableQuantity
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.IsDeleted = 0;
END;
GO

-- 25. USP_CreateUpdateBooking
CREATE OR ALTER PROCEDURE USP_CreateUpdateBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @EventId INT, @SlotId INT, @UserId INT, @TotalTickets INT, @TotalAmount DECIMAL(18,2),
                @BookingReference NVARCHAR(100);

        SELECT 
            @BookingId = BookingId,
            @EventId = EventId,
            @SlotId = SlotId,
            @UserId = UserId,
            @TotalTickets = TotalTickets,
            @TotalAmount = TotalAmount
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            EventId INT '$.EventId',
            SlotId INT '$.SlotId',
            UserId INT '$.UserId',
            TotalTickets INT '$.TotalTickets',
            TotalAmount DECIMAL(18,2) '$.TotalAmount'
        );

        DECLARE @Capacity INT, @Booked INT;
        SELECT @Capacity = Capacity FROM Tracket_Master_Event_Slot WHERE SlotId = @SlotId AND IsDeleted = 0;
        
        SELECT @Booked = ISNULL(SUM(TotalTickets), 0) 
        FROM Tracket_Master_Booking 
        WHERE SlotId = @SlotId AND BookingStatus <> 2 AND IsDeleted = 0;

        IF @BookingId = 0
        BEGIN
            IF (@Capacity - @Booked) < @TotalTickets
            BEGIN
                SELECT 400 AS ResultStatus, 'Insufficient ticket capacity available.' AS ResultMessage;
                ROLLBACK TRANSACTION;
                RETURN;
            END

            SET @BookingReference = 'BK-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

            INSERT INTO Tracket_Master_Booking (BookingNo, EventId, SlotId, UserId, TotalTickets, TotalAmount, TaxAmount, DiscountAmount, FinalAmount, BookingStatus, PaymentStatus, BookingDate, IsDeleted)
            VALUES (@BookingReference, @EventId, @SlotId, @UserId, @TotalTickets, @TotalAmount, 0, 0, @TotalAmount, 1, 0, GETDATE(), 0);

            SET @BookingId = SCOPE_IDENTITY();

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(200) '$.AttendeeName',
                Email NVARCHAR(200) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber'
            );

            COMMIT TRANSACTION;
            SELECT 201 AS ResultStatus, 'Booking created successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            UPDATE Tracket_Master_Booking
            SET TotalTickets = @TotalTickets, TotalAmount = @TotalAmount, FinalAmount = @TotalAmount
            WHERE BookingId = @BookingId;

            UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;

            INSERT INTO Tracket_Master_Booking_Attendee (BookingId, FullName, Email, MobileNo, IsDeleted)
            SELECT @BookingId, AttendeeName, Email, PhoneNumber, 0
            FROM OPENJSON(@JsonData, '$.Attendees')
            WITH (
                AttendeeName NVARCHAR(200) '$.AttendeeName',
                Email NVARCHAR(200) '$.Email',
                PhoneNumber NVARCHAR(20) '$.PhoneNumber'
            );

            COMMIT TRANSACTION;
            SELECT 200 AS ResultStatus, 'Booking updated successfully.' AS ResultMessage;
        END

        SELECT 
            B.BookingId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.FinalAmount AS TotalAmount, CAST(B.BookingStatus AS VARCHAR(10)) AS BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 26. USP_GetBookings
CREATE OR ALTER PROCEDURE USP_GetBookings
    @BookingId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @BookingId IS NOT NULL
    BEGIN
        SELECT 
            B.BookingId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.FinalAmount AS TotalAmount, CAST(B.BookingStatus AS VARCHAR(10)) AS BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId AND B.IsDeleted = 0;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            B.BookingId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, B.TotalTickets, B.FinalAmount AS TotalAmount, CAST(B.BookingStatus AS VARCHAR(10)) AS BookingStatus, B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.IsDeleted = 0;

        SELECT BookingId, AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber 
        FROM Tracket_Master_Booking_Attendee 
        WHERE IsDeleted = 0;
    END
END;
GO

-- 27. USP_CancelBooking
CREATE OR ALTER PROCEDURE USP_CancelBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId INT, @Reason NVARCHAR(255);

    SELECT 
        @BookingId = BookingId,
        @Reason = Reason
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        Reason NVARCHAR(255) '$.Reason'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Booking 
        SET BookingStatus = 2, IsCancelled = 1, CancelReason = @Reason 
        WHERE BookingId = @BookingId;

        SELECT 200 AS ResultStatus, 'Booking cancelled successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Booking not found.' AS ResultMessage;
    END
END;
GO

-- 28. USP_CheckSeatAvailability
CREATE OR ALTER PROCEDURE USP_CheckSeatAvailability
    @EventId INT,
    @SlotId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Capacity INT, @Booked INT;
    SELECT @Capacity = Capacity FROM Tracket_Master_Event_Slot WHERE SlotId = @SlotId AND IsDeleted = 0;
    
    SELECT @Booked = ISNULL(SUM(TotalTickets), 0) 
    FROM Tracket_Master_Booking 
    WHERE SlotId = @SlotId AND BookingStatus <> 2 AND IsDeleted = 0;

    SELECT 
        @EventId AS EventId,
        @SlotId AS SlotId,
        ISNULL(@Capacity, 0) AS TotalCapacity,
        ISNULL(@Booked, 0) AS BookedSeats,
        (ISNULL(@Capacity, 0) - ISNULL(@Booked, 0)) AS AvailableSeats;
END;
GO

-- 29. USP_AddEditTax
CREATE OR ALTER PROCEDURE USP_AddEditTax
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaxId INT, @TaxName NVARCHAR(100), @Percentage DECIMAL(18,2);

    SELECT 
        @TaxId = TaxId,
        @TaxName = TaxName,
        @Percentage = Percentage
    FROM OPENJSON(@JsonData)
    WITH (
        TaxId INT '$.TaxId',
        TaxName NVARCHAR(100) '$.TaxName',
        Percentage DECIMAL(18,2) '$.Percentage'
    );

    IF @TaxId = 0
    BEGIN
        IF EXISTS (SELECT 1 FROM Tracket_Master_Tax WHERE TaxName = @TaxName AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Tax name already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Tax (TaxName, TaxPercentage, TaxType, IsActive, IsDeleted)
        VALUES (@TaxName, @Percentage, 1, 1, 0);

        SET @TaxId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Tax added successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Tax 
        SET TaxName = @TaxName, TaxPercentage = @Percentage 
        WHERE TaxId = @TaxId;

        SELECT 200 AS ResultStatus, 'Tax updated successfully.' AS ResultMessage;
    END

    SELECT TaxId, TaxName, TaxPercentage AS Percentage, IsActive 
    FROM Tracket_Master_Tax 
    WHERE TaxId = @TaxId;
END;
GO

-- 30. USP_GetTaxes
CREATE OR ALTER PROCEDURE USP_GetTaxes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TaxId, TaxName, TaxPercentage AS Percentage, IsActive 
    FROM Tracket_Master_Tax 
    WHERE IsDeleted = 0;
END;
GO

-- 31. USP_AddEditInvoice
CREATE OR ALTER PROCEDURE USP_AddEditInvoice
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InvoiceId INT, @BookingId INT, @BaseAmount DECIMAL(18,2), @TaxAmount DECIMAL(18,2), @TotalAmount DECIMAL(18,2),
            @InvoiceNumber NVARCHAR(100);

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

        DECLARE @UserId BIGINT;
        SELECT @UserId = UserId FROM Tracket_Master_Booking WHERE BookingId = @BookingId;

        INSERT INTO Tracket_Master_Invoice (InvoiceCode, BookingId, UserId, InvoiceDate, SubTotal, TaxAmount, DiscountAmount, GrandTotal, InvoiceStatus, InvoiceType, IsDeleted)
        VALUES (@InvoiceNumber, @BookingId, ISNULL(@UserId, 1), GETDATE(), @BaseAmount, @TaxAmount, 0, @TotalAmount, 0, 0, 0);

        SET @InvoiceId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Invoice created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Invoice 
        SET SubTotal = @BaseAmount, TaxAmount = @TaxAmount, GrandTotal = @TotalAmount 
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
        CAST(I.InvoiceStatus AS VARCHAR(10)) AS Status, 
        I.InvoiceDate AS CreatedDate,
        I.InvoiceDate AS InvoiceDate
    FROM Tracket_Master_Invoice I
    INNER JOIN Tracket_Master_Booking B ON I.BookingId = B.BookingId
    WHERE I.InvoiceId = @InvoiceId;
END;
GO

-- 32. USP_GetInvoices
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
            CAST(I.InvoiceStatus AS VARCHAR(10)) AS Status, 
            I.InvoiceDate AS CreatedDate,
            I.InvoiceDate AS InvoiceDate,
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
            CAST(I.InvoiceStatus AS VARCHAR(10)) AS Status, 
            I.InvoiceDate AS CreatedDate,
            I.InvoiceDate AS InvoiceDate,
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
            CAST(I.InvoiceStatus AS VARCHAR(10)) AS Status, 
            I.InvoiceDate AS CreatedDate,
            I.InvoiceDate AS InvoiceDate,
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

-- 33. USP_AddPayment
CREATE OR ALTER PROCEDURE USP_AddPayment
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId INT, @TransactionReference NVARCHAR(500), @Amount DECIMAL(18,2), @PaymentMode NVARCHAR(100),
                @PaymentReference NVARCHAR(200), @PaymentId INT;

        SELECT 
            @BookingId = BookingId,
            @TransactionReference = TransactionReference,
            @Amount = Amount,
            @PaymentMode = PaymentMode
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT '$.BookingId',
            TransactionReference NVARCHAR(500) '$.TransactionReference',
            Amount DECIMAL(18,2) '$.Amount',
            PaymentMode NVARCHAR(100) '$.PaymentMode'
        );

        SET @PaymentReference = 'PAY-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8));

        DECLARE @InvoiceId BIGINT;
        SELECT @InvoiceId = InvoiceId FROM Tracket_Master_Invoice WHERE BookingId = @BookingId;

        INSERT INTO Tracket_Master_Payment (BookingId, InvoiceId, PaymentReferenceNo, TransactionId, PaymentGateway, PaymentMode, PaymentStatus, Amount, TaxAmount, FinalAmount, PaymentDate, IsDeleted)
        VALUES (@BookingId, ISNULL(@InvoiceId, 1), @PaymentReference, @TransactionReference, 'STRIPE', @PaymentMode, 1, @Amount, 0, @Amount, GETDATE(), 0);

        SET @PaymentId = SCOPE_IDENTITY();

        UPDATE Tracket_Master_Invoice SET InvoiceStatus = 1 WHERE BookingId = @BookingId;
        UPDATE Tracket_Master_Booking SET PaymentStatus = 1 WHERE BookingId = @BookingId;

        COMMIT TRANSACTION;
        SELECT 201 AS ResultStatus, 'Payment completed successfully.' AS ResultMessage;

        SELECT PaymentId, PaymentReferenceNo AS PaymentReference, BookingId, TransactionId AS TransactionReference, Amount, PaymentMode, CAST(PaymentStatus AS VARCHAR(10)) AS PaymentStatus, PaymentDate
        FROM Tracket_Master_Payment
        WHERE PaymentId = @PaymentId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 34. USP_RefundPayment
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
            UPDATE Tracket_Master_Payment 
            SET PaymentStatus = 2, IsRefunded = 1, RefundAmount = @Amount, RefundDate = GETDATE(), RefundTransactionId = 'REF-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8)) 
            WHERE PaymentId = @PaymentId;

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

-- 35. USP_GenerateRegeneratePass
CREATE OR ALTER PROCEDURE USP_GenerateRegeneratePass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId INT, @PassType NVARCHAR(50), @PassNo NVARCHAR(100), @PassId INT;

    SELECT 
        @BookingId = BookingId,
        @PassType = PassType
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        PassType NVARCHAR(50) '$.PassType'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        SELECT @PassId = PassId FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0;
        SELECT 200 AS ResultStatus, 'Pass already exists.' AS ResultMessage;
    END
    ELSE
    BEGIN
        -- Generate passes for the booking attendees
        INSERT INTO Tracket_Master_Pass (BookingId, AttendeeId, PassNo, QRCode, SeatNo, PassStatus, IsUsed, IsDeleted, CreatedDate, CreatedBy)
        SELECT 
            @BookingId,
            A.AttendeeId,
            'PASS-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12)),
            'QR-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8)),
            A.SeatNo,
            1, -- Active
            0, -- Not used
            0,
            GETDATE(),
            'System'
        FROM Tracket_Master_Booking_Attendee A
        WHERE A.BookingId = @BookingId 
          AND A.IsDeleted = 0
          AND NOT EXISTS (
              SELECT 1 FROM Tracket_Master_Pass P WHERE P.AttendeeId = A.AttendeeId AND P.IsDeleted = 0
          );

        SELECT @PassId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Pass generated successfully.' AS ResultMessage;
    END

    SELECT 
        P.PassId,
        P.PassNo AS PassCode,
        P.BookingId,
        E.EventName,
        S.EventDate AS SlotDate,
        S.StartTime,
        S.EndTime,
        S.SlotName,
        P.SeatNo,
        A.FullName AS AttendeeName,
        A.FullName AS HolderName,
        A.Email AS HolderEmail,
        'TICKET' AS PassType, 
        CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
        P.CreatedDate AS GeneratedDate,
        CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
        L.VenueName,
        L.AddressLine1,
        L.AddressLine2,
        L.CityId AS City,
        L.StateId AS State,
        L.CountryId AS Country,
        L.GoogleMapLink
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Event_Slot S ON B.SlotId = S.SlotId
    INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
    LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
    WHERE P.BookingId = @BookingId;
END;
GO

-- 36. USP_GetPassDetails
CREATE OR ALTER PROCEDURE USP_GetPassDetails
    @PassId INT,
    @UserId INT = NULL,
    @UserRole INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserRole = 1
    BEGIN
        -- SuperAdmin: get details for any pass
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND P.IsDeleted = 0;
    END
    ELSE IF @UserRole = 2
    BEGIN
        -- Organizer: get details if the pass event belongs to this organizer
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND E.UserId = @UserId AND P.IsDeleted = 0;
    END
    ELSE
    BEGIN
        -- Visitor/Standard: get details if the pass booking belongs to this user
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND B.UserId = @UserId AND P.IsDeleted = 0;
    END
END;
GO

-- 37. USP_ValidatePass
CREATE OR ALTER PROCEDURE USP_ValidatePass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PassCode NVARCHAR(100);

    SELECT @PassCode = PassCode FROM OPENJSON(@JsonData) WITH (PassCode NVARCHAR(100) '$.PassCode');

    DECLARE @PassId INT, @PassStatus INT, @IsUsed BIT, @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150),
            @BookingId INT, @EventId INT, @SlotId INT, @SlotDate DATETIME, @StartTime TIME, @HolderEmail NVARCHAR(100),
            @VenueName NVARCHAR(300), @AddressLine1 NVARCHAR(500), @AddressLine2 NVARCHAR(500), @City NVARCHAR(100),
            @State NVARCHAR(100), @Country NVARCHAR(100), @GoogleMapLink NVARCHAR(MAX);

    SELECT 
        @PassId = P.PassId,
        @PassStatus = P.PassStatus,
        @IsUsed = P.IsUsed,
        @AttendeeName = A.FullName,
        @EventName = E.EventName,
        @BookingId = P.BookingId,
        @EventId = B.EventId,
        @SlotId = B.SlotId,
        @SlotDate = ES.EventDate,
        @StartTime = ES.StartTime,
        @HolderEmail = A.Email,
        @VenueName = L.VenueName,
        @AddressLine1 = L.AddressLine1,
        @AddressLine2 = L.AddressLine2,
        @City = L.CityId,
        @State = L.StateId,
        @Country = L.CountryId,
        @GoogleMapLink = L.GoogleMapLink
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
    LEFT JOIN Tracket_Master_Event_Slot ES ON B.SlotId = ES.SlotId
    LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
    WHERE P.PassNo = @PassCode AND P.IsDeleted = 0;

    IF @PassId IS NULL
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass not found or invalid.' AS Message,
            0 AS PassId,
            @PassCode AS PassCode,
            0 AS BookingId,
            0 AS EventId,
            '' AS EventName,
            0 AS SlotId,
            GETDATE() AS SlotDate,
            CAST('00:00:00' AS TIME) AS StartTime,
            '' AS HolderName,
            '' AS HolderEmail,
            '' AS VenueName,
            '' AS AddressLine1,
            '' AS AddressLine2,
            '' AS City,
            '' AS State,
            '' AS Country,
            '' AS GoogleMapLink;
    END
    ELSE IF @PassStatus <> 1 OR @IsUsed = 1
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass is already used or cancelled.' AS Message,
            @PassId AS PassId,
            @PassCode AS PassCode,
            @BookingId AS BookingId,
            @EventId AS EventId,
            @EventName AS EventName,
            @SlotId AS SlotId,
            @SlotDate AS SlotDate,
            @StartTime AS StartTime,
            @AttendeeName AS HolderName,
            @HolderEmail AS HolderEmail,
            @VenueName AS VenueName,
            @AddressLine1 AS AddressLine1,
            @AddressLine2 AS AddressLine2,
            @City AS City,
            @State AS State,
            @Country AS Country,
            @GoogleMapLink AS GoogleMapLink;
    END
    ELSE
    BEGIN
        SELECT 
            CAST(1 AS BIT) AS IsValid, 
            'Pass is valid.' AS Message,
            @PassId AS PassId,
            @PassCode AS PassCode,
            @BookingId AS BookingId,
            @EventId AS EventId,
            @EventName AS EventName,
            @SlotId AS SlotId,
            @SlotDate AS SlotDate,
            @StartTime AS StartTime,
            @AttendeeName AS HolderName,
            @HolderEmail AS HolderEmail,
            @VenueName AS VenueName,
            @AddressLine1 AS AddressLine1,
            @AddressLine2 AS AddressLine2,
            @City AS City,
            @State AS State,
            @Country AS Country,
            @GoogleMapLink AS GoogleMapLink;
    END
END;
GO

-- 37b. USP_GetUserPasses
CREATE OR ALTER PROCEDURE USP_GetUserPasses
    @UserId INT,
    @UserRole INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserRole = 1
    BEGIN
        -- SuperAdmin: get all passes
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
        WHERE P.IsDeleted = 0 AND B.IsDeleted = 0;
    END
    ELSE IF @UserRole = 2
    BEGIN
        -- Organizer: get passes for bookings of their own events (filtered by event's UserId)
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
        WHERE E.UserId = @UserId AND P.IsDeleted = 0 AND B.IsDeleted = 0;
    END
    ELSE
    BEGIN
        -- Standard/Visitor or fallback: get passes they booked
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.EventDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON B.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
        WHERE B.UserId = @UserId AND P.IsDeleted = 0 AND B.IsDeleted = 0;
    END
END;
GO

-- 38. USP_ScanPass
CREATE OR ALTER PROCEDURE USP_ScanPass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @PassCode NVARCHAR(100), @DeviceIdentifier NVARCHAR(100), @ScannerUserId INT;

        SELECT 
            @PassCode = PassCode,
            @DeviceIdentifier = DeviceIdentifier,
            @ScannerUserId = ScannerUserId
        FROM OPENJSON(@JsonData)
        WITH (
            PassCode NVARCHAR(100) '$.PassCode',
            DeviceIdentifier NVARCHAR(100) '$.DeviceIdentifier',
            ScannerUserId INT '$.ScannerUserId'
        );

        DECLARE @PassId INT, @PassStatus INT, @IsUsed BIT, @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150), @BookingId INT;

        SELECT 
            @PassId = P.PassId,
            @PassStatus = P.PassStatus,
            @IsUsed = P.IsUsed,
            @AttendeeName = A.FullName,
            @EventName = E.EventName,
            @BookingId = P.BookingId
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        WHERE P.PassNo = @PassCode AND P.IsDeleted = 0;

        IF @PassId IS NULL
        BEGIN
            SELECT 404 AS ResultStatus, 'Pass not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @IsUsed = 1
        BEGIN
            SELECT 400 AS ResultStatus, 'Pass already scanned.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Mark pass as used
        UPDATE Tracket_Master_Pass SET IsUsed = 1, UsedDate = GETDATE() WHERE PassId = @PassId;

        -- Record scanner log
        INSERT INTO Tracket_Master_Scanner_Log (PassId, BookingId, EventId, SlotId, ScanType, ScannerDevice, ScannedBy, ScanDate, IsValid, ValidationMessage, CreatedDate, CreatedBy)
        VALUES (@PassId, @BookingId, (SELECT EventId FROM Tracket_Master_Booking WHERE BookingId = @BookingId), (SELECT SlotId FROM Tracket_Master_Booking WHERE BookingId = @BookingId), 'ENTRY', @DeviceIdentifier, @ScannerUserId, GETDATE(), 1, 'Pass scanned successfully', GETDATE(), @ScannerUserId);

        DECLARE @LogId INT = SCOPE_IDENTITY();

        -- Queue Attendance Marked Notification
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'ATTENDANCE',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Attendance Marked - Event: ' + E.EventName,
            'Dear ' + U.Name + ', your pass (' + @PassCode + ') for the event ' + E.EventName + ' has been successfully scanned. Welcome to the event!',
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
        SELECT 200 AS ResultStatus, 'Pass scanned successfully.' AS ResultMessage;

        SELECT 
            @LogId AS LogId,
            @PassCode AS PassCode,
            @AttendeeName AS AttendeeName,
            @AttendeeName AS HolderName,
            @EventName AS EventName,
            GETDATE() AS ScanTime,
            GETDATE() AS ScanDate,
            'SUCCESS' AS ScanStatus,
            1 AS Status,
            (SELECT ISNULL(Name, 'System') FROM Tracket_Master_User WHERE UserId = @ScannerUserId) AS ScannerUserName,
            'Pass scanned successfully' AS ValidationMessage;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 39. USP_GetScanReports
CREATE OR ALTER PROCEDURE USP_GetScanReports
    @ReportType NVARCHAR(50) = 'HISTORY'
AS
BEGIN
    SET NOCOUNT ON;

    IF @ReportType = 'HISTORY'
    BEGIN
        SELECT 
            L.ScanLogId AS LogId,
            P.PassNo AS PassCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            E.EventName,
            L.ScanDate AS ScanTime,
            L.ScanDate AS ScanDate,
            CASE WHEN L.IsValid = 1 THEN 'SUCCESS' ELSE 'FAILED' END AS ScanStatus,
            L.IsValid AS Status,
            ISNULL(U_SCAN.Name, 'System') AS ScannerUserName,
            L.ValidationMessage AS ValidationMessage
        FROM Tracket_Master_Scanner_Log L
        INNER JOIN Tracket_Master_Pass P ON L.PassId = P.PassId
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_User U_SCAN ON L.ScannedBy = U_SCAN.UserId;
    END
    ELSE IF @ReportType = 'ATTENDANCE'
    BEGIN
        SELECT 
            E.EventId,
            E.EventName,
            SUM(B.TotalTickets) AS TotalBooked,
            SUM(CASE WHEN P.IsUsed = 1 THEN 1 ELSE 0 END) AS ScannedIn,
            SUM(CASE WHEN P.IsUsed = 0 THEN 1 ELSE 0 END) AS Pending
        FROM Tracket_Master_Event E
        LEFT JOIN Tracket_Master_Booking B ON E.EventId = B.EventId AND B.IsDeleted = 0
        LEFT JOIN Tracket_Master_Pass P ON B.BookingId = P.BookingId AND P.IsDeleted = 0
        WHERE E.IsDeleted = 0
        GROUP BY E.EventId, E.EventName;
    END
END;
GO

-- ==========================================
-- DEFAULT SYSTEM ROLES INSERTION
-- ==========================================
SET IDENTITY_INSERT Tracket_Master_Role ON;

INSERT INTO Tracket_Master_Role (RoleId, RoleName, RoleCode, Description, IsActive, IsDeleted) 
VALUES 
(1, 'SuperAdmin', 'SUPER_ADMIN', 'Super Administrator', 1, 0),
(2, 'Organizer', 'ORGANIZER', 'Event Organizer', 1, 0),
(3, 'Employee', 'EMPLOYEE', 'Employee / Staff', 1, 0),
(4, 'Visitor', 'VISITOR', 'Visitor / Attendee', 1, 0),
(5, 'Scanner', 'SCANNER', 'Scanner Agent', 1, 0);

SET IDENTITY_INSERT Tracket_Master_Role OFF;
GO

