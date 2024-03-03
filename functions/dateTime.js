function compareTimes(currentTime, openClose) {
    // Break the openclose into open and close times
    const [openTime, closeTime] = openClose.split(' - ');

    // Split the strings into individual hours and minutes
    const [resHours, resMinutes] = currentTime.split(':').map(Number);
    const [openHours, openMinutes] = openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number);

    // Convert hours and minutes into a single value (in minutes) for easier comparison
    const currentTotalMinutes = resHours * 60 + resMinutes;
    const openTotalMinutes = openHours * 60 + openMinutes;
    const closeTotalMinutes = closeHours * 60 + closeMinutes;

    // Check if the current time falls within the store's open hours
    return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
};

module.exports = {compareTimes};