using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class Tbl_Email_Configuration {
        public int Id { get; set; }
        public string SMTPServer { get; set; }
        public string FromEmail { get; set; }
        public string ToInertnalMailCC { get; set; }
        public int SMTPport { get; set; }
        public string FromPass { get; set; }
        public bool SSL { get; set; }
        public string Module { get; set; }
        public bool IsMailSendToInternal { get; set; }
        public bool IsMailSendToExternal { get; set; }
        public bool MailSend { get; set; }
        public string ToInertnalMailBCC { get; set; }
    }
}
