USE EVENT_Master;
GO

-- 1. Alter USP_AddEditEvent_Full
ALTER PROCEDURE USP_AddEditEvent_Full
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

        -- Extract step 1 and step 2 fields from MetaJson
        DECLARE @Tagline NVARCHAR(300),
                @Purpose NVARCHAR(100),
                @TargetAudience NVARCHAR(300),
                @DateTimeMode NVARCHAR(20),
                @Timezone NVARCHAR(100),
                @DurationDays INT,
                @DurationHours INT,
                @DurationMinutes INT,
                @AllDay BIT,
                @ShowCountdown BIT,
                @VisibilityStartDate NVARCHAR(40),
                @VisibilityStartTime NVARCHAR(40),
                @SetupStartTime NVARCHAR(40),
                @TeardownEndTime NVARCHAR(40),
                @RecurrenceFrequency NVARCHAR(20),
                @RecurrenceInterval INT,
                @RecurrenceEndDate NVARCHAR(40);

        IF @MetaJson IS NOT NULL AND ISJSON(@MetaJson) = 1
        BEGIN
            SET @Tagline = JSON_VALUE(@MetaJson, '$.basic.tagline');
            SET @Purpose = JSON_VALUE(@MetaJson, '$.basic.purpose');
            SET @TargetAudience = JSON_VALUE(@MetaJson, '$.basic.targetAudience');
            SET @DateTimeMode = JSON_VALUE(@MetaJson, '$.datetime.mode');
            SET @Timezone = JSON_VALUE(@MetaJson, '$.datetime.timezone');
            SET @DurationDays = TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationDays') AS INT);
            SET @DurationHours = TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationHours') AS INT);
            SET @DurationMinutes = TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationMinutes') AS INT);
            SET @AllDay = ISNULL(TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.allDay') AS BIT), 0);
            SET @ShowCountdown = ISNULL(TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.showCountdown') AS BIT), 1);
            SET @VisibilityStartDate = JSON_VALUE(@MetaJson, '$.datetime.visibilityStartDate');
            SET @VisibilityStartTime = JSON_VALUE(@MetaJson, '$.datetime.visibilityStartTime');
            SET @SetupStartTime = JSON_VALUE(@MetaJson, '$.datetime.setupStartTime');
            SET @TeardownEndTime = JSON_VALUE(@MetaJson, '$.datetime.teardownEndTime');
            SET @RecurrenceFrequency = JSON_VALUE(@MetaJson, '$.datetime.recurrenceFrequency');
            SET @RecurrenceInterval = TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.recurrenceInterval') AS INT);
            SET @RecurrenceEndDate = JSON_VALUE(@MetaJson, '$.datetime.recurrenceEndDate');
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
                IsFree, IsPublic, MetaJson, IsDeleted, CreatedBy, CreatedDate, CreatedFrom,
                Tagline, Purpose, TargetAudience, DateTimeMode, Timezone, DurationDays, DurationHours, DurationMinutes,
                AllDay, ShowCountdown, VisibilityStartDate, VisibilityStartTime, SetupStartTime, TeardownEndTime,
                RecurrenceFrequency, RecurrenceInterval, RecurrenceEndDate
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
                0, @CreatedBy, GETDATE(), @CreatedFrom,
                @Tagline, @Purpose, @TargetAudience, @DateTimeMode, @Timezone, @DurationDays, @DurationHours, @DurationMinutes,
                ISNULL(@AllDay, 0), ISNULL(@ShowCountdown, 1), @VisibilityStartDate, @VisibilityStartTime, @SetupStartTime, @TeardownEndTime,
                @RecurrenceFrequency, @RecurrenceInterval, @RecurrenceEndDate
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
                UpdatedBy = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedBy ELSE UpdatedBy END,
                UpdatedDate = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN GETDATE() ELSE UpdatedDate END,
                UpdatedFrom = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedFrom ELSE UpdatedFrom END,
                Tagline = @Tagline,
                Purpose = @Purpose,
                TargetAudience = @TargetAudience,
                DateTimeMode = @DateTimeMode,
                Timezone = @Timezone,
                DurationDays = @DurationDays,
                DurationHours = @DurationHours,
                DurationMinutes = @DurationMinutes,
                AllDay = ISNULL(@AllDay, 0),
                ShowCountdown = ISNULL(@ShowCountdown, 1),
                VisibilityStartDate = @VisibilityStartDate,
                VisibilityStartTime = @VisibilityStartTime,
                SetupStartTime = @SetupStartTime,
                TeardownEndTime = @TeardownEndTime,
                RecurrenceFrequency = @RecurrenceFrequency,
                RecurrenceInterval = @RecurrenceInterval,
                RecurrenceEndDate = @RecurrenceEndDate
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
                UpdatedBy = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedBy ELSE UpdatedBy END,
                UpdatedDate = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN GETDATE() ELSE UpdatedDate END,
                UpdatedFrom = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedFrom ELSE UpdatedFrom END
            WHERE EventId = @EventId;

            -- Merging slots
            UPDATE Tracket_Master_Event_Slot 
            SET IsDeleted = 1,
                UpdatedBy = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedBy ELSE UpdatedBy END,
                UpdatedDate = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN GETDATE() ELSE UpdatedDate END,
                UpdatedFrom = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedFrom ELSE UpdatedFrom END
            WHERE EventId = @EventId AND IsDeleted = 0;

            INSERT INTO Tracket_Master_Event_Slot (
                EventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, SlotDate, CAST(StartTime AS TIME), CAST(EndTime AS TIME), Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction,
                0, ISNULL(NULLIF(@UpdatedBy, ''), @CreatedBy), GETDATE(), ISNULL(NULLIF(@UpdatedFrom, ''), @CreatedFrom)
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
            UPDATE Tracket_Master_Event_Document 
            SET IsDeleted = 1,
                UpdatedBy = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedBy ELSE UpdatedBy END,
                UpdatedDate = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN GETDATE() ELSE UpdatedDate END,
                UpdatedFrom = CASE WHEN @UpdatedBy IS NOT NULL AND @UpdatedBy <> '' THEN @UpdatedFrom ELSE UpdatedFrom END
            WHERE EventId = @EventId AND IsDeleted = 0;

            INSERT INTO Tracket_Master_Event_Document (
                EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                @EventId, DocumentName, RelativePath, ISNULL(IsPrimary, 0), ISNULL(DisplayOrder, 0), ThumbnailPath,
                0, ISNULL(NULLIF(@UpdatedBy, ''), @CreatedBy), GETDATE(), ISNULL(NULLIF(@UpdatedFrom, ''), @CreatedFrom)
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
            E.EventId, E.EventRId, E.PublicId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            E.Tagline, E.Purpose, E.TargetAudience, E.DateTimeMode, E.Timezone, E.DurationDays, E.DurationHours, E.DurationMinutes,
            E.AllDay, E.ShowCountdown, E.VisibilityStartDate, E.VisibilityStartTime, E.SetupStartTime, E.TeardownEndTime,
            E.RecurrenceFrequency, E.RecurrenceInterval, E.RecurrenceEndDate,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId;

        -- Return Slots
        SELECT SlotId, PublicId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
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

-- 2. Alter USP_GetEvents
ALTER PROCEDURE USP_GetEvents
    @EventId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @EventId IS NOT NULL
    BEGIN
        SELECT 
            E.EventId, E.EventRId, E.PublicId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            E.Tagline, E.Purpose, E.TargetAudience, E.DateTimeMode, E.Timezone, E.DurationDays, E.DurationHours, E.DurationMinutes,
            E.AllDay, E.ShowCountdown, E.VisibilityStartDate, E.VisibilityStartTime, E.SetupStartTime, E.TeardownEndTime,
            E.RecurrenceFrequency, E.RecurrenceInterval, E.RecurrenceEndDate,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId AND E.IsDeleted = 0;

        SELECT SlotId, PublicId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE EventId = @EventId AND IsDeleted = 0;

        SELECT DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE EventId = @EventId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            E.EventId, E.EventRId, E.PublicId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.UserId AS OrganizerId, E.UserId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            E.Tagline, E.Purpose, E.TargetAudience, E.DateTimeMode, E.Timezone, E.DurationDays, E.DurationHours, E.DurationMinutes,
            E.AllDay, E.ShowCountdown, E.VisibilityStartDate, E.VisibilityStartTime, E.SetupStartTime, E.TeardownEndTime,
            E.RecurrenceFrequency, E.RecurrenceInterval, E.RecurrenceEndDate,
            L.LocationId, L.VenueName, L.AddressLine1, L.AddressLine2, L.AreaName, L.Landmark, L.Pincode, L.GoogleMapLink, L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom, E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.IsDeleted = 0;

        SELECT EventId, SlotId, PublicId, EventDate AS SlotDate, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE IsDeleted = 0;

        SELECT EventId, DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE IsDeleted = 0;
    END
END;
GO
