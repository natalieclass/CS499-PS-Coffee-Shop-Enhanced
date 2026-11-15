//submit info
$('#CreateNewAcc').click(function(){
location.assign("http://localhost:6363"+"/CreateAccount");
alert("Redirecting you to new page.");
});

$('#signin').click(function(){
  var email = $('#email').val();
  var password = $('#password').val();

  var signInString = {email:email, password:password};

  $.ajax({
      url: "http://localhost:6363" + "/sign-in",
      type: "post",
      data: signInString,
      success: function(res){
        localStorage.setItem("userID", res.userID);
        location.replace("http://localhost:6363/PSDashboard");
      },
      error: function(xhr){
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Sign in failed");
      }
  });
  return false;
});

//Refernce: https://www.w3schools.com/howto/howto_js_toggle_password.asp
$('#showPass').click(function(){
var pass=document.getElementById("password");
  if(pass.type==="password"){
    pass.type="text";
  } else{
    pass.type="password";
  }
});
