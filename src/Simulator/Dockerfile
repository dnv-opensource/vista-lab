FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

ENV CI_BUILD True

COPY ["resources/", "resources/"]

COPY [".config/", ".config/"]
COPY [".editorconfig", ".editorconfig"]
COPY ["global.json", "global.json"]
COPY ["Directory.Build.props", "Directory.Build.props"]

COPY ["src/Common/Common.csproj", "src/Common/"]
COPY ["src/Simulator/Simulator.csproj", "src/Simulator/"]

RUN dotnet restore "src/Simulator/"
COPY . .
WORKDIR "src/Simulator/"
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish --no-restore --no-build

FROM mcr.microsoft.com/dotnet/aspnet:6.0
ENV ASPNETCORE_URLS=http://+:5054

WORKDIR /app
EXPOSE 5054
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "Simulator.dll"]
