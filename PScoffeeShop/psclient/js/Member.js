function editInfo(){
document.getElementById("memberInfoFS").disabled = false;
document.getElementById("submitNewInfo").hidden = false;
};

$('#submitNewInfo').click(function(){
localStorage.getItem("userID");
console.log(localStorage.getItem("userID"));
var userData=localStorage.getItem("userID");
var jsonString={userID:userData};
    var email = $('#email').val();
		var firstName = $('#firstName').val();
		var lastName = $('#lastName').val();
		var password = $('#password').val();
		var phone = $('#phone').val();
		var street= $('#street').val();
		var city= $('#city').val();
		var state= $('#state').val();
		var zipCode= $('#zipCode').val();
		var country= $('#country').val();


	var newString = {userID:userData, email: email, password: password, firstName: firstName, lastName: lastName, phone: phone, street:street, city:city, state:state, zipCode:zipCode, country:country};

console.log(jsonString);
console.log(newString);

  $.ajax({
      url: "http://localhost:6363" + "/memberInformationEdit",
      type: "put",
      data: newString,
        success: function(res){
          document.getElementById("submitNewInfo").hidden = true;
          document.getElementById("memberInfoFS").disabled = true;
        }, error: function(xhr){
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Update failed");
        }
});
return false;
});

localStorage.getItem("userID");
console.log(localStorage.getItem("userID"));
var userData=localStorage.getItem("userID");
var jsonString={userID:userData};

console.log(userData);
console.log(jsonString);

$.ajax({
      url: "http://localhost:6363" + "/memberInformation",
      type: "get",
      data: jsonString,
        success: function(res){
          $('#email').val(res.email);
          $('#firstName').val(res.firstName);
          $('#lastName').val(res.lastName);
          $('#phone').val(res.custPhone);
          $('#street').val(res.street);
          $('#city').val(res.city);
          $('#state').val(res.state);
          $('#zipCode').val(res.zipCode);
          $('#country').val(res.country);
      }, error: function(xhr){
        alert(xhr.responseJSON ? xhr.responseJSON.message : "Could not load member information");
      }
  });
