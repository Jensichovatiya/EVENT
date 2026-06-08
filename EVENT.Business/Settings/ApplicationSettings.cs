using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Settings {
    public class ApplicationSettings {
        public string ConnectionString { get; set; }
        public string AppUrl { get; set; }
        public string BaseUrl { get; set; }
        public int MaxAllowedFailedCount { get; set; }
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUserName { get; set; }
        public string SmtpPassword { get; set; }
        public string FromEmailName { get; set; }
        public string VerifyEmailPath { get; set; }
        public bool IsProductionEnvironment { get; set; }
        public string RazorPayBaseUrl { get; set; }
        public string RazorPayKey { get; set; }
        public string RazorPaySecretKey { get; set; }
        public string RazorPayMerchentId { get; set; }
        public string SmsId { get; set; }
        public string SmsPassword { get; set; }
        public string SmsSenderId { get; set; }
        public int MaxSmsInOneHour { get; set; }
        public string LabReportFolderName { get; set; }
        public string AndroidServerKey { get; set; }
        public string AndroidSenderId { get; set; }
        public string AndroidApiUrl { get; set; }
        public string NoteAttachmentFolderName { get; set; }
        public string InvoiceFolderName { get; set; }
        public string KnowledgeBankFolderName { get; set; }
        public string HealthLibraryFolderName { get; set; }
        public int AppointmentPaymentWaitingMinutes { get; set; }
        public string VideoLibraryDocFolderName { get; set; }
        public string CommunityForumFolderName { get; set; }
        public string ReemonitorFolderName { get; set; }
        public string ReemonitorMedicationFolderName { get; set; }
        public string ReemonitorHealthRecordFolderName { get; set; }
        public string ReemonitorEcgReportFolderName { get; set; }
        public string GroceryListFolderName { get; set; }
        public string ReeworkerReportTemplate { get; set; }
        public string ReeworkerReportDirectory { get; set; }
        public int HomeStateId { get; set; }
        public decimal SGSTRate { get; set; }
        public decimal CGSTRate { get; set; }
        public decimal IGSTRate { get; set; }
        public string ReecoachApplicaitonUrl { get; set; }
        public string ReeworkerApplicationPlayStoreUrl { get; set; }
        public string ReeworkerApplicationAppStoreUrl { get; set; }
        public string FirebaseAPIKey { get; set; }
        public string DynamicLinkDomain { get; set; }
        public string AndroidPackageName { get; set; }
        public string iOSPackageName { get; set; }
        public string CountryFlagFolderName { get; set; }
        public string ImageFolderName { get; set; }
        public string RootFolderName { get; set; }
        public string ImageFolderPath { get; set; }
        public string UserImageFolderPath { get; set; }
        public string EventImageFolderPath { get; set; }

    }
}
