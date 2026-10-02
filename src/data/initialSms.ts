import { SMSMessage } from '../types/sms';

// Helper to construct realistic timestamps relative to today's date
function getRelativeTimestamp(daysAgo: number, hour: number, minute: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export const INITIAL_SMS_DATA: SMSMessage[] = [
  // TODAY - During Business Hours (9am - 6pm)
  {
    id: 'sms-001',
    sender: 'Chase Bank',
    senderNumber: '+1-800-432-3117',
    body: 'Your one-time authorization code is 849201 for online access. Valid for 10 minutes. Do not share this code.',
    timestamp: getRelativeTimestamp(0, 10, 15), // Today 10:15 AM
    category: 'verification',
    read: false,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-002',
    sender: 'Amazon Delivery',
    senderNumber: '262966',
    body: 'Out for delivery: Package #112-984321 is on its way with driver Alex. Estimated arrival between 2:00 PM and 4:30 PM today.',
    timestamp: getRelativeTimestamp(0, 13, 40), // Today 1:40 PM
    category: 'delivery',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-003',
    sender: 'Sarah (Work)',
    senderNumber: '+1-415-555-0192',
    body: 'Hey! Did you get a chance to review the Q4 sprint slides before our 3 PM sync? Link is in Slack.',
    timestamp: getRelativeTimestamp(0, 14, 25), // Today 2:25 PM
    category: 'work',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-004',
    sender: 'Stripe',
    senderNumber: '+1-888-927-4228',
    body: 'Payment received: $149.00 USD from Cloudflare Inc for Enterprise Subscription #INV-8821.',
    timestamp: getRelativeTimestamp(0, 16, 50), // Today 4:50 PM
    category: 'finance',
    read: true,
    starred: true,
    simSlot: 1,
  },

  // TODAY - Outside Business Hours (<9am or >6pm)
  {
    id: 'sms-005',
    sender: 'Fitbit Health',
    senderNumber: '+1-877-623-4997',
    body: 'Good morning! You achieved 8 hrs 15 mins of restorative sleep last night. Weekly sleep score: 88 (Excellent).',
    timestamp: getRelativeTimestamp(0, 7, 30), // Today 7:30 AM (outside 9am-6pm)
    category: 'service',
    read: true,
    starred: false,
    simSlot: 2,
  },
  {
    id: 'sms-006',
    sender: 'Mom',
    senderNumber: '+1-312-555-0183',
    body: 'Are we still on for homemade pasta dinner this Saturday at 6:30? Let me know if you want me to pick up dessert!',
    timestamp: getRelativeTimestamp(0, 19, 45), // Today 7:45 PM (outside 9am-6pm)
    category: 'personal',
    read: false,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-007',
    sender: 'Netflix',
    senderNumber: '+1-866-579-7172',
    body: 'New season alert: Stranger Things Season 5 is now streaming. Watch now on your mobile device or TV.',
    timestamp: getRelativeTimestamp(0, 21, 10), // Today 9:10 PM
    category: 'promotional',
    read: true,
    starred: false,
    simSlot: 2,
  },

  // YESTERDAY - During Business Hours (9am - 6pm)
  {
    id: 'sms-008',
    sender: 'John',
    senderNumber: '+1-415-555-0182',
    body: 'Hey, are we still having the project sync meeting at 3:00 PM today? Let me know if you need me to bring the presentation slides.',
    timestamp: getRelativeTimestamp(1, 14, 45), // Yesterday 2:45 PM (between 2 PM and 4 PM)
    category: 'work',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-008b',
    sender: 'John',
    senderNumber: '+1-415-555-0182',
    body: 'Good morning! Dropped off the finalized client brief on your desk.',
    timestamp: getRelativeTimestamp(1, 9, 15), // Yesterday 9:15 AM (outside 2 PM and 4 PM)
    category: 'work',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-008c',
    sender: 'Google Auth',
    senderNumber: '22000',
    body: 'G-394812 is your Google 2-Step Verification security code. Use this to verify your new sign-in.',
    timestamp: getRelativeTimestamp(1, 11, 5), // Yesterday 11:05 AM
    category: 'verification',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-009',
    sender: 'Dr. Sarah Lee Clinic',
    senderNumber: '+1-415-555-0144',
    body: 'Appointment Reminder: Your bi-annual dental cleaning is scheduled for Thursday at 10:00 AM. Reply C to confirm or R to reschedule.',
    timestamp: getRelativeTimestamp(1, 15, 20), // Yesterday 3:20 PM
    category: 'service',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-010',
    sender: 'Uber',
    senderNumber: '+1-800-593-7069',
    body: 'Your driver Marcus in a Blue Tesla Model Y is 3 minutes away at Terminal 2 pickup zone B.',
    timestamp: getRelativeTimestamp(1, 17, 10), // Yesterday 5:10 PM
    category: 'service',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // YESTERDAY - Evening
  {
    id: 'sms-011',
    sender: 'DoorDash',
    senderNumber: '+1-855-973-1040',
    body: 'Order Delivered! Enjoy your meal from Thai Basil Bistro. How was the food? Rate your dasher in the app.',
    timestamp: getRelativeTimestamp(1, 20, 15), // Yesterday 8:15 PM
    category: 'delivery',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // 3 DAYS AGO
  {
    id: 'sms-012',
    sender: 'Wells Fargo',
    senderNumber: '+1-800-869-3557',
    body: 'Wells Fargo Alert: A debit card transaction of $82.40 occurred at WHOLEFDS MKT on card ending in 9042. If unauthorized, call immediately.',
    timestamp: getRelativeTimestamp(3, 12, 35),
    category: 'finance',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-013',
    sender: 'Delta Airlines',
    senderNumber: '+1-800-221-1212',
    body: 'Delta Flight DL1844 to JFK is on schedule for on-time departure. Gate B14. Boarding starts at 1:15 PM.',
    timestamp: getRelativeTimestamp(3, 10, 0),
    category: 'service',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-014',
    sender: 'Alex Turner',
    senderNumber: '+1-206-555-0177',
    body: 'Hey man! That concert was unbelievable. Sent you the video clips on Google Drive whenever you want to check them out.',
    timestamp: getRelativeTimestamp(3, 22, 10),
    category: 'personal',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // 5 DAYS AGO
  {
    id: 'sms-015',
    sender: 'GitHub Security',
    senderNumber: '+1-877-448-4820',
    body: '[GitHub] A new personal access token with repo scope was generated from IP 192.0.2.14.',
    timestamp: getRelativeTimestamp(5, 9, 45),
    category: 'verification',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-016',
    sender: 'T-Mobile',
    senderNumber: '+1-800-937-8997',
    body: 'T-Mobile: Your bill for $75.00 is ready to view. AutoPay is scheduled for payment on the 18th.',
    timestamp: getRelativeTimestamp(5, 14, 10),
    category: 'finance',
    read: true,
    starred: false,
    simSlot: 2,
  },

  // 8 DAYS AGO (Last Week)
  {
    id: 'sms-017',
    sender: 'PayPal',
    senderNumber: '+1-888-221-1161',
    body: 'You received $55.00 from Jordan Lee for "Weekend Cabin Rental Split". Funds are available in your balance.',
    timestamp: getRelativeTimestamp(8, 16, 20),
    category: 'finance',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-018',
    sender: 'Slack Notifications',
    senderNumber: '+1-800-456-9922',
    body: 'Elena mentioned you in #mobile-architecture: "We have finalized the offline sync schema. Please review by Friday."',
    timestamp: getRelativeTimestamp(8, 11, 40),
    category: 'work',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // 15 DAYS AGO
  {
    id: 'sms-019',
    sender: 'Target',
    senderNumber: '+1-800-440-0680',
    body: 'Your Drive Up pickup order is ready! Pull into a designated spot at Store #1402 and tap "I\'m here" in your Target app.',
    timestamp: getRelativeTimestamp(15, 13, 15),
    category: 'delivery',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-020',
    sender: 'USPS Tracking',
    senderNumber: '28777',
    body: 'USPS 94001118992231904328 Delivered: Parcel was placed in parcel locker at 10:25 AM.',
    timestamp: getRelativeTimestamp(15, 10, 25),
    category: 'delivery',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // 25 DAYS AGO
  {
    id: 'sms-021',
    sender: 'Airbnb',
    senderNumber: '+1-855-424-7262',
    body: 'Reservation confirmed! Your stay in Lake Tahoe starts in 3 days. Host Mark sent door check-in instructions: Keycode 4910.',
    timestamp: getRelativeTimestamp(25, 14, 50),
    category: 'service',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-022',
    sender: 'Sammy',
    senderNumber: '+1-555-0129',
    body: 'Yo! Are we playing pickleball at the park courts tomorrow morning? Court reservation is open at 8 AM.',
    timestamp: getRelativeTimestamp(25, 18, 30),
    category: 'personal',
    read: true,
    starred: false,
    simSlot: 1,
  },

  // 40 DAYS AGO (Last Month)
  {
    id: 'sms-023',
    sender: 'Chase Bank',
    senderNumber: '+1-800-432-3117',
    body: 'Fraud Alert: Did you attempt a $420.00 purchase at Best Buy on card 3821? Reply YES or NO. Msg & data rates may apply.',
    timestamp: getRelativeTimestamp(40, 15, 0),
    category: 'finance',
    read: true,
    starred: true,
    simSlot: 1,
  },
  {
    id: 'sms-024',
    sender: 'David (Work)',
    senderNumber: '+1-415-555-0811',
    body: 'Great job presenting the demo today! The client signed off on the mobile prototype milestones.',
    timestamp: getRelativeTimestamp(40, 16, 45),
    category: 'work',
    read: true,
    starred: false,
    simSlot: 1,
  },
  {
    id: 'sms-025',
    sender: 'Apple Support',
    senderNumber: '+1-800-275-2273',
    body: 'Your AppleCare+ repair case #CAS-99214 for iPhone screen replacement has been completed. Ready for pickup.',
    timestamp: getRelativeTimestamp(40, 11, 20),
    category: 'service',
    read: true,
    starred: false,
    simSlot: 1,
  }
];
