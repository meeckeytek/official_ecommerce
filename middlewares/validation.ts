// validate user registration inputs
const userInputValidation = (
    firstname,
    lastname,
    email,
    phone,
    dob,
    address,
    password,
    confirmPassword
  ) => {
    const errors = {};
  
    if (firstname.trim() === "") {
      errors.firstname = "First name is requred";
    }
  
    if (lastname.trim() === "") {
      errors.lastname = "Last name is requred";
    }
    if (email.trim() === "") {
      errors.email = "Email is requred";
    } else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = "Please supply a valid email address";
      }
    }
  
    if (phone.trim() === "") {
      errors.phone = "Phone number is requred";
      if (phone.length > 10) {
        errors.phone = "Supply a valid phone number";
      }
    }
  
    if (dob.trim() === "") {
      errors.dob = "Date of birth is requred";
      if (dob.length < 5) {
        errors.dob = "Supply a valid data of birthd i.e. 20-10-2020";
      }
    }
  
    if (address.trim() === "") {
      errors.address = "Address is requred";
      if (address.length < 7) {
        errors.phone = "Supply a valid address";
      }
    }
    if (password === "") {
      email.password = "Password is required";
    } else {
      const regEx = /^(.{0,6}|[^0-9]*|[^A-Z]*|[a-zA-Z0-9]*)$/;
      if (!password.match(regEx)) {
        errors.password =
          "Your password must include at least one upper case, one special character and it must me more than 5 characters.";
      }
      if (password.length < 7) {
        errors.password = "Your password must be at least 6 characters";
      }
    }
  
    if (password !== confirmPassword) {
      errors.confirmPassword = "Password and confirm password do not match";
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };
  