using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Helper {
    public class ExternalApiCallHelper {
        public static async Task<HttpResponseMessage> ExecuteAsync(string url, HttpMethod method, Dictionary<string, string> headers, string body = "") {
            using (var httpClient = new HttpClient()) {
                using (var request = new HttpRequestMessage(method, $"{url}")) {
                    foreach (var header in headers)
                        request.Headers.Add(header.Key, header.Value);
                    if (method == HttpMethod.Post || method == HttpMethod.Put) {
                        request.Content = new StringContent(body);
                        request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json");
                    }
                    var response = await httpClient.SendAsync(request);
                    return response;
                }
            }
        }
    }
}
