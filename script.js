document.addEventListener('DOMContentLoaded', function () {
    const cityForm = document.getElementById('city-form');
    const weatherContainer = document.getElementById('weather-container');
    const citySelect = document.getElementById('city');
    
    let latitude; // Declare variable for latitude
    let longitude; // Declare variable for longitude

    // Mapping of weather conditions to icon filenames
    const weatherIcons = {
        'clear': 'clear.png',
        'cloudy': 'cloudy.png',
        'fog': 'fog.png',
        'humid': 'humid.png',
        'ishower': 'ishower.png',
        'lightrain': 'lightrain.png',
        'mcloudy': 'mcloudy.png',
        'oshower': 'oshower.png',
        'pcloudy': 'pcloudy.png',
        'rain': 'rain.png',
        'rainsnow': 'rainsnow.png',
        'snow': 'snow.png',
        'tsrain': 'tsrain.png',
        'tstorm': 'tstorm.png',
        'windy': 'windy.png'
    };

    // Fetch CSV data and populate city options
    fetch('city_coordinates.csv')
        .then(response => response.text())
        .then(csvData => {
            const lines = csvData.split('\n');
            for (let i = 1; i < lines.length; i++) { // Start from 1 to skip header row
                const [lat, lon, cityName, country] = lines[i].split(',');
                const option = document.createElement('option');
                option.value = cityName;
                option.textContent = cityName;
                option.setAttribute('data-coordinates', `${lat},${lon}`);
                citySelect.appendChild(option);
                if (cityName === citySelect.value) {
                    latitude = parseFloat(lat); // Parse latitude as float
                    longitude = parseFloat(lon); // Parse longitude as float
                }
            }
        })
        .catch(error => console.error('Error fetching CSV data:', error));

    // Listen for changes to the selected city
    citySelect.addEventListener('change', function () {
        const selectedCityOption = citySelect.querySelector(`option[value="${citySelect.value}"]`);
        if (selectedCityOption) {
            const [lat, lon] = selectedCityOption.getAttribute('data-coordinates').split(',');
            latitude = parseFloat(lat); // Update latitude
            longitude = parseFloat(lon); // Update longitude

            // Manually trigger the form submission to fetch weather data
            cityForm.dispatchEvent(new Event('submit'));
        }
    });

    // Function to generate an array of date stamps for the next 7 days
    function generateDateStamps() {
        const dateStamps = [];
        const currentDate = new Date();

        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            dateStamps.push(nextDate.toDateString());
        }

        return dateStamps;
    }

    // Handle form submission
    cityForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCity = citySelect.value;

        // Construct API URL using selected city's coordinates
        const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Process and display weather forecast data
                const weatherForecasts = data.dataseries; // Assuming the API response structure

                // Generate date stamps for the next 7 days
                const dateStamps = generateDateStamps();

                // Call a function to display the processed weather data
                displayWeatherForecast(dateStamps, weatherForecasts);
            })
            .catch(error => console.error('Error fetching weather data:', error));
    });

    // Function to display weather forecast data
    function displayWeatherForecast(dateStamps, forecasts) {
        weatherContainer.innerHTML = ''; // Clear previous content

        // Loop through the first 7 forecasts (next 7 days)
        for (let index = 0; index < 7; index++) {
            const forecast = forecasts[index];
            const forecastElement = document.createElement('div');
            forecastElement.classList.add('forecast');

            // Get the icon filename based on the weather condition
            const weatherCondition = forecast.weather.toLowerCase();
            const iconFilename = weatherIcons[weatherCondition];

            // Display the formatted date, temperature, description, and icon
            forecastElement.innerHTML = `
                <p>Date: ${dateStamps[index]}</p>
                <p>Temperature: ${forecast.temp2m}°C</p>
                <p>Description: ${forecast.weather}</p>
                <img class="weather-icon" src="images/${iconFilename}" alt="Weather Icon">
            `;

            weatherContainer.appendChild(forecastElement);
        }
    }
});
