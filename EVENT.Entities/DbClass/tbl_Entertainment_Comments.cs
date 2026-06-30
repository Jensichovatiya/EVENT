using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Entertainment_Comments
    {
        public long Id { get; set; }
        public long FileId { get; set; }
        public long UserId { get; set; }
        public string CommentText { get; set; }
        public DateTime EntryDate { get; set; }
        public string? CommentType { get; set; }

    }
}
