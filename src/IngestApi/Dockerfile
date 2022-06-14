FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

ENV CI_BUILD True

COPY ["resources/", "resources/"]

COPY [".config/", ".config/"]
COPY [".editorconfig", ".editorconfig"]
COPY ["global.json", "global.json"]
COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["src/Common/Common.csproj", "src/Common/"]
COPY ["src/IngestApi/IngestApi.csproj", "src/IngestApi/"]

RUN dotnet restore "src/IngestApi/"
COPY . .
WORKDIR "src/IngestApi/"
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish --no-restore --no-build

FROM mcr.microsoft.com/dotnet/aspnet:6.0
ENV ASPNETCORE_URLS=http://+:5050

WORKDIR /app
EXPOSE 5050
EXPOSE 5051
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "IngestApi.dll"]
