require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
};

const indianNews = [
  {
    title: "India's Tech Sector Sees 15% Growth Driven by AI Adoption",
    excerpt: "The Indian IT industry experiences a significant surge in growth as major firms rapidly adopt and export artificial intelligence solutions globally.",
    content: "The Indian technology sector has recorded a robust 15% growth in the last quarter, primarily driven by the rapid adoption and integration of Artificial Intelligence (AI). Industry leaders attribute this surge to increased global demand for AI-driven analytics, automation, and machine learning models developed by Indian tech hubs in Bengaluru, Hyderabad, and Pune. Major IT conglomerates have announced massive upskilling programs to train over 500,000 employees in generative AI technologies by the end of the year. This shift marks a pivotal moment for India's digital economy, transitioning from traditional software services to high-value AI innovation.",
    category: "Technology",
    featured_image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "ISRO Announces Next Generation Lunar Mission 'Chandrayaan-4'",
    excerpt: "Following the historic success of Chandrayaan-3, ISRO reveals plans for an ambitious lunar sample-return mission slated for 2028.",
    content: "The Indian Space Research Organisation (ISRO) has officially unveiled the conceptual framework for 'Chandrayaan-4', its most ambitious lunar mission to date. Scheduled for launch in 2028, the primary objective of this mission is to collect lunar soil and rock samples from the Moon's South Pole and bring them back to Earth for comprehensive scientific analysis. This complex mission will involve multiple launches and orbital docking procedures, showcasing India's growing prowess in deep space exploration. Scientists believe the samples could provide crucial insights into the presence of water ice and the moon's geological history.",
    category: "Science",
    featured_image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "Sensex Hits Record High Amid Strong Quarterly Corporate Earnings",
    excerpt: "Indian stock markets rally to unprecedented levels as major banks and FMCG companies report better-than-expected quarterly profits.",
    content: "The BSE Sensex and NSE Nifty reached new lifetime highs today, fueled by a wave of exceptional quarterly earnings reports from leading Indian corporations. The banking sector led the rally, with major private and public sector banks reporting significant margin improvements and reduced non-performing assets. Additionally, the fast-moving consumer goods (FMCG) sector saw a strong recovery in rural demand. Foreign Institutional Investors (FIIs) injected over $2 billion into Indian equities this week, reflecting strong global confidence in India's macroeconomic stability and growth trajectory amid global economic uncertainties.",
    category: "Business",
    featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "India Secures Historic Series Victory Against Australia in Perth",
    excerpt: "A brilliant century by the Indian captain leads the national cricket team to a dramatic final-day victory, securing the Border-Gavaskar Trophy.",
    content: "In what is being hailed as one of the greatest overseas test matches in cricket history, India secured a thrilling 4-wicket victory against Australia at the challenging Perth stadium. Chasing a formidable target of 328 on the final day, the Indian captain delivered a masterclass innings, scoring an unbeaten 115 under immense pressure. The victory was supported by a gritty half-century from the lower order and disciplined fast bowling in the previous innings. This historic win ensures India retains the prestigious Border-Gavaskar Trophy and solidifies their position at the top of the World Test Championship rankings.",
    category: "Sports",
    featured_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "New Electric Vehicle Subsidy Policy Announced for Tier-2 Cities",
    excerpt: "The central government rolls out the FAME-III scheme with a massive focus on accelerating electric vehicle adoption in emerging Indian cities.",
    content: "In a major push towards green mobility, the Ministry of Heavy Industries has announced the FAME-III (Faster Adoption and Manufacturing of Electric Vehicles) policy. Unlike previous iterations, this massive ₹10,000 crore subsidy scheme specifically targets Tier-2 and Tier-3 cities. The policy offers substantial upfront discounts on electric two-wheelers and commercial three-wheelers, while also allocating significant funds for establishing a robust charging infrastructure network across 50 emerging cities. Industry experts predict this move will democratize EV access and significantly reduce urban carbon emissions over the next decade.",
    category: "Politics",
    featured_image: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "Breakthrough in Indigenous Semiconductor Manufacturing Facility",
    excerpt: "India's first commercial semiconductor fabrication plant in Gujarat begins initial wafer production, marking a major milestone in tech independence.",
    content: "India has officially entered the global semiconductor manufacturing race as its first commercial fabrication plant in Dholera, Gujarat, produced its inaugural batch of silicon wafers. The $11 billion joint venture between Indian conglomerates and Taiwanese tech giants aims to produce 28nm chips primarily for the domestic automotive, consumer electronics, and telecom sectors. This development aligns with the government's 'Make in India' initiative to reduce reliance on imported electronics components. Full-scale commercial production is expected to commence by late next year, potentially creating over 100,000 direct and indirect jobs in the region.",
    category: "Technology",
    featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "Indian Cinema Sweeps Major Awards at Cannes Film Festival",
    excerpt: "Two independent Indian films win prestigious awards at Cannes, highlighting the global rise of regional Indian storytelling.",
    content: "It was a historic night for Indian cinema at the 77th Cannes Film Festival, as two independent features secured top honors. A gritty Malayalam drama exploring social hierarchies won the Grand Prix, while a visually stunning Assamese short film took home the Palme d'Or for Short Films. International critics praised the entries for their authentic cultural representation, profound emotional depth, and innovative cinematography. This unprecedented recognition marks a significant shift in global perceptions of Indian cinema, moving beyond traditional Bollywood narratives to embrace the rich, diverse storytelling of regional filmmakers.",
    category: "Entertainment",
    featured_image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  },
  {
    title: "New National Health Initiative Targets Eradication of Tuberculosis by 2027",
    excerpt: "The Ministry of Health launches an aggressive, tech-enabled tracking and treatment program to eliminate TB three years ahead of the global target.",
    content: "The Government of India has launched the 'TB Mukt Bharat' (TB-Free India) 2.0 initiative, an aggressive nationwide campaign aiming to eradicate Tuberculosis by 2027—three years ahead of the World Health Organization's global target. The program utilizes an innovative AI-driven tracking system to monitor patient medication adherence and predict potential localized outbreaks. Furthermore, the initiative provides enhanced nutritional support to patients through direct benefit transfers. Health officials emphasize that leveraging digital health infrastructure and grassroots community workers (ASHAs) will be crucial in achieving this ambitious public health milestone.",
    category: "Health",
    featured_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    published: true
  }
];

async function run() {
  console.log('Fetching admin user...');
  // We need an author ID. Let's find any user in the profiles table.
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('id').limit(1);
  
  let authorId = null;
  if (profiles && profiles.length > 0) {
    authorId = profiles[0].id;
    console.log('Found author:', authorId);
  } else {
    console.log('No profiles found. RLS might block this or table is empty.');
    // We can't easily insert without an author_id if it's required and foreign key constrained.
  }

  console.log('Injecting articles...');
  for (const article of indianNews) {
    const slug = generateSlug(article.title);
    
    const payload = {
      ...article,
      slug,
      ...(authorId ? { author_id: authorId } : {})
    };

    const { data, error } = await supabase.from('articles').insert([payload]);
    
    if (error) {
      console.error(`Failed to insert "${article.title}":`, error.message);
    } else {
      console.log(`Successfully inserted: ${article.title}`);
    }
  }
  
  console.log('Done!');
}

run();
