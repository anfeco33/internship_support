
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
    const keyword = searchValue.trim();
    if (keyword !== '') {
      
      $("#search_result_row").innerHTML = '';
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
      $collap.show(); 
      $clearIcon.show();
    } else {
      $("#search_result_row").html("");
      $collap.hide();
      $clearIcon.hide();
    }
}
if (searchInput) {


  $clearIcon.hide();

  $collap.hide();

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

    $collap.hide();
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
          if (company && company._id) {
            const imageUrl = company.images && company.images.length > 0 ? company.images[0] : '/images/default_companyImage_details.jpg';
            data += `
            <li class="list-group-item d-flex justify-content-start align-items-center my-2"
            onclick="getBusinessById('${company._id.toString()}')">
              <div class="business_res_pic d-flex justify-content-start align-items-center">
                <img src="${imageUrl}" alt="business" class="img-fluid">
              </div>
              
              <div class="name mx-2 d-flex justify-content-start align-items-center">
                  <span><strong>${company.name}</strong><span>
                  <span class="industry text-muted">(${company.industry})</span>
              </div>
            </li>
            `;
          }
        });
        $("#search_result_row").append(data);
      }else{
        $("#search_result_row").append("");
        $(".course_name").html("No results found for '"+term+"'");
      }
    })
    .catch(error => {
      console.error('Error getting list while searching:', error.message);
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

profile.addEventListener('click', function () {
  console.log('profile page');
  window.location.href = "/profile"
});

log_out.addEventListener('click', function () {
  fetch('/logout', {
    method: 'POST',
    credentials: 'same-origin'
  })
    .then(function (response) {
      // Xử lý phản hồi từ máy chủ
      console.log(response.data);
      if (response.ok) {
        return response.json();
      }

    })
    .then(function (data) {
      if (data.flashMessage.type === 'success') {
        window.location.reload();
      }
      else {
        window.location.href = '/login'
      }

    })
    .catch(function (error) {
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
  if (typeof updateChartColors === 'function') {
    updateChartColors(body.classList.contains('dark'));
  }
})

let getmode = localStorage.getItem('mode');
if (getmode && getmode === "dark") {
  body.classList.toggle('dark');
  if (typeof updateChartColors === 'function') {
    updateChartColors(true);  
  }
} else {
  if (typeof updateChartColors === 'function') {
    updateChartColors(false);
  }
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
      // Ẩn nút sub nếu sidebar đóng lại
      const internshipSubNav = document.getElementById('internshipSubNav');
      if (internshipSubNav) {
        const subNavItems = internshipSubNav.querySelectorAll('.sub-nav-item');
        subNavItems.forEach(subNavItem => {
          subNavItem.classList.add('hide');
        });
        setTimeout(() => {
          subNavItems.forEach(subNavItem => {
            subNavItem.remove();
          });
        }, 300); 
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
/**
 * admin account
 */
const student_manager = document.querySelector(".Student"),
  company_manager = document.querySelector(".Company"),
  business_manager = document.querySelector(".BussinessProfiles"),
  transaction = document.querySelector(".Transaction"),
  statistical = document.querySelector(".Statistics");

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
  if (business_manager) {
    business_manager.addEventListener('click', function () {
      console.log('business manager page');
      window.location.href = "/admin/business-profiles"
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
/**
 * for student and company account
 */
const student_homepage = document.querySelector(".Home"),
  myintern_page = document.querySelector(".MyInternshipApps"),
  applied_page = document.querySelector(".InternshipApplications"),
  dashboard = document.querySelector(".Dashboard");


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
            console.log('Business ID:', businessId);

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

  if(dashboard){
    dashboard.addEventListener('click', function () {
      console.log('Dashboard page');
      window.location.href = "/home/dashboard"
    });
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
      console.error("Error:", error);
    });

}

function getprofilebyId(id) {
  window.location.href = "/profile/" + id;
}

function viewRepresentatives(id) {
  window.location.href = "/home/business/" + id + "/representatives";
}

function viewRepresentatives_byAdmin(event, id) {
  event.stopPropagation();
  window.location.href = "/home/business/" + id + "/representatives";
}

function getBusinessById(id) {
  console.log(id)
  window.location.href = "/home/business/" + id;
}

function editByBussinessId(id) {
  console.log("/home/business-edit/edit/" + id)
  window.location.href = "/home/business-edit/edit/" + id;
}

function getBusinessById_admin(event, id) {
  event.stopPropagation();
  window.location.href = "/admin/business-profile-details/" + id;
}

function getBusinessPageById_admin(id) {
  console.log(id)
  window.location.href = "/home/business/" + id;
}

// function callback(url) {
//   window.location.href = url;
// }

var global_id = "";
var end_point = "";
const delete_modal = document.querySelector("#deleteModal");

const delete_btn = document.querySelector("#confirm_delete")

if (delete_btn) {
  delete_btn.addEventListener("click", () => { deletecoursebyId( end_point, global_id) })
}

function lock_unlock_Account(accountid) {
  console.log(accountid)
  fetch("/lock_account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ accountID: accountid }) 
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        window.location.reload();
      }

    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

/** filter */
const filter = document.getElementById('filterForm');

// if(filter){

//   filter.addEventListener('submit', function (e) {
//     e.preventDefault();

//     const params = {};
//     const industry = document.getElementById('filterIndustry').value.trim();
//     const size = document.getElementById('filterSize').value.trim();
//     const isVerified = document.getElementById('filterIsVerified').value.trim();

//     if (industry) params.industry = industry;
//     if (size) params.size = size;
//     if (isVerified) params.isVerified = isVerified;

//     const queryString = new URLSearchParams(params).toString();
//     const url = queryString ? `/home/business?${queryString}#allCompanies` : '/home/business#allCompanies';

//     console.log('Redirecting to:', url);
//     window.location.href = url;
//   });

//   document.getElementById('showAllBtn').addEventListener('click', function () {
//     window.location.href = '/home/business#allCompanies';
//   });

//   // Scroll to the "All List of Company" section if the URL contains the hash
//   if (window.location.hash === '#allCompanies') {
//     document.getElementById('allCompanies').scrollIntoView();
//   }
// }

if (filter) {
  filter.addEventListener('submit', function (e) {
    e.preventDefault();

    const params = {};
    const industry = document.getElementById('filterIndustry').value.trim();
    const size = document.getElementById('filterSize').value.trim();
    const isVerified = document.getElementById('filterIsVerified').value.trim();

    if (industry) params.industry = industry;
    if (size) params.size = size;
    if (isVerified) params.isVerified = isVerified;

    // phân trang nếu có tham số
    const page = new URLSearchParams(window.location.search).get('page') || 1;
    const limit = new URLSearchParams(window.location.search).get('limit') || 3;
    params.page = page;
    params.limit = limit;

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
 * Pagination
 */
pagi = document.querySelector('.pagination');
if (pagi) {
  document.querySelectorAll('.pagination a.page-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);
      const page = this.getAttribute('href').split('page=')[1].split('&')[0];
      const limit = urlParams.get('limit') || 3;

      urlParams.set('page', page);
      urlParams.set('limit', limit);

      const queryString = urlParams.toString();
      const url = queryString ? `/home/business?${queryString}#allCompanies` : '/business#allCompanies';

      console.log('Redirecting to:', url);
      window.location.href = url;
    });
  });
}

/** 
 * Fav list
 */
async function saveFavoriteCompany(event, companyId) {
  event.stopPropagation();
  try {
    const response = await fetch('/home/toggle-favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyId }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      showflashmessage(result.status, result.message);
      // update icon
      const heartIcon = document.getElementById(`heart-${companyId}`);
      console.log('Heart icon:', heartIcon);
      if (result.action === 'added') {
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa');
        heartIcon.classList.add('clicked');
      } else if (result.action === 'removed') {
        heartIcon.classList.remove('fa');
        heartIcon.classList.add('fa-regular');
        heartIcon.classList.remove('clicked');
      }
    } else {
      showflashmessage(result.status, result.message);
    }
  } catch (error) {
    console.error('Error saving favorite company:', error);
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
            applicationCount.textContent = unreadCount;
          }

          if (updateDropdown) {
            applicationsList.innerHTML = ''; // Làm trống danh sách cũ

            // thông báo liên quan trạng thái lock/unlock business profile
            if (data.notificationMessage) {
              console.log('Notification lock:', data.notificationMessage);
              const notificationItem = document.createElement('li');
              notificationItem.className = 'list-group-item list-group-item-warning';
              notificationItem.innerHTML = `
                <div>
                  <strong>Notification:</strong> ${data.notificationMessage}
                </div>
                <div class="text-muted" style="font-size: 0.8em;">
                  ${new Date().toLocaleString()}
                </div>
              `;
              notificationItem.style.cursor = 'pointer';
              // notificationItem.addEventListener('mouseover', () => {
              //   notificationItem.style.backgroundColor = '#f0f0f0';
              // });
              // notificationItem.addEventListener('mouseout', () => {
              //   notificationItem.style.backgroundColor = '';
              // });
              notificationItem.addEventListener('click', () => {
                window.location.href = `/home/business/${businessId}`;
              });
              applicationsList.appendChild(notificationItem);
              // data.company.isViewedByCompany = true;
            }

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

/**
 * response application processing
 */

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
                    ${new Date(feedback.responseAt).toLocaleString()}
                  </div>
                `;
                listItem.addEventListener('click', function() {
                  window.location.href = '/home/my-application-list';
                });
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
      // feedbackCount.textContent = '0';
      fetch(`/home/student/applications/viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            console.log('STUDENT Applications marked as viewed');
            feedbackCount.textContent = '0';
          } else {
            console.error('Error marking applications as viewed:', data.message);
          }
        })
        .catch(error => {
          console.error('Error marking applications as viewed:', error);
        });
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
 * add repres
 */
const addRepresentativeForm = document.getElementById('addRepresentativeForm');

if(addRepresentativeForm){
  document.addEventListener('DOMContentLoaded', function () {  
    addRepresentativeForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const email = document.getElementById('representativeEmail').value;
  
      try {
        const response = await fetch(`/home/business/${businessId}/add-representative`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        const result = await response.json();
        if (result.status === 'success') {
          showflashmessage(result.status, result.message);
          window.location.reload(); // Reload lại trang để cập nhật
        } else {
          showflashmessage(result.status, result.message);
        }
      } catch (error) {
        console.error('Error adding representative:', error);
        showflashmessage(result.status, result.message);
      }
    });
  });  
}

/**
 * delete repres
 */
let representativeIdToRemove = null;

function setRemoveRepresentative(repId, repName) {
  representativeIdToRemove = repId;
  document.getElementById('representativeName').textContent = repName; // Hiển thị tên trên modal
}

async function removeRepresentative() {
  if (!representativeIdToRemove) return;

  try {
    const response = await fetch(`/home/business/${companyId}/representatives/${representativeIdToRemove}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (result.status === 'success') {
      showflashmessage(result.status, result.message);
      window.location.reload();
    } else {
      showflashmessage(result.status, result.message);
    }
  } catch (error) {
    console.error('Error removing representative:', error);
    showflashmessage('error', 'An error occurred while removing the representative!');
  }
}

/**
 * verify profile
 */
function toggleVerification(companyId, isVerified) {
  fetch(`/admin/business/${companyId}/verify`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isVerified }) // Gửi status
  })
  .then(response => response.json())
  .then(data => {
      if (data.status === 'success') {
          location.reload();
      } else {
          showflashmessage('error', 'Failed to update verification status!');
      }
  })
  .catch(error => {
      showflashmessage('error', 'An error occurred while updating verification status' + error.message);
      console.error('Error:', error);
  });
}

/**
 * gỡ hồ sơ doanh nghiệp
 */
async function toggleLockProfile(companyId, lock) {
  try {
    const response = await fetch(`/admin/business/${companyId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isLocked: lock }),
    });

    const result = await response.json();
    if (result.status === 'success') {
      showflashmessage('success', response.message);
      location.reload();
    } else {
      showflashmessage('error', `Failed to ${lock ? 'remove' : 'unlock'} company profile: ${result.message}`);
    }
  } catch (error) {
    console.error('Error locking profile:', error);
    showflashmessage('error', 'An error occurred while locking the profile!');
  }
}

/**
 * zoom image (admin)
 */
function showImageModal(imageSrc) {
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imageSrc;

  // Wait for the image to load to get its dimensions
  modalImage.onload = function() {
      const modalDialog = document.querySelector('#imageModal .modal-dialog');
      modalDialog.style.width = 'auto';
      modalDialog.style.maxWidth = '90%';
  };

  const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
  imageModal.show();
}

/**
 * star showing in main page
 */
function renderStars(rating) {
  const fullStar = '<i class="fas fa-star" style="color: gold; margin-right: 2px;"></i>'; // Sao đầy
  const halfStar = '<i class="fas fa-star-half-alt" style="color: gold; margin-right: 2px;"></i>'; // Sao nửa
  const emptyStar = '<i class="far fa-star" style="color: gold; margin-right: 2px;"></i>'; // Sao rỗng (outline)

  let stars = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = (rating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  console.log('Rating:', rating);
  console.log('Full:', fullStars, 'Half:', hasHalfStar, 'Empty:', emptyStars);

  for (let i = 0; i < fullStars; i++) {
    stars += fullStar;
  }

  if (hasHalfStar) {
    stars += halfStar;
  }

  for (let i = 0; i < emptyStars; i++) {
    stars += emptyStar;
  }

  return stars.trim();
}

/**
 * Scroll top button
 */
const scrollTopButton = document.querySelector('.scroll-top');

if(scrollTopButton){
  document.addEventListener('DOMContentLoaded', function () {
    let scrollableDiv = document.querySelector('.home-section');
  
  
    scrollableDiv.addEventListener('scroll', function () {
      toggleScrollTopButton();
    });
  
    scrollTopButton.addEventListener('click', function () {
      scrollToTop();
    });
  
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
      }
    }
  
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
          header.classList.add("scrolled");
      } else {
          header.classList.remove("scrolled");
      }
  });
  // gọi hàm renderStars
  document.querySelectorAll('.stars').forEach(function(starContainer) {
    const rating = parseFloat(starContainer.getAttribute('data-rating'));
    starContainer.innerHTML = renderStars(rating);
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
