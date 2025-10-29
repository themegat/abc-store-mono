# ABC Store Webapp

## Overview

**ABC Store Webapp** is a simple e-commerce web application for consumer use. 

Built on the [React Template](https://github.com/suren-atoyan/react-pwa) and using [Vite](https://vitejs.dev/) v6, 
[React](https://react.dev/) v19,
[TypeScript](https://www.typescriptlang.org/) Latest and [MUI](https://mui.com/) v6.

## Project Setup

### Setting up

**This project is dependant on the [ABC Store API](../abc-store-api/) and [Firebase Authentication](https://firebase.google.com/products/auth) so make sure that both service are running/available before starting this project.** 

Also make sure to set these environment variables in the [env](/.env) file: 
- **VITE_API_BASE_URL**: The url to the ABC Store API
- **VITE_FIREBASE_CONFIG_B64**: Your Firebase configuration, *(obtain from the Firebase Console)*, as a Base64 encoded string. Use https://jsonformatter.org/json-to-base64 to encode the firebase configuration.
- **VITE_BUILD_VERSION**: Can be any string indicating a build number for the application, such a *Develop*.  

> **Note**
> 
> If the .env file is missing, create it in the root of this project and then add the environment variables.

### Running the project

```bash
# Use this command to start the development server
npm run dev
```

#### *OR*

If using ***VSCode** use the launch configuration *'Debug App'*.

## License

[MIT](./LICENSE)
