using System;
using System.Data;
using System.Reflection;

namespace EVENT.Business.Helper
{
    public static class DataRowToObject
    {
        public static T CreateItemFromRow<T>(DataRow row) where T : new()
        {
            T item = new T();
            foreach (DataColumn column in row.Table.Columns)
            {
                PropertyInfo? property = typeof(T).GetProperty(column.ColumnName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (property != null && row[column] != DBNull.Value)
                {
                    try
                    {
                        Type targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
                        object value = Convert.ChangeType(row[column], targetType);
                        property.SetValue(item, value, null);
                    }
                    catch
                    {
                        // Ignore mapping failure for mismatched types in dynamic context
                    }
                }
            }
            return item;
        }
    }
}
