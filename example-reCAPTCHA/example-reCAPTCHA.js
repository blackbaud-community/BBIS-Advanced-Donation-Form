// Declaring global variable for div of google recaptcha
var recaptchadiv = document.getElementById('g_captcha');
var responseCaptcha = null;
// handle click funtion to to display captcha
function handleRadioClickEvent(myRadio) {
	if(myRadio.value == '1'){
		ResetGoogleRecaptchaDivStyle();
		GoogleRecaptchaRender();
	}
	else {
		HideGoogleRecaptchaDiv();
	}
}

// binding captcha   
function GoogleRecaptchaRender() {
		grecaptcha.render('g_captcha', {
		'sitekey': CheckoutModel.SiteKey,
		'theme': 'light',  // optional
		'callback': 'onloadCallback'  
	});
}

// function to hide captcha
function HideGoogleRecaptchaDiv() {
	recaptchadiv.style.visibility = 'hidden';
	recaptchadiv.style.display ='none';
}

//function to reset captcha div style
function ResetGoogleRecaptchaDivStyle() {
	recaptchadiv.style.visibility = '';
	recaptchadiv.style.display ='';
}

// check client side validation of google recaptcha
	if ($("#paymentBillMeLater").prop("checked") && CheckoutModel.SiteKey!= null){    
	responseCaptcha = grecaptcha.getResponse();
	if(responseCaptcha==""){
		errs += "CAPTCHA validation is required."
	}
	}
  
// sending the response token to validate on server side
	data.ResponseToken = responseCaptcha;