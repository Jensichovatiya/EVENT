-- ==========================================
-- MODULE 3: EVENT MASTER MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditEvent_Full
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
            @OrganizerId BIGINT,
            @CreatedBy BIGINT,
            @CreatedFrom NVARCHAR(100),
            @UpdatedBy BIGINT,
            @UpdatedFrom NVARCHAR(100),
            
            -- New Event Fields
            @ShortDescription NVARCHAR(500),
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
            @LocationName NVARCHAR(300),
            @Address NVARCHAR(MAX),
            @Latitude DECIMAL(18,10),
            @Longitude DECIMAL(18,10),
            @CountryId BIGINT,
            @StateId BIGINT,
            @CityId BIGINT;

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
            @OrganizerId = OrganizerId,
            @CreatedBy = CreatedBy,
            @CreatedFrom = CreatedFrom,
            @UpdatedBy = UpdatedBy,
            @UpdatedFrom = UpdatedFrom,
            
            -- New Event fields
            @ShortDescription = ShortDescription,
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
            @LocationName = LocationName,
            @Address = Address,
            @Latitude = Latitude,
            @Longitude = Longitude,
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
            OrganizerId BIGINT '$.OrganizerId',
            CreatedBy BIGINT '$.CreatedBy',
            CreatedFrom NVARCHAR(100) '$.CreatedFrom',
            UpdatedBy BIGINT '$.UpdatedBy',
            UpdatedFrom NVARCHAR(100) '$.UpdatedFrom',
            
            -- New Event DTO mappings
            ShortDescription NVARCHAR(500) '$.ShortDescription',
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
            LocationName NVARCHAR(300) '$.LocationName',
            Address NVARCHAR(MAX) '$.Address',
            Latitude DECIMAL(18,10) '$.Latitude',
            Longitude DECIMAL(18,10) '$.Longitude',
            CountryId BIGINT '$.CountryId',
            StateId BIGINT '$.StateId',
            CityId BIGINT '$.CityId'
        );

        -- Fallback
        IF @About IS NULL OR @About = ''
        BEGIN
            SELECT @About = Description FROM OPENJSON(@JsonData) WITH (Description NVARCHAR(MAX) '$.Description');
        END

        IF @EventId = 0
        BEGIN
            INSERT INTO Tracket_Master_Event (
                EventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
                About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
                TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
                Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
                Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, OrganizerId, 
                ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
                IsFree, IsPublic, MetaJson, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @EventName, @EventCode, @EventCategoryId, @EventSubCategoryId, @ThumbnailImage, @BannerImage, 
                @About, @TermsAndConditions, @FacebookLink, @WebsiteLink, @YoutubeLink, @InstagramLink, 
                @TwitterLink, @LinkedInLink, @PintrestLink, @ListingType, ISNULL(@IsBookingAccept, 1), @BookingType, 
                ISNULL(@Currency, 'INR'), @EventType, ISNULL(@IsPublishActive, 0), ISNULL(@IsPassBookingActive, 1), 
                ISNULL(@Status, 0), ISNULL(@ApprovalStatus, 0), @Capacity, @TicketPrice, ISNULL(@IsCancelled, 0), 
                @CancelReason, @RejectionReason, @OrganizerId, 
                @ShortDescription, @Slug, @SeoTitle, @SeoDescription, @SeoKeywords, @Tags, @StartDate, @EndDate,
                ISNULL(@IsFree, 0), ISNULL(@IsPublic, 1), @MetaJson,
                0, @CreatedBy, GETDATE(), @CreatedFrom
            );

            SET @EventId = SCOPE_IDENTITY();

            INSERT INTO Tracket_Master_Event_Location (
                EventId, VenueName, AddressLine1, Latitude, Longitude, CountryId, StateId, CityId,
                IsDeleted, CreatedBy, CreatedDate, CreatedFrom
            )
            VALUES (
                @EventId, @LocationName, @Address, @Latitude, @Longitude, @CountryId, @StateId, @CityId,
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
                RejectionReason = @RejectionReason,
                OrganizerId = @OrganizerId,
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
                VenueName = @LocationName, 
                AddressLine1 = @Address, 
                Latitude = @Latitude, 
                Longitude = @Longitude,
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
            E.EventId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.OrganizerId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId;

        -- Return Slots
        SELECT SlotId, EventDate AS SlotDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
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

-- 2. USP_GetEvents
CREATE OR ALTER PROCEDURE USP_GetEvents
    @EventId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @EventId IS NOT NULL
    BEGIN
        SELECT 
            E.EventId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.OrganizerId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.EventId = @EventId AND E.IsDeleted = 0;

        SELECT SlotId, EventDate AS SlotDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE EventId = @EventId AND IsDeleted = 0;

        SELECT DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE EventId = @EventId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            E.EventId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.OrganizerId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.IsDeleted = 0;

        SELECT EventId, SlotId, EventDate AS SlotDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction
        FROM Tracket_Master_Event_Slot 
        WHERE IsDeleted = 0;

        SELECT EventId, DocumentId, FileName AS DocumentName, FilePath AS RelativePath, IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document 
        WHERE IsDeleted = 0;
    END
END;
GO

-- 3. USP_UpdateEventStatus
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

-- 4. USP_DeleteEventItem
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

-- 5. USP_DuplicateEvent
CREATE OR ALTER PROCEDURE USP_DuplicateEvent
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @EventId INT, @NewEventName NVARCHAR(150), @NewEventId INT;

        SELECT 
            @EventId = EventId,
            @NewEventName = NewEventName
        FROM OPENJSON(@JsonData)
        WITH (
            EventId INT '$.EventId',
            NewEventName NVARCHAR(150) '$.NewEventName'
        );

        IF NOT EXISTS(SELECT 1 FROM Tracket_Master_Event WHERE EventId = @EventId AND IsDeleted = 0)
        BEGIN
            SELECT 404 AS ResultStatus, 'Source event not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Duplicate Base Event
        INSERT INTO Tracket_Master_Event (
            EventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
            About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
            TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
            Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
            Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, OrganizerId, 
            ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
            IsFree, IsPublic, MetaJson, IsDeleted, CreatedBy, CreatedDate
        )
        SELECT 
            @NewEventName, EventCode, EventCategoryId, EventSubCategoryId, ThumbnailImage, BannerImage, 
            About, TermsAndConditions, FacebookLink, WebsiteLink, YoutubeLink, InstagramLink, 
            TwitterLink, LinkedInLink, PintrestLink, ListingType, IsBookingAccept, BookingType, 
            Currency, EventType, IsPublishActive, IsPassBookingActive, Status, ApprovalStatus, 
            Capacity, TicketPrice, IsCancelled, CancelReason, RejectionReason, OrganizerId, 
            ShortDescription, Slug, SeoTitle, SeoDescription, SeoKeywords, Tags, StartDate, EndDate,
            IsFree, IsPublic, MetaJson, 0, CreatedBy, GETDATE()
        FROM Tracket_Master_Event 
        WHERE EventId = @EventId;

        SET @NewEventId = SCOPE_IDENTITY();

        -- Duplicate Location
        INSERT INTO Tracket_Master_Event_Location (EventId, VenueName, AddressLine1, Latitude, Longitude, CountryId, StateId, CityId, IsDeleted)
        SELECT @NewEventId, VenueName, AddressLine1, Latitude, Longitude, CountryId, StateId, CityId, 0
        FROM Tracket_Master_Event_Location
        WHERE EventId = @EventId AND IsDeleted = 0;

        -- Duplicate Slots
        INSERT INTO Tracket_Master_Event_Slot (EventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction, IsDeleted)
        SELECT @NewEventId, EventDate, StartTime, EndTime, Capacity, SlotName, TicketPrice, GenderRestriction, AgeRestriction, 0
        FROM Tracket_Master_Event_Slot
        WHERE EventId = @EventId AND IsDeleted = 0;

        -- Duplicate Documents
        INSERT INTO Tracket_Master_Event_Document (EventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath, IsDeleted)
        SELECT @NewEventId, FileName, FilePath, IsPrimary, DisplayOrder, ThumbnailPath, 0
        FROM Tracket_Master_Event_Document
        WHERE EventId = @EventId AND IsDeleted = 0;

        COMMIT TRANSACTION;
        SELECT 201 AS ResultStatus, 'Event duplicated successfully.' AS ResultMessage;

        SELECT 
            E.EventId, E.EventName, E.EventCode, E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId, E.ThumbnailImage, E.BannerImage, E.About, E.About AS Description,
            E.TermsAndConditions, E.FacebookLink, E.WebsiteLink, E.YoutubeLink, E.InstagramLink, 
            E.TwitterLink, E.LinkedInLink, E.PintrestLink, E.ListingType, E.IsBookingAccept, 
            E.BookingType, E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive, 
            E.Status, E.ApprovalStatus, E.Capacity, E.TicketPrice, E.IsCancelled, E.CancelReason, 
            E.RejectionReason, E.OrganizerId, E.ShortDescription, E.Slug, E.SeoTitle, E.SeoDescription,
            E.SeoKeywords, E.Tags, E.StartDate, E.EndDate, E.IsFree, E.IsPublic, E.MetaJson,
            L.VenueName AS LocationName, L.AddressLine1 AS Address, L.Latitude, L.Longitude,
            L.CountryId, L.StateId, L.CityId, E.IsPublishActive AS IsActive
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

-- 6. USP_GetEventAnalytics
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
