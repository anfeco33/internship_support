document.getElementById('updateBusinessBtn').addEventListener('click', function () {
    // Nếu companyId tồn tại thì PUT, không POST
    const companyId = window.companyId; // từ backend truyền
    const method = companyId ? 'PUT' : 'POST';
    const url = companyId ? `/home/business-edit/edit/${companyId}` : '/home/business/update';

    handleBusinessProfile(url, method);
});

function handleBusinessProfile(url, method) {
    const name = document.getElementById('inputBusinessName').value.trim();
    const industry = document.getElementById('inputIndustry').value.trim();
    const size = document.getElementById('inputSize').value;
    const address = document.getElementById('inputAddress').value.trim();
    const website = document.getElementById('inputWebsite').value.trim();
    
    const locationId = method === 'PUT' ? 'inputLocation' : 'inputLocation_post';
    const locationElement = document.getElementById(locationId);
    const location = locationElement ? locationElement.value.trim() : '';

    const profile = document.getElementById('inputProfile').value.trim();
    const contactEmail = document.getElementById('inputContactEmail').value.trim();
    const phoneNumber = document.getElementById('inputPhoneNumber').value.trim();

    // Lấy giá trị video trực tiếp từ trường input
    const promotionVideo = document.getElementById('inputPromotionVideo').value.trim();

    if (!name || !industry || !address || !website || !contactEmail || !phoneNumber) {
        showflashmessage('warning', 'Please fill in all required fields!');
        return;
    }

    console.log('locationn: ', location);

    const businessProfile = {
        name,
        industry,
        size,
        address,
        website,
        location,
        profile,
        contactEmail,
        phoneNumber,
        promotionVideo,
    };

    const formData = new FormData();
    formData.append('businessProfile', JSON.stringify(businessProfile));

    // Thêm hình ảnh vào FormData
    const imageFiles = document.getElementById('inputImages').files;
    for (const file of imageFiles) {
        formData.append('images', file);
    }

    // Thêm tài liệu vào FormData
    const documentFiles = document.getElementById('inputDocuments').files;
    for (const file of documentFiles) {
        formData.append('documents', file);
    }

    fetch(url, {
        method,
        body: formData,
    })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Failed to process profile.');
        })
        .then(data => {
            const successMessage = method === 'POST' ? 'Profile created successfully!' : 'Profile updated successfully!';
            showflashmessage('success', successMessage);
            window.location.href = '/home';
        })
        .catch(error => {
            console.error(`Error processing profile (${method}):`, error);
            showflashmessage('error', 'Error processing profile. Please try again!');
        });
}

document.getElementById('inputImages').addEventListener('change', function () {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = ''; // Xóa preview cũ

    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('img-thumbnail', 'me-2');
            img.style.width = '100px';
            img.style.height = '100px';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Hiển thị video xem trước
document.getElementById('setVideoBtn').addEventListener('click', function () {
    const videoLink = document.getElementById('inputPromotionVideo').value.trim();

    if (!videoLink) {
        videoLink = [];
        return;
    }

    const isValidYouTubeLink = videoLink.includes('youtube.com/embed/');
    if (!isValidYouTubeLink) {
        showflashmessage('warning', 'You must provide a valid YouTube video "embed" link!');
    }

    // Hiển thị video xem trước
    const previewContainer = document.getElementById('promotionVideoPreview');
    previewContainer.innerHTML = `
        <div class="card mt-2 video-card">
            <div class="embed-responsive embed-responsive-16by9">
                <iframe class="embed-responsive-item" src="${videoLink}" allowfullscreen></iframe>
            </div>
        </div>
    `;
});

document.getElementById('inputDocuments').addEventListener('change', function () {
    const documentPreview = document.getElementById('documentPreview');
    documentPreview.innerHTML = ''; // Clear previous preview

    Array.from(this.files).forEach(file => {
        const fileName = document.createElement('p');
        fileName.textContent = file.name;
        documentPreview.appendChild(fileName);
    });
});

let map, marker;

function initMap() {
    const locationId = window.companyId ? 'inputLocation' : 'inputLocation_post';
    const inputLocation = document.getElementById(locationId);
    if (!inputLocation) {
        console.error('Location input element not found');
        return;
    }
    const locationValue = inputLocation.value.trim();
    let locationCoordinates;

    if (locationValue) {
        locationCoordinates = locationValue.split(',').map(coord => parseFloat(coord.trim()));
    } else {
        // Set default coordinates if location is not provided
        locationCoordinates = [10.762622, 106.660172]; // Default to Ho Chi Minh City
    }

    if (locationCoordinates.length !== 2 || isNaN(locationCoordinates[0]) || isNaN(locationCoordinates[1])) {
        console.error('Invalid coordinates:', locationCoordinates);
        return;
    }

    const location = { lat: locationCoordinates[0], lng: locationCoordinates[1] };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: location,
    });
    marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
    });

    marker.addListener('dragend', function () {
        const position = marker.getPosition();
        inputLocation.value = `${position.lat()}, ${position.lng()}`;
    });

    // Auto-complete địa chỉ từ Google Maps
    const autocomplete = new google.maps.places.Autocomplete(inputLocation);
    autocomplete.addListener('place_changed', function () {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            marker.setPosition(location);
            map.setCenter(location);
            inputLocation.value = `${location.lat()}, ${location.lng()}`;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Load the Google Maps script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBs2CCj3DSth7s_9YHuG5EazDGskh5uKGk&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
});

function showflashmessage(type, message) {
    const validTypes = ['success', 'error', 'info', 'warning']; // Các kiểu hợp lệ của Toastr
      if (!validTypes.includes(type)) {
          console.warn('Invalid toastr type:', type); // coi log f12
          type = 'info'; // Mặc định dùng kiểu `info`
      }
  
    toastr[type](message);
  
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
}