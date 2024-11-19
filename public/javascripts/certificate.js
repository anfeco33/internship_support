document.addEventListener('DOMContentLoaded', () => {
    fetchCompletedCourses();

    function fetchCompletedCourses() {
        $.ajax({
            url: '/home/completed-courses',
            method: 'GET',
            success: function(data) {
                if (data.success) {
                    renderCompletedCourses(data.completedCourses);
                } else {
                    console.error('Failed to fetch completed courses:', data.error);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching completed courses:', error);
            }
        });
    }

    function renderCompletedCourses(courses) {
        const container = $('#completed-courses .card-body');
        container.empty();

        if (!courses || courses.length === 0) {
            console.log('You have not completed any course yet.');
            container.append('<p>You have not completed any course yet.</p>');
            return;
        }

        courses.forEach(course => {
            const courseHtml = `
                <div class="col-lg-6 col-md-6 d-flex align-items-stretch">
                    <div class="course-item">
                        <img id="course_pic" src="${course.courseImage}" class="img-fluid" alt="err">
                        <div class="course-content">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <p class="category">${course.courseCategory}</p>
                                <button class="btn btn-primary" onclick="getCertificate('${course._id}')">Get Certificate</button>
                            </div>
                            <h3 class="course-name">${course.courseName}</h3>
                            <p class="description">${course.courseDescription}</p>
                            <div class="trainer d-flex justify-content-between align-items-center">
                                <div class="trainer-profile d-flex align-items-center">
                                    <img src="${course.instructorID.profilePicture}" alt="profileImg" />
                                    <h5 class="trainer-name">${course.instructorID.fullName}</h5>
                                </div>
                                <div class="trainer-rank d-flex align-items-center">
                                    <i class="fa-regular fa-user"></i>&nbsp;50
                                    &nbsp;&nbsp;
                                    <i class="fa-regular fa-heart"></i>&nbsp;65
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            container.append(courseHtml);
        });
    }
});

function getCertificate(courseId) {
    $.ajax({
        url: `/home/certificate/${courseId}`,
        method: 'GET',
        success: function(data) {
            if (data.success) {
                const userName = data.fullname;
                const courseName = data.course.courseName;

                const certificateHtml = `
                    <div class="certificate-container">
                        <div class="certificate">
                            <div class="logo">EduSphere</div>
                            <div class="marquee">Certificate of Completion</div>
                            <div class="assignment">This certificate is presented to</div>
                            <div class="person">${userName}</div>
                            <div class="reason">For successfully completing the course<br/><strong>${courseName}</strong><br/></div>
                        </div>
                    </div>
                `;

                $('#certificateContent').html(certificateHtml);
                $('#certificateModal').modal('show');
                $('.modal-backdrop').remove();
            } else {
                console.error('Failed to fetch course details:', data.error);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching course details:', error);
        }
    });
}

document.getElementById('downloadCertificate').addEventListener('click', function() {
    html2canvas(document.getElementById('certificateContent')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save('certificate.pdf');
    });
});