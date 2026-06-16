using System;

namespace EVENT.Entities.DbClass
{
    public class Tracket_Master_Role
    {
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? RoleCode { get; set; }
        public string? Description { get; set; }
        public bool IsAllowToCreateSubPartner { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedFrom { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedFrom { get; set; }
    }
}
