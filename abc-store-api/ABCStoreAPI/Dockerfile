FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ABCStoreAPI.csproj", "./"]
RUN dotnet restore "ABCStoreAPI.csproj"

COPY . .
WORKDIR "/src/."
RUN dotnet build "ABCStoreAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ABCStoreAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "ABCStoreAPI.dll"]
