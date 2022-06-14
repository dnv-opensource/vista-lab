FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

ENV CI_BUILD True

COPY ["resources/", "resources/"]

COPY [".config/", ".config/"]
COPY [".editorconfig", ".editorconfig"]
COPY ["global.json", "global.json"]
COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["src/MqttBroker/MqttBroker.csproj", "src/MqttBroker/"]

RUN dotnet restore "src/MqttBroker/"
COPY . .
WORKDIR "src/MqttBroker/"
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish --no-restore --no-build

FROM mcr.microsoft.com/dotnet/runtime:6.0
WORKDIR /app
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "MqttBroker.dll"]
