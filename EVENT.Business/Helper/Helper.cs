using Dapper;
using EVENT.Business.BusinessClass;
using EVENT.Core.Encrypt;
using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.SqlClient;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using EVENT.Core.Common.Enum;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore.Metadata;
using Newtonsoft.Json.Linq;
using System.Buffers.Text;
using static System.Net.Mime.MediaTypeNames;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using Microsoft.AspNetCore.Http;
using System.Xml.Serialization;
using System.Xml;
using System.Net.Mail;
using System.Web;

namespace EVENT.Business.Helper {
    public class Helper {

        public static string GenerateOTP()
        {
            Random generator = new Random();
            int firstDigit = generator.Next(1, 10);
            int remainingDigits = generator.Next(0, 100000);
            string otp = $"{firstDigit}{remainingDigits:D5}";
            return otp;
        }
        public static string RandomString(int length)
        {
            Random random = new Random();
            const string chars = "QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*()";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public static string GetRandomString(int length) {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public static string GetRandomStringWithoutSpecialCharacter(int length) {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public static string GetHash(string input) {
            CryptographyManager cryptography = new CryptographyManager();
            return cryptography.ComputeHash(input);
        }
        public static string Base64Encode(string base64String) {
            byte[] data = Convert.FromBase64String(base64String);
            return Encoding.UTF8.GetString(data);
        }
        public static string Base64Decode(string plainText) {
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        public static string GetImageContentType(string base64String) {
            var dataString = base64String.Substring(0, 5);

            switch (dataString.ToUpper()) {
                case "IVBOR":
                    return "image/png";
                case "/9J/4":
                    return "image/jpg";
                case "R0LGO":
                    return "image/gif";
                case "UKLGR":
                    return "image/webp";
                case "QK2KE":
                    return "image/bmp";
                case "PHN2Z":
                    return "image/svg+xml";
                default:
                    return string.Empty;
            }
        }

        public static bool IsValidUrl(string url) {
            return Uri.IsWellFormedUriString(url, UriKind.Absolute);
        }

        public static double CalculateCaloriesBurned(double mets, double weight, double minutes) {
            return Math.Round((mets * weight / 200f) * minutes, 0);
        }

        public static bool IsImageByExtension(IFormFile file) {
            if (file == null || file.Length == 0)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff" };

            return imageExtensions.Contains(extension);
        }

        public static int GetAgeFromDob(DateTime dob) {
            return (int)Math.Floor((DateTime.Now - dob).TotalDays / 365.25D);
        }

        public static double GetAgeFromDobDouble(DateTime dob) {
            return Math.Floor((DateTime.Now - dob).TotalDays / 365.25D);
        }

        public static double GetAgeFromDobAndToDateDouble(DateTime dob, DateTime toDate) {
            return Math.Floor((toDate - dob).TotalDays / 365.25D);
        }

        public static object ConvertDynamic<T>(dynamic data) {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(Newtonsoft.Json.JsonConvert.SerializeObject(data));
        }

        public static dynamic ToDynamic(object value) {
            IDictionary<string, object> expando = new ExpandoObject();

            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(value.GetType()))
                expando.Add(property.Name, property.GetValue(value));

            return expando as ExpandoObject;
        }

        public static List<PropertyChange> DeepCompare(object oldValue, object newvalue) {
            List<PropertyChange> changes = new List<PropertyChange>();
            if (ReferenceEquals(oldValue, newvalue)) return null;
            if ((oldValue == null) || (newvalue == null)) return null;

            if (oldValue.GetType() != newvalue.GetType()) return null;

            var result = true;

            foreach (var property in oldValue.GetType().GetProperties()) {
                var objValue = property.GetValue(oldValue);
                var anotherValue = property.GetValue(newvalue);
                if (objValue != null && anotherValue != null && Convert.ToString(objValue) != Convert.ToString(anotherValue)) {
                    changes.Add(new PropertyChange() {
                        PropertyName = property.Name,
                        NewValue = Convert.ToString(anotherValue),
                        OldValue = Convert.ToString(objValue)
                    });
                }
                else if ((objValue == null && anotherValue != null) || (anotherValue == null && objValue != null)) {
                    changes.Add(new PropertyChange() {
                        PropertyName = property.Name,
                        NewValue = Convert.ToString(anotherValue),
                        OldValue = Convert.ToString(objValue)
                    });
                }
            }
            return changes;
        }

        public static List<string> IgnorePropertyList() {
            return new List<string> { "CreatedOn", "CreatedBy", "UpdatedOn", "UpdatedBy" };
        }

        public static async Task<string> GetInvoiceNoForPaymentHistory(string ConnectionString) {
            string result = null;
            try {
                int CurrentYear = DateTime.Today.Year;
                int PreviousYear = DateTime.Today.Year - 1;
                int NextYear = DateTime.Today.Year + 1;
                string PreYear = PreviousYear.ToString().Substring(2, 2);
                string NexYear = NextYear.ToString().Substring(2, 2);
                string CurYear = CurrentYear.ToString().Substring(2, 2);
                string FinYear = "";

                if (DateTime.Today.Month > 3)
                    FinYear = CurYear + NexYear;
                else
                    FinYear = PreYear + CurYear;

                result = "SN-" + FinYear.Trim();
                int count = 0;

                var query = "select count(1) +1  from tblPaymentHistory (nolock)  where InvoiceNo like '" + result + "%' ";
                using (var con = new SqlConnection(ConnectionString)) {
                    count = await SqlMapper.QueryFirstOrDefaultAsync<int>(con, query, null, commandType: CommandType.Text);
                    result += "-" + Convert.ToString(count).PadLeft(5, '0');
                }
            }
            catch (Exception ex) {
                throw ex;
            }
            return result;
        }
       
        public static string ConvertNumbertoWords(long number) {
            if (number == 0) return "ZERO";
            if (number < 0) return "minus " + ConvertNumbertoWords(Math.Abs(number));
            string words = "";

            if ((number / 10000000) > 0) {
                words += ConvertNumbertoWords(number / 10000000) + " CRORE ";
                number %= 10000000;
            }
            if ((number / 100000) > 0) {
                words += ConvertNumbertoWords(number / 100000) + " LAKH ";
                number %= 100000;
            }
            if ((number / 1000) > 0) {
                words += ConvertNumbertoWords(number / 1000) + " THOUSAND ";
                number %= 1000;
            }
            if ((number / 100) > 0) {
                words += ConvertNumbertoWords(number / 100) + " HUNDRED ";
                number %= 100;
            }
            //if ((number / 10) > 0)  
            //{  
            // words += ConvertNumbertoWords(number / 10) + " RUPEES ";  
            // number %= 10;  
            //}  
            if (number > 0) {
                if (words != "") words += "AND ";
                var unitsMap = new[]
                {
            "ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"
        };
                var tensMap = new[]
                {
            "ZERO", "TEN", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
        };
                if (number < 20) words += unitsMap[number];
                else {
                    words += tensMap[number / 10];
                    if ((number % 10) > 0) words += " " + unitsMap[number % 10];
                }
            }
            return words;
        }

       
      
        public static bool IsNumeric(object Expression) {
            double retNum;

            bool isNum = Double.TryParse(Convert.ToString(Expression), System.Globalization.NumberStyles.Any, System.Globalization.NumberFormatInfo.InvariantInfo, out retNum);
            return isNum;
        }

        public static T Clone<T>(T source) {
            var serialized = JsonConvert.SerializeObject(source);
            return JsonConvert.DeserializeObject<T>(serialized);
        }        

        public static string GetXmlString(dynamic Object)
        {
            using (MemoryStream xmlStream = new MemoryStream())
            {
                Encoding utf16Encoding = Encoding.Unicode;
                XmlWriterSettings settings = new XmlWriterSettings
                {
                    Encoding = utf16Encoding,
                    Indent = true, 
                    OmitXmlDeclaration = false 
                };
                XmlSerializer xmlSerializer = new XmlSerializer(Object.GetType());
                using (XmlWriter writer = XmlWriter.Create(xmlStream, settings))
                {
                    xmlSerializer.Serialize(writer, Object);
                }
                xmlStream.Position = 0; 
                using (StreamReader reader = new StreamReader(xmlStream, utf16Encoding))
                {
                    return reader.ReadToEnd();
                }
            }
        }
        public static bool SendEmail(string ConnectionString, string EmailId, string Subject, string Body) {
            try {

                string query = @" SELECT TOP 1 * FROM Tbl_Email_Configuration WITH(NOLOCK) ";
                using (var con = new SqlConnection(ConnectionString)) {
                    var EmailConfiguration = SqlMapper.QueryFirstOrDefaultAsync<Tbl_Email_Configuration>(con, query, null, commandType: CommandType.Text).Result;

                    MailMessage myMessage = new MailMessage();
                    myMessage.From = new MailAddress(EmailConfiguration.FromEmail, "____FromEmailName____" /*EmailConfiguration.FromEmailName*/);

                    myMessage.To.Add(EmailId);
                    myMessage.Subject = HttpUtility.HtmlDecode(Subject);
                    myMessage.IsBodyHtml = true;
                    myMessage.Body = HttpUtility.HtmlDecode(Body);

                    SmtpClient mySmtpClient = new SmtpClient();
                    mySmtpClient.UseDefaultCredentials = false;
                    System.Net.NetworkCredential myCredential = new System.Net.NetworkCredential(EmailConfiguration.FromEmail, EmailConfiguration.FromPass);
                    mySmtpClient.Host = EmailConfiguration.SMTPServer;
                    mySmtpClient.Port = EmailConfiguration.SMTPport;
                    mySmtpClient.EnableSsl = true;
                    mySmtpClient.Credentials = myCredential;

                    mySmtpClient.SendCompleted += (s, e) => {
                        mySmtpClient.Dispose();
                        myMessage.Dispose();
                    };
                    mySmtpClient.Send(myMessage);
                    return true;
                }
            }
            catch (Exception ex) {
                return false;
            }
        }

        public static void SendMail(string smtpServer, string fromMail, string toMail, string ToBCC, string mailSubject, string mailBody, int SMTPport, string FromPass, bool SSL) {
            try {
                MailMessage mail = new MailMessage();
                SmtpClient SmtpClient = new SmtpClient(smtpServer);

                mail.From = new MailAddress(fromMail);
                mail.To.Add(toMail);
                if (ToBCC != "")
                    mail.Bcc.Add(ToBCC);
                mail.Subject = mailSubject;

                mail.Body = mailBody;
                mail.IsBodyHtml = true;
                SmtpClient.Port = SMTPport;
                SmtpClient.Credentials = new System.Net.NetworkCredential(fromMail, FromPass);
                SmtpClient.EnableSsl = SSL;
                SmtpClient.Send(mail);
            }
            catch (Exception) {
            }
        }

        public static string UserRegistrationTimeEmail(IDictionary<string, string> parameters) {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();
            if (listparameter["Type"].ToString() == "NR") {
                sb.Append("<!DOCTYPE html>\n");
                sb.Append("<html>\n");
                sb.Append("<style>@import url('https://fonts.googleapis.com/css?family=Lato');</style>\n");
                sb.Append("<body style='font-family:Lato,sans-serif;padding:10px;background-color:#F0F8FF;'>\n");
                sb.Append("<div style='padding: 10px; background-color: #ffffff;margin-left:10%;width: 80%;'>\n");
                sb.Append("<div style='text-align:center; background-color:#FFF; padding:10px;border-bottom:5px solid #e3e3e3'>\n");
                sb.Append("<h2>Welcome to FreeCart</h2></div>\n");
                sb.Append("<div style='text-align:left; background-color:#FFF; padding:10px;border-bottom:1px solid #e3e3e3'>\n");
                sb.Append("<h7><b>Hello <br><br> " + listparameter["UserName"].ToString() + ",</b></h7><br><br>\n");
                sb.Append("<p>An email address is your first line of communication with a customer. Make sure you reach them.</p>\n");
                sb.Append("<p>Make sure you reach Confirmation and verify Email code.</p>\n");
                sb.Append("<h2> Code : " + listparameter["EmailCode"].ToString() + "</h2>\n");
                sb.Append("<p>We are delighted to have you on board. Please confirm your email.</p>\n");
                sb.Append("<a class='button' style='margin: 0 0 10px 0; text-decoration:none; color:#ffffff; display:inline-block;font-size:10px; font-weight:500; border-radius:5px; color:#ffffff; background-color:#339e72; cursor:pointer;padding:5px;'href='" + listparameter["callbackurlenc"].ToString() + "' target='_blank'>Confirm Account</a>\n");
                sb.Append("<br><h7><b>Cheerfully yours</b></h7><br><br>\n");
                sb.Append("<br><h7><b>FreeCart Team</b></h7>\n");
                sb.Append("<br><p style='font-size:10px; margin-top:50px; text-align:center'>if you're having trouble clicking the password reset button, copy and paste the URL below into your web browser.</p></div>\n");
                sb.Append("<div style='text-align:center; background-color:#FFF;padding:10px'>\n");
                sb.Append("<p style='font-size:10px; text-align:center'>@" + System.DateTime.Now.Year.ToString() + "Freecart. All rights reserved</p>\n");
                sb.Append("<p style='font-size:10px; text-align:center'>INDIA</p>\n");
                //sb.Append("<p style='font-size:10px; text-align:center'><a style='text-decoration:none;font-size:12px;font-weight:600;cursor:pointer;color: #339e72;' href='" + AppPath + "/Account/Subscribe/" + listparameter["Token"].ToString() + "' target='_blank'>Subscribe</a>  |  <a style='text-decoration:none;font-size:12px;font-weight:600;cursor:pointer;color: #339e72;' href='" + AppPath + "/Account/UnSubscribe/" + listparameter["Token"].ToString() + "' target='_blank'> UnSubscribe</a></p>\n");
                sb.Append("</div></div></body></html>\n");
            }
            return sb.ToString();
        }
        public static string UserInviteTimeEmail(IDictionary<string, string> parameters) {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();

            sb.Append("<!DOCTYPE html>\n");
            sb.Append("<html>\n");
            sb.Append("<style>@import url('https://fonts.googleapis.com/css?family=Lato');</style>\n");
            sb.Append("<body style=' font-family: Arial, sans-serif;background-color: #f4f4f4;padding: 20px;'>\n");
            sb.Append("<div style=' max-width: 600px;background: white;padding: 20px;margin: auto;border-radius: 10px;box-shadow: 0px 4px 6px rgba(0,0,0,0.2);text-align: center;'>\n");
            sb.Append("<h1 style='color: #264484;'>You're Invited to " + listparameter["EventName"].ToString() + " </h1>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'> Hello <b> " + listparameter["UserName"].ToString() + ",</b></p>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'>We’re excited to invite you to join us at our upcoming Event. It will be a great opportunity to explore, connect, and experience amazing things!</p>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'> <strong>Event Name:</strong> " + listparameter["EventName"].ToString() + "<br> <strong> Date:</strong> " + listparameter["EventDate"].ToString() + "<br> <strong>Time:</strong> " + listparameter["EventTime"].ToString() + " </p>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'Click the button below to view more details and confirm your participation.</p>\n");
            sb.Append("<a href=" + listparameter["CallBackUrl"].ToString() + " target='_blank' style='background-color: navy; color: white;padding: 10px 20px;border-radius: 5px;text-decoration: none; display: inline-block;margin-top: 20px;'>View Event Details</a>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'>We look forward to seeing you there!</p>\n");
            sb.Append("<p style='font-size: 14px;color: #777;margin-top: 20px;' >Best Regards, <br>" + listparameter["CompanyName"].ToString() + " Team</p>\n");
            sb.Append("</div>\n");
            sb.Append("</body></html>\n");
            return sb.ToString();
        }
        public static string UserProfileCompleteTimeEmail(IDictionary<string, string> parameters)
        {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();

            sb.Append("<!DOCTYPE html>\n");
            sb.Append("<html>\n");
            sb.Append("<style>@import url('https://fonts.googleapis.com/css?family=Lato');</style>\n");
            sb.Append("<body style=' font-family: Arial, sans-serif;background-color: #f4f4f4;padding: 20px;'>\n");
            sb.Append("<div style=' max-width: 600px;background: white;padding: 20px;margin: auto;border-radius: 10px;box-shadow: 0px 4px 6px rgba(0,0,0,0.2);text-align: center;'>\n");
            sb.Append("<h1 style='color: #264484;'>Your Business Profile is Now Complete!</h1>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'><b> Dear " + listparameter["UserName"].ToString() + ",</b></p>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'>We are thrilled to have you join us! 🎉</p>\n");
            sb.Append("<p style='font-size: 16px;color: #555;'>Thank you for completing your business profile with " + listparameter["CompanyName"] + ".</p>\n");
            sb.Append("<a href=" + listparameter["CallBackUrl"].ToString() + " target='_blank' style='background-color: navy; color: white;padding: 10px 20px;border-radius: 5px;text-decoration: none; display: inline-block;margin-top: 20px;'>Get Started</a>\n");
            sb.Append("<p style='font-size: 14px;color: #777;margin-top: 20px;'>If you have any questions, feel free to <a>contact us</a>.</p>\n");
            sb.Append("<p style='font-size: 14px;color: #777;margin-top: 20px;' >Best Regards, <br>" + listparameter["CompanyName"].ToString() + " Team</p>\n");
            sb.Append("</div>\n");
            sb.Append("</body></html>\n");
            return sb.ToString();
        }
        public static string SubscriptionPurchaseEmailTemplate(IDictionary<string, string> parameters)
        {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();

            sb.Append("<!DOCTYPE html>\n");
            sb.Append("<html>\n");
            sb.Append("<style>@import url('https://fonts.googleapis.com/css?family=Lato');</style>\n");
            sb.Append("<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>\n");
            sb.Append("<div style='max-width: 600px; background: white; padding: 20px; margin: auto; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0,0,0,0.2); text-align: center;'>\n");

            sb.Append("<h1 style='color: #264484;'>Thank You for Your Subscription!</h1>\n");
            sb.Append("<p style='font-size: 16px; color: #555;'><b>Dear " + listparameter["UserName"] + ",</b></p>\n");
            sb.Append("<p style='font-size: 16px; color: #555;'>We appreciate your purchase of the <b>" + listparameter["PlanName"] + "</b>.</p>\n");

            sb.Append("<table style='width: 100%; margin-top: 20px; font-size: 15px; color: #333;'>");
            sb.Append("<tr><td style='text-align:left; padding: 8px;'>Transaction Date:</td><td style='text-align:right; padding: 8px;'>" + listparameter["TransactionDate"] + "</td></tr>");
            sb.Append("<tr><td style='text-align:left; padding: 8px;'>Amount Paid:</td><td style='text-align:right; padding: 8px;'>₹" + listparameter["Amount"] + "</td></tr>");
            sb.Append("<tr><td style='text-align:left; padding: 8px;'>Payment Status:</td><td style='text-align:right; padding: 8px;'>" + listparameter["PaymentStatus"] + "</td></tr>");
            sb.Append("</table>");

            sb.Append("<a href='http://103.206.139.223:5207/' target='_blank' style='background-color: navy; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px;'>Visit Portal</a>\n");

            sb.Append("<p style='font-size: 14px; color: #777; margin-top: 20px;'>If you have any questions, feel free to <a href='#'>contact us</a>.</p>\n");
            sb.Append("<p style='font-size: 14px; color: #777; margin-top: 20px;'>Best Regards,<br>Expo Portal Team</p>\n");
            sb.Append("</div>\n");
            sb.Append("</body></html>\n");

            return sb.ToString();
        }

        public static string EventApprovalTimeEmail(IDictionary<string, string> parameters) {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset='UTF-8'>
                                <meta name='viewport' content='width=device-width, initial-scale=1.0''>
                                <title>Welcome to Event Management!</title>
                            </head>
                            <body style='font-family: Arial, sans-serif;background-color: #f4f4f4;padding: 20px;'>
                            <h1 style='color: #264484;'>Event Verification Approval Email</h1>
                                <div style=' max-width: 600px;background: white;padding: 20px;margin: auto;border-radius: 10px;box-shadow: 0px 4px 6px rgba(0,0,0,0.2);text-align: center;'>
                                    <h1 style='color: #264484;'>🎉 Congratulations, Your Event Has Been Approved!</h1>");
            sb.Append(" <p style='font-size: 16px;color: #555;'>Dear " + listparameter["UserName"].ToString() + ",</p>");
            sb.Append(" <p style='font-size: 16px;color: #555;'>We are pleased to inform you that your event **" + listparameter["EventName"].ToString() + "** has been successfully verified and approved! 🚀</p>");
            sb.Append($@"<p style='font-size: 16px;color: #555;'>You can now proceed with managing and promoting your expo on our platform.</p>
            <a href='{listparameter["CallBackUrl"]}' target='_blank' style='background-color: #264484;color: white;padding: 10px 20px;border-radius: 5px;text-decoration: none; display: inline-block;margin-top: 20px;'>Go to Dashboard</a>
            <p style='font-size: 14px;color: #777;margin-top: 20px;'>If you have any questions, feel free to <a href='mailto:support@yourcompany.com'>contact us</a>.</p>
            <p style='font-size: 14px;color: #777;margin-top: 20px;'>Best Regards,<br>Your Company Name Team</p>
        </div></body></html>");
            return sb.ToString();
        }

        public static string EventRejectionTimeEmail(IDictionary<string, string> parameters) {
            var listparameter = parameters.ToDictionary(item => item.Key, item => item.Value);
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset='UTF-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <title>Welcome to Event Management!</title>
                    </head>
                    <body style=' font-family: Arial, sans-serif;background-color: #f4f4f4;padding: 20px;'>
                    <div style=' max-width: 600px;background: white;padding: 20px;margin: auto;border-radius: 10px;box-shadow: 0px 4px 6px rgba(0,0,0,0.2);text-align: center;'>
                            <h1 style='color: #264484;'>❌ Your Event Submission is Rejected</h1>");
            sb.Append("<p style='font-size: 16px;color: #555;'>Dear " + listparameter["UserName"].ToString() + ",</p>");
            sb.Append("<p style='font-size: 16px;color: #555;'>We regret to inform you that your event **" + listparameter["EventName"].ToString() + "** did not meet our approval criteria at this time.</p>");
            sb.Append("<p style='font-size: 16px;color: #555;'>Reason: " + listparameter["RejectionReason"].ToString() + "</p>");
            sb.Append("<p style='font-size: 16px;color: #555;'>If you believe this was a mistake or would like to resubmit, please review our guidelines and make necessary changes.</p>");
            sb.Append("<a href='" + listparameter["CallBackUrl"] + "' style='background-color: #264484;color: white;padding: 10px 20px;border-radius: 5px;text-decoration: none; display: inline-block;margin-top: 20px;'>Review & Resubmit</a>");
            sb.Append("<p style='font-size: 14px;color: #777;margin-top: 20px;' >If you need more details, feel free to <a href='mailto:support@yourcompany.com'>contact us</a>.</p>");
            sb.Append(@"<p style='font-size: 14px;color: #777;margin-top: 20px;' >Best Regards,<br>Festum Evento Team</p>
						</div></body></html>");
            return sb.ToString();
        }

    }

    public class FractionalNumber {
        public Double Result {
            get { return this.result; }
            private set { this.result = value; }
        }
        private Double result;

        public FractionalNumber(String input) {
            this.Result = this.Parse(input);
        }

        private Double Parse(String input) {
            input = (input ?? String.Empty).Trim();
            if (String.IsNullOrEmpty(input)) {
                throw new ArgumentNullException("input");
            }

            // standard decimal number (e.g. 1.125)
            if (input.IndexOf('.') != -1 || (input.IndexOf(' ') == -1 && input.IndexOf('/') == -1 && input.IndexOf('\\') == -1)) {
                Double result;
                if (Double.TryParse(input, out result)) {
                    return result;
                }
            }

            String[] parts = input.Split(new[] { ' ', '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);

            // stand-off fractional (e.g. 7/8)
            if (input.IndexOf(' ') == -1 && parts.Length == 2) {
                Double num, den;
                if (Double.TryParse(parts[0], out num) && Double.TryParse(parts[1], out den)) {
                    return num / den;
                }
            }

            // Number and fraction (e.g. 2 1/2)
            if (parts.Length == 3) {
                Double whole, num, den;
                if (Double.TryParse(parts[0], out whole) && Double.TryParse(parts[1], out num) && Double.TryParse(parts[2], out den)) {
                    return whole + (num / den);
                }
            }

            // Bogus / unable to parse
            return Double.NaN;
        }

        public override string ToString() {
            return this.Result.ToString();
        }

        public static implicit operator Double(FractionalNumber number) {
            return number.Result;
        }

        
        
        
    }
}
