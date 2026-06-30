CREATE PROCEDURE [dbo].[USP_AddEditEvent_Full]
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
            @OtherFacility        NVARCHAR(200),
            -- Step-4 Zone-Asset variables
            @ZoneId               BIGINT,
            @AssetId              BIGINT,
            @ArrangementType      NVARCHAR(100),
            @ArrangementTypeId    BIGINT,
            @Quantity             INT,
            @RowCount             INT,
            @ColumnCount          INT,
            -- Step-5 Organizer variables
            @OrganizerTypeId              BIGINT,
            @OrganizationName             NVARCHAR(300),
            @GSTIN                        NVARCHAR(50),
            @PANNumber                    NVARCHAR(50),
            @OrgWebsite                   NVARCHAR(500),
            @OrgPrimaryEmail              NVARCHAR(200),
            @OrgPrimaryPhone              NVARCHAR(50),
            @OrgAlternatePhone            NVARCHAR(50),
            @OrgAddress                   NVARCHAR(MAX),
            @OrgCity                      NVARCHAR(100),
            @OrgState                     NVARCHAR(100),
            @OrgCountry                   NVARCHAR(100),
            @OrgPinCode                   NVARCHAR(20),
            @PrimaryContactName           NVARCHAR(200),
            @PrimaryContactDesignation    NVARCHAR(200),
            @PrimaryContactEmail          NVARCHAR(200),
            @PrimaryContactPhone          NVARCHAR(50),
            @EmergencyContactName         NVARCHAR(200),
            @EmergencyContactRelationship NVARCHAR(200),
            @EmergencyContactPhone        NVARCHAR(50),
            @EmergencyAlternatePhone      NVARCHAR(50),
            @YearEstablished              INT,
            @EmployeeCountId              BIGINT,
            @IndustryId                   BIGINT,
            @BusinessTypeId               BIGINT,
            @RegistrationNumber           NVARCHAR(100),
            @RegisteredAddress            NVARCHAR(MAX),
            @OrgFacebookLink              NVARCHAR(500),
            @OrgInstagramLink             NVARCHAR(500),
            @OrgLinkedInLink              NVARCHAR(500),
            @OrgTwitterLink               NVARCHAR(500),
            @OrgYouTubeLink               NVARCHAR(500),
            @OrganizationLogo             NVARCHAR(500),
            @GSTCertificate               NVARCHAR(500),
            @PANCardDocument              NVARCHAR(500),
            @RegistrationCertificate      NVARCHAR(500),
            @OtherDocument                NVARCHAR(500);

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
            @StartDate           = CASE WHEN StartDate < '1753-01-01' THEN NULL ELSE CAST(StartDate AS DATETIME) END,
            @EndDate             = CASE WHEN EndDate < '1753-01-01' THEN NULL ELSE CAST(EndDate AS DATETIME) END,
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
            @OtherFacility       = OtherFacility,
            -- Step-5 Organizer mappings
            @OrganizerTypeId              = OrganizerTypeId,
            @OrganizationName             = OrganizationName,
            @GSTIN                        = GSTIN,
            @PANNumber                    = PANNumber,
            @OrgWebsite                   = OrgWebsite,
            @OrgPrimaryEmail              = OrgPrimaryEmail,
            @OrgPrimaryPhone              = OrgPrimaryPhone,
            @OrgAlternatePhone            = OrgAlternatePhone,
            @OrgAddress                   = OrgAddress,
            @OrgCity                      = OrgCity,
            @OrgState                     = OrgState,
            @OrgCountry                   = OrgCountry,
            @OrgPinCode                   = OrgPinCode,
            @PrimaryContactName           = PrimaryContactName,
            @PrimaryContactDesignation    = PrimaryContactDesignation,
            @PrimaryContactEmail          = PrimaryContactEmail,
            @PrimaryContactPhone          = PrimaryContactPhone,
            @EmergencyContactName         = EmergencyContactName,
            @EmergencyContactRelationship = EmergencyContactRelationship,
            @EmergencyContactPhone        = EmergencyContactPhone,
            @EmergencyAlternatePhone      = EmergencyAlternatePhone,
            @YearEstablished              = YearEstablished,
            @EmployeeCountId              = EmployeeCountId,
            @IndustryId                   = IndustryId,
            @BusinessTypeId               = BusinessTypeId,
            @RegistrationNumber           = RegistrationNumber,
            @RegisteredAddress            = RegisteredAddress,
            @OrgFacebookLink              = OrgFacebookLink,
            @OrgInstagramLink             = OrgInstagramLink,
            @OrgLinkedInLink              = OrgLinkedInLink,
            @OrgTwitterLink               = OrgTwitterLink,
            @OrgYouTubeLink               = OrgYouTubeLink,
            @OrganizationLogo             = OrganizationLogo,
            @GSTCertificate               = GSTCertificate,
            @PANCardDocument              = PANCardDocument,
            @RegistrationCertificate      = RegistrationCertificate,
            @OtherDocument                = OtherDocument
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
            StartDate            DATETIME2        '$.StartDate',
            EndDate              DATETIME2        '$.EndDate',
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
            OtherFacility        NVARCHAR(200)    '$.OtherFacility',
            -- Step-5 Organizer schema fields
            OrganizerTypeId              BIGINT           '$.OrganizerTypeId',
            OrganizationName             NVARCHAR(300)    '$.OrganizationName',
            GSTIN                        NVARCHAR(50)     '$.GSTIN',
            PANNumber                    NVARCHAR(50)     '$.PANNumber',
            OrgWebsite                   NVARCHAR(500)    '$.OrgWebsite',
            OrgPrimaryEmail              NVARCHAR(200)    '$.OrgPrimaryEmail',
            OrgPrimaryPhone              NVARCHAR(50)     '$.OrgPrimaryPhone',
            OrgAlternatePhone            NVARCHAR(50)     '$.OrgAlternatePhone',
            OrgAddress                   NVARCHAR(MAX)    '$.OrgAddress',
            OrgCity                      NVARCHAR(100)    '$.OrgCity',
            OrgState                     NVARCHAR(100)    '$.OrgState',
            OrgCountry                   NVARCHAR(100)    '$.OrgCountry',
            OrgPinCode                   NVARCHAR(20)     '$.OrgPinCode',
            PrimaryContactName           NVARCHAR(200)    '$.PrimaryContactName',
            PrimaryContactDesignation    NVARCHAR(200)    '$.PrimaryContactDesignation',
            PrimaryContactEmail          NVARCHAR(200)    '$.PrimaryContactEmail',
            PrimaryContactPhone          NVARCHAR(50)     '$.PrimaryContactPhone',
            EmergencyContactName         NVARCHAR(200)    '$.EmergencyContactName',
            EmergencyContactRelationship NVARCHAR(200)    '$.EmergencyContactRelationship',
            EmergencyContactPhone        NVARCHAR(50)     '$.EmergencyContactPhone',
            EmergencyAlternatePhone      NVARCHAR(50)     '$.EmergencyAlternatePhone',
            YearEstablished              INT              '$.YearEstablished',
            EmployeeCountId              BIGINT           '$.EmployeeCountId',
            IndustryId                   BIGINT           '$.IndustryId',
            BusinessTypeId               BIGINT           '$.BusinessTypeId',
            RegistrationNumber           NVARCHAR(100)    '$.RegistrationNumber',
            RegisteredAddress            NVARCHAR(MAX)    '$.RegisteredAddress',
            OrgFacebookLink              NVARCHAR(500)    '$.OrgFacebookLink',
            OrgInstagramLink             NVARCHAR(500)    '$.OrgInstagramLink',
            OrgLinkedInLink              NVARCHAR(500)    '$.OrgLinkedInLink',
            OrgTwitterLink               NVARCHAR(500)    '$.OrgTwitterLink',
            OrgYouTubeLink               NVARCHAR(500)    '$.OrgYouTubeLink',
            OrganizationLogo             NVARCHAR(500)    '$.OrganizationLogo',
            GSTCertificate               NVARCHAR(500)    '$.GSTCertificate',
            PANCardDocument              NVARCHAR(500)    '$.PANCardDocument',
            RegistrationCertificate      NVARCHAR(500)    '$.RegistrationCertificate',
            OtherDocument                NVARCHAR(500)    '$.OtherDocument'
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

            -- Insert Organizer
            INSERT INTO Tracket_Master_Event_Organizer (
                UserId, EventId, OrganizerTypeId, OrganizationName, GSTIN, PANNumber, Website,
                PrimaryEmail, PrimaryPhone, AlternatePhone, Address, City, State, Country, PinCode,
                PrimaryContactName, PrimaryContactDesignation, PrimaryContactEmail, PrimaryContactPhone,
                EmergencyContactName, EmergencyContactRelationship, EmergencyContactPhone, EmergencyAlternatePhone,
                YearEstablished, EmployeeCountId, IndustryId, BusinessTypeId, RegistrationNumber, RegisteredAddress,
                FacebookLink, InstagramLink, LinkedInLink, TwitterLink, YouTubeLink,
                OrganizationLogo, GSTCertificate, PANCardDocument, RegistrationCertificate, OtherDocument,
                IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom, PublicId
            )
            VALUES (
                @UserId, @EventId, @OrganizerTypeId, @OrganizationName, @GSTIN, @PANNumber, @OrgWebsite,
                @OrgPrimaryEmail, @OrgPrimaryPhone, @OrgAlternatePhone, @OrgAddress, @OrgCity, @OrgState, @OrgCountry, @OrgPinCode,
                @PrimaryContactName, @PrimaryContactDesignation, @PrimaryContactEmail, @PrimaryContactPhone,
                @EmergencyContactName, @EmergencyContactRelationship, @EmergencyContactPhone, @EmergencyAlternatePhone,
                @YearEstablished, @EmployeeCountId, @IndustryId, @BusinessTypeId, @RegistrationNumber, @RegisteredAddress,
                @OrgFacebookLink, @OrgInstagramLink, @OrgLinkedInLink, @OrgTwitterLink, @OrgYouTubeLink,
                @OrganizationLogo, @GSTCertificate, @PANCardDocument, @RegistrationCertificate, @OtherDocument,
                1, 0, @ActorBy, GETDATE(), @ActorFrom, NEWID()
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

            -- Update Organizer
            IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Organizer WHERE EventId = @EventId)
            BEGIN
                UPDATE Tracket_Master_Event_Organizer
                SET OrganizerTypeId = @OrganizerTypeId,
                    OrganizationName = @OrganizationName,
                    GSTIN = @GSTIN,
                    PANNumber = @PANNumber,
                    Website = @OrgWebsite,
                    PrimaryEmail = @OrgPrimaryEmail,
                    PrimaryPhone = @OrgPrimaryPhone,
                    AlternatePhone = @OrgAlternatePhone,
                    Address = @OrgAddress,
                    City = @OrgCity,
                    State = @OrgState,
                    Country = @OrgCountry,
                    PinCode = @OrgPinCode,
                    PrimaryContactName = @PrimaryContactName,
                    PrimaryContactDesignation = @PrimaryContactDesignation,
                    PrimaryContactEmail = @PrimaryContactEmail,
                    PrimaryContactPhone = @PrimaryContactPhone,
                    EmergencyContactName = @EmergencyContactName,
                    EmergencyContactRelationship = @EmergencyContactRelationship,
                    EmergencyContactPhone = @EmergencyContactPhone,
                    EmergencyAlternatePhone = @EmergencyAlternatePhone,
                    YearEstablished = @YearEstablished,
                    EmployeeCountId = @EmployeeCountId,
                    IndustryId = @IndustryId,
                    BusinessTypeId = @BusinessTypeId,
                    RegistrationNumber = @RegistrationNumber,
                    RegisteredAddress = @RegisteredAddress,
                    FacebookLink = @OrgFacebookLink,
                    InstagramLink = @OrgInstagramLink,
                    LinkedInLink = @OrgLinkedInLink,
                    TwitterLink = @OrgTwitterLink,
                    YouTubeLink = @OrgYouTubeLink,
                    OrganizationLogo = @OrganizationLogo,
                    GSTCertificate = @GSTCertificate,
                    PANCardDocument = @PANCardDocument,
                    RegistrationCertificate = @RegistrationCertificate,
                    OtherDocument = @OtherDocument,
                    UpdatedBy = @ActorBy,
                    UpdatedDate = GETDATE(),
                    UpdatedFrom = @ActorFrom
                WHERE EventId = @EventId;
            END
            ELSE
            BEGIN
                INSERT INTO Tracket_Master_Event_Organizer (
                    UserId, EventId, OrganizerTypeId, OrganizationName, GSTIN, PANNumber, Website,
                    PrimaryEmail, PrimaryPhone, AlternatePhone, Address, City, State, Country, PinCode,
                    PrimaryContactName, PrimaryContactDesignation, PrimaryContactEmail, PrimaryContactPhone,
                    EmergencyContactName, EmergencyContactRelationship, EmergencyContactPhone, EmergencyAlternatePhone,
                    YearEstablished, EmployeeCountId, IndustryId, BusinessTypeId, RegistrationNumber, RegisteredAddress,
                    FacebookLink, InstagramLink, LinkedInLink, TwitterLink, YouTubeLink,
                    OrganizationLogo, GSTCertificate, PANCardDocument, RegistrationCertificate, OtherDocument,
                    IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom, PublicId
                )
                VALUES (
                    @UserId, @EventId, @OrganizerTypeId, @OrganizationName, @GSTIN, @PANNumber, @OrgWebsite,
                    @OrgPrimaryEmail, @OrgPrimaryPhone, @OrgAlternatePhone, @OrgAddress, @OrgCity, @OrgState, @OrgCountry, @OrgPinCode,
                    @PrimaryContactName, @PrimaryContactDesignation, @PrimaryContactEmail, @PrimaryContactPhone,
                    @EmergencyContactName, @EmergencyContactRelationship, @EmergencyContactPhone, @EmergencyAlternatePhone,
                    @YearEstablished, @EmployeeCountId, @IndustryId, @BusinessTypeId, @RegistrationNumber, @RegisteredAddress,
                    @OrgFacebookLink, @OrgInstagramLink, @OrgLinkedInLink, @OrgTwitterLink, @OrgYouTubeLink,
                    @OrganizationLogo, @GSTCertificate, @PANCardDocument, @RegistrationCertificate, @OtherDocument,
                    1, 0, @ActorBy, GETDATE(), @ActorFrom, NEWID()
                );
            END

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

                DECLARE @OccDate  DATE = TRY_CAST(@StartDate AS DATE);
                DECLARE @RecurEnd DATE = ISNULL(TRY_CAST(@RecurrenceEndDate AS DATE), TRY_CAST(@EndDate AS DATE));
                DECLARE @OccIdx   INT  = 0;
                DECLARE @CleanStart NVARCHAR(8) = CASE WHEN @StartTimeStr = '' THEN '00:00' ELSE @StartTimeStr END;
                DECLARE @CleanEnd   NVARCHAR(8) = CASE WHEN @EndTimeStr = ''   THEN '00:00' ELSE @EndTimeStr   END;

                WHILE @OccDate <= @RecurEnd AND @OccIdx < 365
                BEGIN
                    DECLARE @OccStart DATETIME = TRY_CAST(CONCAT(CONVERT(NVARCHAR(10), @OccDate, 120), ' ', @CleanStart) AS DATETIME);
                    DECLARE @OccEnd   DATETIME = TRY_CAST(CONCAT(CONVERT(NVARCHAR(10), @OccDate, 120), ' ', @CleanEnd) AS DATETIME);

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
        -- Shred/In-line Step 4 details (Zone-Asset & Seats)
        -- ================================================================
     -- ================================================================
        -- FIXED & OPTIMIZED STEP 4: MULTI-ASSET SUMMARY & SEATS (SET-BASED)
        -- ================================================================
        IF @MetaJson IS NOT NULL AND ISJSON(@MetaJson) = 1
        BEGIN
            ----------------------------------------------------------------
            -- A. PREPARE TEMP TABLES WITH CORRECT JSON PATHS
            ----------------------------------------------------------------
            DECLARE @NewSeats TABLE (
                ZoneId BIGINT, ItemId NVARCHAR(100), RowName NVARCHAR(20), ColumnNo INT, 
                Label NVARCHAR(50), Status NVARCHAR(50), Price DECIMAL(18,2), Remarks NVARCHAR(500), AssetId BIGINT
            );

            DECLARE @NewZoneAssets TABLE (
                ZoneId BIGINT, AssetId BIGINT, ArrangementType NVARCHAR(100), Quantity INT, [RowCount] INT, [ColumnCount] INT
            );

            -- Fetch current zoneId directly from details root
            DECLARE @CurrentZoneId BIGINT = ISNULL(TRY_CAST(JSON_VALUE(@MetaJson, '$.details.zoneId') AS BIGINT), 1);

            -- 1. Parse flat items array from correct path: '$.details.assetItems'
            INSERT INTO @NewSeats (ZoneId, ItemId, RowName, ColumnNo, Label, Status, Price, Remarks, AssetId)
            SELECT 
                @CurrentZoneId,
                I.ItemId,
                ISNULL(I.RowName, 'G'),
                ISNULL(TRY_CAST(I.ColumnNo AS INT), 0),
                I.Label,
                ISNULL(I.Status, 'Available'),
                ISNULL(TRY_CAST(I.Price AS DECIMAL(18,2)), 0.00),
                I.Remarks,
                TRY_CAST(I.AssetId AS BIGINT)
            FROM OPENJSON(@MetaJson, '$.details.assetItems')
            WITH (
                ItemId NVARCHAR(100) '$.itemId',
                RowName NVARCHAR(20) '$.rowName',
                ColumnNo NVARCHAR(50) '$.columnNo',
                Label NVARCHAR(50) '$.label',
                Status NVARCHAR(50) '$.status',
                Price NVARCHAR(50) '$.price',
                Remarks NVARCHAR(500) '$.remarks',
                AssetId NVARCHAR(50) '$.assetId'
            ) I
            WHERE I.AssetId IS NOT NULL;

            -- 2. Aggregate counts to create exactly ONE row per unique Asset ID
            INSERT INTO @NewZoneAssets (ZoneId, AssetId, ArrangementType, Quantity, [RowCount], [ColumnCount])
            SELECT 
                ZoneId,
                AssetId,
                ISNULL(JSON_VALUE(@MetaJson, '$.details.arrangementType'), 'Manual Arrange') AS ArrangementType,
                COUNT(1) AS Quantity, -- Converts 30 chair entries into a count of '30'
                ISNULL(TRY_CAST(JSON_VALUE(@MetaJson, '$.details.rows') AS INT), 1) AS [RowCount],
                ISNULL(TRY_CAST(JSON_VALUE(@MetaJson, '$.details.columns') AS INT), 1) AS [ColumnCount]
            FROM @NewSeats
            GROUP BY ZoneId, AssetId;

            ----------------------------------------------------------------
            -- B. STOCK MANAGEMENT (RESTORE & DEDUCT)
            ----------------------------------------------------------------
            -- Restore previous quantities
            UPDATE A
            SET A.AvailableQty = ISNULL(A.AvailableQty, 0) + O.Quantity
            FROM dbo.Tracket_Master_Asset A
            INNER JOIN dbo.Tracket_Master_Event_Zone_Asset O ON A.AssetId = O.AssetId
            WHERE O.EventId = @EventId AND O.IsDeleted = 0 AND A.IsDeleted = 0;

            -- Deduct new quantities
            UPDATE A
            SET A.AvailableQty = CASE WHEN ISNULL(A.AvailableQty, 0) >= N.Quantity THEN A.AvailableQty - N.Quantity ELSE 0 END
            FROM dbo.Tracket_Master_Asset A
            INNER JOIN @NewZoneAssets N ON A.AssetId = N.AssetId
            WHERE A.IsDeleted = 0;

            ----------------------------------------------------------------
            -- C. UPSERT MAPPING SUMMARY (Tracket_Master_Event_Zone_Asset)
            ----------------------------------------------------------------
            -- Soft delete assets no longer in the payload
            UPDATE dbo.Tracket_Master_Event_Zone_Asset
            SET IsDeleted = 1, UpdatedBy = 1, UpdatedDate = GETDATE(), UpdatedFrom = @ActorFrom
            WHERE EventId = @EventId AND IsDeleted = 0 AND AssetId NOT IN (SELECT AssetId FROM @NewZoneAssets);

            -- Merge to handle single row summary updates/inserts
            MERGE dbo.Tracket_Master_Event_Zone_Asset AS Target
            USING (
                SELECT N.*, 
                       ISNULL((SELECT TOP 1 V.ValueId FROM Tracket_Master_GeneralMasterValue V 
                               INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId 
                               WHERE C.DDL_ID = 'ArrangementType' AND V.Description = N.ArrangementType), 94) AS ArrangementTypeId
                FROM @NewZoneAssets N
            ) AS Source
            ON (Target.EventId = @EventId AND Target.ZoneId = Source.ZoneId AND Target.AssetId = Source.AssetId)
            
            WHEN MATCHED THEN
                UPDATE SET 
                    Target.Quantity = Source.Quantity,
                    Target.ArrangementTypeId = Source.ArrangementTypeId,
                    Target.[RowCount] = Source.[RowCount],
                    Target.[ColumnCount] = Source.[ColumnCount],
                    Target.IsDeleted = 0,
                    Target.UpdatedBy = 1,
                    Target.UpdatedDate = GETDATE(),
                    Target.UpdatedFrom = @ActorFrom
            
            WHEN NOT MATCHED THEN
                INSERT (EventId, ZoneId, AssetId, ArrangementTypeId, Quantity, [RowCount], [ColumnCount], IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
                VALUES (@EventId, Source.ZoneId, Source.AssetId, Source.ArrangementTypeId, Source.Quantity, Source.[RowCount], Source.[ColumnCount], 1, 0, 1, GETDATE(), @ActorFrom);

            ----------------------------------------------------------------
            -- D. SYNC DETAILED SEATS BREAKDOWN (Tracket_Master_Event_Zone_Seat)
            ----------------------------------------------------------------
            -- Soft delete missing rows
            UPDATE S
            SET S.IsDeleted = 1, S.UpdatedBy = 1, S.UpdatedDate = GETDATE(), S.UpdatedFrom = @ActorFrom
            FROM Tracket_Master_Event_Zone_Seat S
            WHERE S.EventId = @EventId AND S.IsBooked = 0 AND S.IsDeleted = 0;

            -- Update existing seats
            UPDATE S
            SET S.SeatNumber = N.Label,
                S.SeatStatus = N.Status,
                S.Price = N.Price,
                S.Remarks = CAST(N.AssetId AS NVARCHAR(500)),
                S.IsDeleted = 0,
                S.UpdatedBy = 1,
                S.UpdatedDate = GETDATE(),
                S.UpdatedFrom = @ActorFrom
            FROM Tracket_Master_Event_Zone_Seat S
            INNER JOIN @NewSeats N ON S.EventId = @EventId AND S.ZoneId = N.ZoneId AND S.RowName = N.RowName AND S.ColumnNo = N.ColumnNo;

            -- Insert new detailed seats
            INSERT INTO Tracket_Master_Event_Zone_Seat (
                SeatRId, ZoneId, EventId, SeatNumber, RowName, ColumnNo, SeatStatus, 
                IsBooked, IsBlocked, IsReserved, Price, Remarks, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            SELECT 
                REPLACE(CAST(NEWID() AS NVARCHAR(50)), '-', ''), N.ZoneId, @EventId, N.Label, N.RowName, N.ColumnNo, N.Status,
                0, 0, 0, N.Price, CAST(N.AssetId AS NVARCHAR(500)), 0, 1, GETDATE(), @ActorFrom
            FROM @NewSeats N
            WHERE NOT EXISTS (
                SELECT 1 FROM Tracket_Master_Event_Zone_Seat S 
                WHERE S.EventId = @EventId AND S.ZoneId = N.ZoneId AND S.RowName = N.RowName AND S.ColumnNo = N.ColumnNo
            );
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
            E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom,
            -- Step-5 Organizer fields
            O.OrganizerTypeId, O.OrganizationName, O.GSTIN, O.PANNumber, O.Website AS OrgWebsite,
            O.PrimaryEmail AS OrgPrimaryEmail, O.PrimaryPhone AS OrgPrimaryPhone, O.AlternatePhone AS OrgAlternatePhone,
            O.Address AS OrgAddress, O.City AS OrgCity, O.State AS OrgState, O.Country AS OrgCountry, O.PinCode AS OrgPinCode,
            O.PrimaryContactName, O.PrimaryContactDesignation, O.PrimaryContactEmail, O.PrimaryContactPhone,
            O.EmergencyContactName, O.EmergencyContactRelationship, O.EmergencyContactPhone, O.EmergencyAlternatePhone,
            O.YearEstablished, O.EmployeeCountId, O.IndustryId, O.BusinessTypeId, O.RegistrationNumber, O.RegisteredAddress,
            O.FacebookLink AS OrgFacebookLink, O.InstagramLink AS OrgInstagramLink, O.LinkedInLink AS OrgLinkedInLink,
            O.TwitterLink AS OrgTwitterLink, O.YouTubeLink AS OrgYouTubeLink, O.OrganizationLogo,
            O.GSTCertificate, O.PANCardDocument, O.RegistrationCertificate, O.OtherDocument
        FROM Tracket_Master_Event E
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        LEFT JOIN Tracket_Master_Event_Organizer O ON E.EventId = O.EventId AND O.IsDeleted = 0
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
