using System;

namespace EVENT.Business.BusinessClass
{
 public class FacilityRequest
{
    public long FacilityId { get; set; }

    public string FacilityName { get; set; } = string.Empty;

    public long CreatedBy { get; set; }

    public string CreatedFrom { get; set; } = string.Empty;

    public long? UpdateBy { get; set; }

    public string? UpdatedFrom { get; set; }
}

    public class FacilityResponse
{
    public long FacilityId { get; set; }

    public string FacilityName { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public bool IsDeleted { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }

    public string CreatedFrom { get; set; } = string.Empty;

    public long? UpdateBy { get; set; }

    public DateTime? UpdateDate { get; set; }

    public string? UpdatedFrom { get; set; }
}
}
