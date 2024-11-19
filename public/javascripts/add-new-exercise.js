document.getElementById('exercisesBtn').addEventListener('click', function () {
    const selectCourse = document.getElementById('selectCourse').value;
    const googleFormLink = document.getElementById('googleFormLink').value.trim();

    console.log("javascrt ", googleFormLink, " ", selectCourse);

    if (googleFormLink === "") {
        const dangerAlert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error!</strong> Please enter the Google Form link.
                <button type="button" class="close btn" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
            `;
        document.getElementById('alert-container').innerHTML = dangerAlert;
        $(".alert").alert();

        return;
    }

    fetch('/home/course/exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectCourse, googleFormLink })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            if (data.status === "success") {
              window.location.reload();
              showflashmessage(data.status, "Added exercise link successfully");
            }
            else { showflashmessage("warning", "Error while Adding!"); }
          })
          .catch(function (error) {
            console.error("Error:", error);
          });
});

function saveExercise(courseId, index) {
    const value = document.getElementById(`exercise_${courseId}_${index}`).value;
    // Xác định nếu là thao tác lưu hoặc xóa dựa trên giá trị của input
    const action = value ? 'save' : 'delete';
    console.log("index1: ", index)
    fetch('/home/course/exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        exerciseIndex: index,
        googleFormLink: value,
        action
      })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
          window.location.reload();
          showflashmessage(data.status, "Updated exercise link successfully");
        }
        else { showflashmessage("warning", "Error while updating!"); }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
}
  
  function deleteExercise(courseId, index) {
    fetch('/home/course/exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        exerciseIndex: index,
        action: 'delete'
      })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
          window.location.reload();
          showflashmessage(data.status, "Remove exercise link successfully");
        }
        else { showflashmessage("warning", "Error while removing!"); }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  }