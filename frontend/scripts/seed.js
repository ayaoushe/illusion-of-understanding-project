import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not set. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample ISIC-based dermatology cases for seeding
const sampleCases = [
  {
    diagnosis: 'Melanoma',
    image_url: '/images/ISIC_0000000.jpg',
    evidence_for: ['Asymmetric shape', 'Irregular borders', 'Multiple colors (black, brown, blue)', 'Diameter >6mm', 'Evolution over time'],
    evidence_against: ['Uniform color', 'Round shape', 'Small size (<6mm)', 'No change in appearance']
  },
  {
    diagnosis: 'Melanoma',
    image_url: '/images/ISIC_0000001.jpg',
    evidence_for: ['Irregular pigmentation', 'Notched borders', 'Varied colors', 'Large size', 'Itching or bleeding'],
    evidence_against: ['Symmetrical', 'Even borders', 'Single color', 'Stable appearance']
  },
  {
    diagnosis: 'Nevus',
    image_url: '/images/ISIC_0000002.jpg',
    evidence_for: ['Symmetrical shape', 'Even borders', 'Uniform color', 'Small size', 'Stable over time'],
    evidence_against: ['Asymmetric', 'Irregular borders', 'Multiple colors', 'Large size', 'Recent changes']
  },
  {
    diagnosis: 'Nevus',
    image_url: '/images/ISIC_0000006.jpg',
    evidence_for: ['Round or oval shape', 'Smooth borders', 'Consistent pigmentation', 'Diameter <6mm', 'No symptoms'],
    evidence_against: ['Irregular shape', 'Notched borders', 'Color variation', 'Growing', 'Painful']
  },
  {
    diagnosis: 'Basal Cell Carcinoma',
    image_url: '/images/ISIC_0000007.jpg',
    evidence_for: ['Pearly appearance', 'Telangiectasia', 'Ulceration', 'Rolled borders', 'Slow growth'],
    evidence_against: ['Flat surface', 'No blood vessels visible', 'Intact skin', 'Sharp borders', 'Rapid growth']
  },
  {
    diagnosis: 'Basal Cell Carcinoma',
    image_url: '/images/ISIC_0000008.jpg',
    evidence_for: ['Waxy or shiny surface', 'Visible blood vessels', 'Central depression or ulcer', 'Translucent edges', 'History of sun exposure'],
    evidence_against: ['Opaque surface', 'No telangiectasia', 'Raised uniformly', 'Irregular pigmentation', 'No sun damage history']
  }
];

async function seedDatabase() {
  try {
    console.log('Clearing existing cases...');
    await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    console.log('Seeding Supabase with ISIC-based sample cases...');

    for (const caseData of sampleCases) {
      const { data, error } = await supabase
        .from('cases')
        .insert([caseData]);

      if (error) {
        console.error('Error inserting case:', error);
      } else {
        console.log('Inserted case:', caseData.diagnosis);
      }
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedDatabase();