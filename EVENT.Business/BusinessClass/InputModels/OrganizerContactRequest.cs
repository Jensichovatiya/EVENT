using System;

namespace EVENT.Business.BusinessClass
{
    public class OrganizerContactRequest
    {
        public Guid? PublicId { get; set; }

        // public Guid OrganizerPublicId { get; set; }

        public long OrganizerId { get; set; }

        public string ContactName { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string RoleResponsibility { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public string CreatedBy { get; set; } = string.Empty;

        public string CreatedFrom { get; set; } = string.Empty;

        public string UpdatedBy { get; set; } = string.Empty;

        public string UpdatedFrom { get; set; } = string.Empty;
    }
}