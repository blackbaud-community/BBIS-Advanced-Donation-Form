(function ($) {

 // Create an instance of the DonationService
  var ds = new BLACKBAUD.api.DonationService(
  $('.BBDonationApiContainer').data('partid')),
		 ClientSitesID = $(".BBDonationApiContainer").attr("ClientSitesID");
         CheckoutModel=JSON.parse(checkoutData),
         serverMonth = $(".BBDonationApiContainer").attr("serverMonth") - 1,
         serverDay = $(".BBDonationApiContainer").attr("serverDay"),
         serverYear = $(".BBDonationApiContainer").attr("serverYear"),
         ServerDate = new Date(serverYear, serverMonth, serverDay);
		 InitializeBBCheckout();
  var donationAmount = getDonationAmount();
        var numberOfInstallments = $("#number-of-installments").val();
        var installmentAmount = ds.getRecurringGiftInstallmentAmount(donationAmount, numberOfInstallments);
        var installmentAmt = installmentAmount;

  //Create the donation object we'll send
  //In order to simplify our examples, some of this information is hard-coded.
  var donation = {
  MerchantAccountId: '00000000-0000-0000-0000-000000000000',
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

	
	 var  SrtDt, donationData, ServerDate, ClientSitesID,
        checkoutGenericError = "There was an error while performing the operation. The page will be refreshed";
		
	//return the donation amount	
	function getDonationAmount() {
    if ($("#amtOther").prop("checked")) {
         return $("#txtAmount").val();
    } else {
         return $("[name='radioAmount']:checked").val();
        }
    }
	
	
    //#region CCCheckoutPayment

	//return which payment method is selected on the page
    function GetPaymentType() {
        paymentMethod = $("[name='paymentMethod']:checked").val();
        return paymentMethod;
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

	// this is the function that calls the payment api to open the checkout pop up with all the parameters
    this.makePayment = function () {       
        var donor = data.Donor;
		var selectedCountry=$("#country :selected").attr("iso");
		var selectedState=$("#state :selected").attr("iso");
		
		if(selectedCountry && selectedCountry.toLowerCase() =="gb")
		{
			selectedCountry="UK";
		}
            bbcheckout.Configuration.Data.Amount = ($("#recMonthly").prop("checked")) ? installmentAmt : getDonationAmount();            
            bbcheckout.Configuration.Data.BillingAddressCity = donor.Address.City;
            bbcheckout.Configuration.Data.BillingAddressCountry = selectedCountry;
            bbcheckout.Configuration.Data.BillingAddressLine = donor.Address.StreetAddress;
            bbcheckout.Configuration.Data.BillingAddressPostCode = donor.Address.PostalCode;
            bbcheckout.Configuration.Data.BillingAddressState = selectedState;
            bbcheckout.Configuration.Data.BillingAddressEmail = donor.EmailAddress;
            bbcheckout.Configuration.Data.BillingAddressFirstName = donor.FirstName + " " + (donor.MiddleName ? donor.MiddleName:"");
            bbcheckout.Configuration.Data.BillingAddressLastName = donor.LastName;
            bbcheckout.Configuration.Data.Cardholder = donor.FirstName + " " + donor.LastName;
			bbcheckout.Configuration.Data.UseVisaCheckout = (data.Gift && !data.Gift.Recurrence);
			bbcheckout.Configuration.Data.UseMasterpass = (data.Gift && !data.Gift.Recurrence);
			bbcheckout.Configuration.Data.UseApplePay = (data.Gift && !data.Gift.Recurrence);
            bbcheckout.Configuration.TransactionType = bbcheckout.TransactionType.Card_Not_Present;
            bbcheckout.Configuration.Data.CardToken = null;
	   
        if (data.Gift && data.Gift.Recurrence && !data.Gift.Recurrence.ProcessNow) {
            bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
            bbcheckout.Configuration.TransactionType = bbcheckout.TransactionType.Store_Card; //Store card transactions
        } else if (data.Gift && data.Gift.Recurrence ) {      //Set CardToken value only in case of recurring gifts.
            bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
        }

        //Set Donor Info so that it will be passed to finish the transaction at the end.
		    data.DonationSource = bbcheckout.Configuration.DonationSource.ADF;
		    data.Type=bbcheckout.Configuration.TranType.Donation;
        bbcheckout.DonorInfo = data;
        bbcheckout.openCheckout();
    }
	
	 function InitializeBBCheckout() 
   {
	   
	      bbcheckout = new BBCheckoutProcessor(checkoutFunctions(),CheckoutModel.APIControllerName,CheckoutModel.TokenId,'[class*="donationForm"]');
	      bbcheckout.Configuration.Data.Key = CheckoutModel.PublicKey;
        bbcheckout.Configuration.TransactionType = CheckoutModel.TransactionType;
        bbcheckout.Configuration.Data.ClientAppName = CheckoutModel.ClientAppName;        
        bbcheckout.Configuration.Data.MerchantAccountId = CheckoutModel.MerchantAccountId;
        bbcheckout.Configuration.Data.IsEmailRequired = CheckoutModel.IsEmailRequired;;
        bbcheckout.Configuration.Data.IsNameVisible = CheckoutModel.IsNameVisible;;
        bbcheckout.Configuration.Data.PrimaryColor = CheckoutModel.PrimaryColor;
        bbcheckout.Configuration.Data.SecondaryColor = CheckoutModel.SecondaryColor;
        bbcheckout.Configuration.Data.FontFamily = CheckoutModel.FontFamily;
        bbcheckout.Configuration.Data.UseCaptcha = CheckoutModel.UseCaptcha;
        bbcheckout.Configuration.WorkflowType = CheckoutModel.WorkFlowType;
        bbcheckout.Configuration.HandleBrowserClosing = (CheckoutModel.HandleBrowserClosing === true ? "True" : "False");
        bbcheckout.Configuration.APITokenID = CheckoutModel.TokenId;
	      // You can add your own message to display on screen, after checkout pop-up close
        bbcheckout.Configuration.TempConfirmationHtml = "Thank you for your contribution, please wait while we process your transaction.";
        bbcheckout.intializeCheckout();
   }

function checkoutFunctions()
   {
	  //  If you don't have anything to do then you don't add any events from below mentioned checkoutEvents 
	  checkoutEvents={
		   checkoutComplete : function (e) {
        //Place any code if you want to do anything on checkout complete.

       

        bbcheckout.postCheckoutFinish();
    },

    checkoutError : function (data) {
        //Place any code if you want to do anything on error.
    },

    checkoutExpired : function () {
        //Place any code if you want to do anything on Checkout expired.
    },

    checkoutReady : function () {
        //Place any code if you want to do anything on Checkout Ready.
    },

    browserClose : function () {
        //Place any code if you want to do anything on Checkout Browser closing.

    },

    checkoutCancel : function () {
        //Place any code if you want to do anything on Checkout cancel.
    },

    checkoutLoaded : function () {
        //Place any code if you want to do anything on Checkout loaded.
    }

		  
	  }

return checkoutEvents;	  
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
	
		
	// Attach our event listener to the donate button
    $('.btn-donate').click(function(e) {
      
      // Stop the button from submitting the form
      e.preventDefault(); 
	  sendData();
	  });
		
}(jQuery));
