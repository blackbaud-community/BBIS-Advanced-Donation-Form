// Let's be good developers and not pollute the global namespace
(function($) {

// Let's make sure the DOM is ready
$(function() {

  var designationQueryId = "00000000-0000-0000-0000-000000000000";  /* Ad-hoc Query of Designation Type With Enable query for CMS REST API */
  var service = new BLACKBAUD.api.QueryService();
  
  // Load Designation(s)
  service.getResults(designationQueryId, function (d) {
		var rows = d.Rows;
		$.each(rows, function () {
			var values = this['Values'];
			$("#designation").append($("<option></option>").val(values[0]).text(values[1]));
		});
	}, null, [statusFilter]);   
  });

});
}(jQuery));