import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing insert into articles as published...');
  const { data, error } = await supabase.from('articles').insert({
    title: 'Test Published Article ' + Date.now(),
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    featured_image: 'https://via.placeholder.com/150',
    category: 'Technology',
    author_id: 'a366f0ee-876a-493e-bc57-dc28065b263b', // Dummy or need real? I'll let it use what we can.
    published: true,
    status: 'published',
    slug: 'test-article-published-' + Date.now()
  }).select();
  
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Success:', data);
  }
}

run();
