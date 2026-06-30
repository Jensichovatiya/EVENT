-- ============================================================
-- Update USP_AddEditEvent_Full (v5 - safe transaction structure)
--
-- ALL operations (event, location, documents, slots) are inside
-- the transaction. Results are only returned AFTER commit succeeds.
-- If anything fails, entire operation rolls back.
--
-- Tracket_Master_Event      = event header (Step-1)
-- Tracket_Master_Event_Slot = ALL date & time detail (Step-2)
-- ============================================================
USE EVENT_Master;
GO

ALTER PROCEDURE [dbo].[USP_AddEditEvent_Full]
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY

        -- ── Variables ────────────────────────────────────────────────────────
        DECLARE 
            @EventId              BIGINT,
            @EventRId             NVARCHAR(100),
            @EventName            NVARCHAR(300),
            @EventCode            NVARCHAR(100),
            @EventCategoryId      BIGINT,
            @EventSubCategoryId   BIGINT,
            @ThumbnailImage       NVARCHAR(500),
            @BannerImage          NVARCHAR(500),
            @About                NVARCHAR(MAX),
            @TermsAndConditions   NVARCHAR(MAX),
            @FacebookLink         NVARCHAR(500),
            @WebsiteLink          NVARCHAR(500),
            @YoutubeLink          NVARCHAR(500),
            @InstagramLink        NVARCHAR(500),
            @TwitterLink          NVARCHAR(500),
            @LinkedInLink         NVARCHAR(500),
            @PintrestLink         NVARCHAR(500),
            @ListingType          INT,
            @IsBookingAccept      BIT,
            @BookingType          INT,
            @Currency             NVARCHAR(10),
            @EventType            INT,
            @IsPublishActive      BIT,
            @IsPassBookingActive  BIT,
            @Status               INT,
            @ApprovalStatus       INT,
            @Capacity             INT,
            @TicketPrice          DECIMAL(18,2),
            @IsCancelled          BIT,
            @CancelReason         NVARCHAR(MAX),
            @RejectionReason      NVARCHAR(MAX),
            @CreatedBy            NVARCHAR(200),
            @CreatedFrom          NVARCHAR(100),
            @UpdatedBy            NVARCHAR(200),
            @UpdatedFrom          NVARCHAR(100),
            @ShortDescription     NVARCHAR(500),
            @UserId               BIGINT,
            @Slug                 NVARCHAR(300),
            @SeoTitle             NVARCHAR(300),
            @SeoDescription       NVARCHAR(MAX),
            @SeoKeywords          NVARCHAR(1000),
            @Tags                 NVARCHAR(1000),
            @StartDate            DATETIME,
            @EndDate              DATETIME,
            @IsFree               BIT,
            @IsPublic             BIT,
            @MetaJson             NVARCHAR(MAX),
            -- Step-1 extras
            @Tagline              NVARCHAR(300),
            @Purpose              NVARCHAR(100),
            @TargetAudience       NVARCHAR(300),
            -- Location
            @LocationId           BIGINT,
            @LocationName         NVARCHAR(300),
            @Address              NVARCHAR(MAX),
            @VenueName            NVARCHAR(300),
            @AddressLine1         NVARCHAR(500),
            @AddressLine2         NVARCHAR(500),
            @AreaName             NVARCHAR(300),
            @Landmark             NVARCHAR(300),
            @Pincode              NVARCHAR(20),
            @Latitude             DECIMAL(18,10),
            @Longitude            DECIMAL(18,10),
            @GoogleMapLink        NVARCHAR(MAX),
            @HallName             NVARCHAR(200),
            @GroundName           NVARCHAR(200),
            @ParkingAvailable     BIT,
            @ParkingDetails       NVARCHAR(MAX),
            @CountryId            NVARCHAR(100),
            @StateId              NVARCHAR(100),
            @CityId               NVARCHAR(100),
            -- Step-2 Date & Time (→ Tracket_Master_Event_Slot only)
            @DateTimeMode         NVARCHAR(20),
            @Timezone             NVARCHAR(100),
            @DurationDays         INT,
            @DurationHours        INT,
            @DurationMinutes      INT,
            @AllDay               BIT,
            @ShowCountdown        BIT,
            @VisibilityStartDate  NVARCHAR(40),
            @VisibilityStartTime  NVARCHAR(10),
            @SetupStartTime       NVARCHAR(10),
            @TeardownEndTime      NVARCHAR(10),
            @RecurrenceFrequency  NVARCHAR(20),
            @RecurrenceInterval   INT,
            @RecurrenceEndDate    NVARCHAR(40),
            -- Step-3 Venue extra fields
            @VenueType            NVARCHAR(100),
            @VenueCategory        NVARCHAR(100),
            @Facilities           NVARCHAR(MAX),
            @VenueCapacity        INT,
            @ContactPerson        NVARCHAR(200),
            @ContactDesignation   NVARCHAR(200),
            @ContactPhoneCode     NVARCHAR(10),
            @ContactPhone         NVARCHAR(50),
            @ContactEmail         NVARCHAR(200),
            @Notes                NVARCHAR(500),
            @OtherFacility        NVARCHAR(200);

        -- ── Parse JSON (PascalCase keys = C# JsonConvert output) ─────────────
        SELECT 
            @EventId             = EventId,
            @EventRId            = EventRId,
            @EventName           = EventName,
            @EventCode           = EventCode,
            @EventCategoryId     = CategoryId,
            @EventSubCategoryId  = EventSubCategoryId,
            @ThumbnailImage      = ThumbnailImage,
            @BannerImage         = BannerImage,
            @About               = About,
            @TermsAndConditions  = TermsAndConditions,
            @FacebookLink        = FacebookLink,
            @WebsiteLink         = WebsiteLink,
            @YoutubeLink         = YoutubeLink,
            @InstagramLink       = InstagramLink,
            @TwitterLink         = TwitterLink,
            @LinkedInLink        = LinkedInLink,
            @PintrestLink        = PintrestLink,
            @ListingType         = ListingType,
            @IsBookingAccept     = IsBookingAccept,
            @BookingType         = BookingType,
            @Currency            = Currency,
            @EventType           = EventType,
            @IsPublishActive     = IsPublishActive,
            @IsPassBookingActive = IsPassBookingActive,
            @Status              = Status,
            @ApprovalStatus      = ApprovalStatus,
            @Capacity            = Capacity,
            @TicketPrice         = TicketPrice,
            @IsCancelled         = IsCancelled,
            @CancelReason        = CancelReason,
            @RejectionReason     = RejectionReason,
            @CreatedBy           = CreatedBy,
            @CreatedFrom         = CreatedFrom,
            @UpdatedBy           = UpdatedBy,
            @UpdatedFrom         = UpdatedFrom,
            @ShortDescription    = ShortDescription,
            @UserId              = UserId,
            @Slug                = Slug,
            @SeoTitle            = SeoTitle,
            @SeoDescription      = SeoDescription,
            @SeoKeywords         = SeoKeywords,
            @Tags                = Tags,
            @StartDate           = StartDate,
            @EndDate             = EndDate,
            @IsFree              = IsFree,
            @IsPublic            = IsPublic,
            @MetaJson            = MetaJson,
            @Tagline             = Tagline,
            @Purpose             = Purpose,
            @TargetAudience      = TargetAudience,
            @LocationId          = LocationId,
            @LocationName        = LocationName,
            @Address             = Address,
            @VenueName           = VenueName,
            @AddressLine1        = AddressLine1,
            @AddressLine2        = AddressLine2,
            @AreaName            = AreaName,
            @Landmark            = Landmark,
            @Pincode             = Pincode,
            @Latitude            = Latitude,
            @Longitude           = Longitude,
            @GoogleMapLink       = GoogleMapLink,
            @HallName            = HallName,
            @GroundName          = GroundName,
            @ParkingAvailable    = ParkingAvailable,
            @ParkingDetails      = ParkingDetails,
            @CountryId           = CountryId,
            @StateId             = StateId,
            @CityId              = CityId,
            @DateTimeMode        = DateTimeMode,
            @Timezone            = Timezone,
            @DurationDays        = DurationDays,
            @DurationHours       = DurationHours,
            @DurationMinutes     = DurationMinutes,
            @AllDay              = AllDay,
            @ShowCountdown       = ShowCountdown,
            @VisibilityStartDate = VisibilityStartDate,
            @VisibilityStartTime = VisibilityStartTime,
            @SetupStartTime      = SetupStartTime,
            @TeardownEndTime     = TeardownEndTime,
            @RecurrenceFrequency = RecurrenceFrequency,
            @RecurrenceInterval  = RecurrenceInterval,
            @RecurrenceEndDate   = RecurrenceEndDate,
            @VenueType           = VenueType,
            @VenueCategory       = VenueCategory,
            @Facilities          = Facilities,
            @VenueCapacity       = VenueCapacity,
            @ContactPerson       = ContactPerson,
            @ContactDesignation  = ContactDesignation,
            @ContactPhoneCode    = ContactPhoneCode,
            @ContactPhone        = ContactPhone,
            @ContactEmail        = ContactEmail,
            @Notes               = Notes,
            @OtherFacility       = OtherFacility
        FROM OPENJSON(@JsonData)
        WITH (
            EventId              BIGINT           '$.EventId',
            EventRId             NVARCHAR(100)    '$.EventRId',
            EventName            NVARCHAR(300)    '$.EventName',
            EventCode            NVARCHAR(100)    '$.EventCode',
            CategoryId           BIGINT           '$.CategoryId',
            EventSubCategoryId   BIGINT           '$.EventSubCategoryId',
            ThumbnailImage       NVARCHAR(500)    '$.ThumbnailImage',
            BannerImage          NVARCHAR(500)    '$.BannerImage',
            About                NVARCHAR(MAX)    '$.About',
            TermsAndConditions   NVARCHAR(MAX)    '$.TermsAndConditions',
            FacebookLink         NVARCHAR(500)    '$.FacebookLink',
            WebsiteLink          NVARCHAR(500)    '$.WebsiteLink',
            YoutubeLink          NVARCHAR(500)    '$.YoutubeLink',
            InstagramLink        NVARCHAR(500)    '$.InstagramLink',
            TwitterLink          NVARCHAR(500)    '$.TwitterLink',
            LinkedInLink         NVARCHAR(500)    '$.LinkedInLink',
            PintrestLink         NVARCHAR(500)    '$.PintrestLink',
            ListingType          INT              '$.ListingType',
            IsBookingAccept      BIT              '$.IsBookingAccept',
            BookingType          INT              '$.BookingType',
            Currency             NVARCHAR(10)     '$.Currency',
            EventType            INT              '$.EventType',
            IsPublishActive      BIT              '$.IsPublishActive',
            IsPassBookingActive  BIT              '$.IsPassBookingActive',
            Status               INT              '$.Status',
            ApprovalStatus       INT              '$.ApprovalStatus',
            Capacity             INT              '$.Capacity',
            TicketPrice          DECIMAL(18,2)    '$.TicketPrice',
            IsCancelled          BIT              '$.IsCancelled',
            CancelReason         NVARCHAR(MAX)    '$.CancelReason',
            RejectionReason      NVARCHAR(MAX)    '$.RejectionReason',
            CreatedBy            NVARCHAR(200)    '$.CreatedBy',
            CreatedFrom          NVARCHAR(100)    '$.CreatedFrom',
            UpdatedBy            NVARCHAR(200)    '$.UpdatedBy',
            UpdatedFrom          NVARCHAR(100)    '$.UpdatedFrom',
            ShortDescription     NVARCHAR(500)    '$.ShortDescription',
            UserId               BIGINT           '$.UserId',
            Slug                 NVARCHAR(300)    '$.Slug',
            SeoTitle             NVARCHAR(300)    '$.SeoTitle',
            SeoDescription       NVARCHAR(MAX)    '$.SeoDescription',
            SeoKeywords          NVARCHAR(1000)   '$.SeoKeywords',
            Tags                 NVARCHAR(1000)   '$.Tags',
            StartDate            DATETIME         '$.StartDate',
            EndDate              DATETIME         '$.EndDate',
            IsFree               BIT              '$.IsFree',
            IsPublic             BIT              '$.IsPublic',
            MetaJson             NVARCHAR(MAX)    '$.MetaJson',
            Tagline              NVARCHAR(300)    '$.Tagline',
            Purpose              NVARCHAR(100)    '$.Purpose',
            TargetAudience       NVARCHAR(300)    '$.TargetAudience',
            LocationId           BIGINT           '$.LocationId',
            LocationName         NVARCHAR(300)    '$.LocationName',
            Address              NVARCHAR(MAX)    '$.Address',
            VenueName            NVARCHAR(300)    '$.VenueName',
            AddressLine1         NVARCHAR(500)    '$.AddressLine1',
            AddressLine2         NVARCHAR(500)    '$.AddressLine2',
            AreaName             NVARCHAR(300)    '$.AreaName',
            Landmark             NVARCHAR(300)    '$.Landmark',
            Pincode              NVARCHAR(20)     '$.Pincode',
            Latitude             DECIMAL(18,10)   '$.Latitude',
            Longitude            DECIMAL(18,10)   '$.Longitude',
            GoogleMapLink        NVARCHAR(MAX)    '$.GoogleMapLink',
            HallName             NVARCHAR(200)    '$.HallName',
            GroundName           NVARCHAR(200)    '$.GroundName',
            ParkingAvailable     BIT              '$.ParkingAvailable',
            ParkingDetails       NVARCHAR(MAX)    '$.ParkingDetails',
            CountryId            NVARCHAR(100)    '$.CountryId',
            StateId              NVARCHAR(100)    '$.StateId',
            CityId               NVARCHAR(100)    '$.CityId',
            DateTimeMode         NVARCHAR(20)     '$.DateTimeMode',
            Timezone             NVARCHAR(100)    '$.Timezone',
            DurationDays         INT              '$.DurationDays',
            DurationHours        INT              '$.DurationHours',
            DurationMinutes      INT              '$.DurationMinutes',
            AllDay               BIT              '$.AllDay',
            ShowCountdown        BIT              '$.ShowCountdown',
            VisibilityStartDate  NVARCHAR(40)     '$.VisibilityStartDate',
            VisibilityStartTime  NVARCHAR(10)     '$.VisibilityStartTime',
            SetupStartTime       NVARCHAR(10)     '$.SetupStartTime',
            TeardownEndTime      NVARCHAR(10)     '$.TeardownEndTime',
            RecurrenceFrequency  NVARCHAR(20)     '$.RecurrenceFrequency',
            RecurrenceInterval   INT              '$.RecurrenceInterval',
            RecurrenceEndDate    NVARCHAR(40)     '$.RecurrenceEndDate',
            VenueType            NVARCHAR(100)    '$.VenueType',
            VenueCategory        NVARCHAR(100)    '$.VenueCategory',
            Facilities           NVARCHAR(MAX)    '$.Facilities',
            VenueCapacity        INT              '$.VenueCapacity',
            ContactPerson        NVARCHAR(200)    '$.ContactPerson',
            ContactDesignation   NVARCHAR(200)    '$.ContactDesignation',
            ContactPhoneCode     NVARCHAR(10)     '$.ContactPhoneCode',
            ContactPhone         NVARCHAR(50)     '$.ContactPhone',
            ContactEmail         NVARCHAR(200)    '$.ContactEmail',
            Notes                NVARCHAR(500)    '$.Notes',
            OtherFacility        NVARCHAR(200)    '$.OtherFacility'
        );

        -- ── Fallbacks ─────────────────────────────────────────────────────────
        IF @About IS NULL OR @About = ''
            SELECT @About = Description FROM OPENJSON(@JsonData) WITH (Description NVARCHAR(MAX) '$.Description');
        IF @VenueName IS NULL OR @VenueName = '' SET @VenueName = @LocationName;
        IF @AddressLine1 IS NULL OR @AddressLine1 = '' SET @AddressLine1 = @Address;

        -- MetaJson Step-1 fallbacks
        IF @MetaJson IS NOT NULL AND ISJSON(@MetaJson) = 1
        BEGIN
            SET @Tagline        = ISNULL(NULLIF(@Tagline,''),       JSON_VALUE(@MetaJson, '$.basic.tagline'));
            SET @Purpose        = ISNULL(NULLIF(@Purpose,''),       JSON_VALUE(@MetaJson, '$.basic.purpose'));
            SET @TargetAudience = ISNULL(NULLIF(@TargetAudience,''),JSON_VALUE(@MetaJson, '$.basic.targetAudience'));
        END

        -- MetaJson Step-2 fallbacks (if direct fields missing)
        IF (@DateTimeMode IS NULL OR @DateTimeMode = '') AND @MetaJson IS NOT NULL AND ISJSON(@MetaJson) = 1
        BEGIN
            SET @DateTimeMode        = JSON_VALUE(@MetaJson, '$.datetime.mode');
            SET @Timezone            = ISNULL(@Timezone,           JSON_VALUE(@MetaJson, '$.datetime.timezone'));
            SET @DurationDays        = ISNULL(@DurationDays,       TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationDays') AS INT));
            SET @DurationHours       = ISNULL(@DurationHours,      TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationHours') AS INT));
            SET @DurationMinutes     = ISNULL(@DurationMinutes,    TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.durationMinutes') AS INT));
            SET @AllDay              = ISNULL(@AllDay,             TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.allDay') AS BIT));
            SET @ShowCountdown       = ISNULL(@ShowCountdown,      TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.showCountdown') AS BIT));
            SET @VisibilityStartDate = ISNULL(@VisibilityStartDate,JSON_VALUE(@MetaJson, '$.datetime.visibilityStartDate'));
            SET @VisibilityStartTime = ISNULL(@VisibilityStartTime,JSON_VALUE(@MetaJson, '$.datetime.visibilityStartTime'));
            SET @SetupStartTime      = ISNULL(@SetupStartTime,     JSON_VALUE(@MetaJson, '$.datetime.setupStartTime'));
            SET @TeardownEndTime     = ISNULL(@TeardownEndTime,    JSON_VALUE(@MetaJson, '$.datetime.teardownEndTime'));
            SET @RecurrenceFrequency = ISNULL(@RecurrenceFrequency,JSON_VALUE(@MetaJson, '$.datetime.recurrenceFrequency'));
            SET @RecurrenceInterval  = ISNULL(@RecurrenceInterval, TRY_CAST(JSON_VALUE(@MetaJson, '$.datetime.recurrenceInterval') AS INT));
            SET @RecurrenceEndDate   = ISNULL(@RecurrenceEndDate,  JSON_VALUE(@MetaJson, '$.datetime.recurrenceEndDate'));
        END

        -- Resolve UserId
        IF @UserId IS NULL OR @UserId = 0
        BEGIN
            SELECT TOP 1 @UserId = UserId FROM Tracket_Master_User WHERE EmailId = @CreatedBy AND IsDeleted = 0;
            IF @UserId IS NULL OR @UserId = 0
                SELECT TOP 1 @UserId = UserId FROM Tracket_Master_User WHERE Name = @CreatedBy AND IsDeleted = 0;
        END
        IF @EventRId IS NULL OR @EventRId = ''
            SET @EventRId = 'EVT-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12));
        SET @DateTimeMode       = ISNULL(NULLIF(@DateTimeMode,''), 'single');
        SET @RecurrenceInterval = ISNULL(@RecurrenceInterval, 1);

        -- Derive HH:mm time strings for slots
        DECLARE @StartTimeStr NVARCHAR(10) = '';
        DECLARE @EndTimeStr   NVARCHAR(10) = '';
        IF @MetaJson IS NOT NULL AND ISJSON(@MetaJson) = 1
        BEGIN
            SET @StartTimeStr = ISNULL(JSON_VALUE(@MetaJson, '$.datetime.startTime'), '');
            SET @EndTimeStr   = ISNULL(JSON_VALUE(@MetaJson, '$.datetime.endTime'),   '');
        END
        IF @StartTimeStr = '' AND @StartDate IS NOT NULL
            SET @StartTimeStr = CONVERT(NVARCHAR(5), CAST(@StartDate AS TIME), 108);
        IF @EndTimeStr = '' AND @EndDate IS NOT NULL
            SET @EndTimeStr = CONVERT(NVARCHAR(5), CAST(@EndDate AS TIME), 108);

        DECLARE @ActorBy   NVARCHAR(200) = ISNULL(NULLIF(@UpdatedBy,''), @CreatedBy);
        DECLARE @ActorFrom NVARCHAR(100) = ISNULL(NULLIF(@UpdatedFrom,''), @CreatedFrom);

        -- ================================================================
        -- INSERT or UPDATE Tracket_Master_Event (header only)
        -- ================================================================
        IF @EventId IS NULL OR @EventId = 0
        BEGIN
            INSERT INTO Tracket_Master_Event (
                EventRId, EventName, EventCode, EventCategoryId, EventSubCategoryId,
                ThumbnailImage, BannerImage, About, TermsAndConditions,
                FacebookLink, WebsiteLink, YoutubeLink, InstagramLink,
                TwitterLink, LinkedInLink, PintrestLink,
                ListingType, IsBookingAccept, BookingType,
                Currency, EventType, IsPublishActive, IsPassBookingActive,
                Status, ApprovalStatus, Capacity, TicketPrice,
                IsCancelled, CancelReason, RejectionReason, UserId,
                ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags,
                IsFree, IsPublic, MetaJson, IsDeleted,
                CreatedBy, CreatedDate, CreatedFrom,
                Tagline, Purpose, TargetAudience
            )
            VALUES (
                @EventRId, @EventName, @EventCode, @EventCategoryId, @EventSubCategoryId,
                @ThumbnailImage, @BannerImage, @About, @TermsAndConditions,
                @FacebookLink, @WebsiteLink, @YoutubeLink, @InstagramLink,
                @TwitterLink, @LinkedInLink, @PintrestLink,
                @ListingType, ISNULL(@IsBookingAccept,1), @BookingType,
                ISNULL(@Currency,'INR'), @EventType, ISNULL(@IsPublishActive,0), ISNULL(@IsPassBookingActive,1),
                ISNULL(@Status,0), ISNULL(@ApprovalStatus,0), @Capacity, @TicketPrice,
                ISNULL(@IsCancelled,0), @CancelReason, @RejectionReason, @UserId,
                @ShortDescription, @Slug, @SeoTitle, @SeoDescription, @SeoKeywords, @Tags,
                ISNULL(@IsFree,0), ISNULL(@IsPublic,1), @MetaJson, 0,
                @ActorBy, GETDATE(), @ActorFrom,
                @Tagline, @Purpose, @TargetAudience
            );
            SET @EventId = SCOPE_IDENTITY();

            INSERT INTO Tracket_Master_Event_Location (
                EventId, VenueName, AddressLine1, AddressLine2, AreaName, Landmark, Pincode,
                Latitude, Longitude, GoogleMapLink, HallName, GroundName,
                ParkingAvailable, ParkingDetails, CountryId, StateId, CityId,
                VenueType, VenueCategory, Facilities,
                Capacity, ContactPerson, ContactDesignation, ContactPhoneCode, ContactPhone, ContactEmail, Notes, OtherFacility,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @EventId, @VenueName, @AddressLine1, @AddressLine2, @AreaName, @Landmark, @Pincode,
                @Latitude, @Longitude, @GoogleMapLink, @HallName, @GroundName,
                ISNULL(@ParkingAvailable,0), @ParkingDetails, @CountryId, @StateId, @CityId,
                @VenueType, @VenueCategory, @Facilities,
                @VenueCapacity, @ContactPerson, @ContactDesignation, @ContactPhoneCode, @ContactPhone, @ContactEmail, @Notes, @OtherFacility,
                0, @ActorBy, GETDATE(), @ActorFrom
            );

            INSERT INTO Tracket_Master_Event_Document (
                EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT @EventId, DocumentName, RelativePath,
                   ISNULL(IsPrimary,0), ISNULL(DisplayOrder,0), ThumbnailPath,
                   0, @ActorBy, GETDATE(), @ActorFrom
            FROM OPENJSON(@JsonData, '$.Documents')
            WITH (
                DocumentName  NVARCHAR(500) '$.DocumentName',
                RelativePath  NVARCHAR(MAX) '$.RelativePath',
                IsPrimary     BIT           '$.IsPrimary',
                DisplayOrder  INT           '$.DisplayOrder',
                ThumbnailPath NVARCHAR(500) '$.ThumbnailPath'
            );
        END
        ELSE
        BEGIN
            UPDATE Tracket_Master_Event SET
                EventRId            = ISNULL(NULLIF(@EventRId,''), EventRId),
                EventName           = @EventName,
                EventCode           = @EventCode,
                EventCategoryId     = @EventCategoryId,
                EventSubCategoryId  = @EventSubCategoryId,
                ThumbnailImage      = @ThumbnailImage,
                BannerImage         = @BannerImage,
                About               = @About,
                TermsAndConditions  = @TermsAndConditions,
                FacebookLink        = @FacebookLink,
                WebsiteLink         = @WebsiteLink,
                YoutubeLink         = @YoutubeLink,
                InstagramLink       = @InstagramLink,
                TwitterLink         = @TwitterLink,
                LinkedInLink        = @LinkedInLink,
                PintrestLink        = @PintrestLink,
                ListingType         = @ListingType,
                IsBookingAccept     = ISNULL(@IsBookingAccept, IsBookingAccept),
                BookingType         = @BookingType,
                Currency            = ISNULL(@Currency, Currency),
                EventType           = @EventType,
                IsPublishActive     = ISNULL(@IsPublishActive, IsPublishActive),
                IsPassBookingActive = ISNULL(@IsPassBookingActive, IsPassBookingActive),
                Status              = ISNULL(@Status, Status),
                ApprovalStatus      = ISNULL(@ApprovalStatus, ApprovalStatus),
                Capacity            = @Capacity,
                TicketPrice         = @TicketPrice,
                IsCancelled         = ISNULL(@IsCancelled, IsCancelled),
                CancelReason        = @CancelReason,
                UserId              = @UserId,
                ShortDescription    = @ShortDescription,
                Slug                = @Slug,
                SeoTitle            = @SeoTitle,
                SeoDescription      = @SeoDescription,
                SeoKeywords         = @SeoKeywords,
                Tags                = @Tags,
                IsFree              = ISNULL(@IsFree, IsFree),
                IsPublic            = ISNULL(@IsPublic, IsPublic),
                MetaJson            = @MetaJson,
                UpdatedBy           = @ActorBy,
                UpdatedDate         = GETDATE(),
                UpdatedFrom         = @ActorFrom,
                Tagline             = @Tagline,
                Purpose             = @Purpose,
                TargetAudience      = @TargetAudience
            WHERE EventId = @EventId;

            UPDATE Tracket_Master_Event_Location SET
                VenueName        = @VenueName, AddressLine1 = @AddressLine1, AddressLine2 = @AddressLine2,
                AreaName         = @AreaName,  Landmark     = @Landmark,     Pincode      = @Pincode,
                Latitude         = @Latitude,  Longitude    = @Longitude,    GoogleMapLink= @GoogleMapLink,
                HallName         = @HallName,  GroundName   = @GroundName,
                ParkingAvailable = ISNULL(@ParkingAvailable, ParkingAvailable),
                ParkingDetails   = @ParkingDetails,
                CountryId        = @CountryId, StateId = @StateId, CityId = @CityId,
                VenueType        = @VenueType, VenueCategory = @VenueCategory, Facilities = @Facilities,
                Capacity         = @VenueCapacity,
                ContactPerson    = @ContactPerson,
                ContactDesignation = @ContactDesignation,
                ContactPhoneCode = @ContactPhoneCode,
                ContactPhone     = @ContactPhone,
                ContactEmail     = @ContactEmail,
                Notes            = @Notes,
                OtherFacility    = @OtherFacility,
                UpdatedBy        = @ActorBy,   UpdatedDate = GETDATE(), UpdatedFrom = @ActorFrom
            WHERE EventId = @EventId;

            UPDATE Tracket_Master_Event_Document
            SET IsDeleted=1, UpdatedBy=@ActorBy, UpdatedDate=GETDATE(), UpdatedFrom=@ActorFrom
            WHERE EventId=@EventId AND IsDeleted=0;

            INSERT INTO Tracket_Master_Event_Document (
                EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT @EventId, DocumentName, RelativePath,
                   ISNULL(IsPrimary,0), ISNULL(DisplayOrder,0), ThumbnailPath,
                   0, @ActorBy, GETDATE(), @ActorFrom
            FROM OPENJSON(@JsonData, '$.Documents')
            WITH (
                DocumentName  NVARCHAR(500) '$.DocumentName',
                RelativePath  NVARCHAR(MAX) '$.RelativePath',
                IsPrimary     BIT           '$.IsPrimary',
                DisplayOrder  INT           '$.DisplayOrder',
                ThumbnailPath NVARCHAR(500) '$.ThumbnailPath'
            );
        END

        -- SMART UPSERT & TARGETED DELETION FOR Tracket_Master_Event_Slot (USING SLOTID ONLY)
        -- ===============================
        -- 1. TARGETED DELETION (Sirf vahi slot delete hoga jo frontend se nahi aaya)
        IF EXISTS (SELECT 1 FROM OPENJSON(@JsonData, '$.Slots'))
        BEGIN
            UPDATE S
            SET S.IsDeleted = 1, 
                S.UpdatedBy = @ActorBy, 
                S.UpdatedDate = GETDATE(), 
                S.UpdatedFrom = @ActorFrom
            FROM Tracket_Master_Event_Slot S
            WHERE S.EventId = @EventId 
              AND S.IsDeleted = 0
              AND S.EventMode = @DateTimeMode
              AND S.SlotId NOT IN (
                  SELECT SlotId 
                  FROM OPENJSON(@JsonData, '$.Slots')
                  WITH (SlotId BIGINT '$.SlotId')
                  WHERE SlotId IS NOT NULL AND SlotId > 0
              );
        END

        -- 2. PROCESS METHODS BASE ON CURRENT MODE
        IF @StartDate IS NOT NULL
        BEGIN
            -- ─── SINGLE MODE UPSERT ──────────────────────────────────────────
            IF @DateTimeMode = 'single'
            BEGIN
                IF EXISTS (SELECT 1 FROM OPENJSON(@JsonData, '$.Slots'))
                BEGIN
                    -- A. Update Existing Slots (Matching SlotId)
                    UPDATE S
                    SET S.StartTime = TRY_CAST(J.StartTime AS TIME),
                        S.EndTime = TRY_CAST(J.EndTime AS TIME),
                        S.StartDate = TRY_CAST(CONCAT(J.SlotDate, 'T', J.StartTime) AS DATETIME),
                        S.EndDate = TRY_CAST(CONCAT(J.SlotDate, 'T', J.EndTime) AS DATETIME),
                        S.Capacity = ISNULL(J.Capacity, 0),
                        S.SlotName = ISNULL(J.SlotName, @EventName),
                        S.TicketPrice = ISNULL(J.TicketPrice, 0),
                        S.Timezone = @Timezone,
                        S.AllDay = ISNULL(@AllDay, 0),
                        S.ShowCountdown = ISNULL(@ShowCountdown, 1),
                        S.UpdatedBy = @ActorBy,
                        S.UpdatedDate = GETDATE(),
                        S.UpdatedFrom = @ActorFrom
                    FROM Tracket_Master_Event_Slot S
                    INNER JOIN OPENJSON(@JsonData, '$.Slots')
                    WITH (
                        SlotId BIGINT '$.SlotId',
                        SlotDate NVARCHAR(10) '$.SlotDate',
                        StartTime NVARCHAR(10) '$.StartTime',
                        EndTime NVARCHAR(10) '$.EndTime',
                        Capacity INT '$.Capacity',
                        SlotName NVARCHAR(200) '$.SlotName',
                        TicketPrice DECIMAL(18,2) '$.TicketPrice'
                    ) J ON S.SlotId = J.SlotId
                    WHERE S.EventId = @EventId AND S.IsDeleted = 0;

                    -- B. Insert New Slots (Jinki SlotId ya toh 0 hai ya NULL)
                    INSERT INTO Tracket_Master_Event_Slot (
                        EventId, PublicId, StartTime, EndTime, StartDate, EndDate,
                        Capacity, SlotName, TicketPrice, EventMode, Timezone, AllDay, ShowCountdown,
                        SetupStartTime, TeardownEndTime, VisibilityStartDate, VisibilityStartTime,
                        DurationDays, DurationHours, DurationMinutes, OccurrenceIndex,
                        IsDeleted, CreatedBy, CreatedDate, CreatedFrom
                    )
                    SELECT 
                        @EventId,
                        NEWID(), -- Auto-generate new GUID public token for new rows
                        TRY_CAST(J.StartTime AS TIME), TRY_CAST(J.EndTime AS TIME),
                        TRY_CAST(CONCAT(J.SlotDate, 'T', J.StartTime) AS DATETIME),
                        TRY_CAST(CONCAT(J.SlotDate, 'T', J.EndTime) AS DATETIME),
                        ISNULL(J.Capacity, 0), ISNULL(J.SlotName, @EventName), ISNULL(J.TicketPrice, 0),
                        'single', @Timezone, ISNULL(@AllDay,0), ISNULL(@ShowCountdown,1),
                        @SetupStartTime, @TeardownEndTime, TRY_CAST(@VisibilityStartDate AS DATE), @VisibilityStartTime,
                        @DurationDays, @DurationHours, @DurationMinutes, ISNULL(J.OccurrenceIndex, 0),
                        0, @ActorBy, GETDATE(), @ActorFrom
                    FROM OPENJSON(@JsonData, '$.Slots')
                    WITH (
                        SlotId BIGINT '$.SlotId',
                        SlotDate NVARCHAR(10) '$.SlotDate',
                        StartTime NVARCHAR(10) '$.StartTime',
                        EndTime NVARCHAR(10) '$.EndTime',
                        Capacity INT '$.Capacity',
                        SlotName NVARCHAR(200) '$.SlotName',
                        TicketPrice DECIMAL(18,2) '$.TicketPrice',
                        OccurrenceIndex INT '$.OccurrenceIndex'
                    ) J
                    WHERE J.SlotId IS NULL OR J.SlotId = 0;
                END
                ELSE
                BEGIN
                    -- Fallback agar JSON array khali ho
                    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_Event_Slot WHERE EventId = @EventId AND EventMode = 'single' AND IsDeleted = 0)
                    BEGIN
                        INSERT INTO Tracket_Master_Event_Slot (
                            EventId, PublicId, StartTime, EndTime, StartDate, EndDate, Capacity, SlotName, TicketPrice,
                            EventMode, Timezone, AllDay, ShowCountdown, SetupStartTime, TeardownEndTime,
                            VisibilityStartDate, VisibilityStartTime, DurationDays, DurationHours, DurationMinutes,
                            OccurrenceIndex, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
                        )
                        VALUES (
                            @EventId, NEWID(), TRY_CAST(@StartTimeStr AS TIME), TRY_CAST(@EndTimeStr AS TIME), @StartDate, @EndDate,
                            ISNULL(@Capacity,0), @EventName, ISNULL(@TicketPrice,0), 'single', @Timezone, ISNULL(@AllDay,0), ISNULL(@ShowCountdown,1),
                            @SetupStartTime, @TeardownEndTime, TRY_CAST(@VisibilityStartDate AS DATE), @VisibilityStartTime,
                            @DurationDays, @DurationHours, @DurationMinutes, 0, 0, @ActorBy, GETDATE(), @ActorFrom
                        );
                    END
                END
            END

            -- ─── RECURRING MODE (Isme hamesha series fresh recreate hoti hai) ───
            IF @DateTimeMode = 'recurring'
            BEGIN
                UPDATE Tracket_Master_Event_Slot
                SET IsDeleted=1, UpdatedBy=@ActorBy, UpdatedDate=GETDATE(), UpdatedFrom=@ActorFrom
                WHERE EventId=@EventId AND EventMode = 'recurring' AND IsDeleted=0;

                DECLARE @OccDate  DATE = CAST(@StartDate AS DATE);
                DECLARE @RecurEnd DATE = ISNULL(TRY_CAST(@RecurrenceEndDate AS DATE), CAST(@EndDate AS DATE));
                DECLARE @OccIdx   INT  = 0;
                DECLARE @CleanStart NVARCHAR(8) = CASE WHEN @StartTimeStr = '' THEN '00:00' ELSE @StartTimeStr END;
                DECLARE @CleanEnd   NVARCHAR(8) = CASE WHEN @EndTimeStr = ''   THEN '00:00' ELSE @EndTimeStr   END;

                WHILE @OccDate <= @RecurEnd AND @OccIdx < 365
                BEGIN
                    DECLARE @OccStart DATETIME = CAST(CONCAT(CONVERT(NVARCHAR(10), @OccDate, 120), ' ', @CleanStart) AS DATETIME);
                    DECLARE @OccEnd   DATETIME = CAST(CONCAT(CONVERT(NVARCHAR(10), @OccDate, 120), ' ', @CleanEnd) AS DATETIME);

                    INSERT INTO Tracket_Master_Event_Slot (
                        EventId, PublicId, StartTime, EndTime, StartDate, EndDate, Capacity, SlotName, TicketPrice,
                        EventMode, Timezone, AllDay, ShowCountdown, SetupStartTime, TeardownEndTime,
                        VisibilityStartDate, VisibilityStartTime, DurationDays, DurationHours, DurationMinutes,
                        RecurrenceFrequency, RecurrenceInterval, RecurrenceEndDate, OccurrenceIndex,
                        IsDeleted, CreatedBy, CreatedDate, CreatedFrom
                    )
                    VALUES (
                        @EventId, NEWID(), TRY_CAST(@StartTimeStr AS TIME), TRY_CAST(@EndTimeStr AS TIME), @OccStart, @OccEnd,
                        ISNULL(@Capacity,0), @EventName + ' #' + CAST(@OccIdx+1 AS NVARCHAR(10)), ISNULL(@TicketPrice,0),
                        'recurring', @Timezone, ISNULL(@AllDay,0), ISNULL(@ShowCountdown,1),
                        @SetupStartTime, @TeardownEndTime, TRY_CAST(@VisibilityStartDate AS DATE), @VisibilityStartTime,
                        @DurationDays, @DurationHours, @DurationMinutes, @RecurrenceFrequency, @RecurrenceInterval, @RecurEnd,
                        @OccIdx, 0, @ActorBy, GETDATE(), @ActorFrom
                    );

                    IF @RecurrenceFrequency = 'daily'
                        SET @OccDate = DATEADD(DAY,   @RecurrenceInterval, @OccDate);
                    ELSE IF @RecurrenceFrequency = 'weekly'
                        SET @OccDate = DATEADD(WEEK,  @RecurrenceInterval, @OccDate);
                    ELSE IF @RecurrenceFrequency = 'monthly'
                        SET @OccDate = DATEADD(MONTH, @RecurrenceInterval, @OccDate);
                    ELSE
                        SET @OccDate = DATEADD(DAY, 1, @RecurEnd);

                    SET @OccIdx = @OccIdx + 1;
                END
            END
        END

        -- ================================================================
        -- ALL operations succeeded — commit and return results
        -- ================================================================
        COMMIT TRANSACTION;

        -- Table[0]: status (C# checks this first)
        SELECT 201 AS ResultStatus, 'Event saved successfully.' AS ResultMessage;

        -- Table[1]: event header (C# maps to EventResponse)
        SELECT TOP 1
            E.EventId, E.EventRId, E.PublicId,
            E.EventName, E.EventCode,
            E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId,
            E.ThumbnailImage, E.BannerImage,
            E.About, E.About AS Description,
            E.TermsAndConditions,
            E.ShortDescription, E.Slug,
            E.SeoTitle, E.SeoDescription, E.SeoKeywords, E.Tags,
            (SELECT MIN(StartDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS StartDate,
            (SELECT MAX(EndDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS EndDate,
            E.EventType, E.ListingType, E.BookingType,
            E.Currency, E.TicketPrice, E.Capacity,
            E.IsFree, E.IsPublic, E.IsPublishActive,
            E.Status, E.ApprovalStatus, E.UserId,
            E.Tagline, E.Purpose, E.TargetAudience,
            E.MetaJson,
            L.LocationId, L.VenueName, L.VenueName AS LocationName,
            L.AddressLine1, L.AddressLine1 AS Address,
            L.AddressLine2, L.AreaName, L.Landmark, L.Pincode,
            L.Latitude, L.Longitude, L.GoogleMapLink,
            L.HallName, L.GroundName, L.ParkingAvailable, L.ParkingDetails,
            L.CountryId, L.StateId, L.CityId,
            L.VenueType, L.VenueCategory, L.Facilities,
            L.Capacity AS VenueCapacity,
            L.ContactPerson, L.ContactDesignation, L.ContactPhoneCode, L.ContactPhone, L.ContactEmail,
            L.Notes, L.OtherFacility,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom,
            E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom
        FROM Tracket_Master_Event E
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId AND E.IsDeleted = 0;

        -- Table[2]: slots (C# maps to EventResponse.Slots)
        SELECT
            S.SlotId, S.PublicId, S.EventId,
            S.StartDate AS SlotDate,
            CONVERT(VARCHAR(8), S.StartTime, 108) AS StartTime,
            CONVERT(VARCHAR(8), S.EndTime,   108) AS EndTime,
            S.StartDate, S.EndDate,
            S.Capacity, S.SlotName, S.TicketPrice,
            S.EventMode, S.Timezone, S.AllDay, S.ShowCountdown,
            S.SetupStartTime, S.TeardownEndTime,
            S.VisibilityStartDate, S.VisibilityStartTime,
            S.DurationDays, S.DurationHours, S.DurationMinutes,
            S.RecurrenceFrequency, S.RecurrenceInterval, S.RecurrenceEndDate,
            S.OccurrenceIndex
        FROM Tracket_Master_Event_Slot S
        WHERE S.EventId = @EventId AND S.IsDeleted = 0
        ORDER BY S.StartDate, S.OccurrenceIndex;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg  NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrLine INT            = ERROR_LINE();
        -- Table[0] on error: status row that C# checks
        SELECT 500 AS ResultStatus,
               'Error at line ' + CAST(@ErrLine AS NVARCHAR(10)) + ': ' + @ErrMsg AS ResultMessage;
    END CATCH
END
GO

PRINT 'USP_AddEditEvent_Full updated (v5 - all ops inside transaction, results after commit).';
GO
