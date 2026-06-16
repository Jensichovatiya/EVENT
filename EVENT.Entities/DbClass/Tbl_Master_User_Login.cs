using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_User_Login
    {
        [Key]
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool IsVerified { get; set; }
        public bool IsApproved { get; set; }
        public bool IsFreezed { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsLocked { get; set; }
        public int FailedPasswordCount { get; set; }
        public string Token { get; set; }
        public DateTime LastActivityTime { get; set; }
        public long EntryBy { get; set; }
        public long EntryDate { get; set; }
        public string OTP { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
