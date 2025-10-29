# ABC Store API

## Overview

**ABC Store API** is a simple e-commerce web API powering the [ABC Store Webapp](../abc-store-webapp/), built using ASP.NET Core.

## Project Setup

### Setting up

**This project is dependant on the [ABC Store API](../abc-store-api/) and [Firebase Functions](https://firebase.google.com/products/functions) and [Firebase Storage](https://firebase.google.com/products/storage) so make sure that both services are running (use the local emulator during development).**

**The project also requires a Postgresql to be running.**

If using VSCode make sure to set these environment variables in the _launch.json_ file:

- **CONNECTION_STRING**: The connection string to the Postgresql database instance.
- **EXCHANGE_RATE_API_KEY**: You can obtain an API key at [EXCHANGE RATE API](https://v6.exchangerate-api.com).
- **FIREBASE_PROJECT_ID**: Your firbase project id obtained from the Firebase Console.
- **FIREBASE_FUNCTION_URL**: The url to the firebase function used to create thumbnails _(can be local or hosted url)_.
- **ALLOWED_ORIGINS**: Which origin should be allowed to access the API. This should be the base url or the ABC Store Webapp.
- **BUILD_VERSION**: Can be any string indicating a build number for the application, such a _Develop_.

> **Note**
> 
> If not using VSCode you will need to provide these environment variable when starting the project.

### Running the project

If using **\*VSCode** use the launch configuration _'Debug API'_.

#### _OR_

```bash
# To build the project
dotnet build

# To run the project
dotnet run -- CONNECTION_STRING [YOUR_CONNECTION_STRING] \ EXCHANGE_RATE_API_KEY [YOUR_EXCHANGE_RATE_API_KEY] \ FIREBASE_PROJECT_ID [YOUR_FIREBASE_PROJECT_ID] \
FIREBASE_FUNCTION_URL [YOUR_FIREBASE_FUNCTION_URL] \
ALLOWED_ORIGINS [YOUR_ALLOWED_ORIGINS] \ 
BUILD_VERSION [YOUR_BUILD_VERSION]

```

> **Note**
>
> During start up the projec will consume the following,
>
> Product information from:
> - https://dummyjson.com
> - https://fakestoreapi.com
>
> Exchange Rates from: 
> - https://v6.exchangerate-api.com/v6


## License

[MIT](./LICENSE)
