window.onload = function() {
    let data = [];
    const labels = [];
    const dataForDataSets = [];

    $.ajax({
        async: false,
        type: "GET",
        data: data,
        contentType: "application/json",
        url: "http://localhost:8080/api/order/report",
        success: function(data) {
            for (let i = 0; i < data.length; i++) {
                labels.push(data[i][0] + "/" + data[i][1]);
                dataForDataSets.push(data[i][2] / 1000000);
            }
        },
        error: function(e) {
            alert("Error: ", e);
            console.log("Error", e);
        }
    });

    const ctx = document.getElementById('myChart').getContext('2d');

    const chartData = {
        labels: labels,
        datasets: [{
            label: "Total value",
            backgroundColor: "#0000ff",
            borderColor: "#0000ff",
            borderWidth: 2,
            hoverBackgroundColor: "#0043ff",
            hoverBorderColor: "#0043ff",
            data: dataForDataSets,
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                stacked: true,
                grid: {
                    display: true,
                    color: "rgba(255,99,132,0.2)"
                }
            },
            x: {
                barPercentage: 0.5,
                grid: {
                    display: false
                }
            }
        },
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20
                    }
                }
            }
        }
    };

    const myBarChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}
