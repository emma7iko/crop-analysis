document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loader = document.getElementById('loader');
    const cropTableBody = document.getElementById('cropTableBody');
    const cropChart = document.getElementById('cropChart');
    const exportCsvButton = document.getElementById('exportCsv');
    const printTableButton = document.getElementById('printTable');
    const searchInput = document.getElementById('searchInput');
    const dataCount = document.getElementById('dataCount');
    const lastUpdated = document.getElementById('lastUpdated');
    const backToTopButton = document.getElementById('backToTop');
    const periodButtons = document.querySelectorAll('[data-period]');
    const sortableHeaders = document.querySelectorAll('.sortable');

    // Sample data - in a real app, this would come from an API
    let sampleData = [
        { id: 1, crop: 'Maize', region: 'Arusha', price: 50000, volume: 120, date: '2025-07-31', category: 'Cereals' },
        { id: 2, crop: 'Beans', region: 'Mbeya', price: 80000, volume: 80, date: '2025-07-31', category: 'Legumes' },
        { id: 3, crop: 'Rice', region: 'Morogoro', price: 120000, volume: 200, date: '2025-07-30', category: 'Cereals' },
        { id: 4, crop: 'Potatoes', region: 'Iringa', price: 60000, volume: 150, date: '2025-07-30', category: 'Tubers' },
        { id: 5, crop: 'Cashews', region: 'Mtwara', price: 250000, volume: 50, date: '2025-07-29', category: 'Nuts' },
        { id: 6, crop: 'Coffee', region: 'Kilimanjaro', price: 300000, volume: 40, date: '2025-07-29', category: 'Beverages' },
        { id: 7, crop: 'Cotton', region: 'Shinyanga', price: 180000, volume: 70, date: '2025-07-28', category: 'Fiber' },
        { id: 8, crop: 'Sunflower', region: 'Singida', price: 90000, volume: 90, date: '2025-07-28', category: 'Oilseeds' },
    ];

    // State
    let currentData = [...sampleData];
    let sortConfig = { key: 'crop', direction: 'asc' };
    let currentChart = null;

    // Initialize the application
    function init() {
        showLoader();
        setupEventListeners();
        updateLastUpdated();
        renderData();
        hideLoader();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Export button
        exportCsvButton.addEventListener('click', () => exportToCsv(currentData));
        
        // Print button
        printTableButton.addEventListener('click', handlePrint);
        
        // Search input
        searchInput.addEventListener('input', handleSearch);
        
        // Period buttons for chart
        periodButtons.forEach(button => {
            button.addEventListener('click', () => handlePeriodChange(button.dataset.period));
        });
        
        // Sortable headers
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => handleSort(header.dataset.sort));
        });
        
        // Back to top button
        window.addEventListener('scroll', toggleBackToTop);
        backToTopButton.addEventListener('click', scrollToTop);
    }

    // Update last updated timestamp
    function updateLastUpdated() {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Render all data visualizations
    function renderData() {
        populateTable(currentData);
        createChart(currentData);
        populateGallery(currentData);
        updateDataCount(currentData.length);
    }

    // Populate the data table
    function populateTable(data) {
        cropTableBody.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center py-4">No matching records found</td>';
            cropTableBody.appendChild(row);
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crop}</td>
                <td>${item.region}</td>
                <td class="text-end">${formatCurrency(item.price)}</td>
                <td class="text-end">${item.volume.toLocaleString()}</td>
                <td class="text-end">${formatDate(item.date)}</td>
            `;
            cropTableBody.appendChild(row);
        });
    }

    // Create or update the chart
    function createChart(data) {
        const ctx = cropChart.getContext('2d');
        
        // Destroy previous chart instance if it exists
        if (currentChart) {
            currentChart.destroy();
        }
        
        // Group data by crop and calculate average price
        const cropData = {};
        data.forEach(item => {
            if (!cropData[item.crop]) {
                cropData[item.crop] = { total: 0, count: 0 };
            }
            cropData[item.crop].total += item.price;
            cropData[item.crop].count += 1;
        });
        
        // Sort crops by average price (highest first)
        const sortedCrops = Object.entries(cropData)
            .map(([crop, data]) => ({
                crop,
                averagePrice: Math.round(data.total / data.count)
            }))
            .sort((a, b) => b.averagePrice - a.averagePrice);
        
        const labels = sortedCrops.map(item => item.crop);
        const prices = sortedCrops.map(item => item.averagePrice);
        
        // Generate gradient colors for the chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(44, 122, 123, 0.8)');
        gradient.addColorStop(1, 'rgba(56, 178, 172, 0.8)');
        
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Price (TZS)',
                    data: prices,
                    backgroundColor: gradient,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    barThickness: 'flex',
                    maxBarThickness: 50,
                    categoryPercentage: 0.8,
                    barPercentage: 0.9,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 20,
                        right: 20,
                        bottom: 10,
                        left: 10
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart',
                    y: {
                        type: 'number',
                        easing: 'easeOutQuart',
                        from: (ctx) => {
                            if (ctx.type === 'data') {
                                return ctx.chart.scales.y.getPixelForValue(0);
                            }
                            return 0;
                        },
                        to: (ctx) => {
                            if (ctx.type === 'data') {
                                return ctx.chart.getDatasetMeta(0).data[ctx.dataIndex].y;
                            }
                            return 0;
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `Average Price: ${formatCurrency(context.raw)}`;
                            },
                            labelTextColor: function(context) {
                                return '#e5e7eb';
                            }
                        },
                        titleFont: {
                            size: 16,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 14
                        },
                        boxPadding: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false,
                            drawTicks: false,
                            borderDash: [5, 5]
                        },
                        ticks: {
                            padding: 10,
                            color: '#6b7280',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'TZS ' + (value / 1000000).toFixed(1) + 'M';
                                }
                                if (value >= 1000) {
                                    return 'TZS ' + (value / 1000).toFixed(0) + 'K';
                                }
                                return 'TZS ' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#4b5563',
                            font: {
                                size: 12,
                                weight: '500',
                                family: "'Inter', sans-serif"
                            },
                            maxRotation: 45,
                            minRotation: 45,
                            padding: 10
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                }
            }
        });
    }

    // Populate the image gallery
    function populateGallery(data) {
        const imageGallery = document.getElementById('image-gallery');
        imageGallery.innerHTML = '';
        
        // Get unique crops
        const uniqueCrops = [...new Set(data.map(item => item.crop))];
        
        uniqueCrops.slice(0, 6).forEach(crop => {
            const item = data.find(d => d.crop === crop);
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4';
            col.innerHTML = `
                <div class="card border-0 rounded-0 h-100">
                    <div class="position-relative overflow-hidden" style="height: 150px;">
                        <img src="https://source.unsplash.com/400x300/?${crop},agriculture" 
                             class="img-fluid w-100 h-100" 
                             style="object-fit: cover;" 
                             alt="${crop}" 
                             loading="lazy">
                        <div class="position-absolute bottom-0 start-0 w-100 p-2" 
                             style="background: linear-gradient(transparent, rgba(0,0,0,0.7));">
                            <h5 class="text-white mb-0">${crop}</h5>
                            <small class="text-white-50">${item.region}</small>
                        </div>
                    </div>
                </div>
            `;
            imageGallery.appendChild(col);
        });
    }

    // Handle search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm.trim()) {
            currentData = [...sampleData];
        } else {
            currentData = sampleData.filter(item => 
                item.crop.toLowerCase().includes(searchTerm) ||
                item.region.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }
        
        renderData();
    }

    // Handle sorting
    function handleSort(key) {
        // Toggle sort direction if same key is clicked
        if (sortConfig.key === key) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig = { key, direction: 'asc' };
        }
        
        // Update sort indicators
        sortableHeaders.forEach(header => {
            const icon = header.querySelector('i');
            if (header.dataset.sort === key) {
                icon.className = sortConfig.direction === 'asc' ? 
                    'fas fa-sort-up ms-1' : 'fas fa-sort-down ms-1';
            } else {
                icon.className = 'fas fa-sort ms-1';
            }
        });
        
        // Sort the data
        currentData.sort((a, b) => {
            let valueA = a[sortConfig.key];
            let valueB = b[sortConfig.key];
            
            // Handle different data types
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            if (valueA < valueB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        renderData();
    }

    // Handle period change for chart
    function handlePeriodChange(period) {
        // Update active button
        periodButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        // In a real app, we would fetch data for the selected period
        // For now, we'll just regenerate the chart with the current data
        createChart(currentData);
    }

    // Export to CSV
    function exportToCsv(data) {
        // Prepare data for export
        const exportData = data.map(item => ({
            'Crop': item.crop,
            'Region': item.region,
            'Price (TZS)': item.price,
            'Volume (Tonnes)': item.volume,
            'Date': formatDate(item.date, 'yyyy-MM-dd'),
            'Category': item.category
        }));
        
        const csv = Papa.unparse(exportData);
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `crop_market_data_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showToast('Data exported successfully!', 'success');
    }

    // Handle print functionality
    function handlePrint() {
        window.print();
    }

    // Toggle back to top button
    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    }

    // Scroll to top
    function scrollToTop(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Update data count display
    function updateDataCount(count) {
        dataCount.textContent = `Showing ${count} ${count === 1 ? 'entry' : 'entries'}`;
    }

    // Helper function to format currency
    function formatCurrency(amount, decimals = 0) {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount).replace('TZS', 'TZS ');
    }

    // Helper function to format date
    function formatDate(dateString, format = 'MMM d, yyyy') {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Helper function to generate colors for the chart
    function generateColors(count, alpha = 1) {
        const colors = [
            'rgba(44, 122, 123, ALPHA)',  // Primary color
            'rgba(56, 161, 105, ALPHA)',  // Success color
            'rgba(214, 158, 46, ALPHA)',  // Warning color
            'rgba(56, 178, 172, ALPHA)',  // Teal
            'rgba(237, 137, 54, ALPHA)',  // Orange
            'rgba(159, 122, 234, ALPHA)', // Purple
            'rgba(225, 29, 72, ALPHA)',   // Pink
            'rgba(6, 182, 212, ALPHA)'    // Cyan
        ];
        
        // If we have more data points than colors, cycle through the colors
        return Array.from({ length: count }, (_, i) => 
            colors[i % colors.length].replace('ALPHA', alpha)
        );
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // In a real app, you might use a toast library or create a custom toast element
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    // Show loader
    function showLoader() {
        if (loader) loader.style.display = 'flex';
    }

    // Hide loader
    function hideLoader() {
        if (loader) loader.style.display = 'none';
    }

    // Initialize the application
    init();
});
