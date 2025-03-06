
async function checkHeaders() {
    const url = document.getElementById('url').value;
    const reportContainer = document.getElementById('report');
    const presentScoreElement = document.getElementById('presentScore');
    const missingScoreElement = document.getElementById('missingScore');
    const gradeBox = document.getElementById('gradeBox');
    const scoreSection = document.getElementById('scoreSection');

    const mainHeaders = [
        "X-Frame-Options",
        "Strict-Transport-Security",
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "X-XSS-Protection",
        "Cache-Control"
    ];

    // Clear previous results
    reportContainer.innerHTML = '';
    presentScoreElement.textContent = "0%";
    missingScoreElement.textContent = "0%";
    gradeBox.textContent = "Grade: -";

    if (!url) {
        alert('Please enter a valid URL.');
        return;
    }

    try {
        const response = await fetch('/api/headers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            const data = await response.json();
            const headers = data.headers;
            console.log(headers);
            let mainPresentCount = 0;
            let otherPresentCount = 0;
            let reportHTML = '';

            Object.keys(headers).forEach(header => {
                const status = headers[header];
                const isMainHeader = mainHeaders.includes(header);

                if (status !== "missing") {
                    if (isMainHeader) mainPresentCount++;
                    else otherPresentCount++;
                }

                const cardClass = status === "missing" ? "missing" : "present";
                reportHTML += `
                    <div class="report-card ${cardClass}">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>${header}</h5>
                            <span>${status.toUpperCase()}</span>
                        </div>
                    </div>
                `;
            });

            reportContainer.innerHTML = reportHTML;

            const totalMainHeaders = mainHeaders.length;
            const totalOtherHeaders = Object.keys(headers).length - totalMainHeaders;

            const mainScore = (mainPresentCount / totalMainHeaders) * 99.5;
            const otherScore = (otherPresentCount / totalOtherHeaders) * 0.5;

            const totalScore = Math.round(mainScore + otherScore);
            const missingScore = 100 - totalScore;

            presentScoreElement.textContent = `${totalScore}%`;
            missingScoreElement.textContent = `${missingScore}%`;

            let grade = "F";
            if (totalScore >= 60) grade = "A";
            else if (totalScore >= 50) grade = "B";
            else if (totalScore >= 40) grade = "C";
            else if (totalScore >= 30) grade = "D";
            else if (totalScore >= 10) grade = "F";
            

            gradeBox.textContent = `Grade: ${grade}`;

            scoreSection.style.display = "block";
        } else {
            alert('Failed to fetch headers. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}



document.querySelectorAll('.box-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    content.classList.toggle('show');
    arrow.classList.toggle('rotate');
  });
});



