let totalSpellPoints = 0;
let remainingSpellPoints = 0;

// Function to calculate total spell points based on level and ability score
document.getElementById('calculate-total-points').onclick = function () {
    const level = parseInt(document.getElementById('level').value);
    const abilityScore = parseInt(document.getElementById('ability-score').value);

    // Base spell points by level
    const baseSpellPoints = [0, 4, 8, 14, 24, 38, 48, 69, 94, 72, 94, 141, 208, 308, 348, 385, 505, 595, 655, 705, 795];

    // Bonus spell points by ability score and character level
    const bonusSpellPointsTable = {
        12: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
        13: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
        14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        16: [1, 3, 4, 6, 7, 9, 10, 12, 13, 15],
        17: [1, 3, 4, 6, 7, 9, 10, 12, 13, 15],
        18: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
        19: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
        20: [2, 5, 7, 10, 12, 15, 17, 20, 22, 25],
        21: [2, 5, 7, 10, 12, 15, 17, 20, 22, 25],
        22: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
        23: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
        24: [3, 7, 10, 14, 17, 21, 24, 28, 31, 35],
        25: [3, 7, 10, 14, 17, 21, 24, 28, 31, 35]
    };

    // Ensure level and ability score are valid
    if (level < 1 || level > 20 || abilityScore < 12 || abilityScore > 25) {
        alert('Invalid level or ability score.');
        return;
    }

    // Calculate total spell points (base + bonus)
    const basePoints = baseSpellPoints[level];
    const bonusPoints = (bonusSpellPointsTable[abilityScore] || [])[level - 1] || 0;
    totalSpellPoints = basePoints + bonusPoints;
    remainingSpellPoints = totalSpellPoints;

    // Update the total points display
    document.getElementById('total-points').innerHTML = `Total Spell Points: ${totalSpellPoints}`;
    document.getElementById('remaining-points').innerHTML = `Remaining Spell Points: ${remainingSpellPoints}`;
};

// Function to cast a spell and subtract spell points
document.getElementById('cast-spell').onclick = function () {
    const castingMode = document.getElementById('casting-mode').value;
    const spellLevel = document.getElementById('spell-level').value === 'cantrip' ? 0 : parseInt(document.getElementById('spell-level').value);

    // Spell cost by casting mode and spell level
    const spellCostTable = {
        'fixed-regular': [0, 4, 6, 10, 15, 22, 30, 40, 50, 60],
        'fixed-enhanced': [0, 6, 9, 15, 22, 33, 45, 60, 75, 90],
        'free': [0, 8, 12, 20, 30, 44, 60, 80, 100, 120],
        'incantation': [0, 4, 6, 10, 15, 22, 30, 40, 50, 60],
        'long-cast': [0, 3, 5, 8, 12, 18, 25, 35, 45, 55]
    };

    const spellCost = spellCostTable[castingMode][spellLevel];

    // Subtract spell cost from remaining spell points
    if (remainingSpellPoints >= spellCost) {
        remainingSpellPoints -= spellCost;
        document.getElementById('remaining-points').innerHTML = `Remaining Spell Points: ${remainingSpellPoints}`;
    } else {
        alert('Not enough spell points to cast this spell!');
    }
};

// Function to calculate recovery based on activity and time
document.getElementById('calculate-recovery').onclick = function () {
    const activity = document.getElementById('activity').value;
    const time = parseFloat(document.getElementById('time').value); // Time in hours
    let pointsRecovered = 0;

    // Calculate 30-minute segments (time is in hours, so multiply by 2)
    const halfHourSegments = time * 2;

    // Define base recovery rates per 30 minutes
    const recoveryRates = {
        walking: {
            flat: 1, // 2 per hour => 1 per 30 minutes
            percentage: 0.01 // 2% per hour => 1% per 30 minutes
        },
        resting: {
            flat: 2, // 4 per hour => 2 per 30 minutes
            percentage: 0.02 // 4% per hour => 2% per 30 minutes
        },
        sleeping: {
            flat: 4, // 8 per hour => 4 per 30 minutes
            percentage: 0.05 // 10% per hour => 5% per 30 minutes
        },
        none: {
            flat: 0,
            percentage: 0
        }
    };

    // Get the flat and percentage recovery rates based on the selected activity
    const { flat, percentage } = recoveryRates[activity] || recoveryRates.none;

    // Calculate total recovery for the given time in 30-minute segments
    for (let i = 0; i < halfHourSegments; i++) {
        const flatRecovery = flat;
        const percentageRecovery = Math.floor(totalSpellPoints * percentage);

        // Use the greater of flat recovery or percentage recovery
        const segmentRecovery = Math.max(flatRecovery, percentageRecovery);

        // Add to the total points recovered
        pointsRecovered += segmentRecovery;

        // Ensure points recovered does not exceed total spell points
        if (pointsRecovered > totalSpellPoints - remainingSpellPoints) {
            pointsRecovered = totalSpellPoints - remainingSpellPoints;
            break;
        }
    }

    // Update remaining spell points
    remainingSpellPoints += pointsRecovered;

    // Display recovered and remaining points
    document.getElementById('recovered-points').innerHTML = `Recovered Spell Points: ${Math.round(pointsRecovered)}`;
    document.getElementById('remaining-points').innerHTML = `Remaining Spell Points: ${Math.round(remainingSpellPoints)}`;
};

