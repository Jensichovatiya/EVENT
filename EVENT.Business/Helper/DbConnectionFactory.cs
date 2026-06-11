using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.Net.Http.Json;

namespace Tracket.Models {
    public static class DbConnectionFactory
    {
        private static IConfiguration _configuration;
        private static IHttpContextAccessor _http;
        private static IHttpClientFactory _clientFactory;
        private static IMemoryCache _cache;

        public static void Configure(
            IConfiguration configuration,
            IHttpContextAccessor http,
            IHttpClientFactory clientFactory,
            IMemoryCache cache)
        {
            _configuration = configuration;
            _http = http;
            _clientFactory = clientFactory;
            _cache = cache;
        }

        public static string FrontendUrl => _configuration["FrontendUrl"] ?? "http://localhost:4040";
        public static string BackendUrl => _configuration["BackendUrl"] ?? (_http?.HttpContext?.Request != null ? $"{_http.HttpContext.Request.Scheme}://{_http.HttpContext.Request.Host}" : "http://103.206.139.223:6015");

        /// <summary>
        /// Resolves the connection string based on ConnectionMode.
        /// In Vault mode, parses subdomain from {company}.{product}.localhost
        /// and fetches the tenant connection string from Vault API.
        /// Falls back to DefaultConnection when no valid subdomain is present.
        /// </summary>
        public static string ConnectionString
        {
            get
            {
                var mode = _configuration["ConnectionMode"] ?? "Local";

                if (mode.Equals("Local", StringComparison.OrdinalIgnoreCase))
                    return _configuration.GetConnectionString("DefaultConnection");

                // Vault mode: resolve from subdomain
                var host = _http?.HttpContext?.Request.Host.Host;

                if (string.IsNullOrEmpty(host))
                    return _configuration.GetConnectionString("DefaultConnection");

                var parts = host.Split('.');

                // Pattern: {company}.{product}.localhost  (3+ parts)
                // If fewer parts (e.g., "ecommerce.localhost"), no tenant subdomain → fallback
                if (parts.Length < 3)
                    return _configuration.GetConnectionString("DefaultConnection");

                var company = parts[0];
                var product = parts[1];

                if (string.IsNullOrEmpty(company) || string.IsNullOrEmpty(product))
                    return _configuration.GetConnectionString("DefaultConnection");

                // Check cache first
                var cacheKey = $"conn_{product}_{company}";
                if (_cache.TryGetValue(cacheKey, out string cachedConn))
                    return cachedConn;

                // Fetch from Vault API
                var client = _clientFactory.CreateClient("Vault");
                var endpoint = _configuration["Vault:GetConnectionStringEndpoint"]
                            ?? _configuration["Vault:Endpoint"]
                            ?? "api/auth/getconnectionstring";

                var response = client.PostAsJsonAsync(endpoint,
                    new { product, company }).Result;

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Vault API failed ({response.StatusCode}) for tenant {company}.{product}");

                var json = response.Content.ReadAsStringAsync().Result;
                var result = System.Text.Json.JsonSerializer.Deserialize<VaultApiResponse>(json,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (result?.Data?.ConnectionString == null)
                    throw new Exception($"Vault returned no connection string for tenant {company}.{product}");

                var connStr = result.Data.ConnectionString;
                var cacheMinutes = int.Parse(_configuration["Vault:CacheMinutes"] ?? "30");
                _cache.Set(cacheKey, connStr, TimeSpan.FromMinutes(cacheMinutes));

                return connStr;
            }
        }

        /// <summary>
        /// Extracts the company name from the current request subdomain.
        /// Returns null if no valid subdomain pattern.
        /// </summary>
        public static string? GetCurrentCompany()
        {
            var host = _http?.HttpContext?.Request.Host.Host;
            if (string.IsNullOrEmpty(host)) return null;
            var parts = host.Split('.');
            return parts.Length >= 3 ? parts[0] : null;
        }

        // Vault API response models (matches Vault's ApiResponse<GetConnResult>)
        private class VaultApiResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public VaultData Data { get; set; }
            public int StatusCode { get; set; }
        }

        private class VaultData
        {
            public string ConnectionString { get; set; }
        }
    }
}
