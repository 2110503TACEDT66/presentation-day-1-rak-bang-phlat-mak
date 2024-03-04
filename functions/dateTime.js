function compareTimes(currentTime, openClose) {
    // Break the openclose into open and close times
    const [openTime, closeTime] = openClose.split(' - ');

    // Split time into hours and minutes
    const [resHours, resMinutes] = currentTime.split(':').map(Number);
    const [openHours, openMinutes] = openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number);

    // Convert times into minutes
    const currentTotalMinutes = resHours * 60 + resMinutes;
    const openTotalMinutes = openHours * 60 + openMinutes;
    const closeTotalMinutes = closeHours * 60 + closeMinutes;

    return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
};

module.exports = {compareTimes};