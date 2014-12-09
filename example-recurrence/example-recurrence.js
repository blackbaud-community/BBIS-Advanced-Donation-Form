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
      
      // The following fields are always required
      donation.Gift.Recurrence = {
        Frequency: $('#frequency').val(),
        StartDate: $('#start-date').val()
      };
      
      // The remaining required values are different depending on what frequency the user selects
      var frequency = $('#frequency').val();
      switch (frequency) {
        case 1:
          donation.Gift.Recurrence.DayOfWeek = $('#day-of-week').val();
        break;
        case 2:
        case 3:
          donation.Gift.Recurrence.DayOfMonth = $('#day-of-month').val();
          // Purposefully letting selection fall through (no "break")
        case 4:
          donation.Gift.Recurrence.Month = $('#month').val();
        break;
      };
        
      // Submit our donation
      ds.createDonation(donation, success, error);
    });
    
  });
}(jQuery));