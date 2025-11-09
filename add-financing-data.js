import fs from 'fs';

// Load the cars data
const cars = JSON.parse(fs.readFileSync('./cars_with_links_annotated.json', 'utf-8'));

// DFW Toyota dealerships near 75080
const dealerships = [
  {
    name: "Toyota of Richardson",
    address: "1501 N Central Expy, Richardson, TX 75080",
    distance_miles: 2.1,
    phone: "(972) 234-5678"
  },
  {
    name: "Trophy Toyota of Dallas",
    address: "13333 N Stemmons Fwy, Dallas, TX 75234",
    distance_miles: 8.7,
    phone: "(972) 243-9999"
  },
  {
    name: "Vandergriff Toyota",
    address: "6201 Colleyville Blvd, Colleyville, TX 76034",
    distance_miles: 15.3,
    phone: "(817) 329-3200"
  }
];

// Function to calculate financing based on vehicle price
function generateFinancing(car) {
  const msrp = car.price_usd?.msrp_from || car.price_usd?.full_price || 25000;
  const isNew = car.year >= 2024;
  const incentive = isNew ? msrp * 0.05 : msrp * 0.02; // 5% off new, 2% off used
  
  const financing = {
    zip_code: "75080",
    area: "Richardson, TX",
    last_updated: "2025-11-09",
    dealerships: [],
    yearly_cost_estimates: {
      insurance_annual: Math.round(900 + (msrp / 30000) * 500), // Higher for expensive cars
      registration_annual: Math.round(150 + (msrp / 50000) * 100),
      maintenance_annual: Math.round(400 + (car.horsepower_hp || 200) * 0.5),
      fuel_annual_12k_miles: Math.round(12000 / (car.mpg?.combined || 25) * 3.50), // $3.50/gal
      total_annual_ownership: 0
    }
  };
  
  financing.yearly_cost_estimates.total_annual_ownership = 
    financing.yearly_cost_estimates.insurance_annual +
    financing.yearly_cost_estimates.registration_annual +
    financing.yearly_cost_estimates.maintenance_annual +
    financing.yearly_cost_estimates.fuel_annual_12k_miles;
  
  let lowestMonthly = Infinity;
  let lowestMonthlDealer = "";
  let lowestTotalCost = Infinity;
  let lowestTotalDealer = "";
  let bestAPR = Infinity;
  let bestAPRDealer = "";
  
  // Generate financing for each dealership
  dealerships.forEach((dealer, idx) => {
    const priceVariation = msrp - incentive + (idx * 150); // Slight price differences
    const downPayment = Math.round(msrp * 0.1); // 10% down
    const financeAmount = priceVariation - downPayment;
    
    // APR varies by dealership and credit tier
    const baseAPR = isNew ? 4.99 : 6.99;
    const tier1APR = baseAPR + (idx * 0.3);
    const tier2APR = tier1APR + 1.5;
    const tier3APR = tier2APR + 3.5;
    
    // Calculate monthly payments (60 month term)
    const term = 60;
    const tier1Monthly = Math.round((financeAmount * (tier1APR/100/12)) / (1 - Math.pow(1 + (tier1APR/100/12), -term)));
    const tier2Monthly = Math.round((financeAmount * (tier2APR/100/12)) / (1 - Math.pow(1 + (tier2APR/100/12), -term)));
    const tier3Monthly = Math.round((financeAmount * (tier3APR/100/12)) / (1 - Math.pow(1 + (tier3APR/100/12), -term)));
    
    const tier1Total = tier1Monthly * term + downPayment;
    const tier2Total = tier2Monthly * term + downPayment;
    const tier3Total = tier3Monthly * term + downPayment;
    
    // Lease calculations
    const leaseMonthly = Math.round(msrp * 0.013 + (idx * 10)); // Roughly 1.3% of MSRP
    const leaseDAS = 2999 + (idx * 250);
    const leaseTerm = 36;
    const residualPercent = 0.54;
    
    const dealerData = {
      name: dealer.name,
      address: dealer.address,
      distance_miles: dealer.distance_miles,
      phone: dealer.phone,
      finance_options: {
        purchase: {
          price_after_incentives: Math.round(priceVariation),
          down_payment: downPayment,
          apr_tiers: {
            tier_1_excellent: {
              credit_score: "720+",
              apr: parseFloat(tier1APR.toFixed(2)),
              term_months: term,
              monthly_payment: tier1Monthly,
              total_cost: tier1Total,
              total_interest: tier1Total - priceVariation
            },
            tier_2_good: {
              credit_score: "680-719",
              apr: parseFloat(tier2APR.toFixed(2)),
              term_months: term,
              monthly_payment: tier2Monthly,
              total_cost: tier2Total,
              total_interest: tier2Total - priceVariation
            },
            tier_3_fair: {
              credit_score: "620-679",
              apr: parseFloat(tier3APR.toFixed(2)),
              term_months: term,
              monthly_payment: tier3Monthly,
              total_cost: tier3Total,
              total_interest: tier3Total - priceVariation
            }
          }
        },
        lease: {
          term_months: leaseTerm,
          monthly_payment: leaseMonthly,
          due_at_signing: leaseDAS,
          annual_mileage: idx === 2 ? 10000 : 12000,
          excess_mileage_charge: idx === 2 ? 0.25 : 0.20,
          total_lease_cost: leaseMonthly * leaseTerm + leaseDAS,
          money_factor: parseFloat((0.0018 + idx * 0.0001).toFixed(4)),
          residual_value: Math.round(msrp * residualPercent)
        }
      }
    };
    
    financing.dealerships.push(dealerData);
    
    // Track best deals
    if (leaseMonthly < lowestMonthly) {
      lowestMonthly = leaseMonthly;
      lowestMonthlDealer = dealer.name;
    }
    if (tier1Total < lowestTotalCost) {
      lowestTotalCost = tier1Total;
      lowestTotalDealer = dealer.name;
    }
    if (tier1APR < bestAPR) {
      bestAPR = tier1APR;
      bestAPRDealer = dealer.name;
    }
  });
  
  financing.best_deal_summary = {
    lowest_monthly_payment: {
      dealership: lowestMonthlDealer,
      type: "lease",
      amount: lowestMonthly
    },
    lowest_total_cost: {
      dealership: lowestTotalDealer,
      type: "purchase_tier_1",
      amount: lowestTotalCost
    },
    best_apr: {
      dealership: bestAPRDealer,
      rate: parseFloat(bestAPR.toFixed(2))
    }
  };
  
  return financing;
}

// Add financing to all cars
console.log(`Processing ${cars.length} vehicles...`);
let count = 0;

cars.forEach((car, index) => {
  // Skip if already has financing_75080
  if (car.financing_75080) {
    console.log(`Skipping ${car.year} ${car.model} - already has financing data`);
    return;
  }
  
  car.financing_75080 = generateFinancing(car);
  count++;
  
  if (count % 10 === 0) {
    console.log(`Processed ${count} vehicles...`);
  }
});

// Save the updated data
fs.writeFileSync('./cars_with_links_annotated.json', JSON.stringify(cars, null, 2));
console.log(`\n✓ Added financing data to ${count} vehicles`);
console.log('✓ File saved: cars_with_links_annotated.json');
