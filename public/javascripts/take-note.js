var updateTimeInterval;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('lecture_link', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    const takeNoteButton = document.querySelector('.take_note');

    if (updateTimeInterval) {
        clearInterval(updateTimeInterval);
    }

    updateTimeInterval = setInterval(() => {
        if (player && typeof player.getCurrentTime === 'function') {
            const seconds = player.getCurrentTime();
            const formattedTime = new Date(seconds * 1000).toISOString().substr(11, 8);
            document.getElementById('noteTime').textContent = `Take note ${formattedTime}`;
        }
    }, 1000);

    takeNoteButton.addEventListener('click', function (event) {
        event.preventDefault();
        player.pauseVideo();
        const currentTime = player.getCurrentTime();
        const formattedTime = new Date(currentTime * 1000).toISOString().substr(11, 8);
        console.log("Time: " + formattedTime);
        showNoteModal(formattedTime);
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        console.log('Video is playing');
    } else if (event.data == YT.PlayerState.PAUSED) {
        console.log('Video is paused');
    } else if (event.data == YT.PlayerState.ENDED) {
        console.log('Video has ended');
        updateLectureProgress();
    }
}

function updateLectureProgress() {
    const lectureID = document.getElementById('lectureId').value;
    const courseId = window.location.pathname.split('/').pop();

    console.log("CHECK COURSE: " + courseId);

    $.ajax({
        url: '/home/update-progress',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lectureID: lectureID,
            courseID: courseId,
            progress: 100 // Mark as complete
        }),
        success: function(response) {
            if (response.success) {
                console.log('Lecture progress updated successfully');
                fetchCourseProgress(courseId);
            } else {
                console.error('Failed to update lecture progress:', response.error);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating lecture progress:', error);
        }
    });
}

function showNoteModal(time) {
    const modalHTML = `
      <div class="modal fade" id="noteModal" tabindex="-1" aria-labelledby="noteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="noteModalLabel">Take note at ${time}</h5>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <textarea id="noteText" class="form-control" placeholder="Enter your note here"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="saveNote('${time}')">Save Note</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    $('#noteModal').modal('show');

    $('#noteModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function saveNote(time) {
    const noteDescription = document.getElementById('noteText').value;
    const lectureID = document.getElementById('lectureId').value;

    console.log(`Note at ${time}: ${noteDescription}`);

    $.ajax({
        url: '/home/take-note',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lectureID,
            noteTimeStamp: time,
            noteDescription
        }),
        success: function (response) {
            console.log('Note saved:', response);
            $('#noteModal').modal('hide');

            if (response.success) {
                // const note = response.note;
                // const newNoteHtml = `
                //     <li onclick="jumpToLecture('${note.lectureID}', '${note.noteTimeStamp}', '${note.lectureDetails.lectureTitle}', '${note.lectureDetails.lectureLink}', '${note.lectureDetails.lectureDescription}')">
                //         <p>${note.noteTimeStamp} - ${note.sectionDetails.sectionTitle} - ${note.lectureDetails.lectureTitle}: ${note.noteDescription}</p>
                //     </li>`;
                // $('.notes-list ul').append(newNoteHtml);

                fetchNotes();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error saving note:', error);
        }
    });
}

function getYouTubeVideoID(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\s*[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function jumpToLecture(lectureID, noteTimeStamp, lectureTitle, lectureLink, lectureDescription) {
    change_lecture(lectureID, lectureTitle, lectureLink, lectureDescription);

    function seekAndPlay() {
        if (player && typeof player.seekTo === 'function' && player.getPlayerState() > 0) {
            const timeInSeconds = hmsToSeconds(noteTimeStamp);
            player.seekTo(timeInSeconds, true);
            player.playVideo();
        } else {
            // Wait for the player to be ready
            setTimeout(seekAndPlay, 500);
        }
    }

    seekAndPlay();
}

function hmsToSeconds(hms) {
    var a = hms.split(':');
    // Convert HH:MM:SS to seconds
    var seconds = (+a[0]) * 3600 + (+a[1]) * 60 + (+a[2]);
    return seconds;
}

async function fetchNotes() {
    try {
        const courseId = window.location.pathname.split('/').pop();
        const response = await fetch(`/home/notes?courseId=${courseId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const notes = await response.json();
        updateNotesList(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

function updateNotesList(notes) {
    const notesList = document.querySelector('.notes-list ul');
    notesList.innerHTML = '';

    if (notes && notes.length > 0) {
        notes.forEach(note => {
            const li = document.createElement('li');
            li.onclick = function () {
                jumpToLecture(note.lectureID, note.noteTimeStamp, note.lectureTitle, note.lectureLink, note.lectureDescription);
            };
            li.innerHTML = `<p>${note.noteTimeStamp} - ${note.sectionTitle} - ${note.lectureTitle}: ${note.noteDescription}</p>`;
            notesList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'There are no notes yet.';
        notesList.appendChild(li);
    }
}

function fetchCourseProgress(courseId) {
    $.ajax({
        url: `/home/course-progress/${courseId}`,
        method: 'GET',
        success: function(data) {
            if (data.success) {
                const progressText = `${data.completedLectureIds.length} of ${data.totalLectures} completed`;
                document.getElementById('courseProgress').innerText = progressText;
                markCompletedLectures(data.completedLectureIds);

                if (data.completedLectureIds.length === data.totalLectures) {
                    document.getElementById('courseProgress').innerText = 'Course completed';
                }
            } else {
                console.error('Failed to fetch course progress:', data.error);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching course progress:', error);
        }
    });
}

function markCompletedLectures(completedLectureIds) {
    completedLectureIds.forEach(lectureId => {
        const lectureElement = document.querySelector(`li[data-lecture-id="${lectureId}"]`);
        if (lectureElement) {
            lectureElement.classList.add('completed');
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchNotes);

document.addEventListener('DOMContentLoaded', () => {
    const courseId = window.location.pathname.split('/').pop();
    fetchCourseProgress(courseId);
});


const comm = document.getElementById('comment-form');

// add rating
if(comm){
    comm.addEventListener('submit', function(e) {
    e.preventDefault();
  
    const comment = document.getElementById('comment').value;
  
    fetch(`/home/addcomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
    })
    .then(response => response.json())
    .then(data => {
        showflashmessage("success", "You have successfully submitted your comment.");
        document.getElementById('comment').value = '';
        setTimeout(() => {
          location.reload();
        }, 500);
    })
    .catch(error => {
        showflashmessage('error', error.message || 'An error occurred while submitting your comment.');
    });
  });
  
}
