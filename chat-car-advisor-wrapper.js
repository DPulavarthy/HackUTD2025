import 'dotenv/config';
import fs from 'fs/promises';
import fsSync from 'fs';
import inquirer from 'inquirer';

const GEMINI_API_KEY = 'AIzaSyAXRUMSAGySiptuR4Q95zUN_TmWoCSHHWI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Load your dataset
const cars = JSON.parse(fsSync.readFileSync('./cars_with_links_annotated.json', 'utf-8'));

// Simple helper to build a compact system prompt
const systemMsg = `You are a helpful Toyota car advisor that compares vehicles based on user specifications.

IMPORTANT: You MUST return EXACTLY 3-6 cars. Do not return more or less than this range.

From the provided JSON, return a shortlist of 3-6 cars ranked from best match to least match, based on the user's specifications.

CRITICAL: For each car, ONLY mention and compare the specific attributes the user asked about. Do not include information about other attributes they didn't request.

IMPORTANT: When user mentions keywords like "family", "SUV", "reliability", etc., look at ALL the buying_factors fields (reliability_longevity, practicality, total_cost_to_own, etc.) to find matching information. For example, "Family SUV costs; reliable." in total_cost_to_own indicates a family SUV.

Format your response as a comparison, showing:
1. Car name (Make, Model, Year)
2. Why it ranks where it does for the user's SPECIFIC requested attributes
3. Use the actual stats/data from the JSON to support your comparison
4. Compare cars against each other for the requested attributes

Do not invent cars or stats; use the JSON exactly. 
Respect any "links_used_for" annotations per car in the JSON.

Remember: Return between 3 and 6 cars only, and ONLY discuss the attributes the user specifically requested.`;

async function main() {
  // 1) Get user's vehicle specifications
  const { specifications } = await inquirer.prompt([
    {
      type: 'input',
      name: 'specifications',
      message: 'List your desired vehicle specifications (e.g., "safety and reliability", "fuel efficiency and low price", etc.):',
    }
  ]);

  // 2) Call Gemini to rank and compare cars based on specifications
  const userPrompt = 
    `${systemMsg}\n\n` +
    `User's desired vehicle specifications: ${specifications}\n\n` +
    `JSON dataset (analyze and compare cars based ONLY on the specifications mentioned above):\n` +
    JSON.stringify(cars); // Send full dataset

  // Make direct API call to Gemini
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: userPrompt
        }]
      }]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error from Gemini API:', JSON.stringify(data, null, 2));
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const text = data.candidates[0].content.parts[0].text;

  console.log('\n===== Recommended shortlist =====\n');
  console.log(text);
  
  // Extract ONLY the relevant factors from user specifications
  const specWords = specifications.toLowerCase().split(/[\s,]+/).filter(w => w && w !== 'and' && w !== 'or' && w !== 'the' && w !== 'a');
  const relevantFactors = [];
  const factorMapping = {
    // SAFETY - all variations
    'safe': 'safety', 'safety': 'safety', 'safer': 'safety', 'safest': 'safety', 'secure': 'safety', 'security': 'safety',
    'protected': 'safety', 'protection': 'safety', 'crash': 'safety', 'airbag': 'safety', 'airbags': 'safety',
    'collision': 'safety', 'braking': 'safety', 'brake': 'safety', 'brakes': 'safety', 'saftey': 'safety', 
    'safty': 'safety', 'saftye': 'safety', 'safte': 'safety',
    
    // RELIABILITY / LONGEVITY - all variations
    'reliable': 'reliability', 'reliability': 'reliability', 'reliablity': 'reliability',
    'longevity': 'reliability', 'durable': 'reliability', 'durability': 'reliability',
    'dependable': 'reliability', 'lasting': 'reliability', 'quality': 'reliability',
    'trustworthy': 'reliability', 'proven': 'reliability', 'solid': 'reliability',
    'sturdy': 'reliability', 'tough': 'reliability', 'robust': 'reliability',
    'maintenance': 'reliability', 'upkeep': 'reliability', 'repair': 'reliability',
    'repairs': 'reliability', 'issues': 'reliability', 'problems': 'reliability',
    'realiablity': 'reliability', 'realibity': 'reliability', 'realbilty': 'reliability',
    
    // FUEL EFFICIENCY / MPG - all variations (maps to mpg data, not buying_factors)
    'efficiency': 'mpg', 'efficient': 'mpg', 'fuel': 'mpg',
    'mpg': 'mpg', 'mileage': 'mpg', 'gas': 'mpg', 'milage': 'mpg',
    'economy': 'mpg', 'economical': 'mpg', 'consumption': 'mpg',
    'frugal': 'mpg', 'thrifty': 'mpg', 'range': 'mpg',
    'gallon': 'mpg', 'gallons': 'mpg',
    'epa': 'mpg', 'city': 'mpg', 'highway': 'mpg', 'hwy': 'mpg',
    'combined': 'mpg', 'electric': 'mpg', 'hybrid': 'mpg',
    
    // TOTAL COST TO OWN / PRICE - all variations
    'price': 'total_cost_to_own', 'cost': 'total_cost_to_own', 'costs': 'total_cost_to_own',
    'budget': 'total_cost_to_own', 'cheap': 'total_cost_to_own', 'cheaper': 'total_cost_to_own', 'cheapest': 'total_cost_to_own',
    'affordable': 'total_cost_to_own', 'affordability': 'total_cost_to_own', 'inexpensive': 'total_cost_to_own',
    'expensive': 'total_cost_to_own', 'pricey': 'total_cost_to_own', 'costly': 'total_cost_to_own',
    'money': 'total_cost_to_own', 'payment': 'total_cost_to_own', 'payments': 'total_cost_to_own',
    'financing': 'total_cost_to_own', 'finance': 'total_cost_to_own',
    'msrp': 'total_cost_to_own', 'value': 'total_cost_to_own', 'deal': 'total_cost_to_own',
    'bargain': 'total_cost_to_own', 'ownership': 'total_cost_to_own', 'own': 'total_cost_to_own',
    'total': 'total_cost_to_own', 'spend': 'total_cost_to_own', 'spending': 'total_cost_to_own',
    'investment': 'total_cost_to_own', 'invest': 'total_cost_to_own',
    
    // LEASE - all variations
    'lease': 'lease', 'leasing': 'lease', 'monthly': 'lease', 'month': 'lease',
    'leases': 'lease', 'leased': 'lease', 'rent': 'lease', 'rental': 'lease',
    
    // PRACTICALITY - all variations
    'practical': 'practicality', 'practicality': 'practicality', 'practical': 'practicality',
    'useful': 'practicality', 'utility': 'practicality', 'versatile': 'practicality', 'versatility': 'practicality',
    'functional': 'practicality', 'functionality': 'practicality', 'usable': 'practicality', 'usability': 'practicality',
    'cargo': 'practicality', 'storage': 'practicality', 'trunk': 'practicality', 'space': 'practicality', 'spacious': 'practicality',
    'capacity': 'practicality', 'hauling': 'practicality', 'haul': 'practicality', 'carry': 'practicality',
    'stuff': 'practicality', 'things': 'practicality', 'gear': 'practicality', 'luggage': 'practicality',
    'family': 'practicality', 'kids': 'practicality', 'children': 'practicality', 'baby': 'practicality',
    'groceries': 'practicality', 'shopping': 'practicality', 'errands': 'practicality',
    'suv': 'practicality', 'crossover': 'practicality', 'van': 'practicality', 'minivan': 'practicality',
    
    // LEG ROOM - all variations
    'legroom': 'leg_room', 'legspace': 'leg_room', 'leg': 'leg_room', 'legs': 'leg_room',
    'room': 'leg_room', 'roomy': 'leg_room', 'roominess': 'leg_room', 'interior': 'leg_room',
    'seats': 'leg_room', 'seating': 'leg_room', 'seat': 'leg_room', 'sitting': 'leg_room',
    'tall': 'leg_room', 'height': 'leg_room', 'headroom': 'leg_room', 'head': 'leg_room',
    'passenger': 'leg_room', 'passengers': 'leg_room', 'backseat': 'leg_room', 'rear': 'leg_room',
    'front': 'leg_room', 'driver': 'leg_room', 'cabin': 'leg_room',
    
    // COMFORT / REFINEMENT - all variations
    'comfort': 'comfort', 'comfortable': 'comfort', 'comfy': 'comfort',
    'comfortability': 'comfort', 'comforatble': 'comfort', 'comfotable': 'comfort',
    'confortable': 'comfort', 'comfortble': 'comfort',
    'refinement': 'comfort', 'refined': 'comfort', 'smooth': 'comfort',
    'quiet': 'comfort', 'silence': 'comfort', 'silent': 'comfort', 'noise': 'comfort',
    'ride': 'comfort', 'riding': 'comfort', 'cushion': 'comfort', 'cushioned': 'comfort',
    'plush': 'comfort', 'luxury': 'comfort', 'luxurious': 'comfort', 'premium': 'comfort',
    'soft': 'comfort', 'supple': 'comfort', 'cozy': 'comfort', 'pleasant': 'comfort',
    'relaxing': 'comfort', 'easy': 'comfort', 'ergonomic': 'comfort',
    'climate': 'comfort', 'ac': 'comfort', 'airconditioning': 'comfort',
    'heating': 'comfort', 'heated': 'comfort', 'cooled': 'comfort', 'ventilated': 'comfort',
    
    // TECH / CONVENIENCE - all variations
    'tech': 'tech_convenience', 'technology': 'tech_convenience', 'techy': 'tech_convenience', 'techie': 'tech_convenience',
    'convenience': 'tech_convenience', 'convenient': 'tech_convenience', 'features': 'tech_convenience', 'feature': 'tech_convenience',
    'infotainment': 'tech_convenience', 'screen': 'tech_convenience', 'display': 'tech_convenience', 'touchscreen': 'tech_convenience',
    'bluetooth': 'tech_convenience', 'carplay': 'tech_convenience', 'android': 'tech_convenience', 'smartphone': 'tech_convenience',
    'phone': 'tech_convenience', 'wireless': 'tech_convenience', 'connectivity': 'tech_convenience', 'connected': 'tech_convenience',
    'navigation': 'tech_convenience', 'nav': 'tech_convenience', 'gps': 'tech_convenience', 'maps': 'tech_convenience',
    'camera': 'tech_convenience', 'cameras': 'tech_convenience', 'backup': 'tech_convenience', 'parking': 'tech_convenience',
    'sensors': 'tech_convenience', 'sensor': 'tech_convenience', 'assist': 'tech_convenience', 'assistance': 'tech_convenience',
    'adaptive': 'tech_convenience', 'cruise': 'tech_convenience', 'lane': 'tech_convenience', 'blind': 'tech_convenience',
    'spot': 'tech_convenience', 'monitor': 'tech_convenience', 'monitoring': 'tech_convenience',
    'smart': 'tech_convenience', 'digital': 'tech_convenience', 'electronics': 'tech_convenience', 'electronic': 'tech_convenience',
    'modern': 'tech_convenience', 'advanced': 'tech_convenience', 'gadgets': 'tech_convenience', 'gadget': 'tech_convenience',
    
    // PERFORMANCE / HANDLING - all variations
    'performance': 'performance_handling', 'perform': 'performance_handling', 'performing': 'performance_handling',
    'handling': 'performance_handling', 'handle': 'performance_handling', 'handles': 'performance_handling',
    'power': 'horsepower', 'powerful': 'horsepower', 'horsepower': 'horsepower',
    'hp': 'horsepower', 'torque': 'horsepower', 'engine': 'horsepower',
    'fast': 'horsepower', 'quick': 'horsepower', 'quickness': 'horsepower',
    'speed': 'horsepower', 'speedy': 'horsepower', 'acceleration': 'horsepower',
    'accelerate': 'horsepower', 'accelerating': 'horsepower', 'responsive': 'performance_handling',
    'responsiveness': 'performance_handling', 'agile': 'performance_handling', 'agility': 'performance_handling',
    'sporty': 'performance_handling', 'sport': 'performance_handling', 'driving': 'performance_handling',
    'drive': 'performance_handling', 'fun': 'performance_handling', 'exciting': 'performance_handling',
    'dynamic': 'performance_handling', 'nimble': 'performance_handling', 'sharp': 'performance_handling',
    'precise': 'performance_handling', 'cornering': 'performance_handling', 'corners': 'performance_handling',
    'grip': 'performance_handling', 'traction': 'performance_handling', 'stability': 'performance_handling',
    'turbo': 'performance_handling', 'turbocharged': 'performance_handling', 'supercharged': 'performance_handling',
    
    // WARRANTY / SUPPORT - all variations
    'warranty': 'warranty_support', 'warrantee': 'warranty_support', 'guarantee': 'warranty_support',
    'support': 'warranty_support', 'coverage': 'warranty_support', 'covered': 'warranty_support',
    'service': 'warranty_support', 'servicing': 'warranty_support', 'dealer': 'warranty_support', 'dealership': 'warranty_support',
    'network': 'warranty_support', 'certified': 'warranty_support', 'cpo': 'warranty_support',
    'powertrain': 'warranty_support', 'bumper': 'warranty_support', 'comprehensive': 'warranty_support',
    'roadside': 'warranty_support', 'assistance': 'warranty_support',
    
    // RESALE VALUE - all variations
    'resale': 'resale_value', 'resell': 'resale_value', 'residual': 'resale_value', 'residuals': 'resale_value',
    'depreciation': 'resale_value', 'depreciate': 'resale_value', 'retain': 'resale_value', 'retains': 'resale_value',
    'holds': 'resale_value', 'hold': 'resale_value', 'worth': 'resale_value', 'trade': 'resale_value',
    'tradein': 'resale_value', 'selling': 'resale_value', 'sell': 'resale_value',
    
    // TOWING CAPACITY - all variations
    'towing': 'towing_capacity', 'tow': 'towing_capacity', 'tows': 'towing_capacity',
    'trailer': 'towing_capacity', 'trailers': 'towing_capacity', 'hitch': 'towing_capacity',
    'pull': 'towing_capacity', 'pulling': 'towing_capacity', 'haul': 'towing_capacity', 'hauling': 'towing_capacity',
    'boat': 'towing_capacity', 'camper': 'towing_capacity', 'rv': 'towing_capacity',
    
    // STYLE / VIBE - all variations
    'style': 'style', 'styling': 'style', 'stylish': 'style', 'stylisha': 'style',
    'sylish': 'style', 'sylysh': 'style', 'stlish': 'style', 'stilish': 'style',
    'look': 'style', 'looks': 'style', 'looking': 'style', 'appearance': 'style',
    'design': 'style', 'designed': 'style', 'aesthetic': 'style', 'aesthetics': 'style',
    'beautiful': 'style', 'pretty': 'style', 'attractive': 'style', 'sharp': 'style',
    'sleek': 'style', 'modern': 'style', 'contemporary': 'style', 'trendy': 'style',
    'fashionable': 'style', 'cool': 'style', 'hip': 'style', 'chic': 'style',
    'classy': 'style', 'elegant': 'style', 'sophisticated': 'style', 'upscale': 'style',
    'aggressive': 'style', 'bold': 'style', 'striking': 'style', 'eye': 'style',
    'catching': 'style', 'attention': 'style', 'head': 'style', 'turner': 'style',
    'exterior': 'style', 'body': 'style', 'color': 'style', 'colors': 'style',
    'paint': 'style', 'trim': 'style', 'grille': 'style', 'wheels': 'style',
    
    // CLIMATE / ROADS - all variations
    'weather': 'all_weather_capability', 'climate': 'all_weather_capability', 'winter': 'all_weather_capability',
    'snow': 'all_weather_capability', 'snowy': 'all_weather_capability', 'ice': 'all_weather_capability', 'icy': 'all_weather_capability',
    'rain': 'all_weather_capability', 'rainy': 'all_weather_capability', 'wet': 'all_weather_capability',
    'cold': 'all_weather_capability', 'hot': 'all_weather_capability', 'heat': 'all_weather_capability',
    'awd': 'all_weather_capability', '4wd': 'all_weather_capability', 'fwd': 'all_weather_capability', 'rwd': 'all_weather_capability',
    'allwheel': 'all_weather_capability', 'fourwheel': 'all_weather_capability', 'wheel': 'all_weather_capability',
    'offroad': 'all_weather_capability', 'road': 'all_weather_capability', 'roads': 'all_weather_capability',
    'terrain': 'all_weather_capability', 'rugged': 'all_weather_capability', 'ground': 'all_weather_capability',
    'clearance': 'all_weather_capability', 'conditions': 'all_weather_capability'
  };
  
  console.log(`\nInput words: ${specWords.join(', ')}`);
  
  for (const word of specWords) {
    if (factorMapping[word] && !relevantFactors.includes(factorMapping[word])) {
      relevantFactors.push(factorMapping[word]);
      console.log(`  ✓ Matched "${word}" → ${factorMapping[word]}`);
    }
  }
  
  // ONLY use factors that were actually found in user input
  // Don't add defaults if the user was specific
  const topFactors = relevantFactors.length > 0 
    ? relevantFactors 
    : ['total_cost_to_own']; // Only use one default if nothing matched
  
  console.log(`\n🎯 Final factors to display: ${topFactors.join(', ')}\n`);
  
  // Find mentioned cars
  const carsInResponse = [];
  for (const car of cars) {
    const modelRegex = new RegExp(`${car.model}.*${car.year}`, 'i');
    if (text.match(modelRegex)) {
      carsInResponse.push(car);
    }
  }
  
  // Read the HTML template
  let htmlTemplate = await fs.readFile('./comparison-template.html', 'utf-8');
  
  // Inject the data as window variables
  const dataScript = `
    <script>
        window.CARS_DATA = ${JSON.stringify(carsInResponse)};
        window.TOP_FACTORS = ${JSON.stringify(topFactors)};
        window.USER_SPEC = ${JSON.stringify(specifications)};
        window.AI_ANALYSIS = ${JSON.stringify(text)};
    </script>
`;
  
  // Insert the data script before the main script tag
  htmlTemplate = htmlTemplate.replace(
    '<script>',
    dataScript + '<script>'
  );
  
  // Save the generated HTML file
  await fs.writeFile('./car-recommendations.html', htmlTemplate, 'utf-8');
  
  console.log('\n================================\n');
  console.log('✓ Recommendations generated: car-recommendations.html');
  console.log('✓ Open the file in your browser to view results\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
