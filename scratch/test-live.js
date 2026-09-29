import fetch from 'node-fetch';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node test-live.js <TRIP_ID> <HOST_TOKEN>");
  process.exit(1);
}

const tripId = args[0];
const token = args[1];
const url = `http://localhost:3001/api/trips/${tripId}/location`;

const locations = [
  { lat: 12.9716, lng: 77.5946 }, // Start
  { lat: 12.9720, lng: 77.5952 }, // Move 1
  { lat: 12.9725, lng: 77.5960 }, // Move 2
  { lat: 12.9730, lng: 77.5970 }, // Move 3
  { lat: 12.9740, lng: 77.5985 }, // Move 4
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log(`Starting simulated drive for Trip ${tripId}...`);
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`[Step ${i+1}/${locations.length}] Sending GPS: ${loc.lat}, ${loc.lng}`);
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: loc.lat,
          longitude: loc.lng,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Failed: ${res.status} - ${text}`);
        return;
      }
      
      console.log(`✅ Success! Wait 3 seconds...`);
    } catch (e) {
      console.error("Network error:", e.message);
    }
    
    await sleep(3000); // wait 3 seconds before next move
  }
  
  console.log("Drive complete!");
}

run();
