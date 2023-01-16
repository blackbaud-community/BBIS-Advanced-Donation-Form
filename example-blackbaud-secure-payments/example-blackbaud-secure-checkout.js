// Let's be good developers and not pollute the global namespace
(function($) {

// Let's make sure the DOM is ready
$(function() {

  // Create an instance of the DonationService
    var ds = new BLACKBAUD.api.DonationService(
      $('.BBDonationApiContainer').data('partid')
    );
	InitializeBBCheckout();
  // Create the donation object we'll send
  // In order to simplify our examples, some of this information is hard-coded.
  var donation = {
    MerchantAccountId: '00000000-0000-0000-0000-000000000000',
    BBSPReturnUri: window.location.href,
    BBSPTemplateSitePageId: 000,
    Gift: {
      PaymentMethod: 0,
      Designations: [
        {
          Amount: 5.00,
          DesignationId: '00000000-0000-0000-0000-000000000000'
        }
      ]
    }
  };

  // Create our success handler
  var success = function(returnedDonation) {
    console.log(returnedDonation);
  };

  // Create our error handler
  var error = function(returnedErrors) {
    console.log('Error!');
  };
  
    
  
  //this is the function that calls the payment api to open the checkout pop up with all the parameters
    this.makePayment = function () {
        var donor = donation.Donor;
        bbcheckout.Configuration.Data.Amount = "5.00";
        bbcheckout.Configuration.Data.BillingAddressCity = donor.Address.City;
        bbcheckout.Configuration.Data.BillingAddressCountry = donor.Address.Country;
        bbcheckout.Configuration.Data.BillingAddressLine = donor.Address.StreetAddress;
        bbcheckout.Configuration.Data.BillingAddressPostCode = donor.Address.PostalCode;
        bbcheckout.Configuration.Data.BillingAddressState = donor.Address.State;
        bbcheckout.Configuration.Data.BillingAddressEmail = donor.EmailAddress;
        bbcheckout.Configuration.Data.BillingAddressFirstName = donor.FirstName;
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
        bbcheckout.Configuration.Data.IsEmailRequired = CheckoutModel.IsEmailRequired;
        bbcheckout.Configuration.Data.IsNameVisible = CheckoutModel.IsNameVisible;
        bbcheckout.Configuration.Data.PrimaryColor = CheckoutModel.PrimaryColor;
        bbcheckout.Configuration.Data.SecondaryColor = CheckoutModel.SecondaryColor;
        bbcheckout.Configuration.Data.FontFamily = CheckoutModel.FontFamily;
        bbcheckout.Configuration.Data.UseCaptcha = CheckoutModel.UseCaptcha;
        bbcheckout.Configuration.WorkflowType = CheckoutModel.WorkFlowType;
        bbcheckout.Configuration.HandelBrowserClosing = CheckoutModel.HandleBrowserClosing;
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
     
  
	 //use this method for credit card payment through popup
    function ProcessCCPayment() {
        
            onValidationSuccess = function (result) {
			
            makePayment();
            return false;
        };
        onValidationFailed = function (error) {
            console.log(error);
        };

        ds.validateDonationRequest(donation, onValidationSuccess, onValidationFailed);

    }

  // Attach our event listener to the donate button
  $('.btn-donate').click(function(e) {

    // Stop the button from submitting the form
    e.preventDefault(); 

    // Add the information our user has typed
    donation.Donor = {
      FirstName: $('#first-name').val(),
      LastName: $('#last-name').val(),
      Address: {
        StreetAddress: $('#address').val(),
        City: $('#city').val(),
        State: $('#state').val(),
        PostalCode: $('#zip').val(),
        Country: $('#country').val()
      }
    };

    // Send the donation
	ProcessCCPayment()
  });

});
}(jQuery));