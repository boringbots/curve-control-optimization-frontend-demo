// Curve Control Demo JavaScript
// Extracted and adapted from curve-control-card for standalone demo

class CurveControlDemo {
    constructor() {
        this.currentTab = 'basic';
        this.backendUrl = 'https://optimal-temp-ha-backend-a69b8b7983db.herokuapp.com';
        this.isCalculating = false;
        this.chart = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAdvancedSchedule();
        this.loadSampleData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!e.target.disabled) {
                    this.switchTab(e.target.dataset.tab);
                }
            });
        });

        // Basic settings form
        document.getElementById('calculate-basic').addEventListener('click', () => {
            this.calculateBasicOptimization();
        });

        // Advanced settings form
        document.getElementById('calculate-advanced').addEventListener('click', () => {
            this.calculateAdvancedOptimization();
        });

        document.getElementById('reset-schedule').addEventListener('click', () => {
            this.resetScheduleToDefaults();
        });

        // Results actions
        document.getElementById('try-another').addEventListener('click', () => {
            this.switchTab('basic');
            this.enableResultsTab(false);
        });

        document.getElementById('retry-calculation').addEventListener('click', () => {
            this.retryCalculation();
        });

        // Form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.validateForm();
            });
        });
    }

    validateForm() {
        const homeSize = parseInt(document.getElementById('home-size').value);
        const targetTemp = parseFloat(document.getElementById('target-temp').value);
        
        const isValid = homeSize >= 500 && homeSize <= 10000 && 
                       targetTemp >= 60 && targetTemp <= 85;

        document.getElementById('calculate-basic').disabled = !isValid;
        return isValid;
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `${tabName}-tab` || content.id === `${tabName}-tab-content`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    enableResultsTab(enabled) {
        const resultsTab = document.getElementById('results-tab');
        resultsTab.disabled = !enabled;
        if (enabled) {
            this.switchTab('results');
        }
    }

    getDefaultTemperatures(hour) {
        // 00:00 to 10:00 (0-9): 69-72°F (sleep/early morning)
        if (hour >= 0 && hour < 10) {
            return { high: 72, low: 69 };
        }
        // 10:00 to 18:00 (10-17): 65-78°F (away/work hours - wider range)
        else if (hour >= 10 && hour < 18) {
            return { high: 78, low: 65 };
        }
        // 18:00 to 00:00 (18-23): 69-72°F (evening/home time)
        else {
            return { high: 72, low: 69 };
        }
    }

    setupAdvancedSchedule() {
        const container = document.getElementById('hourly-schedule');
        container.innerHTML = '';
        
        for (let hour = 0; hour < 24; hour++) {
            const hourDiv = document.createElement('div');
            hourDiv.className = 'hour-group';
            
            const hourLabel = document.createElement('div');
            hourLabel.className = 'hour-label';
            hourLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
            
            const tempInputs = document.createElement('div');
            tempInputs.className = 'temp-inputs';
            
            const highGroup = document.createElement('div');
            highGroup.className = 'temp-input-group';
            const highLabel = document.createElement('label');
            highLabel.textContent = 'High';
            const defaults = this.getDefaultTemperatures(hour);
            const highInput = document.createElement('input');
            highInput.type = 'number';
            highInput.min = '60';
            highInput.max = '85';
            highInput.value = defaults.high.toString();
            highInput.id = `high-${hour}`;

            const lowGroup = document.createElement('div');
            lowGroup.className = 'temp-input-group';
            const lowLabel = document.createElement('label');
            lowLabel.textContent = 'Low';
            const lowInput = document.createElement('input');
            lowInput.type = 'number';
            lowInput.min = '60';
            lowInput.max = '85';
            lowInput.value = defaults.low.toString();
            lowInput.id = `low-${hour}`;
            
            highGroup.appendChild(highLabel);
            highGroup.appendChild(highInput);
            lowGroup.appendChild(lowLabel);
            lowGroup.appendChild(lowInput);
            
            tempInputs.appendChild(highGroup);
            tempInputs.appendChild(lowGroup);
            
            hourDiv.appendChild(hourLabel);
            hourDiv.appendChild(tempInputs);
            container.appendChild(hourDiv);
        }
    }

    resetScheduleToDefaults() {
        for (let hour = 0; hour < 24; hour++) {
            const highInput = document.getElementById(`high-${hour}`);
            const lowInput = document.getElementById(`low-${hour}`);

            if (highInput && lowInput) {
                const defaults = this.getDefaultTemperatures(hour);
                highInput.value = defaults.high.toString();
                lowInput.value = defaults.low.toString();
            }
        }
    }

    loadSampleData() {
        // Pre-fill with realistic sample data
        document.getElementById('home-size').value = '2000';
        document.getElementById('target-temp').value = '72';
        document.getElementById('location').value = '1';
        document.getElementById('time-away').value = '08:00';
        document.getElementById('time-home').value = '17:00';
        document.querySelector('input[name="savings-level"][value="2"]').checked = true;
    }

    async calculateBasicOptimization() {
        if (!this.validateForm() || this.isCalculating) return;

        const data = this.collectBasicSettings();
        await this.performOptimization(data);
    }

    async calculateAdvancedOptimization() {
        if (this.isCalculating) return;

        const data = this.collectAdvancedSettings();
        await this.performOptimization(data);
    }

    collectBasicSettings() {
        const homeSize = parseInt(document.getElementById('home-size').value);
        const targetTemp = parseFloat(document.getElementById('target-temp').value);
        const location = parseInt(document.getElementById('location').value);
        const timeAway = document.getElementById('time-away').value;
        const timeHome = document.getElementById('time-home').value;
        const savingsLevel = parseInt(document.querySelector('input[name="savings-level"]:checked').value);

        // Generate basic temperature schedule (like HA integration does)
        const temperatureSchedule = this.generateBasicTemperatureSchedule(targetTemp, timeAway, timeHome, savingsLevel);

        return {
            homeSize,
            homeTemperature: targetTemp,
            location,
            timeAway,
            timeHome,
            savingsLevel,
            temperatureSchedule,
            heatUpRate: 0.5535,  // Default thermal rates
            coolDownRate: 1.9335
        };
    }

    generateBasicTemperatureSchedule(baseTemp, timeAway, timeHome, savingsLevel) {
        // Convert times to 30-minute intervals (0-47)
        const awayInterval = this.timeToInterval(timeAway);
        const homeInterval = this.timeToInterval(timeHome);
        
        // Calculate temperature offsets based on savings level
        const savingsOffset = this.calculateSavingsOffset(savingsLevel);
        const deadbandOffset = 1.4; // Same as HA integration DEADBAND_OFFSET
        
        const highTemperatures = [];
        const lowTemperatures = [];
        
        for (let interval = 0; interval < 48; interval++) {
            if (awayInterval <= interval && interval <= homeInterval) {
                // Away period - allow more temperature variation for savings
                highTemperatures.push(baseTemp + savingsOffset + deadbandOffset);
                lowTemperatures.push(baseTemp - savingsOffset - deadbandOffset);
            } else {
                // Home period - tighter comfort range
                highTemperatures.push(baseTemp + deadbandOffset);
                lowTemperatures.push(baseTemp - deadbandOffset);
            }
        }
        
        return {
            highTemperatures,
            lowTemperatures,
            intervalMinutes: 30,
            totalIntervals: 48
        };
    }

    timeToInterval(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 2) + (minutes >= 30 ? 1 : 0);
    }

    calculateSavingsOffset(savingsLevel) {
        // Same logic as HA integration
        switch (savingsLevel) {
            case 1: return 2;   // Conservative
            case 2: return 6;   // Balanced  
            case 3: return 12;  // Aggressive
            default: return 6;
        }
    }

    collectAdvancedSettings() {
        const basicData = this.collectBasicSettings();
        
        // Build detailed temperature arrays (convert hourly to 30-min intervals)
        const highTemperatures = [];
        const lowTemperatures = [];

        for (let hour = 0; hour < 24; hour++) {
            const highInput = document.getElementById(`high-${hour}`);
            const lowInput = document.getElementById(`low-${hour}`);
            
            const highTemp = parseFloat(highInput?.value || 75);
            const lowTemp = parseFloat(lowInput?.value || 69);
            
            // Add twice for 30-minute intervals (2 intervals per hour)
            highTemperatures.push(highTemp, highTemp);
            lowTemperatures.push(lowTemp, lowTemp);
        }

        return {
            ...basicData,
            temperatureSchedule: {
                highTemperatures,
                lowTemperatures,
                intervalMinutes: 30,
                totalIntervals: 48
            }
        };
    }

    async performOptimization(data) {
        this.isCalculating = true;
        this.showLoading();
        this.enableResultsTab(true);

        try {
            console.log('Sending optimization request:', data);
            
            const response = await fetch(`${this.backendUrl}/generate_schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Received optimization result:', result);
            
            this.displayResults(result);
        } catch (error) {
            console.error('Optimization failed:', error);
            this.showError('Unable to connect to optimization service. Please try again later.');
        } finally {
            this.isCalculating = false;
        }
    }

    showLoading() {
        document.getElementById('loading-indicator').style.display = 'block';
        document.getElementById('results-content').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('results-content').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
        document.getElementById('error-message').textContent = message;
    }

    displayResults(result) {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('results-content').style.display = 'block';

        // Update savings summary
        const costSavings = result.costSavings || 0;
        const percentSavings = result.percentSavings || 0;
        const co2Avoided = result.co2Avoided || 0;

        // Display savings as returned by backend (already calculated for appropriate period)
        document.getElementById('cost-savings').textContent = `$${costSavings.toLocaleString()}`;
        document.getElementById('percent-savings').textContent = `${percentSavings}%`;
        document.getElementById('co2-savings').textContent = `${co2Avoided.toFixed(2)}`;

        // Create temperature chart
        this.createTemperatureChart(result);
    }

    createTemperatureChart(result) {
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const hourlyTemp = result.HourlyTemperature || [];
        if (hourlyTemp.length < 3) {
            console.error('Invalid chart data:', result);
            return;
        }

        const intervals = hourlyTemp[0] || [];
        const highBounds = hourlyTemp[1] || [];
        const lowBounds = hourlyTemp[2] || [];
        // Generate sample price data since backend doesn't return it
        const prices = this.generateSamplePrices(intervals.length);
        const optimizedTemps = result.bestTempActual || [];

        // Create standard 24-hour time labels (every 30 minutes)
        const timeLabels = [];
        for (let hour = 0; hour < 24; hour++) {
            timeLabels.push(`${hour.toString().padStart(2, '0')}:00`);
            timeLabels.push(`${hour.toString().padStart(2, '0')}:30`);
        }

        // Ensure we have exactly 48 data points for 24 hours
        const dataLength = 48;

        const config = {
            type: 'line',
            data: {
                labels: [...timeLabels.filter((_, i) => i % 4 === 0), '00:00'], // Show every 2 hours + final 00:00
                datasets: [
                    {
                        label: 'Optimized Temperature',
                        data: [...optimizedTemps.slice(0, dataLength).filter((_, i) => i % 4 === 0), optimizedTemps[0]],
                        borderColor: '#667eea',
                        backgroundColor: '#667eea',
                        borderWidth: 3,
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'High Limit',
                        data: [...highBounds.slice(0, dataLength).filter((_, i) => i % 4 === 0), highBounds[0]],
                        borderColor: '#ff6b6b',
                        backgroundColor: '#ff6b6b',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Low Limit',
                        data: [...lowBounds.slice(0, dataLength).filter((_, i) => i % 4 === 0), lowBounds[0]],
                        borderColor: '#4ecdc4',
                        backgroundColor: '#4ecdc4',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Electricity Price',
                        data: [...prices.slice(0, dataLength).filter((_, i) => i % 4 === 0), prices[0]],
                        borderColor: '#feca57',
                        backgroundColor: 'rgba(254, 202, 87, 0.3)',
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time of Day (24-Hour)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Price ($/kWh)'
                        },
                        min: 0,
                        max: 1.0,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label === 'Electricity Price') {
                                    return context.dataset.label + ': $' + context.parsed.y.toFixed(3) + '/kWh';
                                }
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '°F';
                            }
                        }
                    }
                }
            }
        };

        const canvas = document.getElementById('temperature-chart');
        this.chart = new Chart(canvas, config);
    }

    generateSamplePrices(length) {
        // Get the current location from form or use default
        const locationSelect = document.getElementById('location');
        const location = locationSelect ? parseInt(locationSelect.value) : 1;

        return this.getLocationPrices(location);
    }

    getLocationPrices(location) {
        // Real retail prices by location (cents per kWh converted to dollars per kWh)
        const priceData = {
            1: [24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7, 24.7,
                36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8,
                36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8, 59.7, 59.7, 59.7, 59.7,
                59.7, 59.7, 59.7, 59.7, 59.7, 59.7, 36.8, 36.8, 36.8, 36.8, 36.8, 36.8],

            2: [31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6,
                31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6,
                31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6, 60.3, 60.3, 60.3, 60.3,
                60.3, 60.3, 60.3, 60.3, 60.3, 60.3, 31.6, 31.6, 31.6, 31.6, 31.6, 31.6],

            3: [27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9, 27.9,
                39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3,
                39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3, 47.6, 47.6, 47.6, 47.6,
                47.6, 47.6, 47.6, 47.6, 47.6, 47.6, 39.3, 39.3, 39.3, 39.3, 39.3, 39.3],

            4: [31.72222222, 31.72222222, 31.72222222, 31.72222222, 31.72222222, 31.72222222,
                31.72222222, 31.72222222, 31.72222222, 31.72222222, 31.72222222, 31.72222222,
                35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222,
                35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222,
                35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222,
                35.32222222, 35.32222222, 62.32222222, 62.32222222, 62.32222222, 62.32222222,
                62.32222222, 62.32222222, 62.32222222, 62.32222222, 62.32222222, 62.32222222,
                35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222, 35.32222222],

            5: [40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4,
                40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4,
                40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4,
                40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4],

            6: [8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778,
                8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778,
                12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778,
                12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778,
                12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778, 12.09077778,
                24.25577778, 24.25577778, 24.25577778, 24.25577778, 24.25577778, 24.25577778,
                24.25577778, 24.25577778, 24.25577778, 24.25577778, 8.384777778, 8.384777778,
                8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778, 8.384777778],

            7: [9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333,
                9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333,
                9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333,
                9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333,
                9.375933333, 9.375933333, 26.10743333, 26.10743333, 26.10743333, 26.10743333,
                26.10743333, 26.10743333, 26.10743333, 26.10743333, 26.10743333, 26.10743333,
                26.10743333, 26.10743333, 9.375933333, 9.375933333, 9.375933333, 9.375933333,
                9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333, 9.375933333]
        };

        // Get price data for location, convert cents to dollars
        const centsPerKwh = priceData[location] || priceData[1]; // Default to location 1
        return centsPerKwh.map(cents => parseFloat((cents / 100).toFixed(4))); // Convert cents to dollars
    }

    retryCalculation() {
        if (this.currentTab === 'basic') {
            this.calculateBasicOptimization();
        } else {
            this.calculateAdvancedOptimization();
        }
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CurveControlDemo();
});

// Add some demo enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add input formatting
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            // Remove any non-numeric characters except decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
    });

    // Add demo tips
    const demoTips = [
        "💡 Tip: Higher optimization levels save more money but allow larger temperature swings.",
        "🏠 Tip: Larger homes typically see greater absolute savings but similar percentage savings.",
        "⏰ Tip: Longer away periods allow more aggressive optimization for greater savings.",
        "🌡️ Tip: The system maintains comfort while shifting energy use to cheaper time periods."
    ];

    let tipIndex = 0;
    const showTip = () => {
        // You could add a tip display element here
        console.log(demoTips[tipIndex]);
        tipIndex = (tipIndex + 1) % demoTips.length;
    };

    // Show tips every 30 seconds
    setInterval(showTip, 30000);
});