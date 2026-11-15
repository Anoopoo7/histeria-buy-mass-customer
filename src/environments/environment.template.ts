// Template for environment variables. Actual values are generated at build/start from .env
export const environment = {
  production: false,
  apiBaseUrl: '',
  googleMapsApiKey: '',
  cloudinary: {
    cloudName: '',
    uploadPreset: '',
    apiKey: '',
  },
  newRelic: {
    accountId: '',
    applicationId: '',
    licenseKey: '',
    trustKey: '',
    enabled: false,
  },
  appName: 'BuyMass Customer',
  defaultRadiusKm: 20,
};
