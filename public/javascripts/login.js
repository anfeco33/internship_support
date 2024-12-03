const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".login_page");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});


const login_form = document.querySelector('.sign-in-form');

const signup_form = document.querySelector('.sign-up-form');

if (login_form) {
  const sendOtpButton = document.getElementById('send-otp-btn');
  const otpField = document.getElementById('otp-field');
  const passwordField = document.getElementById('admin-password-field');

  login_form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById('otp_email').value.trim();
      const otpInput = document.getElementById('otp_code')?.value.trim();
      const passwordInput = document.getElementById('admin_password')?.value.trim();

      if (sendOtpButton.textContent === 'Continue') {
          fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailInput })
          })
          .then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  otpField.style.display = 'block';
                  sendOtpButton.textContent = 'Login';
              } else if (data.status === 'requirePassword') {
                  passwordField.style.display = 'block';
                  sendOtpButton.textContent = 'Login';
              } else {
                  showflashmessage(data.status, data.message);
              }
          })
          .catch(error => console.error('Error:', error));
      } else if (sendOtpButton.textContent === 'Login') {
            const requestBody = passwordInput
                ? { email: emailInput, password: passwordInput }
                : { email: emailInput, otp: otpInput };
        
            fetch('/login/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
            .then(response => response.json())
            .then(data => {
                showflashmessage(data.status, data.message);
    
                if (data.status === 'success') {
                    window.location.href = data.redirect;
                }
            })
            .catch(error => {
                console.error('Unexpected Error:', error);
                showflashmessage('error', 'Something went wrong. Please try again.');
            });
        }
  });
} else {
  console.error('Login form not found');
}

  //old
//   login_form.addEventListener("submit", (event) => {
//     event.preventDefault();
//     console.log("here aa");

//     const usname = document.getElementById('username').value;
//     const pass = document.getElementById('password').value;
//     const data = {
//       username: usname,
//       password: pass,
//     };
//     console.log(data);

//     fetch("/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(data)
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log(data);
//         if (data.status === "success") {
//           window.location.href = data.redirect;
//         } else {
//           showflashmessage(data.status, data.message);
//         }
//       })
//       .catch(function (error) {
//         console.error("Error:", error);
//       });
//   });
// } else {
//   console.error("err");
// }


if (signup_form) {
  signup_form.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("here");

    const usname = document.getElementById('sign_username').value;
    const email = document.getElementById('sign_email').value;
    const pass = document.getElementById('sign_password').value;
    const confirm_pass = document.getElementById('sign_confirmpassword').value;
    if(confirm_pass != pass){
      showflashmessage("warning", "Password and Confirm password do not match");
    }else{
      const accountTypeElement = document.querySelector('input[name="account_type"]:checked');
      const accountType = accountTypeElement ? accountTypeElement.value : '';
      const data = {
        username: usname,
        email: email,
        password: pass,
        accountType: accountType
      };
      console.log(data);
  
      fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.status === "success") {
            window.location.href = data.redirect;
          } 
          showflashmessage(data.status, data.message);
        })
        .catch(function (error) {
          console.error("Error:", error);
        });
    }
    
  });
} else {
  console.error("err");
}


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
