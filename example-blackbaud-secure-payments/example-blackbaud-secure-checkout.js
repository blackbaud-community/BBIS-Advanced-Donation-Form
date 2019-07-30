// Let's be good developers and not pollute the global namespace
(function($) {

// Let's make sure the DOM is ready
$(function() {

  // Create an instance of the DonationService
    var ds = new BLACKBAUD.api.DonationService(
      $('.BBDonationApiContainer').data('partid')
    );

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
  
  
  
  //set the public key by using public key service that is used to open the checkout pop up
    function GetPublicKey() {
    
    onPublicKeySuccess = function (reply) {
        publicKey = JSON.parse(reply.Data).PublicKey;
    };
   
	ds.getCheckoutPublicKey(onPublicKeySuccess, error);
	return publicKey;
    }
  
  
  //this is the function that calls the payment api to open the checkout pop up with all the parameters
    this.makePayment = function () {
        opened = false;
        var donor=donation.Donor;
        var checkout = new SecureCheckout(handleCheckoutComplete, handleCheckoutError, handleCheckoutCancelled, handleCheckoutLoaded);
        donationData = {
            "key": GetPublicKey(),
            'Amount': "5.00",
            'UseCaptcha': true,
            'BillingAddressCity': donor.Address.City,
            'BillingAddressCountry': donor.Address.Country,
            'BillingAddressLine': donor.Address.StreetAddress,
            'BillingAddressPostCode': donor.Address.PostalCode,
            'BillingAddressState': donor.Address.State,
            'BillingAddressEmail': donor.EmailAddress,
            'BillingAddressFirstName': donor.FirstName,
            'BillingAddressLastName': donor.LastName,
            'Cardholder': donor.FirstName + " " + donor.LastName,
            'ClientAppName': 'BBIS',
            'MerchantAccountId': donation.MerchantAccountId,
            'IsEmailRequired': true,
            'PrimaryColor': true,
            'SecondaryColor': true,
            'FontFamily': true,
            'IsNameVisible': true,
          'UseVisaCheckout':true,
          'UseMasterpass': true,
          'UseApplePay': true
        };

            return checkout.processCardNotPresent(donationData);
        }
  
  //when checkout popup is successfully loaded
    handleDonationCreated = function (data) {
        var orderID = JSON.parse(data.Data).OrderId;
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
  
  //this function called when the checkout popup is loaded on a page
    function handleCheckoutLoaded() {

        if (!opened) {

            opened = true;
            var url = $("#bbCheckoutPaymentIframe").prop('src');
            var tid = getUrlVars(url)["t"];

            //save transaction id in global variable. Will be used throughout the transaction
            this.transactionIDl = tid;

            if (tid) {
                donation.TokenId = tid;
                ds.checkoutDonationCreate(donation, handleDonationCreated, error);
                return false;
            }
        }

        return false;
    }

	//when we cancel the payment pop up hen unbind all the binded events on checkout popup
    function UnBindPaymentCheckoutEvents() {
        $(document).unbind("checkoutComplete");
        $(document).unbind("checkoutLoaded");
        $(document).unbind("checkoutError");
        $(document).unbind("checkoutCancel");
    }

	//this is called when the payment is completed
    function handleCheckoutComplete(event, tranToken) {
        
        if (tranToken) {
            donation.TokenId = tranToken;
            ds.checkoutDonationComplete(donation, success, error);
        }
        else {
           console.log(error);
        }
        return false;
    }

	//call when there is any error while doing the payment on checkout pop up
    handleCheckoutError = function (event, errorMsg, errorCode) {
        console.log(error);
    }

    //Cancel Donation if user close checkout popup
    function handleCheckoutCancelled() {
        try {
            ds.checkoutDonationCancel(donation, success, error);
        }
        catch (e) {
            //do not store this error. Already stored from server side
        }
        UnBindPaymentCheckoutEvents();
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