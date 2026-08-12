/**
 * Smart Hostel Management System - Permanent Database Initialization Script
 * Target Database: smarthostel_authz
 * 
 * Behavior:
 * 1. Seeds the initial weekly `mess_menu` collection (7 days).
 * 2. All other collections (students, rooms, complaints, leave_requests, attendance, etc.)
 *    are created automatically on demand when data is inserted via UI or REST API.
 */

db = db.getSiblingDB("smarthostel_authz");

// Seed initial mess_menu if not present
if (db.mess_menu.countDocuments() === 0) {
  db.mess_menu.insertMany([
    {
      dayOfWeek: "Monday",
      breakfast: "Idli Sambar, Coconut Chutney, Tea / Coffee",
      lunch: "Rajma Chawal, Chapati, Mixed Veg, Salad, Curd",
      snacks: "Samosa, Mint Chutney, Tea",
      dinner: "Paneer Butter Masala, Roti, Jeera Rice, Dal Fry",
      specialItem: "Gulab Jamun",
      notes: "Fresh Monday Kickoff Menu"
    },
    {
      dayOfWeek: "Tuesday",
      breakfast: "Puri Bhaji, Sprouted Moong, Tea / Coffee",
      lunch: "Kadi Pakoda, Steamed Rice, Aloo Gobhi, Chapati",
      snacks: "Veg Cutlet, Tomato Ketchup, Tea",
      dinner: "Mix Veg Curry, Chapati, Dal Tadka, Rice",
      specialItem: "Fruit Custard",
      notes: "Healthy Tuesday Choice"
    },
    {
      dayOfWeek: "Wednesday",
      breakfast: "Aloo Paratha, Curd, Pickle, Tea / Coffee",
      lunch: "Veg Biryani, Boondi Raita, Chapati, Paneer Curry",
      snacks: "Poha, Sev, Tea",
      dinner: "Kadai Paneer, Butter Roti, Veg Pulao, Dal Makhani",
      specialItem: "Rasgulla",
      notes: "Mid-week Special Feast"
    },
    {
      dayOfWeek: "Thursday",
      breakfast: "Uttapam, Tomato Chutney, Sambhar, Tea / Coffee",
      lunch: "Chole Bhature, Steamed Rice, Cucumber Salad",
      snacks: "Bread Pakoda, Green Chutney, Tea",
      dinner: "Dum Aloo, Chapati, Veg Khichdi, Papad",
      specialItem: "Kheer",
      notes: "Thursday Special"
    },
    {
      dayOfWeek: "Friday",
      breakfast: "Masala Dosa, Sambhar, Coconut Chutney, Tea / Coffee",
      lunch: "Dal Makhani, Jeera Rice, Bhindi Fry, Chapati, Sweet Lassi",
      snacks: "Bhel Puri, Tea",
      dinner: "Veg Kolhapuri, Chapati, Matar Pulao, Dal Fry",
      specialItem: "Ice Cream",
      notes: "Friday Delight"
    },
    {
      dayOfWeek: "Saturday",
      breakfast: "Pav Bhaji, Butter Pav, Tea / Coffee",
      lunch: "Veg Pulao, Paneer Do Pyaza, Chapati, Onion Raita",
      snacks: "Pasta / Chowmein, Tea",
      dinner: "Soya Chaap Curry, Chapati, Plain Rice, Dal",
      specialItem: "Jalebi",
      notes: "Weekend Eve Menu"
    },
    {
      dayOfWeek: "Sunday",
      breakfast: "Chole Kulche, Pickle, Fresh Juice / Tea",
      lunch: "Special Veg Thali, Shahi Paneer, Naan, Pulao, Sweet",
      snacks: "Corn Chaat, Tea",
      dinner: "Special Dal Baati Churma / Veg Handi, Rice",
      specialItem: "Gajar Ka Halwa",
      notes: "Sunday Feast"
    }
  ]);
  print("Seeded 7 days of weekly mess menu items into smarthostel_authz.mess_menu.");
}

print("Permanent database smarthostel_authz configured! Mess Menu seeded; all other collections will be created dynamically upon UI / API insertions.");





