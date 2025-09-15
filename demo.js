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
            const highInput = document.createElement('input');
            highInput.type = 'number';
            highInput.min = '60';
            highInput.max = '85';
            highInput.value = '75';
            highInput.id = `high-${hour}`;
            
            const lowGroup = document.createElement('div');
            lowGroup.className = 'temp-input-group';
            const lowLabel = document.createElement('label');
            lowLabel.textContent = 'Low';
            const lowInput = document.createElement('input');
            lowInput.type = 'number';
            lowInput.min = '60';
            lowInput.max = '85';
            lowInput.value = '69';
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
                highInput.value = '75';
                lowInput.value = '69';
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

        return {
            homeSize,
            homeTemperature: targetTemp,
            location,
            timeAway,
            timeHome,
            savingsLevel,
            heatUpRate: 0.5535,  // Default thermal rates
            coolDownRate: 1.9335
        };
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

        // Annualize the savings (assuming daily savings)
        const annualSavings = Math.round(costSavings * 365);
        
        document.getElementById('cost-savings').textContent = `$${annualSavings.toLocaleString()}`;
        document.getElementById('percent-savings').textContent = `${percentSavings}%`;
        document.getElementById('co2-savings').textContent = `${(co2Avoided * 365).toFixed(1)}`;

        // Create temperature chart
        this.createTemperatureChart(result);
    }

    createTemperatureChart(result) {
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const hourlyTemp = result.HourlyTemperature || [];
        if (hourlyTemp.length < 4) {
            console.error('Invalid chart data:', result);
            return;
        }

        const intervals = hourlyTemp[0] || [];
        const highBounds = hourlyTemp[1] || [];
        const lowBounds = hourlyTemp[2] || [];
        const prices = hourlyTemp[3] || [];
        const optimizedTemps = result.bestTempActual || [];

        // Convert intervals to time labels
        const timeLabels = intervals.map((_, index) => {
            const hour = Math.floor(index / 2);
            const minute = (index % 2) * 30;
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        });

        const options = {
            series: [
                {
                    name: 'Optimized Temperature',
                    type: 'line',
                    data: optimizedTemps,
                    color: '#667eea'
                },
                {
                    name: 'High Limit',
                    type: 'line',
                    data: highBounds,
                    color: '#ff6b6b'
                },
                {
                    name: 'Low Limit',
                    type: 'line',
                    data: lowBounds,
                    color: '#4ecdc4'
                },
                {
                    name: 'Electricity Price',
                    type: 'area',
                    yAxisIndex: 1,
                    data: prices,
                    color: '#feca57'
                }
            ],
            chart: {
                height: 400,
                type: 'line',
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: [3, 2, 2, 2],
                dashArray: [0, 5, 5, 0]
            },
            fill: {
                opacity: [1, 0.8, 0.8, 0.3]
            },
            xaxis: {
                categories: timeLabels,
                title: {
                    text: 'Time of Day'
                },
                labels: {
                    rotate: -45,
                    formatter: function(value, timestamp, opts) {
                        // Show only every 4th label to avoid crowding
                        return opts.dataPointIndex % 4 === 0 ? value : '';
                    }
                }
            },
            yaxis: [
                {
                    title: {
                        text: 'Temperature (°F)'
                    },
                    min: function(min) {
                        return Math.floor(min - 2);
                    },
                    max: function(max) {
                        return Math.ceil(max + 2);
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Electricity Price ($/kWh)'
                    },
                    min: 0
                }
            ],
            legend: {
                position: 'bottom',
                offsetY: 10
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function(value, { seriesIndex }) {
                        if (seriesIndex === 3) {
                            return '$' + value.toFixed(3) + '/kWh';
                        }
                        return value.toFixed(1) + '°F';
                    }
                }
            },
            grid: {
                borderColor: '#e9ecef',
                strokeDashArray: 4
            }
        };

        this.chart = new ApexCharts(document.querySelector("#temperature-chart"), options);
        this.chart.render();
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