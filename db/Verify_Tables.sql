-- ============================================================
-- Verification: Check that both tables have correct entries
-- Run this in SSMS after saving an event via the wizard
-- ============================================================
USE EVENT_Master;
GO

-- 1. Get latest event and check all Step-1 & Step-2 columns
SELECT TOP 1
    e.EventId,
    e.EventRId,
    e.EventName,
    e.Slug,
    e.CategoryId         AS EventCategoryId,
    e.ShortDescription,
    -- Step-1 extras
    e.Tagline,
    e.Purpose,
    e.TargetAudience,
    -- Core dates (computed from slots)
    (SELECT MIN(StartDate) FROM Tracket_Master_Event_Slot WHERE EventId = e.EventId AND IsDeleted = 0) AS StartDate,
    (SELECT MAX(EndDate) FROM Tracket_Master_Event_Slot WHERE EventId = e.EventId AND IsDeleted = 0) AS EndDate,
    e.MetaJson,
    e.CreatedDate
FROM Tracket_Master_Event e
WHERE e.IsDeleted = 0
ORDER BY e.EventId DESC;

-- 2. Check slot rows generated for that event
SELECT TOP 20
    s.SlotId,
    s.EventId,
    s.StartDate,
    s.EndDate,
    s.EventMode,
    s.Timezone,
    s.AllDay,
    s.ShowCountdown,
    s.SetupStartTime,
    s.TeardownEndTime,
    s.VisibilityStartDate,
    s.VisibilityStartTime,
    s.DurationDays,
    s.DurationHours,
    s.DurationMinutes,
    s.RecurrenceFrequency,
    s.RecurrenceInterval,
    s.RecurrenceEndDate,
    s.OccurrenceIndex,
    s.IsDeleted,
    s.CreatedDate
FROM Tracket_Master_Event_Slot s
WHERE s.EventId = (
    SELECT TOP 1 EventId FROM Tracket_Master_Event 
    WHERE IsDeleted = 0 ORDER BY EventId DESC
)
ORDER BY s.StartDate, s.OccurrenceIndex;
GO
