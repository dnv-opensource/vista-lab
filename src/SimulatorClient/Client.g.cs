//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

#nullable enable

#pragma warning disable 108 // Disable "CS0108 '{derivedDto}.ToJson()' hides inherited member '{dtoBase}.ToJson()'. Use the new keyword if hiding was intended."
#pragma warning disable 114 // Disable "CS0114 '{derivedDto}.RaisePropertyChanged(String)' hides inherited member 'dtoBase.RaisePropertyChanged(String)'. To make the current member override that implementation, add the override keyword. Otherwise add the new keyword."
#pragma warning disable 472 // Disable "CS0472 The result of the expression is always 'false' since a value of type 'Int32' is never equal to 'null' of type 'Int32?'
#pragma warning disable 1573 // Disable "CS1573 Parameter '...' has no matching param tag in the XML comment for ...
#pragma warning disable 1591 // Disable "CS1591 Missing XML comment for publicly visible type or member ..."
#pragma warning disable 8073 // Disable "CS8073 The result of the expression is always 'false' since a value of type 'T' is never equal to 'null' of type 'T?'"
#pragma warning disable 3016 // Disable "CS3016 Arrays as attribute arguments is not CLS-compliant"

namespace SimulatorClient
{
    using System = global::System;

    [System.CodeDom.Compiler.GeneratedCode("NSwag", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial interface ISimulatorClient
    {

        /// <param name="cancellationToken">A cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
        /// <returns>Success</returns>
        /// <exception cref="SimulatorApiException">A server side error occurred.</exception>
        System.Threading.Tasks.Task ImportDataChannelsAndSimulateAsync(DataChannelListPackage body, System.Threading.CancellationToken cancellationToken = default(System.Threading.CancellationToken));

        /// <param name="cancellationToken">A cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
        /// <returns>Success</returns>
        /// <exception cref="SimulatorApiException">A server side error occurred.</exception>
        System.Threading.Tasks.Task ImportDataChannelsFileAndSimulateAsync(System.IO.Stream body, System.Threading.CancellationToken cancellationToken = default(System.Threading.CancellationToken));

    }

    [System.CodeDom.Compiler.GeneratedCode("NSwag", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class SimulatorClient : ISimulatorClient
    {
        private string _baseUrl = "";
        private System.Net.Http.HttpClient _httpClient;
        private System.Lazy<System.Text.Json.JsonSerializerOptions> _settings;

        public SimulatorClient(string baseUrl, System.Net.Http.HttpClient httpClient)
        {
            BaseUrl = baseUrl;
            _httpClient = httpClient;
            _settings = new System.Lazy<System.Text.Json.JsonSerializerOptions>(CreateSerializerSettings);
        }

        private System.Text.Json.JsonSerializerOptions CreateSerializerSettings()
        {
            var settings = new System.Text.Json.JsonSerializerOptions();
            UpdateJsonSerializerSettings(settings);
            return settings;
        }

        public string BaseUrl
        {
            get { return _baseUrl; }
            set { _baseUrl = value; }
        }

        protected System.Text.Json.JsonSerializerOptions JsonSerializerSettings { get { return _settings.Value; } }

        partial void UpdateJsonSerializerSettings(System.Text.Json.JsonSerializerOptions settings);

        partial void PrepareRequest(System.Net.Http.HttpClient client, System.Net.Http.HttpRequestMessage request, string url);
        partial void PrepareRequest(System.Net.Http.HttpClient client, System.Net.Http.HttpRequestMessage request, System.Text.StringBuilder urlBuilder);
        partial void ProcessResponse(System.Net.Http.HttpClient client, System.Net.Http.HttpResponseMessage response);

        /// <param name="cancellationToken">A cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
        /// <returns>Success</returns>
        /// <exception cref="SimulatorApiException">A server side error occurred.</exception>
        public virtual async System.Threading.Tasks.Task ImportDataChannelsAndSimulateAsync(DataChannelListPackage body, System.Threading.CancellationToken cancellationToken = default(System.Threading.CancellationToken))
        {
            if (body == null)
                throw new System.ArgumentNullException("body");

            var urlBuilder_ = new System.Text.StringBuilder();
            urlBuilder_.Append(BaseUrl != null ? BaseUrl.TrimEnd('/') : "").Append("/api/data-channel/import-and-simulate");

            var client_ = _httpClient;
            var disposeClient_ = false;
            try
            {
                using (var request_ = new System.Net.Http.HttpRequestMessage())
                {
                    var content_ = new System.Net.Http.StringContent(System.Text.Json.JsonSerializer.Serialize(body, _settings.Value));
                    content_.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("application/json");
                    request_.Content = content_;
                    request_.Method = new System.Net.Http.HttpMethod("POST");

                    PrepareRequest(client_, request_, urlBuilder_);

                    var url_ = urlBuilder_.ToString();
                    request_.RequestUri = new System.Uri(url_, System.UriKind.RelativeOrAbsolute);

                    PrepareRequest(client_, request_, url_);

                    var response_ = await client_.SendAsync(request_, System.Net.Http.HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
                    var disposeResponse_ = true;
                    try
                    {
                        var headers_ = System.Linq.Enumerable.ToDictionary(response_.Headers, h_ => h_.Key, h_ => h_.Value);
                        if (response_.Content != null && response_.Content.Headers != null)
                        {
                            foreach (var item_ in response_.Content.Headers)
                                headers_[item_.Key] = item_.Value;
                        }

                        ProcessResponse(client_, response_);

                        var status_ = (int)response_.StatusCode;
                        if (status_ == 200)
                        {
                            return;
                        }
                        else
                        {
                            var responseData_ = response_.Content == null ? null : await response_.Content.ReadAsStringAsync().ConfigureAwait(false);
                            throw new SimulatorApiException("The HTTP status code of the response was not expected (" + status_ + ").", status_, responseData_, headers_, null);
                        }
                    }
                    finally
                    {
                        if (disposeResponse_)
                            response_.Dispose();
                    }
                }
            }
            finally
            {
                if (disposeClient_)
                    client_.Dispose();
            }
        }

        /// <param name="cancellationToken">A cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
        /// <returns>Success</returns>
        /// <exception cref="SimulatorApiException">A server side error occurred.</exception>
        public virtual async System.Threading.Tasks.Task ImportDataChannelsFileAndSimulateAsync(System.IO.Stream body, System.Threading.CancellationToken cancellationToken = default(System.Threading.CancellationToken))
        {
            if (body == null)
                throw new System.ArgumentNullException("body");

            var urlBuilder_ = new System.Text.StringBuilder();
            urlBuilder_.Append(BaseUrl != null ? BaseUrl.TrimEnd('/') : "").Append("/api/data-channel/import-file-and-simulate");

            var client_ = _httpClient;
            var disposeClient_ = false;
            try
            {
                using (var request_ = new System.Net.Http.HttpRequestMessage())
                {
                    var content_ = new System.Net.Http.StreamContent(body);
                    content_.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("application/json");
                    request_.Content = content_;
                    request_.Method = new System.Net.Http.HttpMethod("POST");

                    PrepareRequest(client_, request_, urlBuilder_);

                    var url_ = urlBuilder_.ToString();
                    request_.RequestUri = new System.Uri(url_, System.UriKind.RelativeOrAbsolute);

                    PrepareRequest(client_, request_, url_);

                    var response_ = await client_.SendAsync(request_, System.Net.Http.HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
                    var disposeResponse_ = true;
                    try
                    {
                        var headers_ = System.Linq.Enumerable.ToDictionary(response_.Headers, h_ => h_.Key, h_ => h_.Value);
                        if (response_.Content != null && response_.Content.Headers != null)
                        {
                            foreach (var item_ in response_.Content.Headers)
                                headers_[item_.Key] = item_.Value;
                        }

                        ProcessResponse(client_, response_);

                        var status_ = (int)response_.StatusCode;
                        if (status_ == 200)
                        {
                            return;
                        }
                        else
                        {
                            var responseData_ = response_.Content == null ? null : await response_.Content.ReadAsStringAsync().ConfigureAwait(false);
                            throw new SimulatorApiException("The HTTP status code of the response was not expected (" + status_ + ").", status_, responseData_, headers_, null);
                        }
                    }
                    finally
                    {
                        if (disposeResponse_)
                            response_.Dispose();
                    }
                }
            }
            finally
            {
                if (disposeClient_)
                    client_.Dispose();
            }
        }

        protected struct ObjectResponseResult<T>
        {
            public ObjectResponseResult(T responseObject, string responseText)
            {
                this.Object = responseObject;
                this.Text = responseText;
            }

            public T Object { get; }

            public string Text { get; }
        }

        public bool ReadResponseAsString { get; set; }

        protected virtual async System.Threading.Tasks.Task<ObjectResponseResult<T>> ReadObjectResponseAsync<T>(System.Net.Http.HttpResponseMessage response, System.Collections.Generic.IReadOnlyDictionary<string, System.Collections.Generic.IEnumerable<string>> headers, System.Threading.CancellationToken cancellationToken)
        {
            if (response == null || response.Content == null)
            {
                return new ObjectResponseResult<T>(default(T)!, string.Empty);
            }

            if (ReadResponseAsString)
            {
                var responseText = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                try
                {
                    var typedBody = System.Text.Json.JsonSerializer.Deserialize<T>(responseText, JsonSerializerSettings);
                    return new ObjectResponseResult<T>(typedBody!, responseText);
                }
                catch (System.Text.Json.JsonException exception)
                {
                    var message = "Could not deserialize the response body string as " + typeof(T).FullName + ".";
                    throw new SimulatorApiException(message, (int)response.StatusCode, responseText, headers, exception);
                }
            }
            else
            {
                try
                {
                    using (var responseStream = await response.Content.ReadAsStreamAsync().ConfigureAwait(false))
                    {
                        var typedBody = await System.Text.Json.JsonSerializer.DeserializeAsync<T>(responseStream, JsonSerializerSettings, cancellationToken).ConfigureAwait(false);
                        return new ObjectResponseResult<T>(typedBody!, string.Empty);
                    }
                }
                catch (System.Text.Json.JsonException exception)
                {
                    var message = "Could not deserialize the response body stream as " + typeof(T).FullName + ".";
                    throw new SimulatorApiException(message, (int)response.StatusCode, string.Empty, headers, exception);
                }
            }
        }

        private string ConvertToString(object? value, System.Globalization.CultureInfo cultureInfo)
        {
            if (value == null)
            {
                return "";
            }

            if (value is System.Enum)
            {
                var name = System.Enum.GetName(value.GetType(), value);
                if (name != null)
                {
                    var field = System.Reflection.IntrospectionExtensions.GetTypeInfo(value.GetType()).GetDeclaredField(name);
                    if (field != null)
                    {
                        var attribute = System.Reflection.CustomAttributeExtensions.GetCustomAttribute(field, typeof(System.Runtime.Serialization.EnumMemberAttribute)) 
                            as System.Runtime.Serialization.EnumMemberAttribute;
                        if (attribute != null)
                        {
                            return attribute.Value != null ? attribute.Value : name;
                        }
                    }

                    var converted = System.Convert.ToString(System.Convert.ChangeType(value, System.Enum.GetUnderlyingType(value.GetType()), cultureInfo));
                    return converted == null ? string.Empty : converted;
                }
            }
            else if (value is bool) 
            {
                return System.Convert.ToString((bool)value, cultureInfo).ToLowerInvariant();
            }
            else if (value is byte[])
            {
                return System.Convert.ToBase64String((byte[]) value);
            }
            else if (value.GetType().IsArray)
            {
                var array = System.Linq.Enumerable.OfType<object>((System.Array) value);
                return string.Join(",", System.Linq.Enumerable.Select(array, o => ConvertToString(o, cultureInfo)));
            }

            var result = System.Convert.ToString(value, cultureInfo);
            return result == null ? "" : result;
        }
    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class ConfigurationReference
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public ConfigurationReference(string? @iD, System.DateTimeOffset? @timeStamp, string? @version)

        {

            this.ID = @iD;

            this.Version = @version;

            this.TimeStamp = @timeStamp;

        }
        [System.Text.Json.Serialization.JsonPropertyName("ID")]
        public string? ID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Version")]
        public string? Version { get; }

        [System.Text.Json.Serialization.JsonPropertyName("TimeStamp")]
        public System.DateTimeOffset? TimeStamp { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class DataChannel
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public DataChannel(DataChannelID? @dataChannelID, Property? @property)

        {

            this.DataChannelID = @dataChannelID;

            this.Property = @property;

        }
        [System.Text.Json.Serialization.JsonPropertyName("DataChannelID")]
        public DataChannelID? DataChannelID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Property")]
        public Property? Property { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class DataChannelID
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public DataChannelID(string? @localID, NameObject? @nameObject, string? @shortID)

        {

            this.LocalID = @localID;

            this.ShortID = @shortID;

            this.NameObject = @nameObject;

        }
        [System.Text.Json.Serialization.JsonPropertyName("LocalID")]
        public string? LocalID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("ShortID")]
        public string? ShortID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("NameObject")]
        public NameObject? NameObject { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class DataChannelList
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public DataChannelList(System.Collections.Generic.List<DataChannel>? @dataChannel)

        {

            this.DataChannel = @dataChannel;

        }
        [System.Text.Json.Serialization.JsonPropertyName("DataChannel")]
        public System.Collections.Generic.List<DataChannel>? DataChannel { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class DataChannelListPackage
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public DataChannelListPackage(Package? @package)

        {

            this.Package = @package;

        }
        [System.Text.Json.Serialization.JsonPropertyName("Package")]
        public Package? Package { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class DataChannelType
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public DataChannelType(string? @calculationPeriod, string? @type, string? @updateCycle)

        {

            this.Type = @type;

            this.UpdateCycle = @updateCycle;

            this.CalculationPeriod = @calculationPeriod;

        }
        [System.Text.Json.Serialization.JsonPropertyName("Type")]
        public string? Type { get; }

        [System.Text.Json.Serialization.JsonPropertyName("UpdateCycle")]
        public string? UpdateCycle { get; }

        [System.Text.Json.Serialization.JsonPropertyName("CalculationPeriod")]
        public string? CalculationPeriod { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Format
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Format(Restriction? @restriction, string? @type)

        {

            this.Type = @type;

            this.Restriction = @restriction;

        }
        [System.Text.Json.Serialization.JsonPropertyName("Type")]
        public string? Type { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Restriction")]
        public Restriction? Restriction { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Header
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Header(string? @author, ConfigurationReference? @dataChannelListID, System.DateTimeOffset? @dateCreated, string? @shipID, VersionInformation? @versionInformation)

        {

            this.ShipID = @shipID;

            this.DataChannelListID = @dataChannelListID;

            this.VersionInformation = @versionInformation;

            this.Author = @author;

            this.DateCreated = @dateCreated;

        }
        [System.Text.Json.Serialization.JsonPropertyName("ShipID")]
        public string? ShipID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("DataChannelListID")]
        public ConfigurationReference? DataChannelListID { get; }

        [System.Text.Json.Serialization.JsonPropertyName("VersionInformation")]
        public VersionInformation? VersionInformation { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Author")]
        public string? Author { get; }

        [System.Text.Json.Serialization.JsonPropertyName("DateCreated")]
        public System.DateTimeOffset? DateCreated { get; }

        private System.Collections.Generic.IDictionary<string, object> _additionalProperties = new System.Collections.Generic.Dictionary<string, object>();

        [System.Text.Json.Serialization.JsonExtensionData]
        public System.Collections.Generic.IDictionary<string, object> AdditionalProperties
        {
            get { return _additionalProperties; }
            set { _additionalProperties = value; }
        }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class NameObject
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public NameObject(string? @namingRule)

        {

            this.NamingRule = @namingRule;

        }
        [System.Text.Json.Serialization.JsonPropertyName("NamingRule")]
        public string? NamingRule { get; }

        private System.Collections.Generic.IDictionary<string, object> _additionalProperties = new System.Collections.Generic.Dictionary<string, object>();

        [System.Text.Json.Serialization.JsonExtensionData]
        public System.Collections.Generic.IDictionary<string, object> AdditionalProperties
        {
            get { return _additionalProperties; }
            set { _additionalProperties = value; }
        }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Package
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Package(DataChannelList? @dataChannelList, Header? @header)

        {

            this.Header = @header;

            this.DataChannelList = @dataChannelList;

        }
        [System.Text.Json.Serialization.JsonPropertyName("Header")]
        public Header? Header { get; }

        [System.Text.Json.Serialization.JsonPropertyName("DataChannelList")]
        public DataChannelList? DataChannelList { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Property
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Property(string? @alertPriority, DataChannelType? @dataChannelType, Format? @format, string? @name, string? @qualityCoding, Range? @range, string? @remarks, Unit? @unit)

        {

            this.DataChannelType = @dataChannelType;

            this.Format = @format;

            this.Range = @range;

            this.Unit = @unit;

            this.QualityCoding = @qualityCoding;

            this.AlertPriority = @alertPriority;

            this.Name = @name;

            this.Remarks = @remarks;

        }
        [System.Text.Json.Serialization.JsonPropertyName("DataChannelType")]
        public DataChannelType? DataChannelType { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Format")]
        public Format? Format { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Range")]
        public Range? Range { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Unit")]
        public Unit? Unit { get; }

        [System.Text.Json.Serialization.JsonPropertyName("QualityCoding")]
        public string? QualityCoding { get; }

        [System.Text.Json.Serialization.JsonPropertyName("AlertPriority")]
        public string? AlertPriority { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Name")]
        public string? Name { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Remarks")]
        public string? Remarks { get; }

        private System.Collections.Generic.IDictionary<string, object> _additionalProperties = new System.Collections.Generic.Dictionary<string, object>();

        [System.Text.Json.Serialization.JsonExtensionData]
        public System.Collections.Generic.IDictionary<string, object> AdditionalProperties
        {
            get { return _additionalProperties; }
            set { _additionalProperties = value; }
        }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Range
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Range(string? @high, string? @low)

        {

            this.High = @high;

            this.Low = @low;

        }
        [System.Text.Json.Serialization.JsonPropertyName("High")]
        public string? High { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Low")]
        public string? Low { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Restriction
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Restriction(System.Collections.Generic.List<string>? @enumeration, string? @fractionDigits, string? @length, string? @maxExclusive, string? @maxInclusive, string? @maxLength, string? @minExclusive, string? @minInclusive, string? @minLength, string? @pattern, string? @totalDigits, RestrictionWhiteSpace? @whiteSpace)

        {

            this.Enumeration = @enumeration;

            this.FractionDigits = @fractionDigits;

            this.Length = @length;

            this.MaxExclusive = @maxExclusive;

            this.MaxInclusive = @maxInclusive;

            this.MaxLength = @maxLength;

            this.MinExclusive = @minExclusive;

            this.MinInclusive = @minInclusive;

            this.MinLength = @minLength;

            this.Pattern = @pattern;

            this.TotalDigits = @totalDigits;

            this.WhiteSpace = @whiteSpace;

        }
        [System.Text.Json.Serialization.JsonPropertyName("Enumeration")]
        public System.Collections.Generic.List<string>? Enumeration { get; }

        [System.Text.Json.Serialization.JsonPropertyName("FractionDigits")]
        public string? FractionDigits { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Length")]
        public string? Length { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MaxExclusive")]
        public string? MaxExclusive { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MaxInclusive")]
        public string? MaxInclusive { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MaxLength")]
        public string? MaxLength { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MinExclusive")]
        public string? MinExclusive { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MinInclusive")]
        public string? MinInclusive { get; }

        [System.Text.Json.Serialization.JsonPropertyName("MinLength")]
        public string? MinLength { get; }

        [System.Text.Json.Serialization.JsonPropertyName("Pattern")]
        public string? Pattern { get; }

        [System.Text.Json.Serialization.JsonPropertyName("TotalDigits")]
        public string? TotalDigits { get; }

        [System.Text.Json.Serialization.JsonPropertyName("WhiteSpace")]
        public RestrictionWhiteSpace? WhiteSpace { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public enum RestrictionWhiteSpace
    {

        _0 = 0,

        _1 = 1,

        _2 = 2,

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class Unit
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public Unit(string? @quantityName, string? @unitSymbol)

        {

            this.UnitSymbol = @unitSymbol;

            this.QuantityName = @quantityName;

        }
        [System.Text.Json.Serialization.JsonPropertyName("UnitSymbol")]
        public string? UnitSymbol { get; }

        [System.Text.Json.Serialization.JsonPropertyName("QuantityName")]
        public string? QuantityName { get; }

        private System.Collections.Generic.IDictionary<string, object> _additionalProperties = new System.Collections.Generic.Dictionary<string, object>();

        [System.Text.Json.Serialization.JsonExtensionData]
        public System.Collections.Generic.IDictionary<string, object> AdditionalProperties
        {
            get { return _additionalProperties; }
            set { _additionalProperties = value; }
        }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class VersionInformation
    {
        [System.Text.Json.Serialization.JsonConstructor]

        public VersionInformation(string? @namingRule, string? @namingSchemeVersion, string? @referenceURL)

        {

            this.NamingRule = @namingRule;

            this.NamingSchemeVersion = @namingSchemeVersion;

            this.ReferenceURL = @referenceURL;

        }
        [System.Text.Json.Serialization.JsonPropertyName("NamingRule")]
        public string? NamingRule { get; }

        [System.Text.Json.Serialization.JsonPropertyName("NamingSchemeVersion")]
        public string? NamingSchemeVersion { get; }

        [System.Text.Json.Serialization.JsonPropertyName("ReferenceURL")]
        public string? ReferenceURL { get; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NSwag", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class FileParameter
    {
        public FileParameter(System.IO.Stream data)
            : this (data, null, null)
        {
        }

        public FileParameter(System.IO.Stream data, string? fileName)
            : this (data, fileName, null)
        {
        }

        public FileParameter(System.IO.Stream data, string? fileName, string? contentType)
        {
            Data = data;
            FileName = fileName;
            ContentType = contentType;
        }

        public System.IO.Stream Data { get; private set; }

        public string? FileName { get; private set; }

        public string? ContentType { get; private set; }
    }



    [System.CodeDom.Compiler.GeneratedCode("NSwag", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class SimulatorApiException : System.Exception
    {
        public int StatusCode { get; private set; }

        public string? Response { get; private set; }

        public System.Collections.Generic.IReadOnlyDictionary<string, System.Collections.Generic.IEnumerable<string>> Headers { get; private set; }

        public SimulatorApiException(string message, int statusCode, string? response, System.Collections.Generic.IReadOnlyDictionary<string, System.Collections.Generic.IEnumerable<string>> headers, System.Exception? innerException)
            : base(message + "\n\nStatus: " + statusCode + "\nResponse: \n" + ((response == null) ? "(null)" : response.Substring(0, response.Length >= 512 ? 512 : response.Length)), innerException)
        {
            StatusCode = statusCode;
            Response = response;
            Headers = headers;
        }

        public override string ToString()
        {
            return string.Format("HTTP Response: \n\n{0}\n\n{1}", Response, base.ToString());
        }
    }

    [System.CodeDom.Compiler.GeneratedCode("NSwag", "13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class SimulatorApiException<TResult> : SimulatorApiException
    {
        public TResult Result { get; private set; }

        public SimulatorApiException(string message, int statusCode, string? response, System.Collections.Generic.IReadOnlyDictionary<string, System.Collections.Generic.IEnumerable<string>> headers, TResult result, System.Exception? innerException)
            : base(message, statusCode, response, headers, innerException)
        {
            Result = result;
        }
    }

}

#pragma warning restore 1591
#pragma warning restore 1573
#pragma warning restore  472
#pragma warning restore  114
#pragma warning restore  108
#pragma warning restore 3016