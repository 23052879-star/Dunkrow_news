const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let supabaseUrl = '';
let supabaseKey = '';

lines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const urlObj = new URL(supabaseUrl + '/rest/v1/articles');

const options = {
  hostname: urlObj.hostname,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'apikey': supabaseKey,
    'Authorization': 'Bearer ' + supabaseKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const payload = JSON.stringify({
  title: 'Test Published Direct ' + Date.now(),
  content: '<p>Test</p>',
  excerpt: 'Test excerpt',
  featured_image: 'https://via.placeholder.com/150',
  category: 'Technology',
  author_id: '1e19dcf5-341a-46da-98cf-1959343ee0fb', // We need a valid author id? Let's hope auth is disabled for insert or it bypasses RLS? Wait, anon key has RLS.
  published: true,
  status: 'published',
  slug: 'test-article-published-' + Date.now()
});

console.log('Sending request to', urlObj.href);

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', error => {
  console.error('Request Error:', error);
});

req.write(payload);
req.end();
