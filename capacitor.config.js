const config = {
  appId: 'com.teaspill.app',
  appName: 'Spill Wise',
  webDir: 'dist-mobile',
  server: {
    url: 'https://spill-wise.netlify.app/app.html',
    cleartext: false,
    allowNavigation: [
      'spill-wise.netlify.app',
      '*.supabase.co',
      'accounts.google.com',
      'www.googleapis.com'
    ],
    // Override user-agent so Google OAuth doesn't block with 403 disallowed_useragent.
    // Android WebView adds 'wv' to the UA string which Google detects and blocks.
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
  }
};

module.exports = config;
