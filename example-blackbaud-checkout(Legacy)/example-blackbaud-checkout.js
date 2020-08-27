(function ($) {

 // Create an instance of the DonationService
  var ds = new BLACKBAUD.api.DonationService(
  $('.BBDonationApiContainer').data('partid')),
         serverMonth = $(".BBDonationApiContainer").attr("serverMonth") - 1,
         serverDay = $(".BBDonationApiContainer").attr("serverDay"),
         serverYear = $(".BBDonationApiContainer").attr("serverYear"),
         ServerDate = new Date(serverYear, serverMonth, serverDay);
		 
  var donationAmount = getDonationAmount();
        var numberOfInstallments = $("#number-of-installments").val();
        var installmentAmount = ds.getRecurringGiftInstallmentAmount(donationAmount, numberOfInstallments);
        var installmentAmt = installmentAmount;

  //Create the donation object we'll send
  //In order to simplify our examples, some of this information is hard-coded.
  var donation = {
  MerchantAccountId: '00000000-0000-0000-0000-000000000000',
  BBSPReturnUri: window.location.href,
  BBSPTemplateSitePageId: 000,
  PartId: $('.BBDonationApiContainer').data('partid'),
  Gift: {
        PaymentMethod: 0,
        Designations: []
      }
  };

  // Create our success handler
  var success = function (returnedDonation) {
  console.log(returnedDonation);
  };   

  // Create our error handler
  var error = function (returnedErrors) {
  console.log('Error!');
  };
 
//Checkout Payment popup is loaded in this form.
    if ($('form[data-formtype="bbCheckout"]').length <= 0) {
        var form = '<form method=\'get\' id=\"paymentForm\" data-formtype=\'bbCheckout\' data-disable-submit=\'false\' novalidate><\/form>';
        $('body').append(form);
    }


    $("#paymentForm").submit(function paymentComplete(e) {
        // prevent form from refreshing and show the transaction token
        e.preventDefault();
    });

	
	 var  SrtDt, publicKey, donationData, EditorContent, ServerDate,
        checkoutGenericError = "There was an error while performing the operation.The page will be refreshed";
		
	//return the donation amount	
	function getDonationAmount() {
    if ($("#amtOther").prop("checked")) {
         return $("#txtAmount").val();
    } else {
         return $("[name='radioAmount']:checked").val();
        }
    }
	
	 //Handle Generic error 
    function handleError(errorMessage) {
        $("#bbspLoadingOverlay").hide();
        alert(checkoutGenericError);
        location.reload(true);
    }

    //#region CCCheckoutPayment

	//return which payment method is selected on the page
    function GetPaymentType() {
        paymentMethod = $("[name='paymentMethod']:checked").val();
        return paymentMethod;
    }

	//set the public key by using public key service that is used to open the checkout pop up
    function GetPublicKey() {
     
    onPublicKeySuccess = function (reply) {
        publicKey = JSON.parse(reply.Data).PublicKey;
    };
    
	onPublicKeyFailure = function (d) {
    };
    
	ds.getCheckoutPublicKey(onPublicKeySuccess, onPublicKeyFailure);

    }


	//get all the information that is configured on the editor used to open the checkout pop up
    function GetEditorInformation(partId) {

        onEditorContentSuccess = function onSuccess(content) {
            donation.MerchantAccountId = content.MerchantAccountID;
            EditorContent = content;
        };

        onEditorContentFailure = function onFail(error) {
        };

        ds.getADFEditorContentInformation(partId, onEditorContentSuccess, onEditorContentFailure);

    }


    function getUrlVars(url) {
        var vars = [], hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

	//this is the function that calls the payment api to open the checkout pop up with all the parameters
    this.makePayment = function () {
        opened = false;

        var checkout = new SecureCheckout(handleCheckoutComplete, handleCheckoutError, handleCheckoutCancelled, handleCheckoutLoaded);
        var donor = data.Donor;
		var selectedCountry=$("#country :selected").attr("iso");
		var selectedState=$("#state :selected").attr("iso");
		
		if(selectedCountry && selectedCountry=="GB")
		{
			selectedCountry="UK";
		}
        donationData = {
            "key": publicKey,
            'Amount': ($("#recMonthly").prop("checked")) ? installmentAmt : getDonationAmount(),
            'UseCaptcha': EditorContent.RecaptchRequired,
            'BillingAddressCity': donor.Address.City,
            'BillingAddressCountry': selectedCountry,
            'BillingAddressLine': donor.Address.StreetAddress,
            'BillingAddressPostCode': donor.Address.PostalCode,
            'BillingAddressState': selectedState,
            'BillingAddressEmail': donor.EmailAddress,
            'BillingAddressFirstName': donor.FirstName + " " +donor.MiddleName,
            'BillingAddressLastName': donor.LastName,
            'Cardholder': donor.FirstName + " " + donor.LastName,
            'ClientAppName': 'BBIS',
            'MerchantAccountId': EditorContent.MerchantAccountID,
            'IsEmailRequired': true,
            'PrimaryColor': EditorContent.PrimaryFontColor,
            'SecondaryColor': EditorContent.SecondaryFontColor,
            'FontFamily': EditorContent.FontType,
            'IsNameVisible': true,
          'UseVisaCheckout': EditorContent.UseVisaPass && (data.Gift && !data.Gift.Recurrence),
          'UseMasterpass': EditorContent.UseMasterPass && (data.Gift && !data.Gift.Recurrence),
          'UseApplePay': EditorContent.UseApplePay && (data.Gift && !data.Gift.Recurrence)
        };
       if (data.Gift && data.Gift.Recurrence )
		{
			donationData.CardToken = EditorContent.DataKey;
		}

        //check server date and start date here -- if same then make transaction today
        if (data.Gift && data.Gift.Recurrence && !data.Gift.Recurrence.ProcessNow) {
            return checkout.processStoredCard(donationData);
        }
        else {

            return checkout.processCardNotPresent(donationData);
        }
    }

	//to check for recurring gift that is to be processed today or not (this is check for call stored card payment api)
    function isProcessNow() {
        var recStartDate = $("#start-date").val()
        var frequency = $("#frequency").val();
        var dayOfMonth = $('#day-of-month').val();
        var dayOfWeek = $("#day-of-week").val();
        var month = $('#month').val();

        var startDateIsTodayDate = false;

        var recurrrentStartDate = new Date(recStartDate);

        var isProcessedNow = false;

        var serverDate = new Date(ServerDate);


        if (
            recurrrentStartDate.getFullYear() === serverDate.getFullYear() &&
            recurrrentStartDate.getMonth() === serverDate.getMonth() &&
            recurrrentStartDate.getDate() === serverDate.getDate()
        ) {
            startDateIsTodayDate = true;
        }
        else {

            return false;
        }

        //Weekly Frequency
        if (frequency == 1) {
            isProcessedNow = startDateIsTodayDate && dayOfWeek == serverDate.getDay();
        }
        //Mothly and Quarterly frequency
        else if (frequency == 2 || frequency == 3) {
            isProcessedNow = startDateIsTodayDate && dayOfMonth == serverDate.getDate();
        }
        //Annually frequency
        else if (frequency == 4) {

            isProcessedNow =
                startDateIsTodayDate
                && dayOfMonth == serverDate.getDate()
                && month == serverDate.getMonth() + 1;
        }
        //Every 4 weeks
        else if (frequency == 7) {
            isProcessedNow = startDateIsTodayDate;
        }
        else {
            isProcessedNow = false;
        }

        return isProcessedNow;


    };

	//when checkout popup is successfully loaded
    handleDonationCreated = function (data) {
        var orderID = JSON.parse(data.Data).OrderId;
    }

	//when checkout popup is fail to load
    this.handleDonationCreateFailed = function (error) {
        handleError(error);
    }

	//when the payment is successfully completed and we have to show the confirnmation screen
    this.handlePaymentComplete = function (data) {
        $("#bbspLoadingOverlay").hide();
        //confirmation message show here
		//donationform
        $(".form").hide();
		//confirmation div
        $(".confirmation").show();

       $(".confirmation").html(JSON.parse(data.Data).confirmationHTML);
    }

	//this function called when the checkout popup is loaded on a page
    function handleCheckoutLoaded() {

        if (!opened) {

            opened = true;
            var url = $("#bbCheckoutPaymentIframe").prop('src');
            var tid = getUrlVars(url)["t"];

            //save transaction id in global variable. Will be used throughout the transaction
            this.transactionIDl = tid;

            if (tid) {
                data.TokenId = tid;
                ds.checkoutDonationCreate(data, handleDonationCreated, handleDonationCreateFailed);
                return false;
            }
        }

        return false;
    }

	//when we cancel the payment pop up then unbind all the binded events on checkout popup
    function UnBindPaymentCheckoutEvents() {
        $(document).unbind("checkoutComplete");
        $(document).unbind("checkoutLoaded");
        $(document).unbind("checkoutError");
        $(document).unbind("checkoutCancel");
    }

	//this is called when the payment is completed
    function handleCheckoutComplete(event, tranToken) {
        $("#bbspLoadingOverlay").show();
		var Id=tranToken ? tranToken :(event?(event.detail?(event.detail.transactionToken?event.detail.transactionToken:null):null):null);
        if (Id) {
            data.TokenId = Id;
            ds.checkoutDonationComplete(data, handlePaymentComplete, handleDonationCreateFailed);
        }
        else {
            handleError();
        }
		UnBindPaymentCheckoutEvents();
        return false;
    }

	//call when there is any error while doing the payment on checkout pop up
    handleCheckoutError = function (event, errorMsg, errorCode) {
        handleError(errorMsg);
    }

    //Cancel Donation if user close checkout popup
    function handleCheckoutCancelled() {
        try {
            ds.checkoutDonationCancel(data, onSuccess, onFail);
        }
        catch (e) {
            //do not store this error. Already stored from server side
        }
        UnBindPaymentCheckoutEvents();
    }

	//this function call when we click on donate button
	function sendData() {
        if (EditorContent && EditorContent.MACheckoutSupported && GetPaymentType() == 0) {
            ProcessCCPayment();
        }
    }
	
	 //use this method for credit card payment through popup
    function ProcessCCPayment() {
        
        data = donation;

            onValidationSuccess = function (result) {
            makePayment();
            return false;
        };
        onValidationFailed = function (error) {
            console.log(error);
        };

        ds.validateDonationRequest(data, onValidationSuccess, onValidationFailed);

    }
	
	//Call some functions       
        GetEditorInformation($('.BBDonationApiContainer').data('partid'));
        GetPublicKey();
		
		
	// Attach our event listener to the donate button
    $('.btn-donate').click(function(e) {
      
      // Stop the button from submitting the form
      e.preventDefault(); 
	  sendData();
	  });
		
}(jQuery));
