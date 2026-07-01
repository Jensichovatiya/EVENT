using EVENT.Business.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using EVENT.WebAPI.Attribute;
using EVENT.WebAPI.Middleware;
using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Text;
using EVENT.WebApi;

var builder = WebApplication.CreateBuilder(args);
var isProductionEnvironment = Convert.ToBoolean(builder.Configuration["ApplicationSettings:IsProductionEnvironment"]);

builder.Services.Configure<ApplicationSettings>(
    builder.Configuration.GetSection("ApplicationSettings"));

//builder.Services.AddCors(options => {
//    options.AddPolicy(name: "MyAllowSpecificOrigins",
//    builder => {
//        builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
//    });
//});

Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXtfdnRSRWVcWUd2Wks=");

builder.Services.AddHttpContextAccessor();

//builder.Services.AddDbContext<UserContext>(options =>
//                  options.UseSqlServer(builder.Configuration.GetSection("ApplicationSettings").GetValue<string>("ConnectionString")));

if (!Debugger.IsAttached) {
   // builder.Services.AddHostedService<AutoSchedulerProcessingServiceHostedService>();
   // builder.Services.AddScoped<IAutoSchedulerProcessingService, AutoSchedulerProcessingService>();
}

builder.Services.AddControllers();


//Add Context Here
//Add Repository Here

builder.Services.AddControllers().AddNewtonsoftJson();

builder.Services.AddControllers()
               .AddJsonOptions(opts => {
                   //Force Camel Case to JSON
                   opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
               });

builder.Services.Configure<ApiBehaviorOptions>(o => {
    o.InvalidModelStateResponseFactory = actionContext =>
        new BadRequestObjectResult(actionContext.ModelState);
});

//Validation Msg for ModelClass
builder.Services.AddMvc(config => {
    config.Filters.Add(new ValidateModelAttribute());
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo {
        Title = "Event.WebApi",
        Version = "v1"
    });
    c.MapType<TimeSpan>(() => new OpenApiSchema {
        Type = "string",
        Example = new OpenApiString("00:00:00")
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme() {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "Jwt",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
    });

    //c.AddSecurityDefinition("PlatformType", new OpenApiSecurityScheme() {
    //    Name = "Platform",
    //    Type = SecuritySchemeType.ApiKey,
    //    In = ParameterLocation.Header,
    //    Description = "Add Platform Type",
    //});

    c.AddSecurityDefinition("ApiSecurityKey", new OpenApiSecurityScheme() {
        Name = "ApiSecurityKey",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Add Api Security Type",
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    //c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    //    {
    //        new OpenApiSecurityScheme {
    //            Reference = new OpenApiReference {
    //                Type = ReferenceType.SecurityScheme,
    //                    Id = "PlatformType"
    //            }
    //        },
    //        new string[] {}
    //    }
    //});

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                        Id = "ApiSecurityKey"
                }
            },
            new string[] {}
        }
    });

    if (!isProductionEnvironment) {
        //Event.WebApi
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.XML";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

        //Event.Business
        var xmlFile2 = $"Event.Business.XML";
        var xmlPath2 = Path.Combine(AppContext.BaseDirectory, xmlFile2);
        c.IncludeXmlComments(xmlPath2, includeControllerXmlComments: true);

        //Event.Core
        var xmlFile3 = $"Event.Core.XML";
        var xmlPath3 = Path.Combine(AppContext.BaseDirectory, xmlFile3);
        c.IncludeXmlComments(xmlPath3, includeControllerXmlComments: true);

        //Event.DAL
        var xmlFile4 = $"Event.DAL.XML";
        var xmlPath4 = Path.Combine(AppContext.BaseDirectory, xmlFile4);
        c.IncludeXmlComments(xmlPath4, includeControllerXmlComments: true);

        //Event.Entities
        var xmlFile5 = $"Event.Entities.XML";
        var xmlPath5 = Path.Combine(AppContext.BaseDirectory, xmlFile5);
        c.IncludeXmlComments(xmlPath5, includeControllerXmlComments: true);
    }
});



builder.Services.Configure<RequestLocalizationOptions>(options => {
    options.DefaultRequestCulture = new RequestCulture("en-IN");
    options.SupportedCultures = new List<CultureInfo>() { new CultureInfo("en-IN"), };
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters() {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

RegisterService.RegisterServices(builder.Services);

var app = builder.Build();

if (!isProductionEnvironment) {
    app.UseSwagger();
    app.UseSwaggerUI();
}
else {
    app.UseHttpsRedirection();
}

app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
//app.UseHttpsRedirection();
//app.UseStaticFiles();





if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:CountryFlagFolderName"].ToString())))
{
    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:CountryFlagFolderName"].ToString()));
}

if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:RootFolderName"].ToString())))
{
    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:RootFolderName"].ToString()));
}

if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:ImageFolderPath"].ToString()))) {
    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:ImageFolderPath"].ToString()));
}

if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:UserImageFolderPath"].ToString()))) {
    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:UserImageFolderPath"].ToString()));
}
if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:EventImageFolderPath"].ToString()))) {
    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:EventImageFolderPath"].ToString()));
}

var compositeProvider = new CompositeFileProvider(
    new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:CountryFlagFolderName"].ToString())),
    new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:RootFolderName"].ToString())),
    new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:ImageFolderPath"].ToString())),
    new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:UserImageFolderPath"].ToString())),
    new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), builder.Configuration["ApplicationSettings:EventImageFolderPath"].ToString()))

);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = compositeProvider,
    RequestPath = "/" + builder.Configuration["ApplicationSettings:CountryFlagFolderName"].ToString()
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = compositeProvider,
    RequestPath = "/" + builder.Configuration["ApplicationSettings:RootFolderName"].ToString()
});

app.UseStaticFiles(new StaticFileOptions {
    FileProvider = compositeProvider,
    RequestPath = "/" + builder.Configuration["ApplicationSettings:ImageFolderPath"].ToString()
});

app.UseStaticFiles(new StaticFileOptions {
    FileProvider = compositeProvider,
    RequestPath = "/" + builder.Configuration["ApplicationSettings:UserImageFolderPath"].ToString()
});

app.UseStaticFiles(new StaticFileOptions {
    FileProvider = compositeProvider,
    RequestPath = "/" + builder.Configuration["ApplicationSettings:EventImageFolderPath"].ToString()
});

// Serve wwwroot/image (for asset-type icons and other uploads)
var wwwImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "image");
if (!Directory.Exists(wwwImagePath))
    Directory.CreateDirectory(wwwImagePath);

app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwImagePath),
    RequestPath = "/image"
});

app.UseRouting();
app.UseAuthentication();
app.UseMiddleware<JWTMiddleware>();
//app.UseMiddleware<UserDetailMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.Run();