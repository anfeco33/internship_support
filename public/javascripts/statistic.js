document.addEventListener('DOMContentLoaded', function() {
  const timeFixedSelect = document.getElementById('timeFixed');
  const statisticRightDiv = document.querySelector('.statisticRight');
  const fromDayInput = document.getElementById('fromDay');
  const toDayInput = document.getElementById('toDay');
  const resetButton = document.getElementById('btnReset');
  const reportButton = document.getElementById('btnReport');
  const show = document.getElementById("showReport");

  timeFixedSelect.addEventListener('change', function() {
      if (timeFixedSelect.value !== '') {
          statisticRightDiv.classList.add('disabled');
          // Nếu bạn muốn vô hiệu hóa cả input bên trong statisticRightDiv
          const inputsInStatisticRight = statisticRightDiv.querySelectorAll('input');
          inputsInStatisticRight.forEach(input => {
              input.disabled = true;
          });
      } else {
          statisticRightDiv.classList.remove('disabled');
          // Nếu bạn muốn kích hoạt lại input bên trong statisticRightDiv
          const inputsInStatisticRight = statisticRightDiv.querySelectorAll('input');
          inputsInStatisticRight.forEach(input => {
              input.disabled = false;
          });
      }
  });

  resetButton.addEventListener('click', function() {
      timeFixedSelect.selectedIndex = 0; // Chọn lại option mặc định trong select
      fromDayInput.value = ''; // Đặt lại giá trị trống cho input date "From"
      toDayInput.value = ''; // Đặt lại giá trị trống cho input date "To"
      statisticRightDiv.classList.remove('disabled');
      // Nếu bạn muốn kích hoạt lại input bên trong statisticRightDiv
      const inputsInStatisticRight = statisticRightDiv.querySelectorAll('input');
      inputsInStatisticRight.forEach(input => {
          input.disabled = false;
      });
      timeFixedSelect.disabled = false;
  });

  // Kiểm tra giá trị của các input trong statisticRight khi có sự thay đổi
  const statisticRightInputs = statisticRightDiv.querySelectorAll('input');
  statisticRightInputs.forEach(input => {
      input.addEventListener('input', function() {
          const anyInputHasValue = Array.from(statisticRightInputs).some(input => input.value.trim() !== '');
          timeFixedSelect.disabled = anyInputHasValue; // Vô hiệu hóa select nếu có input có giá trị
      });
  });


  reportButton.addEventListener('click', async () => {
      const timeFixed = document.getElementById('timeFixed').value;
      const fromDay = document.getElementById('fromDay').value;
      const toDay = document.getElementById('toDay').value;
      const currentDate = new Date().toISOString().split('T')[0];
      if (timeFixed === '' && fromDay === '' && toDay === '') {
        alert('Please select at least one option.');
        return; // Dừng hàm nếu không có trường nào được chọn
      }

      if (fromDay !== '' && toDay === '') {
        alert("Please choose from and to day");
      }
      if (fromDay === '' && toDay !== '') {
        alert("Please choose from and to day");
      }

      if (fromDay !== '' && toDay !== '') {
        if (toDay > currentDate) {
          alert('To date must be in the past.');
          return;
        }
        // Kiểm tra xem toDay có lớn hơn fromDay không
        if (toDay <= fromDay) {
            alert('To date must be greater than from date.');
            return;
        }
      }
    });
});
