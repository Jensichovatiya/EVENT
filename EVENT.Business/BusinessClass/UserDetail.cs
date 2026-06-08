using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass {
    public class UserDetail {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
        public int RoleId { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }
        public int CityId { get; set; }
        public string CityName { get; set; }
        public string Address { get; set; }
        public int Pincode { get; set; }
        public string PincodeString { get; set; }
        public DateTime Dob { get; set; }
        public string Gender { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string? DeletedBy { get; set; }
        public DateTime? LogoutTime { get; set; }
        public bool IsVerified { get; set; }
        public bool IsApproved { get; set; }
        public bool IsFreezed { get; set; }
        public bool IsLocked { get; set; }
        public string? Image { get; set; }
        public int? PlanId { get; set; }
        public string? PlanName { get; set; }
        public bool IsFreePlan { get; set; }
        public double ReeScore { get; set; }
        public int ClinicId { get; set; }
        public string? ClinicCode { get; set; }
        public string? ReeScoreColorCode { get; set; }
        public string? Prefix { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
