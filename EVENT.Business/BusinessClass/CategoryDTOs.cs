namespace EVENT.Business.BusinessClass
{
    public class CategoryRequest
    {
        public long CategoryId { get; set; }
        public string CategoryRId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public long ParentCategoryId { get; set; }
        public string SeoTitle { get; set; } = string.Empty;
        public string SeoDescription { get; set; } = string.Empty;
        public string CategoryImageUrl { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool ShowInMenu { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class CategoryResponse
    {
        public long CategoryId { get; set; }
        public string CategoryRId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public long ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; } = string.Empty;
        public string SeoTitle { get; set; } = string.Empty;
        public string SeoDescription { get; set; } = string.Empty;
        public string CategoryImageUrl { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool ShowInMenu { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class CategoryStatusUpdateRequest
    {
        public long CategoryId { get; set; }
        public bool IsActive { get; set; }
    }
}
