// Ultra-minimal Vercel serverless function
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;

  // Route handling
  if (url === '/' && method === 'GET') {
    res.status(200).json({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      method: method,
      url: url
    });
  } else if (url === '/users' && method === 'GET') {
    res.status(200).json([
      { id: 1, name: 'Test User 1', email: 'test1@example.com' },
      { id: 2, name: 'Test User 2', email: 'test2@example.com' }
    ]);
  } else if (url === '/health' && method === 'GET') {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      error: 'Not found',
      path: url,
      method: method
    });
  }
};