const hostedMode = process.env.MOBILE_HOSTED === '1';

const config = {
  appId: 'com.teaspill.app',
  appName: 'Spill Wise',
  webDir: 'dist-mobile'
};

if (hostedMode) {
  config.server = {
    url: 'https://spill-wise.netlify.app/app.html',
    cleartext: false,
    allowNavigation: [
      'spill-wise.netlify.app',
      '*.supabase.co',
      'accounts.google.com',
      'www.googleapis.com'
    ]
  };
}

module.exports = config;
