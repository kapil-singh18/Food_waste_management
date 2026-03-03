const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Ingredient = require('../models/Ingredient');
const Dish = require('../models/Dish');
const ConsumptionLog = require('../models/ConsumptionLog');
const Ngo = require('../models/Ngo');
const EventAdjustment = require('../models/EventAdjustment');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ingredientSeed = [
  { kitchenId: 'kitchen-nyc-001', name: 'Basmati Rice', stockQuantity: 110, unit: 'kg', reorderDays: 12 },
  { kitchenId: 'kitchen-nyc-001', name: 'Toor Dal', stockQuantity: 72, unit: 'kg', reorderDays: 9 },
  { kitchenId: 'kitchen-nyc-001', name: 'Mixed Vegetables', stockQuantity: 95, unit: 'kg', reorderDays: 4 },
  { kitchenId: 'kitchen-nyc-001', name: 'Paneer', stockQuantity: 36, unit: 'kg', reorderDays: 3 },
  { kitchenId: 'kitchen-nyc-001', name: 'Wheat Flour', stockQuantity: 130, unit: 'kg', reorderDays: 14 },
  { kitchenId: 'kitchen-nyc-001', name: 'Curd', stockQuantity: 55, unit: 'kg', reorderDays: 5 },
  { kitchenId: 'kitchen-nyc-001', name: 'Tomatoes', stockQuantity: 44, unit: 'kg', reorderDays: 3 },
  { kitchenId: 'kitchen-nyc-001', name: 'Onions', stockQuantity: 60, unit: 'kg', reorderDays: 6 }
];

const eventSeed = [
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'Quarterly Townhall',
    date: new Date('2026-03-12'),
    holidayFlag: false,
    specialDemandMultiplier: 1.2,
    notes: 'Higher lunch attendance from all departments'
  },
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'Founders Day',
    date: new Date('2026-03-15'),
    holidayFlag: true,
    specialDemandMultiplier: 1.28,
    notes: 'Celebration meal service and guest attendees'
  },
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'Wellness Friday',
    date: new Date('2026-03-20'),
    holidayFlag: false,
    specialDemandMultiplier: 0.86,
    notes: 'Light menu day with lower consumption'
  }
];

const ngoSeed = [
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'City Harvest Outreach',
    contactPerson: 'Maya Collins',
    phone: '+1-212-555-1901',
    email: 'pickup@cityharvest.org',
    address: '150 W 30th St, New York, NY',
    acceptedFoodTypes: ['Cooked Meals', 'Packaged Meals'],
    pickupAvailable: true,
    operatingHours: '08:00 - 20:00',
    location: { type: 'Point', coordinates: [-73.9942, 40.7484] }
  },
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'Hope Meal Bank',
    contactPerson: 'Daniel Rivera',
    phone: '+1-212-555-1033',
    email: 'donations@hopemealbank.org',
    address: '280 Madison Ave, New York, NY',
    acceptedFoodTypes: ['Dry Rations', 'Fresh Produce', 'Cooked Meals'],
    pickupAvailable: false,
    operatingHours: '09:00 - 18:00',
    location: { type: 'Point', coordinates: [-73.9816, 40.7527] }
  },
  {
    kitchenId: 'kitchen-nyc-001',
    name: 'Midtown Community Kitchen',
    contactPerson: 'Aisha Graham',
    phone: '+1-212-555-4449',
    email: 'support@midtowncommunity.org',
    address: '439 W 46th St, New York, NY',
    acceptedFoodTypes: ['Cooked Meals', 'Fresh Produce'],
    pickupAvailable: true,
    operatingHours: '07:00 - 16:00',
    location: { type: 'Point', coordinates: [-73.9956, 40.7625] }
  }
];

function dishSeed(ingredientByName) {
  return [
    {
      kitchenId: 'kitchen-nyc-001',
      name: 'Vegetable Pulao',
      ingredients: [
        { ingredientId: ingredientByName.get('Basmati Rice')._id, name: 'Basmati Rice', amountPerMeal: 0.17, unit: 'kg' },
        { ingredientId: ingredientByName.get('Mixed Vegetables')._id, name: 'Mixed Vegetables', amountPerMeal: 0.11, unit: 'kg' },
        { ingredientId: ingredientByName.get('Onions')._id, name: 'Onions', amountPerMeal: 0.03, unit: 'kg' },
        { ingredientId: ingredientByName.get('Tomatoes')._id, name: 'Tomatoes', amountPerMeal: 0.02, unit: 'kg' }
      ],
      quantityPerPerson: 1
    },
    {
      kitchenId: 'kitchen-nyc-001',
      name: 'Dal Tadka',
      ingredients: [
        { ingredientId: ingredientByName.get('Toor Dal')._id, name: 'Toor Dal', amountPerMeal: 0.12, unit: 'kg' },
        { ingredientId: ingredientByName.get('Onions')._id, name: 'Onions', amountPerMeal: 0.02, unit: 'kg' },
        { ingredientId: ingredientByName.get('Tomatoes')._id, name: 'Tomatoes', amountPerMeal: 0.02, unit: 'kg' }
      ],
      quantityPerPerson: 1
    },
    {
      kitchenId: 'kitchen-nyc-001',
      name: 'Paneer Curry',
      ingredients: [
        { ingredientId: ingredientByName.get('Paneer')._id, name: 'Paneer', amountPerMeal: 0.09, unit: 'kg' },
        { ingredientId: ingredientByName.get('Onions')._id, name: 'Onions', amountPerMeal: 0.02, unit: 'kg' },
        { ingredientId: ingredientByName.get('Tomatoes')._id, name: 'Tomatoes', amountPerMeal: 0.03, unit: 'kg' },
        { ingredientId: ingredientByName.get('Curd')._id, name: 'Curd', amountPerMeal: 0.02, unit: 'kg' }
      ],
      quantityPerPerson: 1
    },
    {
      kitchenId: 'kitchen-nyc-001',
      name: 'Tawa Roti',
      ingredients: [
        { ingredientId: ingredientByName.get('Wheat Flour')._id, name: 'Wheat Flour', amountPerMeal: 0.11, unit: 'kg' }
      ],
      quantityPerPerson: 2
    }
  ];
}

function consumptionSeed(dishByName) {
  return [
    { kitchenId: 'kitchen-nyc-001', dishName: 'Vegetable Pulao', cooked: 142, consumed: 131, date: new Date('2026-02-24') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Dal Tadka', cooked: 138, consumed: 129, date: new Date('2026-02-24') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Paneer Curry', cooked: 118, consumed: 106, date: new Date('2026-02-24') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Tawa Roti', cooked: 275, consumed: 261, date: new Date('2026-02-24') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Vegetable Pulao', cooked: 148, consumed: 140, date: new Date('2026-02-25') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Dal Tadka', cooked: 136, consumed: 133, date: new Date('2026-02-25') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Paneer Curry', cooked: 120, consumed: 111, date: new Date('2026-02-25') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Tawa Roti', cooked: 280, consumed: 268, date: new Date('2026-02-25') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Vegetable Pulao', cooked: 152, consumed: 145, date: new Date('2026-02-26') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Dal Tadka', cooked: 142, consumed: 138, date: new Date('2026-02-26') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Paneer Curry', cooked: 122, consumed: 114, date: new Date('2026-02-26') },
    { kitchenId: 'kitchen-nyc-001', dishName: 'Tawa Roti', cooked: 287, consumed: 275, date: new Date('2026-02-26') }
  ].map((row) => {
    const dish = dishByName.get(row.dishName);
    return {
      kitchenId: row.kitchenId,
      dishId: dish._id,
      cooked: row.cooked,
      consumed: row.consumed,
      leftover: row.cooked - row.consumed,
      date: row.date
    };
  });
}

async function upsertIngredients() {
  await Ingredient.bulkWrite(
    ingredientSeed.map((doc) => ({
      updateOne: {
        filter: { kitchenId: doc.kitchenId, name: doc.name },
        update: { $set: doc },
        upsert: true
      }
    }))
  );
}

async function upsertEvents() {
  await EventAdjustment.bulkWrite(
    eventSeed.map((doc) => ({
      updateOne: {
        filter: { kitchenId: doc.kitchenId, name: doc.name, date: doc.date },
        update: { $set: doc },
        upsert: true
      }
    }))
  );
}

async function upsertNgos() {
  await Ngo.bulkWrite(
    ngoSeed.map((doc) => ({
      updateOne: {
        filter: { kitchenId: doc.kitchenId, name: doc.name, phone: doc.phone },
        update: { $set: doc },
        upsert: true
      }
    }))
  );
}

async function upsertDishesAndLogs() {
  const ingredients = await Ingredient.find({ kitchenId: 'kitchen-nyc-001' });
  const ingredientByName = new Map(ingredients.map((x) => [x.name, x]));

  const requiredIngredients = ['Basmati Rice', 'Toor Dal', 'Mixed Vegetables', 'Paneer', 'Wheat Flour', 'Curd', 'Tomatoes', 'Onions'];
  const missingIngredients = requiredIngredients.filter((name) => !ingredientByName.has(name));
  if (missingIngredients.length > 0) {
    throw new Error(`Missing ingredients for dish seed: ${missingIngredients.join(', ')}`);
  }

  const dishes = dishSeed(ingredientByName);
  await Dish.bulkWrite(
    dishes.map((doc) => ({
      updateOne: {
        filter: { kitchenId: doc.kitchenId, name: doc.name },
        update: { $set: doc },
        upsert: true
      }
    }))
  );

  const dishDocs = await Dish.find({ kitchenId: 'kitchen-nyc-001' });
  const dishByName = new Map(dishDocs.map((x) => [x.name, x]));

  const logs = consumptionSeed(dishByName);
  await ConsumptionLog.bulkWrite(
    logs.map((doc) => ({
      updateOne: {
        filter: { kitchenId: doc.kitchenId, dishId: doc.dishId, date: doc.date },
        update: { $set: doc },
        upsert: true
      }
    }))
  );
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env before running the seed.');
  }

  await connectDB();
  await upsertIngredients();
  await upsertEvents();
  await upsertNgos();
  await upsertDishesAndLogs();

  const [ingredientCount, dishCount, logCount, ngoCount, eventCount] = await Promise.all([
    Ingredient.countDocuments({ kitchenId: 'kitchen-nyc-001' }),
    Dish.countDocuments({ kitchenId: 'kitchen-nyc-001' }),
    ConsumptionLog.countDocuments({ kitchenId: 'kitchen-nyc-001' }),
    Ngo.countDocuments({ kitchenId: 'kitchen-nyc-001' }),
    EventAdjustment.countDocuments({ kitchenId: 'kitchen-nyc-001' })
  ]);

  console.log('Seed complete for kitchen-nyc-001');
  console.log(`Ingredients: ${ingredientCount}`);
  console.log(`Dishes: ${dishCount}`);
  console.log(`Consumption logs: ${logCount}`);
  console.log(`NGOs: ${ngoCount}`);
  console.log(`Event adjustments: ${eventCount}`);
}

seed()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
