FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

ENV CI_BUILD True

COPY ["resources/", "resources/"]

COPY [".config/", ".config/"]
COPY [".editorconfig", ".editorconfig"]
COPY ["global.json", "global.json"]
COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["src/AlertManager/AlertManager.csproj", "src/AlertManager/"]

RUN dotnet restore "src/AlertManager/"
COPY . .
WORKDIR "src/AlertManager/"
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish --no-restore --no-build

FROM mcr.microsoft.com/dotnet/runtime:6.0
WORKDIR /app
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "AlertManager.dll"]
