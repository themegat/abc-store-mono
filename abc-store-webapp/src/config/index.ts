const config = {
  loader: {
    // no more blinking in your app
    delay: 300, // if your asynchronous process is finished during 300 milliseconds you will not see the loader at all
    minimumLoading: 700, // but if it appears, it will stay for at least 700 milliseconds
  },
  defaultMetaTags: {
    image: '',
    description: 'ABC Storefront',
  },
  dateFormat: 'MMMM DD, YYYY',
  email: 'auther-email@gmail.com',
  title: 'ABC Store',
  firebase: {
    firebaseConfig: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: '',
    },
  },
  preferedCurrency: "ZAR"
};

export { config };
