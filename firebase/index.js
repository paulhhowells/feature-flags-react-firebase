import firebase from 'firebase/app';
import 'firebase/firestore';

let config = {};

switch (process.env.REACT_APP_TARGET_ENV) {
  case 'production':
    // Production config.
    config = {
      apiKey: '### FIREBASE API KEY ###',
      authDomain: 'app-name-prod.firebaseapp.com',
      databaseURL: 'https://app-name-prod.firebaseio.com',
      projectId: 'app-name-prod',
    };

    break;
  case 'staging':
    // Staging config.
    config = {
      apiKey: '### FIREBASE API KEY ###',
      authDomain: 'app-name-staging.firebaseapp.com',
      databaseURL: 'https://app-name-staging.firebaseio.com',
      projectId: 'app-name-staging',
    };

    break;
  default:
    // Dev config.
    config = {
      apiKey: '### FIREBASE API KEY ###',
      authDomain: 'app-name-dev.firebaseapp.com',
      databaseURL: 'https://app-name-dev.firebaseio.com',
      projectId: 'app-name-dev',
    };
}

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export { firebase };
