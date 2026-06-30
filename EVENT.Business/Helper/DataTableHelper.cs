using System;
using System.Collections.Generic;
using System.Data;


namespace EVENT.Business.Helper
{
    public static class DataTableHelper
    {
        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            // Get all public properties of the type
            var properties = typeof(T).GetProperties();

            // Create columns in DataTable for each property
            foreach (var property in properties)
            {
                dataTable.Columns.Add(property.Name, property.PropertyType);
            }

            // Add rows to the DataTable
            foreach (var item in items)
            {
                DataRow row = dataTable.NewRow();
                foreach (var property in properties)
                {
                    row[property.Name] = property.GetValue(item);
                }
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }
    }
}
