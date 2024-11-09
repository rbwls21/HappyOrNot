/* js/app.js */

// Initialize project data
let projectData = {
    name: '',
    displayText: '',
    date: '',
    description: '',
    customInfo: '',
    responses: [],
};

// Auto-fill date and time on setup page load
function autoFillDateTime() {
    const dateField = document.getElementById('date');
    const now = new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    dateField.value = now;
}

// Save setup data
function saveSetupData() {
    projectData.name = document.getElementById('project-name').value.trim();
    projectData.displayText = document.getElementById('display-text').value.trim();
    projectData.date = document.getElementById('date').value;
    projectData.description = document.getElementById('description').value.trim();
    projectData.customInfo = document.getElementById('custom-info').value.trim();

    // Validate required fields
    if (!projectData.name || !projectData.displayText || !projectData.date) {
        alert('Please fill in all required fields.');
        return;
    }

    localStorage.setItem('projectData', JSON.stringify(projectData));
    window.location.href = 'voting.html';
}

// Load voting page data
function loadVotingPage() {
    const storedData = localStorage.getItem('projectData');
    if (storedData) {
        projectData = JSON.parse(storedData);
        document.getElementById('display-text').innerText = projectData.displayText;
    } else {
        alert('No project data found. Please set up the project first.');
        window.location.href = 'setup.html';
    }
}

// Handle emoji click and show inline thank-you message
function handleEmojiClick(value) {
    projectData.responses.push(value);
    localStorage.setItem('projectData', JSON.stringify(projectData));

    const thankYouMessage = document.getElementById('thank-you-message');
    thankYouMessage.style.display = 'block';

    setTimeout(() => {
        thankYouMessage.style.display = 'none';
    }, 2000); // Show for 2 seconds
}

// Finish voting and go to summary page
function finishVoting() {
    window.location.href = 'summary.html';
}

// Load summary page data and display all setup information
function loadSummaryPage() {
    const storedData = localStorage.getItem('projectData');
    if (storedData) {
        projectData = JSON.parse(storedData);

        // Display project information
        document.getElementById('summary-project-name').innerText = projectData.name;
        document.getElementById('summary-display-text').innerText = projectData.displayText;
        document.getElementById('summary-date').innerText = new Date(projectData.date).toLocaleString();
        document.getElementById('summary-description').innerText = projectData.description || 'N/A';
        document.getElementById('summary-custom-info').innerText = projectData.customInfo || 'N/A';

        // Calculate metrics
        const totalResponses = projectData.responses.length;
        const averageScore = totalResponses > 0 ? (projectData.responses.reduce((a, b) => a + b, 0) / totalResponses).toFixed(2) : 0;
        const positiveResponses = projectData.responses.filter(r => r > 3).length;
        const negativeResponses = projectData.responses.filter(r => r < 3).length;
        const positivePercentage = totalResponses > 0 ? ((positiveResponses / totalResponses) * 100).toFixed(2) : 0;
        const negativePercentage = totalResponses > 0 ? ((negativeResponses / totalResponses) * 100).toFixed(2) : 0;

        // Update metrics on page
        document.getElementById('total-responses').innerText = totalResponses;
        document.getElementById('average-score').innerText = averageScore;
        document.getElementById('positive-percentage').innerText = positivePercentage + '%';
        document.getElementById('negative-percentage').innerText = negativePercentage + '%';

        generatePieChart();
    } else {
        alert('No project data found. Please set up the project first.');
        window.location.href = 'setup.html';
    }
}

// Generate pie chart using Chart.js
function generatePieChart() {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    const data = [0, 0, 0, 0, 0];

    projectData.responses.forEach(response => {
        data[response - 1]++;
    });

    if (window.pieChart) {
        window.pieChart.destroy();
    }

    window.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Very Mad', 'Mad', 'Neutral', 'Happy', 'Very Happy'],
            datasets: [{
                data: data,
                backgroundColor: [
                    '#cd0403',
                    '#e57373',
                    '#e5e3e3',
                    '#81c784',
                    '#4caf50'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Download summary as PDF including all information
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(projectData.name, 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.text('Date & Time: ' + new Date(projectData.date).toLocaleString(), 20, 40);
    doc.text('Display Text: ' + projectData.displayText, 20, 50);
    doc.text('Description: ' + (projectData.description || 'N/A'), 20, 60);
    doc.text('Custom Info: ' + (projectData.customInfo || 'N/A'), 20, 70);

    doc.text('Total Responses: ' + document.getElementById('total-responses').innerText, 20, 90);
    doc.text('Average Satisfaction Score: ' + document.getElementById('average-score').innerText, 20, 100);
    doc.text('Positive Response Percentage: ' + document.getElementById('positive-percentage').innerText, 20, 110);
    doc.text('Negative Response Percentage: ' + document.getElementById('negative-percentage').innerText, 20, 120);

    // Add pie chart image
    const chartCanvas = document.getElementById('pie-chart');
    const chartImage = chartCanvas.toDataURL('image/png', 1.0);
    doc.addImage(chartImage, 'PNG', 15, 130, 180, 100);

    doc.save('summary.pdf');
}

// Navigation functions
function goHome() {
    window.location.href = 'setup.html';
}

function goBack() {
    window.history.back();
}