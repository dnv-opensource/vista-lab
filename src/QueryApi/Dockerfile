FROM mcr.microsoft.com/dotnet/aspnet:6.0 as runtime

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /app

ENV CI_BUILD True

COPY ["resources/", "resources/"]

COPY [".config/", ".config/"]
COPY [".editorconfig", ".editorconfig"]
COPY ["global.json", "global.json"]
COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["src/Common/Common.csproj", "src/Common/"]
COPY ["src/QueryApi/QueryApi.csproj", "src/QueryApi/"]
COPY ["src/SearchClient/SearchClient.csproj", "src/SearchClient/"]
COPY ["src/SimulatorClient/SimulatorClient.csproj", "src/SimulatorClient/"]

RUN dotnet restore "src/QueryApi/"
COPY . .
WORKDIR "src/QueryApi/"
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish --no-restore --no-build

FROM runtime

ENV ASPNETCORE_URLS=http://+:5052

WORKDIR /app
EXPOSE 5052
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "QueryApi.dll"]
