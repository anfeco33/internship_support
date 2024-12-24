const imgPosition = document.querySelectorAll(".aspect-ratio-169 img");
const imgContainer = document.querySelector('.aspect-ratio-169');
const dots = document.querySelectorAll('.dot'); // Lấy tất cả các dot
let count = 0;

imgPosition.forEach(function(image, index) {
    image.style.left = index * 100 + "%";
});

// function updateDots() {
//     // Loại bỏ class 'active' khỏi tất cả các dot
//     dots.forEach(dot => {
//         dot.classList.remove('active');
//     });
//     // Thêm class 'active' vào dot hiện tại
//     dots[count].classList.add('active');
// }

function updateDots() {
    // Ensure count is within the valid range
    if (count >= 0 && count < dots.length) {
        // Loại bỏ class 'active' khỏi tất cả các dot
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        // Thêm class 'active' vào dot hiện tại
        dots[count].classList.add('active');
    }
}

let sliderInterval; // Biến để giữ giá trị của setInterval

function startSlider() {
    // Bắt đầu hoặc thiết lập lại slider với interval mới
    clearInterval(sliderInterval); // Dừng interval hiện tại nếu có
    sliderInterval = setInterval(imgSlider, 3000); // Bắt đầu interval mới
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", function() {
        moveSlider(index);
        startSlider(); // Khởi động lại interval mỗi khi dot được nhấp
    });
});

function moveSlider(index) {
    count = index; // Đặt count bằng index của dot được nhấp
    imgContainer.style.left = "-" + count * 100 + "%"; // Di chuyển slider
    updateDots(); // Cập nhật các dot
}

function imgSlider() {
    count++;
    if (count >= imgPosition.length) {
        count = 0;
    }
    moveSlider(count);
}

// Cập nhật dots khi trang web tải xong
updateDots();
startSlider(); // Bắt đầu interval khi trang web tải xong