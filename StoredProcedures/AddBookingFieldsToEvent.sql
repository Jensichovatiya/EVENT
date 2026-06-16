-- ==========================================
-- MIGRATION: Add Booking Configuration Fields to Tracket_Master_Event
-- Run this script once against your database
-- ==========================================

-- Step 1: Add new columns to Tracket_Master_Event
-- (Safe to re-run: uses IF NOT EXISTS checks)

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'MinBookingQty')
    ALTER TABLE Tracket_Master_Event ADD MinBookingQty BIGINT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'MaxBookingQty')
    ALTER TABLE Tracket_Master_Event ADD MaxBookingQty BIGINT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'MaxBookingPerUser')
    ALTER TABLE Tracket_Master_Event ADD MaxBookingPerUser BIGINT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'AllowGroupBooking')
    ALTER TABLE Tracket_Master_Event ADD AllowGroupBooking BIT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'AllowMultipleDateBooking')
    ALTER TABLE Tracket_Master_Event ADD AllowMultipleDateBooking BIT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'MaxGroupMember')
    ALTER TABLE Tracket_Master_Event ADD MaxGroupMember BIGINT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'BookingStartDate')
    ALTER TABLE Tracket_Master_Event ADD BookingStartDate DATETIME NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'BookingEndDate')
    ALTER TABLE Tracket_Master_Event ADD BookingEndDate DATETIME NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'AllowSeatSelection')
    ALTER TABLE Tracket_Master_Event ADD AllowSeatSelection BIT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tracket_Master_Event') AND name = 'AllowMultiSlotBooking')
    ALTER TABLE Tracket_Master_Event ADD AllowMultiSlotBooking BIT NOT NULL DEFAULT 0;

GO

PRINT 'Columns added to Tracket_Master_Event successfully.';
GO

-- ==========================================
-- Step 2: Update USP_AddEditEvent_Full
-- ==========================================
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
            @CityId NVARCHAR(100),

            -- Booking Configuration Fields
            @MinBookingQty BIGINT,
            @MaxBookingQty BIGINT,
            @MaxBookingPerUser BIGINT,
            @AllowGroupBooking BIT,
            @AllowMultipleDateBooking BIT,
            @MaxGroupMember BIGINT,
            @BookingStartDate DATETIME,
            @BookingEndDate DATETIME,
            @AllowSeatSelection BIT,
            @AllowMultiSlotBooking BIT;

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
            @CityId = CityId,

            -- Booking Configuration
            @MinBookingQty = MinBookingQty,
            @MaxBookingQty = MaxBookingQty,
            @MaxBookingPerUser = MaxBookingPerUser,
            @AllowGroupBooking = AllowGroupBooking,
            @AllowMultipleDateBooking = AllowMultipleDateBooking,
            @MaxGroupMember = MaxGroupMember,
            @BookingStartDate = BookingStartDate,
            @BookingEndDate = BookingEndDate,
            @AllowSeatSelection = AllowSeatSelection,
            @AllowMultiSlotBooking = AllowMultiSlotBooking
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
            CityId NVARCHAR(100) '$.CityId',

            -- Booking Configuration
            MinBookingQty BIGINT '$.MinBookingQty',
            MaxBookingQty BIGINT '$.MaxBookingQty',
            MaxBookingPerUser BIGINT '$.MaxBookingPerUser',
            AllowGroupBooking BIT '$.AllowGroupBooking',
            AllowMultipleDateBooking BIT '$.AllowMultipleDateBooking',
            MaxGroupMember BIGINT '$.MaxGroupMember',
            BookingStartDate DATETIME '$.BookingStartDate',
            BookingEndDate DATETIME '$.BookingEndDate',
            AllowSeatSelection BIT '$.AllowSeatSelection',
            AllowMultiSlotBooking BIT '$.AllowMultiSlotBooking'
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

        -- Look up @UserId by email if it is null/zero
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
                IsFree, IsPublic, MetaJson,
                MinBookingQty, MaxBookingQty, MaxBookingPerUser, AllowGroupBooking, AllowMultipleDateBooking,
                MaxGroupMember, BookingStartDate, BookingEndDate, AllowSeatSelection, AllowMultiSlotBooking,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
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
                @MinBookingQty, @MaxBookingQty, @MaxBookingPerUser,
                ISNULL(@AllowGroupBooking, 0), ISNULL(@AllowMultipleDateBooking, 0),
                @MaxGroupMember, @BookingStartDate, @BookingEndDate,
                ISNULL(@AllowSeatSelection, 0), ISNULL(@AllowMultiSlotBooking, 0),
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
                -- Booking Configuration
                MinBookingQty = @MinBookingQty,
                MaxBookingQty = @MaxBookingQty,
                MaxBookingPerUser = @MaxBookingPerUser,
                AllowGroupBooking = ISNULL(@AllowGroupBooking, AllowGroupBooking),
                AllowMultipleDateBooking = ISNULL(@AllowMultipleDateBooking, AllowMultipleDateBooking),
                MaxGroupMember = @MaxGroupMember,
                BookingStartDate = @BookingStartDate,
                BookingEndDate = @BookingEndDate,
                AllowSeatSelection = ISNULL(@AllowSeatSelection, AllowSeatSelection),
                AllowMultiSlotBooking = ISNULL(@AllowMultiSlotBooking, AllowMultiSlotBooking),
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

        -- Return Event Info with all columns including new booking fields
        SELECT 
            E.EventId, E.EventRId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            E.MinBookingQty, E.MaxBookingQty, E.MaxBookingPerUser,
            E.AllowGroupBooking, E.AllowMultipleDateBooking, E.MaxGroupMember,
            E.BookingStartDate, E.BookingEndDate, E.AllowSeatSelection, E.AllowMultiSlotBooking,
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

-- ==========================================
-- Step 3: Update USP_GetEvents
-- ==========================================
CREATE OR ALTER PROCEDURE USP_GetEvents
    @EventId INT = NULL,
    @EventRId NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Resolve EventId from EventRId if needed
    IF @EventId IS NULL AND @EventRId IS NOT NULL AND @EventRId <> ''
    BEGIN
        SELECT @EventId = EventId FROM Tracket_Master_Event WHERE EventRId = @EventRId AND IsDeleted = 0;
    END

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
            E.MinBookingQty, E.MaxBookingQty, E.MaxBookingPerUser,
            E.AllowGroupBooking, E.AllowMultipleDateBooking, E.MaxGroupMember,
            E.BookingStartDate, E.BookingEndDate, E.AllowSeatSelection, E.AllowMultiSlotBooking,
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
            E.MinBookingQty, E.MaxBookingQty, E.MaxBookingPerUser,
            E.AllowGroupBooking, E.AllowMultipleDateBooking, E.MaxGroupMember,
            E.BookingStartDate, E.BookingEndDate, E.AllowSeatSelection, E.AllowMultiSlotBooking,
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

PRINT 'Stored procedures updated successfully.';
GO
