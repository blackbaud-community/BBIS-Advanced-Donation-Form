// Let's be good developers and not pollute the global namespace
(function($) {

// Let's make sure the DOM is ready
$(function() {

  var selectCountry = $('#country');
  var selectState = $('#state');
  
  // Load Countries
  $.get(BLACKBAUD.api.pageInformation.rootPath + '/webapi/country', function(countries) {
    for (var i = 0, j = countries.length; i < j; i++) {
      selectCountry.append('<option value="' + countries[i].Id + '">' + countries[i].Description + '</option>');
    }
  });
  
  // Watch Countries Change
  $('.countries').on('change', function() {
  
    // Load States
    $.get(BLACKBAUD.api.pageInformation.rootPath + '/webapi/country/' + $(this).val(), function(states) {
      selectState.html('');
      for (var i = 0, j = states.length; i < j; i++) {
        selectState.append('<option value="' + states[i].Id + '">' + states[i].Description + '</option>');
      }
    });
  });

});
}(jQuery));
