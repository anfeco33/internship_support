
const sidebar = document.querySelector(".sidebar"),

  show_card = document.querySelector(".show_card"),

  closeBtn = document.querySelector("#btn_sidebar"),

  open_course_card = document.querySelector(".course"),

  homeSection = document.querySelector('.home-section'),

  body = document.querySelector('body'),

  mode = document.querySelector('.toggle_switch'),

  mode_text = document.querySelector('.mode_name'),

  log_out = document.querySelector('#confirm'),

  profile = document.querySelector(".profile-details"),

  offcanvasElement = document.getElementById('section_bar'),

  menuIcon = document.querySelector('.menu_icon'),

  // const curr_page = document.querySelector('.home-section');


  // order = document.querySelector(".order_card"),

  searchInput = document.getElementById('searchInput'),

  icon_seach = document.getElementById("seach_icon");

  const $collap = $('#collapseExample');

  const $clearIcon = $('#clear_icon');
const handleSearchResultsDebouce = useDebounce(handleSearchResults , 250);

function handleSearchResults(searchValue) {
  // if (event.key === 'Enter') {
    const keyword = searchValue.trim();
    // console.log(keyword)
    if (keyword !== '') {
      
      $("#search_result_row").innerHTML = ''; // Xóa nội dung hiện tại của collapseExample
      data = `
                <li class="list-group-item d-flex justify-content-start align-items-center my-2">
                  <div class="find_icon ">
                      <i class="fa-solid fa-magnifying-glass"></i>

                  </div>
                 
                  <div class="course_name mx-2  d-flex justify-content-start align-items-center">
                      
                      Search result for "${keyword}"
                  </div>
                </li>
            `
      $("#search_result_row").html(data);

      sendData(keyword);
      $collap.show(); // Hiển thị collapseExample
      $clearIcon.show();
    } else {
      $("#search_result_row").html("");
      $collap.hide(); // Ẩn collapseExample
      $clearIcon.hide();
    }
}
if (searchInput) {


  $clearIcon.hide();

  $collap.hide(); // Ẩn collapseExample

  searchInput.addEventListener('input', () => {
    handleSearchResultsDebouce(searchInput.value);
    // }
  });
  searchInput.addEventListener('click', () => {
    handleSearchResultsDebouce(searchInput.value);
    // }
  });
  icon_seach.addEventListener('click', function () {
    handleSearchResultsDebouce(searchInput.value);
  });

  $clearIcon.click(function() {
    searchInput.value = '';
    $("#search_result_row").html("");
    $clearIcon.hide();

    $collap.hide(); // Ẩn collapseExample
  });
}

function sendData(term) {
  console.log(term)
  fetch(`/home/search/${term}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(list => {
      if (list.data.length > 0) {
        list_business = list.data
        var data = ""
        list_business.forEach((company) => {
          data += `
          <li class="list-group-item d-flex justify-content-start align-items-center my-2"
          onclick="getBusinessById('${company._id.toString()}')">
            <div class="business_res_pic  d-flex justify-content-start align-items-center">
              <img src="${company.images[0]}" alt="business" class="img-fluid">
            </div>
            
            <div class="name mx-2  d-flex justify-content-start align-items-center">
                <span><strong>${company.name}</strong><span>
                <span class="industry text-muted">(${company.industry})</span>
            </div>
          </li>
          `
        });
        $("#search_result_row").append(data);
      }else{
        $("#search_result_row").append("");
        $(".course_name").html("No results found for '"+term+"'");
      }
    })
    .catch(error => {
      console.error('Error getting list of product:', error.message);
    });
}

function useDebounce(callback, delay) {
  let timeoutId;
  return (key) =>{
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(key);
    }, delay);
  }
}

//TODO: tách ra từng js cho partials vì render chỉ read property , 
// các element của partials hiện tại
profile.addEventListener('click', function () {
  console.log('profile page');
  window.location.href = "/profile"
});


// Lắng nghe sự kiện click của nút "Có"
log_out.addEventListener('click', function () {
  // Gửi yêu cầu đăng xuất đến máy chủ
  fetch('/logout', {
    method: 'POST',
    credentials: 'same-origin' // Đảm bảo gửi cookie và thông tin xác thực cùng phiên
  })
    .then(function (response) {
      // Xử lý phản hồi từ máy chủ
      console.log(response.data);
      if (response.ok) {
        return response.json();
      }

    })
    .then(function (data) {
      // Xử lý dữ liệu nhận được từ phản hồi
      if (data.flashMessage.type === 'success') {
        window.location.reload();
      }
      else {
        window.location.href = '/login'
      }

    })
    .catch(function (error) {
      // Xử lý lỗi khi gửi yêu cầu
      console.log('Error while sending logout require:', error);
      window.location.href = '/login'
    });
});



mode.addEventListener("click", () => {
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    localStorage.setItem("mode", "dark");
  } else {
    localStorage.setItem("mode", "");
  }
})


let getmode = localStorage.getItem('mode');
if (getmode && getmode === "dark") {
  body.classList.toggle('dark');
}


if (offcanvasElement) {
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
}


closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  homeSection.classList.toggle('sidebar-open');
    if (sidebar.classList.contains('open')) {
      console.log('Sidebar opened');
    } else {
      console.log('Sidebar closed');
      // Ẩn các nút sub nếu sidebar đóng lại
      const internshipSubNav = document.getElementById('internshipSubNav');
      if (internshipSubNav) {
        const subNavItems = internshipSubNav.querySelectorAll('.sub-nav-item');
        subNavItems.forEach(subNavItem => {
          subNavItem.classList.add('hide');
        });
        // Loại bỏ các mục khỏi DOM sau khi hiệu ứng hoàn tất
        setTimeout(() => {
          subNavItems.forEach(subNavItem => {
            subNavItem.remove();
          });
        }, 300); // Thời gian chờ khớp với thời gian chuyển tiếp trong CSS
        subNavVisible = false;
      }
    }

  menuBtnChange();
});



if (offcanvasElement) {
  offcanvasElement.addEventListener('show.bs.offcanvas', event => {
    homeSection.classList.add('offcanvas-open');
    sidebar.classList.remove("open");
    homeSection.classList.remove('sidebar-open');
  });

  offcanvasElement.addEventListener('hide.bs.offcanvas', event => {
    homeSection.classList.remove('offcanvas-open');
  });
}

function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the icon class
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");//replacing the icon class
  }
}

//Admin page redirect
const student_manager = document.querySelector(".Student"),
  company_manager = document.querySelector(".Company"),
  transaction = document.querySelector(".Transaction"),
  statistical = document.querySelector(".Statistical");

if (body) {
  if (student_manager) {
    student_manager.addEventListener('click', function () {
      console.log('student manager page');
      window.location.href = "/admin/student"
    });
  }
  if (company_manager) {
    company_manager.addEventListener('click', function () {
      console.log('company manager page');
      window.location.href = "/admin/company"
    });
  }
  if (transaction) {
    transaction.addEventListener('click', function () {
      console.log('transaction page');
      window.location.href = "/admin/transaction"
    });
  }
  if (statistical) {
    statistical.addEventListener('click', function () {
      console.log('statistical page');
      window.location.href = "/admin/statistical"
    });
  }


}

//Student and company page redirect
const student_homepage = document.querySelector(".Home"),
  myintern_page = document.querySelector(".MyInternshipApps"),
  applied_page = document.querySelector(".InternshipApplications");

if (body) {
  if (student_homepage) {
    student_homepage.addEventListener('click', function () {
      console.log('HOME page');
      window.location.href = "/home/business"
    });
  }

  if (myintern_page) {
    myintern_page.addEventListener('click', function () {
      console.log('My Internship list page');
      window.location.href = "/home/my-application-list";
    });
  }
  
  let subNavVisible = false;
  if (applied_page) {
    applied_page.addEventListener('click', function () {
      console.log('Applied page');
      const internshipSubNav = document.getElementById('internshipSubNav');
      console.log('Internship Sub Nav:', internshipSubNav);

      // Mở sidebar nếu nó đang đóng
      if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
        homeSection.classList.add('sidebar-open');
        console.log('Sidebar opened automatically');
      }

      if (internshipSubNav) {
        if (sidebar.classList.contains('open')) {
          if (subNavVisible) {
            // Ẩn các nút sub với hiệu ứng mượt mà
            const subNavItems = internshipSubNav.querySelectorAll('.sub-nav-item');
            subNavItems.forEach(subNavItem => {
              subNavItem.classList.add('hide');
            });
            // Loại bỏ các mục khỏi DOM sau khi hiệu ứng hoàn tất
            setTimeout(() => {
              subNavItems.forEach(subNavItem => {
                subNavItem.remove();
              });
            }, 300); // Thời gian chờ khớp với thời gian chuyển tiếp trong CSS
            subNavVisible = false;
          } else {
            const businessId = internshipSubNav.getAttribute('data-business-id');
            console.log('Business ID:', businessId); // Log businessId để kiểm tra

            // Lấy danh sách internships từ server
            fetch(`/home/internships/${businessId}`)
              .then(response => response.json())
              .then(data => {
                console.log('API Response:', data); // Log dữ liệu trả về từ API
                if (data.status === 'success') {
                  const internships = data.internships;
                  internshipSubNav.innerHTML = ''; // Làm trống danh sách cũ
                  internships.forEach(internship => {
                    const subNavItem = document.createElement('li');
                    subNavItem.className = 'sub-nav-item';
                    subNavItem.innerHTML = `
                      <a href="#" data-internship-id="${internship._id}" title="${internship.title}">
                        <i class="fa-solid fa-briefcase"></i> ${truncateText(internship.title, 15)}
                      </a>
                    `;
                    subNavItem.addEventListener('click', function () {
                      window.location.href = `/home/business/${businessId}/application-list/${internship._id}`;
                    });
                    internshipSubNav.appendChild(subNavItem);

                    requestAnimationFrame(() => {
                      subNavItem.classList.add('show');
                    });
                  });
                  subNavVisible = true;
                } else {
                  showflashmessage('info', "You haven't posted any internships yet.");
                }
              })
              .catch(error => {
                console.error('Error fetching internships:', error);
              });
          }
        } else {
          // Sidebar đang đóng, ẩn các nút sub nếu có
          const subNavItems = internshipSubNav.querySelectorAll('.sub-nav-item');
          subNavItems.forEach(subNavItem => {
            subNavItem.classList.add('hide');
          });
          setTimeout(() => {
            subNavItems.forEach(subNavItem => {
              subNavItem.remove();
            });
          }, 300); // Thời gian chờ khớp với thời gian chuyển tiếp trong CSS
          subNavVisible = false;
        }
      }
    });
  }

  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }








}


const editButton = document.getElementById('editRequest');
function toggleEdit(id) {
  const inputs = document.querySelectorAll('input');
  if (editButton.classList.contains('active')) {
    // Gửi biểu mẫu

    const productName = document.getElementById('productname').value;
    const importPrice = document.getElementById('importprice').value;
    const retailPrice = document.getElementById('retailprice').value;
    const inventory = document.getElementById('inventory').value;
    const category = document.querySelector('input[name="category"]:checked');
    const category_value = category ? category.value : "";
    const fileInput = document.getElementById('customFile');


    // Create the data object
    const data = {
      productname: productName,
      importprice: importPrice,
      retailprice: retailPrice,
      inventory: inventory,
      category: category_value,
    };
    console.log(data);
    // Send the data using fetch
    fetch('/admin/product/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        if (data.update) {
          const product = data.product
          console.log(data.product); // true
          window.location.reload();
        }
        else {
          showflashmessage('error', data.message);

        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    console.log(id);
    // window.location.reload()
  }
  inputs.forEach(function (input) {
    input.classList.toggle('editing');
    input.disabled = !input.disabled;
  });
  editButton.classList.toggle('active');
  editButton.textContent = (editButton.classList.contains('active')) ? 'Save' : 'Edit';
}





function uploadFiles(event, endpoint) {
  event.preventDefault();
  const progressBarFill = document.querySelector('.progress-bar');
  const progressBar = document.querySelector('.progress');
  const uploadButton = document.getElementById('upload');
  const fileInput = document.getElementById('customFile');

  const files = fileInput.files;
  const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
  const maxSize = 20 * 1024 * 1024; // Kích thước tối đa: 20 MB

  let uploadedSize = 0;
  let fileCount = files.length;
  let flag = false;

  Array.from(files).forEach((file) => {
    if (file.size <= maxSize) {
      progressBar.style.display = 'block';
      progressBarFill.style.width = '0%';
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('file', file);
      formData.append('action', 'changed_avatar');

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          uploadedSize += event.loaded;
          if (uploadButton) {
            uploadButton.disabled = true;
          }

          const percent = Math.round((uploadedSize / totalSize) * 100);
          updateProgress(percent);
          if (percent >= 100) {
            setTimeout(() => {
              progressBar.style.display = 'none';
              flag = true;
            }, 2000);
          }
        }
      });
      //TÙY CHỈNH UPLOAD VÀ RELOAD
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setTimeout(() => {
              if (response.uploaded && flag) {
                // console.log("uploaded")

                if (uploadButton) {
                  uploadButton.disabled = false;
                  window.location.reload();
                }



              }
            }, 2100);

          }
        }
      };
      console.log("upload :" + file.name)
      xhr.open('POST', endpoint);
      xhr.send(formData);
    } else {
      showflashmessage('warning', `File ${file.name} exceeds the size limit.`);
    }
  });
}

function changeFullname(event) {
  event.preventDefault();
  const fullnameInput = document.querySelector('input[name="fullname"]');
  const fullnameValue = fullnameInput ? fullnameInput.value : "";

  fetch("/change_name", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Đặt kiểu dữ liệu là JSON
    },
    body: JSON.stringify({ fullname: fullnameValue }) // Chuyển đổi dữ liệu thành chuỗi JSON
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        window.location.reload();
      }
      else { showflashmessage('error', data.message); }


    })
    .catch(function (error) {
      // Xử lý lỗi (nếu có)
      console.error("Error:", error);
    });
}

function changePassword(event) {
  event.preventDefault();
  // Lấy giá trị từ các trường nhập liệu
  var currpass = document.querySelector('input[name="currpass"]').value;
  var newpass = document.querySelector('input[name="newpass"]').value;
  var renewpass = document.querySelector('input[name="renewpass"]').value;

  // Tạo đối tượng dữ liệu để gửi lên máy chủ
  var data = {
    currpass: currpass,
    newpass: newpass,
    renewpass: renewpass
  };
  console.log(data);

  fetch("/change_pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Đặt kiểu dữ liệu là JSON
    },
    body: JSON.stringify(data) // Chuyển đổi dữ liệu thành chuỗi JSON
  })
    .then(response => response.json())
    .then(data => {
      // showflashmessage(data.status, data.message)
      if (data.status === "success") {
        window.location.reload();

      }
      else { showflashmessage('error', data.message); }
    })
    .catch(function (error) {
      // Xử lý lỗi (nếu có)
      console.error("Error:", error);
    });

}




function getprofilebyId(id) {
  window.location.href = "/profile/" + id;
}

function gotocart() {
  window.location.href = "/home/cart";
}

function getBusinessById(id) {
  console.log(id)
  window.location.href = "/home/business/" + id;
}

function editByBussinessId(id) {
  console.log("/home/business-edit/edit/" + id)
  window.location.href = "/home/business-edit/edit/" + id;
}

function getcoursebyId_admin(id) {
  console.log(id)
  window.location.href = "/admin/course/" + id;
}

function getlecturebyId(id) {
  console.log(id)
  window.location.href = "/home/lecture/" + id;
}

function callback(url) {
  window.location.href = url;
}

function viewhistorypurchase(id) {
  console.log(id)
  window.location.href = "/admin/customer/" + id;
}

function gotodetailsorder(id) {
  console.log(id)
  window.location.href = "/admin/order/" + id;
}

var global_id = "";
var end_point = "";
const delete_modal = document.querySelector("#deleteModal");

const delete_btn = document.querySelector("#confirm_delete")

if (delete_btn) {
  delete_btn.addEventListener("click", () => { deletecoursebyId( end_point, global_id) })

}


function deletecourse(role, course_name, id) {
  // Điền id vào trường có id là "id"
  $(".id_course").text(course_name);
  $("#deleteModal").modal('show');
  global_id = id;
  if(role == "admin"){
    end_point = "/admin/course/";
  }
  if(role =="company"){
    end_point = "/home/business/";
  }

}


function show_info_payment(card_owner, payment_id) {
  // Điền id vào trường có id là "id"
  $(".payment_owner").text(card_owner);
  $(".payment_id").text(payment_id);
  $("#show_info_payment").modal('show');
  // global_id = id;
  console.log(card_owner, payment_id)
}



function deletecoursebyId(target , id) {
  console.log(id)


  fetch(target + id, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => {
      if (data.delete) {
        if(target == '/admin/course/'){
          window.location.href = data.redirect;
        }else{
          window.location.href = '/home/course';
        }
      }
      else {
        showflashmessage('error', data.message);
      }

    })
    .catch(error => {
      console.error('Error:', error);
    });

}

function resendVerifyEmail(email, accountid) {
  console.log(email)
  fetch("/resend_email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Đặt kiểu dữ liệu là JSON
    },
    body: JSON.stringify({ email: email, accountId: accountid }) // Chuyển đổi dữ liệu thành chuỗi JSON
  })
    .then(response => response.json())
    .then(data => {
      // showflashmessage(data.status, data.message)
      if (data.status === "success") {
        showflashmessage('success', data.message);

      }

    })
    .catch(function (error) {
      // Xử lý lỗi (nếu có)
      console.error("Error:", error);
    });
}

function lock_unlock_Account(accountid) {
  console.log(accountid)
  fetch("/lock_account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Đặt kiểu dữ liệu là JSON
    },
    body: JSON.stringify({ accountID: accountid }) // Chuyển đổi dữ liệu thành chuỗi JSON
  })
    .then(response => response.json())
    .then(data => {
      // showflashmessage(data.status, data.message)
      if (data.status === "success") {
        window.location.reload();
      }

    })
    .catch(function (error) {
      // Xử lý lỗi (nếu có)
      console.error("Error:", error);
    });
}


function updateProgress(percent) {
  const progressBarFill = document.querySelector('.progress-bar');
  progressBarFill.style.width = `${percent}%`;

  if (percent >= 100) {
    progressBarFill.innerText = 'Uploaded!';
  } else {
    progressBarFill.innerText = `${percent}%`;
  }
}


// function closeModal(id) {
//   $(`#${id}`).modal('hide');
// }

// function resetModal(id) {
//   const form = document.getElementById(id);
//   if (form) {
//     form.reset();
//   }
// }


// let lecture_page = document.querySelector('.lecture_page');
// var player;

// if (lecture_page) {
//   $('.toggle_show_lecture').click(function () {
//     $(this).toggleClass('fa-angle-down fa-angle-up');
//     $(this).parent().next('#all_lecture').toggleClass('open');
//   });

//   function change_lecture(lectureID, lectureTitle, lectureLink, lectureDescription) {
//     console.log(lectureID, lectureTitle, lectureLink, lectureDescription);

//     $('#lectureId').val(lectureID);
//     // $('#lecture_link').attr('src', lectureLink);
//     $('.lecture_title').text(lectureTitle);
//     $('.lecture_description').text(lectureDescription);

//     const videoId = getYouTubeVideoID(lectureLink);
//     if (player && videoId) {
//       player.loadVideoById(videoId);
//     }
//   }
// }


function buyNow(courseId) {
  window.location.href = '/payment/' + courseId;
}

function checkout() {
  window.location.href = '/payment/';
}

// 5 star rating
function change(id) {
  var cname = document.getElementById(id).className;
  var ab = document.getElementById(id+"_hidden").value;
  document.getElementById("starrating").value = ab;
  document.getElementById(cname+"rating").innerHTML = ab;

  for(var i=ab; i>=1; i--)
  {
      document.getElementById(cname+i).src="../../images/star.png";
  }
  var id=parseInt(ab)+1;
  for(var j=id; j<=5; j++)
  {
      document.getElementById(cname+j).src="../../images/whitestar.png";
  }
  // console.log(rating);
} 

const rating = document.getElementById('rating-form');

// add rating
if(rating){

  rating.addEventListener('submit', function(e) {
    e.preventDefault();
  
    const rating = document.getElementById('starrating').value;
    const comment = document.getElementById('comment').value;
    const courseId = document.getElementById('courseId').value;
  
    if (!rating || !comment) {
        showflashmessage('error', 'Please provide both rating and comment.');
        return;
    }
  
    fetch(`/home/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment, courseId })
    })
    .then(response => response.json())
    .then(data => {
        showflashmessage("success", "Rating submitted successfully.");
        document.getElementById('comment').value = '';
        setTimeout(() => {
          location.reload();
        }, 500);
    })
    .catch(error => {
        showflashmessage('error', error.message || 'An error occurred while submitting your rating.');
    });
  });
  
}

//delete review
function rmComment(id) {
  console.log("comment id: ", id)

  fetch("/home/rating", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({rmComment : id})
  })
    .then(response => response.json())
    .then(data => {
      // showflashmessage(data.status, data.message)
      if (data.status === "success") {
        window.location.reload();
        showflashmessage('success', data.message);
      }
      else { showflashmessage('error', data.message); }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

/** filter */
const filter = document.getElementById('filterForm');

// add rating
if(filter){

  filter.addEventListener('submit', function (e) {
    e.preventDefault();

    const params = {};
    const industry = document.getElementById('filterIndustry').value.trim();
    const size = document.getElementById('filterSize').value.trim();
    const isVerified = document.getElementById('filterIsVerified').value.trim();

    if (industry) params.industry = industry;
    if (size) params.size = size;
    if (isVerified) params.isVerified = isVerified;

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/home/business?${queryString}#allCompanies` : '/home/business#allCompanies';

    console.log('Redirecting to:', url); // Log URL
    window.location.href = url;
  });

  document.getElementById('showAllBtn').addEventListener('click', function () {
    window.location.href = '/home/business#allCompanies';
  });

  // Scroll to the "All List of Company" section if the URL contains the hash
  if (window.location.hash === '#allCompanies') {
    document.getElementById('allCompanies').scrollIntoView();
  }
}

/**
 * Bell notification dropdown
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof userRole === 'undefined' || userRole !== 'company') {
    return;
  }

  console.log('DOM fully loaded and parsed NOTIFICATION');
  let isDropdownVisible = false;

  function fetchApplications(updateDropdown = false) {
    fetch(`/home/business/${businessId}/applications`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
      .then(response => {
        console.log('Response received:', response);
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data);
        if (data.status === 'success') {
          const applications = data.applications;
          const unreadCount = data.unreadCount; // Lấy số lượng thông báo chưa đọc
          const applicationCount = document.getElementById('applicationCount');
          const applicationsList = document.getElementById('applicationsList');

          // Luôn cập nhật số lượng thông báo
          if (!isDropdownVisible) {
            applicationCount.textContent = unreadCount; // Cập nhật số lượng thông báo
          }

          if (updateDropdown) {
            console.log('Applications:', applications);
            console.log('Unread Count:', unreadCount);

            applicationsList.innerHTML = ''; // Làm trống danh sách cũ
            if (applications.length > 0) {
              applications.forEach(application => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                  <div>
                    <strong>${application.applicantName}</strong> applied for "${application.internship.title}"
                  </div>
                  <div class="text-muted" style="font-size: 0.8em;">
                    ${new Date(application.appliedAt).toLocaleString()}
                  </div>
                `;
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('mouseover', () => {
                  listItem.style.backgroundColor = '#f0f0f0';
                });
                listItem.addEventListener('mouseout', () => {
                  listItem.style.backgroundColor = '';
                });
                listItem.addEventListener('click', () => {
                  window.location.href = `/home/business/${businessId}/applications/${application._id}`;
                });
                applicationsList.appendChild(listItem);
              });
            } else {
              const listItem = document.createElement('li');
              listItem.className = 'list-group-item';
              listItem.textContent = 'No new notifications received';
              listItem.style.pointerEvents = 'none';
              listItem.style.userSelect = 'none';
              applicationsList.appendChild(listItem);
            }
          }
        } else {
          console.error('Error in application data:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
      });
  }

  function toggleApplicationsDropdown() {
    const dropdown = document.getElementById('applicationsDropdown');
    const applicationCount = document.getElementById('applicationCount');

    dropdown.classList.toggle('show'); // Toggle visibility
    isDropdownVisible = dropdown.classList.contains('show');
    console.log('Dropdown visible:', isDropdownVisible);

    if (isDropdownVisible) {
      console.log('Fetching applications for dropdown...');
      fetchApplications(true); // Cập nhật danh sách ứng dụng

      // Đặt lại số lượng thông báo nhưng không thay đổi danh sách
      fetch(`/home/business/${businessId}/applications/viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            console.log('Applications marked as viewed');
            applicationCount.textContent = '0'; // Đặt lại số lượng thông báo
          } else {
            console.error('Error marking applications as viewed:', data.message);
          }
        })
        .catch(error => {
          console.error('Error marking applications as viewed:', error);
        });
    }
  }

  // fetchApplications khi nhấn chuông
  const bellIcon = document.querySelector('.bell_icon');
  if (bellIcon) {
    bellIcon.addEventListener('click', toggleApplicationsDropdown);
  
    // Fetch số lượng ng apply ngay khi trang load
    fetchApplications(false); // Không cập nhật dropdown
  }
});

function confirmStatus(applicationId) {
  const status = document.getElementById(`status-${applicationId}`).value;
  const modalBody = document.getElementById('confirmModalBody');
  modalBody.textContent = `Are you sure you want to set the status to "${status}" for this application?`;

  const confirmButton = document.getElementById('confirmButton');
  confirmButton.setAttribute('onclick', `showReasonModal('${applicationId}', '${status}')`);

  // show modal xác nhận
  const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
  confirmModal.show();
}

function showReasonModal(applicationId, status) {
  // Đóng modal xác nhận
  const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
  confirmModal.hide();

  // Hiển thị modal nhập lý do hoặc thông báo
  const reasonModal = new bootstrap.Modal(document.getElementById('reasonModal'));
  reasonModal.show();

  const reasonConfirmButton = document.getElementById('reasonConfirmButton');
  reasonConfirmButton.setAttribute('onclick', `sendStatus('${applicationId}', '${status}')`);
}

async function sendStatus(applicationId, status) {
  const reasonMessage = document.getElementById('reasonMessage').value;

  try {
    const response = await fetch(`/home/applications/${applicationId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reasonOrMessage: reasonMessage }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Status updated:', data.message);
      showflashmessage('success', data.message);
      // Đóng modal nhập lý do hoặc thông báo
      const reasonModal = bootstrap.Modal.getInstance(document.getElementById('reasonModal'));
      reasonModal.hide();
      // Disable dropdown btn Send
      const sendButton = document.querySelector(`#application-${applicationId} button`);
      sendButton.textContent = 'Status Sent';
      sendButton.disabled = true;
    } else {
      console.error('Error updating status:', data.message);
      showflashmessage('error', data.message);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    showflashmessage('error', 'An error occurred while updating the status');
  }
}

// student notification
document.addEventListener('DOMContentLoaded', function () {
  if (typeof userRole === 'undefined' || userRole !== 'student') {
    return;
  }
  console.log('DOM fully loaded and parsed for Student Feedback');
  let isFeedbackDropdownVisible = false;

  function fetchStudentNotifications(updateDropdown = false) {
    fetch(`/home/student/applications/notifications`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const feedbacks = data.feedbacks; // danh sách phản hồi
          const unreadCount = data.unreadCount; // slg chưa đọc
          const feedbackCount = document.getElementById('studentFeedbackCount');
          const feedbackList = document.getElementById('studentFeedbackList');

          // Cập nhật số lượng thông báo chưa đọc
          if (!isFeedbackDropdownVisible) {
            feedbackCount.textContent = unreadCount;
          }

          if (updateDropdown) {
            feedbackList.innerHTML = ''; // Xóa danh sách cũ
            if (feedbacks.length > 0) {
              feedbacks.forEach(feedback => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                  <div>
                    <strong>${feedback.internship.company.name}</strong> - "${feedback.internship.title}"
                  </div>
                  <div>
                    Status: <strong>${feedback.status || 'Pending'}</strong>
                  </div>
                  <div class="text-muted" style="font-size: 0.8em;">
                    ${new Date(feedback.appliedAt).toLocaleString()}
                  </div>
                `;
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('mouseover', () => {
                  listItem.style.backgroundColor = '#f0f0f0';
                });
                listItem.addEventListener('mouseout', () => {
                  listItem.style.backgroundColor = '';
                });
                feedbackList.appendChild(listItem);
              });
            } else {
              const listItem = document.createElement('li');
              listItem.className = 'list-group-item';
              listItem.textContent = 'No feedbacks received yet';
              listItem.style.pointerEvents = 'none';
              listItem.style.userSelect = 'none';
              feedbackList.appendChild(listItem);
            }
          }
        } else {
          console.error('Error fetching student notifications:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching student notifications:', error);
      });
  }

  function toggleStudentFeedbackDropdown() {
    const dropdown = document.getElementById('studentFeedbackDropdown');
    const feedbackCount = document.getElementById('studentFeedbackCount');

    dropdown.classList.toggle('show'); // Toggle visibility
    isFeedbackDropdownVisible = dropdown.classList.contains('show');

    if (isFeedbackDropdownVisible) {
      console.log('Fetching feedbacks for dropdown...');
      fetchStudentNotifications(true); // Cập nhật danh sách phản hồi

      // Đặt lại số lượng thông báo
      feedbackCount.textContent = '0';
    }
  }

  // Xử lý khi nhấn chuông
  const bellIcon = document.querySelector('.bell_icon');
  if (bellIcon) {
    bellIcon.addEventListener('click', toggleStudentFeedbackDropdown);

    // Fetch số lượng thông báo ngay khi trang load
    fetchStudentNotifications(false); // Không cập nhật dropdown
  }
});

/**
 * Scroll top button
 */
const scrollTopButton = document.querySelector('.scroll-top');

if(scrollTopButton){
  document.addEventListener('DOMContentLoaded', function () {
    let scrollableDiv = document.querySelector('.home-section');
  
  
    // Lắng nghe sự kiện scroll của khối div
    scrollableDiv.addEventListener('scroll', function () {
      toggleScrollTopButton();
    });
  
    // Lắng nghe sự kiện click của nút "scroll top"
    scrollTopButton.addEventListener('click', function () {
      scrollToTop();
    });
  
    // Kiểm tra và cập nhật trạng thái của nút "scroll top"
    function toggleScrollTopButton() {
      let scrollTop = scrollableDiv.scrollTop;
      let scrollHeight = scrollableDiv.scrollHeight;
      let clientHeight = scrollableDiv.clientHeight;
  
      if (scrollTop > 0) {
        scrollTopButton.classList.add('active');
      } else {
        scrollTopButton.classList.remove('active');
      }
  
      if (scrollTop + clientHeight >= scrollHeight) {
        // Đã cuộn đến cuối khối div
        // Có thể thực hiện các hành động khác tại đây (nếu cần)
      }
    }
  
    // Cuộn khối div đến đầu trang
    function scrollToTop() {
      homeSection.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
  
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
          header.classList.add("scrolled"); // Thêm lớp khi cuộn xuống
      } else {
          header.classList.remove("scrolled"); // Gỡ lớp khi trở về đầu trang
      }
  });
});


function showflashmessage(type, message) {
  const validTypes = ['success', 'error', 'info', 'warning'];
    if (!validTypes.includes(type)) {
        console.warn('Invalid toastr type:', type); // coi log f12
        type = 'info'; 
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
