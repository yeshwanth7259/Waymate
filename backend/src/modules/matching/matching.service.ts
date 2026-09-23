export const calculateMatchScore = (ride: any, searchParams: any): number => {
    let score = 100;
  
    // Dummy matching logic based on the user's rules
    // Route 40%, Time 25%, Pickup 15%, Destination 10%, Vehicle 10%
  
    // Example: If dates don't match exactly, reduce score
    if (searchParams.date) {
      const searchDate = new Date(searchParams.date).toDateString();
      const rideDate = new Date(ride.departureTime).toDateString();
      if (searchDate !== rideDate) {
        score -= 25; 
      }
    }
  
    // In a real postGIS engine, we would calculate distance from `searchParams.from` to `ride.from`
    // For now, if strings don't somewhat match, penalize
    if (searchParams.from && !ride.from.toLowerCase().includes(searchParams.from.toLowerCase())) {
        score -= 15;
    }
    
    if (searchParams.to && !ride.to.toLowerCase().includes(searchParams.to.toLowerCase())) {
        score -= 10;
    }
  
    return Math.max(0, score);
  };
  
