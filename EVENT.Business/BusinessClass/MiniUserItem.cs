using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass {
    public class MiniUserItem {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
        public string? Image { get; set; }
        public string Gender { get; set; }
        public int CityId { get; set; }
        public MiniUserItem() { }
        public MiniUserItem(int id, string firstName, string lastName, string email, string mobile) {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Mobile = mobile;
        }
        public MiniUserItem(int id, string firstName, string lastName, string email, string mobile, string gender) {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Mobile = mobile;
            Gender = gender;
        }
        public MiniUserItem(int id, string firstName, string lastName, string email, string mobile, string gender, int cityId) {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Mobile = mobile;
            Gender = gender;
            CityId = cityId;
        }
    }
}
