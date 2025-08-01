document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const cropTableBody = document.getElementById('cropTableBody');
    const cropChart = document.getElementById('cropChart');
    const exportCsvButton = document.getElementById('exportCsv');

    // Sample data - we will replace this with data from an API
    const sampleData = [
        { crop: 'Maize', region: 'Arusha', price: 50000, volume: 120, date: '2025-07-31' },
        { crop: 'Beans', region: 'Mbeya', price: 80000, volume: 80, date: '2025-07-31' },
        { crop: 'Rice', region: 'Morogoro', price: 120000, volume: 200, date: '2025-07-31' },
        { crop: 'Potatoes', region: 'Iringa', price: 60000, volume: 150, date: '2025-07-31' },
        { crop: 'Cashews', region: 'Mtwara', price: 250000, volume: 50, date: '2025-07-31' },
    ];

    function showLoader() {
        loader.style.display = 'flex';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function populateTable(data) {
        cropTableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crop}</td>
                <td>${item.region}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.volume}</td>
                <td>${item.date}</td>
            `;
            cropTableBody.appendChild(row);
        });
    }

    function createChart(data) {
        const ctx = cropChart.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.crop),
                datasets: [{
                    label: 'Price (TZS)',
                    data: data.map(item => item.price),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuad'
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function populateGallery(data) {
        const imageGallery = document.getElementById('image-gallery');
        imageGallery.innerHTML = '';
        data.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';
            col.innerHTML = `
                <div class="card">
                    <img src="https://source.unsplash.com/1600x900/?${item.crop}" class="card-img-top" alt="${item.crop}">
                    <div class="card-body">
                        <h5 class="card-title">${item.crop}</h5>
                    </div>
                </div>
            `;
            imageGallery.appendChild(col);
        });
    }

    function exportToCsv(data) {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'crop_market_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportCsvButton.addEventListener('click', () => {
        exportToCsv(sampleData);
    });

    // Initial load
    showLoader();
    setTimeout(() => {
        populateTable(sampleData);
        createChart(sampleData);
        populateGallery(sampleData);
        hideLoader();
    }, 1500); // Simulate loading time
});
