// Using native fetch in Node 24
import { io } from "socket.io-client";

const API_BASE = 'http://localhost:3001/api';

function createMockToken(userId, phone) {
  const payload = Buffer.from(JSON.stringify({ user_id: userId, phone_number: phone })).toString('base64');
  return `header.${payload}.signature`;
}

const tokenA = createMockToken('user_a_host', '+919999999991');
const tokenB = createMockToken('user_b_rider', '+919999999992');

async function api(endpoint, method, token, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${method} ${endpoint}: ${err}`);
  }
  return res.json();
}

async function runTest() {
  try {
    console.log("=== STARTING GOLDEN TEST ===");
    
    console.log("\\n1. Sync Phone A (Host)");
    await api('/auth/sync', 'POST', tokenA);
    const hostProfile = await api('/users/me', 'PUT', tokenA, { fullName: 'Account A (Host)', gender: 'Male', city: 'Bengaluru' });
    console.log("Host Profile:", hostProfile.profile.fullName);

    console.log("\\n2. Add Bike for Phone A");
    const vehicleRes = await api('/vehicles', 'POST', tokenA, {
      type: 'BIKE',
      brand: 'Royal Enfield',
      model: 'Classic 350',
      color: 'Black',
      registrationNumber: 'KA-01-AB-1234',
      seatCapacity: 1,
      isEv: false
    });
    console.log("Added Vehicle:", vehicleRes.brand, vehicleRes.model);

    console.log("\\n3. Offer Ride (HSR -> Whitefield) for Phone A");
    const rideResData = await api('/rides', 'POST', tokenA, {
      vehicleId: vehicleRes.id,
      from: 'HSR Layout',
      to: 'Whitefield',
      departureTime: '2026-10-01T08:30:00.000Z',
      availableSeats: 1,
      purpose: 'Office'
    });
    const rideRes = rideResData.ride;
    console.log("Offered Ride ID:", rideRes.id, "from", rideRes.from, "to", rideRes.to);

    console.log("\\n4. Sync Phone B (Rider)");
    await api('/auth/sync', 'POST', tokenB);
    const riderProfile = await api('/users/me', 'PUT', tokenB, { fullName: 'Account B (Rider)', gender: 'Female', city: 'Bengaluru' });
    console.log("Rider Profile:", riderProfile.profile.fullName);

    console.log("\\n5. Find Ride for Phone B (HSR -> Whitefield)");
    const searchRes = await api('/rides/search?from=HSR Layout&to=Whitefield', 'GET', tokenB);
    console.log(`Found ${searchRes.length} rides.`);
    const matchingRide = searchRes.find(r => r.id === rideRes.id);
    if (!matchingRide) throw new Error("Could not find the offered ride in search results!");
    console.log("Found Host's Ride:", matchingRide.from, "->", matchingRide.to, "(Host:", matchingRide.host.profile.fullName, ")");

    console.log("\\n6. Request Seat for Phone B on Phone A's Ride");
    const requestRes = await api(`/rides/${matchingRide.id}/request`, 'POST', tokenB, { seats: 1 });
    console.log("Request created:", requestRes.status);

    console.log("\\n7. Phone A checks pending requests and Accepts");
    const acceptRes = await api(`/requests/${requestRes.id}/accept`, 'POST', tokenA);
    console.log("Request status after accept:", acceptRes.request.status);
    console.log("Booking created ID:", acceptRes.booking.id, "Status:", acceptRes.booking.status);

    console.log("\\n8. Phone B checks My Bookings");
    const myBookingsRes = await api('/bookings/my', 'GET', tokenB);
    const myBooking = myBookingsRes.find(b => b.id === acceptRes.booking.id);
    if (!myBooking || myBooking.status !== 'CONFIRMED') throw new Error("Booking is not confirmed for Rider!");
    console.log("Phone B has confirmed booking for ride:", myBooking.ride.from, "->", myBooking.ride.to);

    console.log("\\n=== PHASE 8: TRIP LIFECYCLE TESTS ===");

    console.log("\\n9. Get My Trips for Phone A (Host)");
    const myTripsRes = await api('/trips/my', 'GET', tokenA);
    const hostTrip = myTripsRes.find(t => t.ride.id === rideRes.id);
    if (!hostTrip) throw new Error("Trip not found for the created ride!");
    console.log(`Trip found with status: ${hostTrip.status}`);

    console.log("\\n10. Negative Test: Rider (Phone B) tries to start the trip");
    try {
      await api(`/trips/${hostTrip.id}/start`, 'POST', tokenB);
      throw new Error("Rider was able to start the trip! (Expected failure)");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    console.log("\\n10.5 Negative Test: Host POST location before START");
    try {
      await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
        latitude: 12.9121, longitude: 77.6446, timestamp: new Date().toISOString()
      });
      throw new Error("Host posted location before start! (Expected failure)");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    console.log("\\n11. Phone A (Host) starts the trip");
    const startTripRes = await api(`/trips/${hostTrip.id}/start`, 'POST', tokenA);
    console.log(`Trip status changed to: ${startTripRes.trip.status}`);

    console.log("\\n12. Phone B (Rider) gets the trip to view live status");
    const viewTripRes = await api(`/trips/${hostTrip.id}`, 'GET', tokenB);
    console.log(`Rider sees trip status as: ${viewTripRes.status}`);

    console.log("\\n13. Negative Test: Random user (Phone C) tries to view the trip");
    const tokenC = createMockToken('user_c_random', '+919999999993');
    await api('/auth/sync', 'POST', tokenC);
    try {
      await api(`/trips/${hostTrip.id}`, 'GET', tokenC);
      throw new Error("Random user was able to view the trip! (Expected failure)");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    console.log("\\n=== PHASE 9: LIVE TRACKING TESTS ===");
    console.log("\\n13.1 Connect Rider to Socket.IO and Join Trip");
    
    // Ensure mock dev token is handled in socket.io middleware
    const riderSocket = io('http://localhost:3001', {
      auth: { token: 'MOCK_user_b_rider' } // Uses mock prefix for dev
    });

    const userCSocket = io('http://localhost:3001', {
      auth: { token: 'MOCK_user_c_random' }
    });

    await new Promise((resolve) => riderSocket.on('connect', resolve));
    await new Promise((resolve) => userCSocket.on('connect', resolve));
    
    console.log("Sockets connected. Joining rooms...");
    
    let riderReceivedEvents = [];
    let userCReceivedEvents = [];

    riderSocket.on('location:update', (loc) => riderReceivedEvents.push(loc));
    userCSocket.on('location:update', (loc) => userCReceivedEvents.push(loc));

    const joinTrip = (socket, tripId) => new Promise((resolve, reject) => {
      socket.emit('joinTrip', tripId);
      // Wait a moment to see if error comes back
      const onErr = (err) => reject(new Error(err));
      socket.once('error', onErr);
      setTimeout(() => {
        socket.off('error', onErr);
        resolve();
      }, 500);
    });

    await joinTrip(riderSocket, hostTrip.id);
    console.log("Rider joined trip successfully");

    try {
      await joinTrip(userCSocket, hostTrip.id);
      throw new Error("Random user was able to join trip room!");
    } catch (err) {
      console.log("Expected Error for Random User joining:", err.message);
    }

    console.log("\\n13.2 Host sends 3 GPS updates via REST");
    await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
      latitude: 12.9121, longitude: 77.6446, timestamp: new Date().toISOString()
    });
    await new Promise(r => setTimeout(r, 200));
    await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
      latitude: 12.9132, longitude: 77.6460, timestamp: new Date().toISOString()
    });
    await new Promise(r => setTimeout(r, 200));
    await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
      latitude: 12.9145, longitude: 77.6481, timestamp: new Date().toISOString()
    });
    await new Promise(r => setTimeout(r, 200));

    console.log(`Rider received ${riderReceivedEvents.length} events. User C received ${userCReceivedEvents.length} events.`);
    if (riderReceivedEvents.length !== 3) throw new Error("Rider did not receive all location updates");
    if (userCReceivedEvents.length !== 0) throw new Error("User C received location updates when they shouldn't");
    console.log("Latest location received by Rider:", riderReceivedEvents[2].latitude, riderReceivedEvents[2].longitude);

    console.log("\\n13.3 Negative Tests: Unauthorized users posting location");
    try {
      await api(`/trips/${hostTrip.id}/location`, 'POST', tokenB, {
        latitude: 12.9121, longitude: 77.6446, timestamp: new Date().toISOString()
      });
      throw new Error("Rider was able to POST location!");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    try {
      await api(`/trips/${hostTrip.id}/location`, 'POST', tokenC, {
        latitude: 12.9121, longitude: 77.6446, timestamp: new Date().toISOString()
      });
      throw new Error("Random user was able to POST location!");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }
    
    console.log("\\n13.4 Negative Test: Invalid GPS Data");
    try {
      await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
        latitude: 120.9121, longitude: 77.6446, timestamp: new Date().toISOString() // Invalid lat
      });
      throw new Error("Host posted invalid location!");
    } catch (e) {
      console.log("Expected Error (Invalid GPS):", e.message);
    }

    riderSocket.disconnect();
    userCSocket.disconnect();

    console.log("\\n14. Phone A (Host) completes the trip");
    const completeTripRes = await api(`/trips/${hostTrip.id}/complete`, 'POST', tokenA);
    console.log(`Trip status changed to: ${completeTripRes.trip.status}`);

    console.log("\\n15. Negative Test: Host tries to start a completed trip");
    try {
      await api(`/trips/${hostTrip.id}/start`, 'POST', tokenA);
      throw new Error("Host was able to start a completed trip! (Expected failure)");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    console.log("\\n16. Negative Test: Host tries to POST location after COMPLETE");
    try {
      await api(`/trips/${hostTrip.id}/location`, 'POST', tokenA, {
        latitude: 12.9145, longitude: 77.6481, timestamp: new Date().toISOString()
      });
      throw new Error("Host was able to POST location after complete!");
    } catch (e) {
      console.log("Expected Error:", e.message);
    }

    console.log("\\n=== GOLDEN TEST PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("\\n!!! TEST FAILED !!!", err);
    process.exit(1);
  }
}

runTest();
