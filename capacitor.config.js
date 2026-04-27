const isHosted = process.env.MOBILE_HOSTED === '1';

const config = {
  appId: 'com.teaspill.app',
  appName: 'Spill Wise',
  webDir: 'dist-mobile',
  server: {
    cleartext: false,
    allowNavigation: [
      'spill-wise.netlify.app',
      '*.supabase.co',
      'accounts.google.com',
      'www.googleapis.com'
    ],
    // Override user-agent so Google OAuth doesn't block with 403 disallowed_useragent.
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
  }
};

if (isHosted) {
  config.server.url = 'https://spill-wise.netlify.app/app.html';
}

module.exports = config;
