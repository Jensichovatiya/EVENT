using System;

namespace EVENT.Entities.DbClass
{
    public class Tracket_Master_User
    {
        public long UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UserType { get; set; }
        public long UserRole { get; set; }
        public string MobileNo { get; set; } = string.Empty;
        public string? EmailId { get; set; }
        public string? PasswordHash { get; set; }
        public string? DialCode { get; set; }
        public bool MobileConfirmation { get; set; }
        public bool EmailConfirmation { get; set; }
        public string? RefferalCode { get; set; }
        public string? RefferedByRefferalCode { get; set; }
        public bool IsAgreedToTerms { get; set; }
        public long? ParentUserId { get; set; }
        public Guid? UniqueScanCode { get; set; }
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
