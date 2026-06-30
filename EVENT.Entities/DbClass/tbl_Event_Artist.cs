using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_Artist
    {
        public long ArtistId { get; set; }

        public long EventId { get; set; }

        public string? ImageFile { get; set; }

        [Required(ErrorMessage = "Artist Name is required.")]
        [StringLength(100, ErrorMessage = "Artist Name cannot exceed 100 characters.")]
        public string ArtistName { get; set; }

        [StringLength(200, ErrorMessage = "Speciality cannot exceed 200 characters.")]
        public string? Speciality { get; set; }

        [Required(ErrorMessage = "Email ID is required.")]
        [EmailAddress(ErrorMessage = "Invalid Email Address.")]
        public string EmailId { get; set; }

        [Required(ErrorMessage = "Dial Code is required.")]
        [RegularExpression(@"^\+?\d+$", ErrorMessage = "Dial code must start with '+' followed by numbers.")]
        public string DialCode { get; set; }

        [Required(ErrorMessage = "Mobile Number is required.")]
        [RegularExpression(@"^\d{10,15}$", ErrorMessage = "Mobile number must be between 10 and 15 digits.")]
        public string MobileNumber { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? FacebookLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? WebsiteLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? YoutubeLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? InstagramLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? TwitterLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? LinkedInLink { get; set; }

        [Url(ErrorMessage = "Invalid URL format.")]
        public string? PintrestLink { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Hiring Price must be a positive number.")]
        public decimal? HiringPrice { get; set; }

        public DateTime? PaymentDate { get; set; }

        [Required(ErrorMessage = "Payment Type is required.")]
        [StringLength(50, ErrorMessage = "Payment Type cannot exceed 50 characters.")]
        public string PaymentType { get; set; }

        [StringLength(100, ErrorMessage = "Transaction ID cannot exceed 100 characters.")]
        public string TransactionId { get; set; }

        public long? EntryBy { get; set; }

        [DataType(DataType.DateTime, ErrorMessage = "Invalid date format.")]
        public DateTime? EntryDate { get; set; }

        public long? UpdateBy { get; set; }

        [DataType(DataType.DateTime, ErrorMessage = "Invalid date format.")]
        public DateTime? UpdateDate { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public long CommonArtistId { get; set; }
    }
}