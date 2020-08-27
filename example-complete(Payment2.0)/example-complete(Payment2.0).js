      
      (function () {
		  
	  /*------------------------------------------- GLOBAL VARIABLE DECLARATION - SECTION START -------------------------------------------*/

      var blocked,
      donationService,
      part,
      partInstanceId,
      addressLinesCaption,
      cityCaption,
      stateCaption,
      postCodeCaption,
      installmentAmt;

      /*------------------------------------------- GLOBAL VARIABLE DECLARATION - SECTION END -------------------------------------------*/


      /*------------------------------------------- JAVASCRIPT - VALIDATION FUNCTIONS - SECTION START -------------------------------------------*/

      function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
      }

      function validatePhone(phone) {
      if (phone) {
      var re = /^[0-9 \+\)\(\-]{6,20}\s?((([xX]|[eE][xX][tT])\.?\s*(\d+))*)$/;
      return re.test(phone);

      } else {

      return true;
      }
      }

      function validateStartDate(startDate) {
      if (startDate) {
      var pattern = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
      return pattern.test(startDate);
      } else {
      return false;
      }
      }

      // this function validate all required fields of donation page
      function validateFormClientSide() {

      $(".validation").html("");
      var errs = "";
      //Amount
      if (getDonationAmount() <= 0) {
      errs += "Gift amount is not valid.<br />";
      }
      //Last Name
      if (!part.find("#lastName").val()) {
      errs += "Last name is required.<br />";
      }
      //Email Address
      if (!validateEmail(part.find("#emailAddress").val())) {
      errs += "Email is not valid.<br />";
      }
      //Street Address
      if (!part.find("#streetAddress").val()) {
      errs += addressLinesCaption + " is required.<br />";
      }
      //City
      if (!part.find("#city").val()) {
      errs += cityCaption + " is required.<br />";
      }
      //Postal Code
      if (!part.find("#postalCode").val()) {
      errs += postCodeCaption + " is required.<br />";
      }
      //Phone
      if (!validatePhone(part.find("#phone").val())) {
      errs += "Phone is not valid.<br />";
      }
      // Organization name
      if (part.find("#isCorporate").prop("checked") && !part.find("#organizationName").val()) {
      errs += "Company name is required if this donation is on behalf of a company";
      }
      // No Of Installation
      if (part.find("#recMonthly").prop("checked") && part.find("#number-of-installments").val() < 2) {
      errs += "Number Of installments should be greater than 1 in case of recurring gift.";
      }

      if (errs === "") {
      return true;
      } else {
      setValidationMessage(errs);
      return false;
      }
      }

      function setValidationMessage(html) {
      part.find(".validation").html(html);
      }

      /*************************************** CONSENT VALIDATION FUNCTIONS - SECTION START ***************************************/

      function consentValidation() {
      $(".consentValidation").html("");
      var errs = "";
      // Consent info
      var solicitCodeCount = $("table[id='consentOption'] tr[isRequired]").length
      if (solicitCodeCount > 0) {
      for (var i = 1; i <= solicitCodeCount; i++) {
      if ($($("#consentOption tr[isRequired]")[i - 1]).attr("isrequired") == "true" && $($("#consentOption tr[isRequired]")[i - 1]).find(':checked').val() === undefined) {
      errs += $($("#consentOption tr[isRequired]")[i - 1]).find("label")[0].innerHTML + " is required.<br />"
      }
      }
      }
      if (errs === "") {
      return true;
      } else {
      setConsentValidationMessage(errs);
      return false;
      }
      }

      function setConsentValidationMessage(html) {
      $(".consentValidation").html(html);
      }

      /*************************************** CONSENT VALIDATION FUNCTIONS - SECTION END ***************************************/

      /*------------------------------------------- JAVASCRIPT - VALIDATION FUNCTIONS - SECTION END -------------------------------------------*/

      /*------------------------------------------- JAVASCRIPT FUNCTIONS - SECTION START -------------------------------------------*/

      function convertErrorToString(error) {
      if (error) {
      if (error.Message) return error.Message;
      switch (error.ErrorCode) {
      case 101:
      return error.Field + " is required.";
      case 105:
      return error.Field + " is not valid.";
      case 106:
      return "Record for " + error.Field + " was not found.";
      case 203:
      return "Donation not completed on BBSP.";
      case 107:
      return "Max length for " + error.Field + " exceeded.";
      default:
      return "Error code " + error.ErrorCode + ".";
      }
      }
      }

      function convertErrorsToHtml(errors) {
      var i, message = "Unknown error.<br />";
      if (errors) {
      message = "";
      for (i = 0; i < errors.length; i++) {
      message = message + convertErrorToString(errors[i]) + "<br />";
      }
      }
      return message;
      }

      // Extract the data entered by the user and fill the result object for transaction processing.
      function extractDataFromForm() {
      var paymentMethod,
      result,
      organizationName = "",
      consentOptions,
      solicitCodeCount;

      if (part.find("#isCorporate").prop("checked")) {
      organizationName = part.find("#organizationName").val();
      }
      paymentMethod = part.find("[name='paymentMethod']:checked").val();
      result = {};

      // Consent Information
      consentOptions = [];
      solicitCodeCount = $("table[id='consentOption'] tr[isRequired]").length;
      if (solicitCodeCount > 0) {
      for (var i = 1; i <= solicitCodeCount; i++) {
      consentOptions.push({
      SolicitCodeID: $("table[id='consentOption'] tr[isRequired]")[i - 1].id,
      IsRequired: $("table[id='consentOption'] tr[isRequired]")[i - 1].isrequired,
      ConsentPreferenceCode: $($("table[id='consentOption'] tr[isRequired]")[i - 1]).find(':checked').val()
      });
      }
      }
      result.ContactConsents = { ConsentPartId: consentPartId, SolicitCodes: consentOptions };
      result.Gift = {      
      PaymentMethod: paymentMethod,
      Designations: [{
      Amount: (part.find("#recMonthly").prop("checked")) ? installmentAmt : getDonationAmount(),
      DesignationId: part.find("#designation").val()
      }],
      FinderNumber: part.find("#finderNumber").val(),      
      Comments: part.find("#comments").val(),
      CreateGiftAidDeclaration: part.find("#createGiftAidDeclaration").prop("checked"),
      IsAnonymous: part.find("#isAnonymous").prop("checked"),
      IsCorporate: part.find("#isCorporate").prop("checked")
      };
      // Recurring Gift Information
      if (part.find("#recMonthly").prop("checked")) {
      result.Gift.Recurrence = {
      DayOfMonth: part.find('#day-of-month').val(),
      Month: (part.find("#frequency").val() == "2" || part.find("#frequency").val() == "3") ? "" : part.find('#month').val(),
      Frequency: part.find("#frequency").val(),
      StartDate: part.find("#start-date").val(),
      EndDate: part.find("#end-date").text(),
      DayOfWeek: part.find("#day-of-week").val()
      };
      }
      // Tribute Information
      if (part.find("#includeTribue").prop("checked")) {
      var kind = part.find("[name='radioTribute']:checked").val();
      if (kind === "1") {
      result.Gift.Tribute = {
      TributeId: part.find("#tributeID").val()
      };
      } else {
      result.Gift.Tribute = {
      TributeDefinition: {
      Name: part.find("#tributeFirstName").val() + " " + part.find("#tributeLastName").val(),
      FirstName: part.find("#tributeFirstName").val(),
      LastName: part.find("#tributeLastName").val(),
      Type: part.find("#tributeType").val(),
      Description: part.find("#tributeDescription").val()
      }
      };
      }
      if (part.find("#includeAcknowledgee").prop("checked")) {
      result.Gift.Tribute.Acknowledgee = {
      FirstName: part.find("#acknowledgeeFirstName").val(),
      LastName: part.find("#acknowledgeeLastName").val(),
      Country: part.find("#acknowledgeeCountry").val(),
      AddressLines: part.find("#acknowledgeeAddressLines").val(),
      City: part.find("#acknowledgeeCity").val(),
      State: part.find("#acknowledgeeState").val(),
      PostalCode: part.find("#acknowledgeePostalCode").val(),
      Phone: part.find("#acknowledgeePhone").val(),
      Email: part.find("#acknowledgeeEmail").val()
      };
      }
      }
      // Attribute Information
      if (part.find("#includeAttribute1").prop("checked") || part.find("#includeAttribute2").prop("checked")) {
      result.Gift.Attributes = [];
      var index = 0;
      if (part.find("#includeAttribute1").prop("checked")) {
      result.Gift.Attributes[index] = {
      AttributeId: part.find("#attribute1ID").val(),
      Value: part.find("#attribute1Value").val()
      };
      index += 1;
      }
      if (part.find("#includeAttribute2").prop("checked")) {
      result.Gift.Attributes[index] = {
      AttributeId: part.find("#attribute2ID").val(),
      Value: part.find("#attribute2Value").val()
      };
      index += 1;
      }
      }

      result.Origin = {
      PageId: BLACKBAUD.api.pageInformation.pageId,
      AppealId: part.find("#appealId").val()
      };

      return result;
      }

      // this function submit Donation using CreateDonation() of donationService
      function submitDonationToServer(data) {
      onSuccess = function (d) {
      // For Pledge, go ahead and show the confirmation.  For credit card, you will be redirected to BBSP already.
      if (d.Donation.TransactionStatus === 1) {
      part.find(".form").hide();
      part.find(".confirmation").show();
      getConfirmationHtml(d.Donation.Id);
      }
      };

      onFail = function (d) {
      setValidationMessage(convertErrorsToHtml(d));

      };

      donationService.createDonation(data, onSuccess, onFail);
      }

      // Success Callback from Secure Payment Page
      function completeBBSPPayment(id) {
      onSuccess = function (d) {
      '<%Session["' + d.Id + '"] = "' + true + '"; %>';
      getConfirmationHtml(d.Id);
      };
      onFail = function (d) {
      setValidationMessage(convertErrorsToHtml(d));
      };
      donationService.completeBBSPDonation(id, onSuccess, onFail);
      }

      // Display the Final Confirmation screen after Successful Doantion
      function getConfirmationHtml(id) {
      onSuccess = function (d) {
      part.find(".confirmation").html(d);
      };
      onFail = function (d) {
      setValidationMessage(convertErrorsToHtml(d));
      };
      donationService.getDonationConfirmationHtml(id, onSuccess, onFail);
      }

      // bind the Designation
      function bindDesignationDropdown() {
      queryService = new BLACKBAUD.api.QueryService();
      statusFilter = { columnName: 'Is active', value: 'True' };
      queryService.getResults(designationQueryId, function (d) {
      var rows = d.Rows;
      $.each(rows, function () {
      var values = this['Values'];
      $("#designation").append($("<option></option>").val(values[0]).text(values[1]));
      });
      }, null, [statusFilter]);
      }

      // populate the Title Dropdown with available list of Title
      function bindTitleDropdown() {
      codeTableService = new BLACKBAUD.api.CodeTableService();
      codeTableService.getTitles('456FFD4C-0FBF-49DB-A503-0726F86E2A39', function (d) {
      $.each(d, function () {
      $("#title").append($("<option></option>").val(this["Description"]).text(this["Description"]));
      });
      });
      }

      // bind the Linked user Details to the HTML Controls of Page, when we logged in with Linked User
      function bindUserData() {
      userService = new BLACKBAUD.api.UserService();
      userService.getProfile(function (d) {
      part.find("#firstName").val(d["FirstName"]);
      part.find("#lastName").val(d["LastName"]);
      part.find("#phone").val(d["Phone"]);

      });
      }

      // change the Address related Label of Page, when change the Country from Country dropdown
      function updateAddressLabels() {
      var countryId = $("#country").find(":selected").attr("id");
      countryService = new BLACKBAUD.api.CountryService();
      countryService.getAddressCaptions(countryId, function (d) {
      if (!!d) {
      addressLinesCaption = d["AddressLines"];
      cityCaption = d["City"];
      stateCaption = d["State"];
      postCodeCaption = d["PostCode"];
      }
      else {
      addressLinesCaption = "Address lines";
      cityCaption = "City";
      stateCaption = "State/Providence";
      postCodeCaption = "Zip/Postal code";
      }
      $("#streetAddressLabel").text(addressLinesCaption + ":");
      $("#cityLabel").text(cityCaption + ":");
      $("#stateLabel").text(stateCaption + ":");
      $("#postalCodeLabel").text(postCodeCaption + ":");
      }, function () {

      });
      }


      /*************************************** RECURRENCE FUNCTIONS - SECTION START ***************************************/

      function showHideRecurrenceDiv() {
      if (part.find("#recMonthly").prop("checked")) {
      part.find("#divRecurringGift").show();
      }
      else {
      part.find("#divRecurringGift").hide();
      }
      }

      function updateEverythingPossible() {
      var donationAmount = getDonationAmount();
      var numberOfInstallments = part.find("#number-of-installments").val();
      var installmentAmount = donationService.getRecurringGiftInstallmentAmount(donationAmount, numberOfInstallments);
      var startDate = part.find("#start-date").val();
      var frequency = part.find("#frequency").val();
      var dayOfMonth = part.find('#day-of-month').val();
      var dayOfWeek = part.find("#day-of-week").val();
      var month = part.find('#month').val();
      if (numberOfInstallments < 2) {
      setValidationMessage("Number Of installments should be greater than 1 in case of recurring gift.");
      return false;
      }
      else {
      setValidationMessage("");
      if (frequency == 1) {//Weekly
      part.find("#divDayOfWeek").show();
      part.find("#divMonth").hide();
      part.find("#annual-options").hide();
      part.find("#divDayOfMonth").hide();
      } else if (frequency == 2 || frequency == 3) {//Monthly| Quarterly
      part.find("#divMonth").hide();
      part.find("#divDayOfMonth").show();
      part.find("#divDayOfWeek").hide();
      part.find("#annual-options").hide();
      } else if (frequency == 4) {// Annually
      part.find("#divMonth").show();
      part.find("#divDayOfMonth").show();
      part.find("#divDayOfWeek").hide();
      part.find("#annual-options").css("display", "inline");
      } else if (frequency == 7) {    //Every4Weeks
      part.find("#divDayOfWeek").hide();
      part.find("#divMonth").hide();
      part.find("#annual-options").hide();
      part.find("#divDayOfMonth").hide();
      } else {
      part.find("#divDayOfWeek").hide();
      part.find("#divMonth").show();
      part.find("#divDayOfMonth").show();
      part.find("#annual-options").hide();
      }
      if (validateStartDate(startDate)) {
      if (frequency == 1) {
      var StartDate1 = new Date(startDate);
      var dayOfStartDate = StartDate1.getDay();

      if (dayOfStartDate != dayOfWeek) {

      var startDateCopy = new Date(StartDate1);
      var firstDayOfCurrentWeek = new Date(startDate);
      firstDayOfCurrentWeek.setHours(0, 0, 0, 0);
      // if start date's day of week is not monday then calculate the first day(i.e. monday) of the week of start date
      //{0-Sunday,1-Monday,2-Tuesday,3-Wednesday,4-Thursday,5-Friday,6-Saturday}
      if (dayOfStartDate != 1) {
      firstDayOfCurrentWeek.setDate(StartDate1.getDate() - dayOfStartDate + (dayOfStartDate == 0 ? -6 : 1));
      }
      // if the installment's day of week is not same as start date's day of week , then adjust the start date.
      while (firstDayOfCurrentWeek < startDateCopy ||
      firstDayOfCurrentWeek.getDay() != parseInt(dayOfWeek, 10)) {
      firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 1);
      }
      // set the start date's to the expected day of week
      StartDate1 = firstDayOfCurrentWeek;
      }
      var endDate = new Date(StartDate1);
      endDate.setDate(StartDate1.getDate() + (7 * (numberOfInstallments - 1)));
      var endDateFormatted;
      if (endDate) {
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      endDateFormatted = monthNames[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getFullYear();
      }
      }
      else {
      var endDate = donationService.getRecurringGiftLastPaymentDate(numberOfInstallments, frequency, startDate, month, dayOfMonth, dayOfWeek);
      var endDateFormatted;
      if (endDate) {
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      endDateFormatted = monthNames[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getFullYear();
      }
      }
      }
      part.find("#installment-amount").text("$" + installmentAmount);
      part.find("#end-date").text(endDateFormatted);
      installmentAmt = installmentAmount;
      }
      }

      /*************************************** RECURRENCE FUNCTIONS - SECTION END ***************************************/

      /*************************************** CONSENT FUNCTIONS - SECTION START ***************************************/

      function bindConsentOption() {
      consentOptionService = new BLACKBAUD.api.ConsentOptionService();
      consentOptionService.getConsentOptions(consentPartId, function (d) {
      if (!cnstType && d.SolicitCodes.length > 0) { $("#myModal").css("display", "block"); }
      $("#consentTitle").append("<b></b>").text(d["Title"]);
      if (d["hdnCRMSolicitCode"] != null) { $("#hdnCRMSolicitCode").val(d["hdnCRMSolicitCode"]); }
      if (d["hdnCRMConsentSolicitCode"] != null) { $("#hdnCRMConsentSolicitCode").val(d["hdnCRMConsentSolicitCode"]); }
      $("#consentStatement").text(d["ConsentStatement"]);
      if (d["PrivacyPolicy"] != null) {
      $("#privacylink").attr("onclick", "javascript:window.open('" + d["PrivacyPolicy"] + "', '_blank' ,height=600, width=800, resizable='yes', scrollbars='yes' )");
      } else { $("#privacylink").css("display", "none"); }
      var count = 0;
      $.each(d.SolicitCodes, function () {
      if (this["ConsentCode"] === 3) {
      $("#consentOption").append($("<tr></tr>").attr("id", this["SolicitCodeID"])
      .append($("<td colspan='3' style='width:100%;text-align:left; font-weight:bold;'></td>").html(this["Caption"]))
      );
      if (count % 2 != 0) { $("#consentOption tr[id=" + this["SolicitCodeID"] + "]").css("background-color", "#efefef"); }
      count = count + 1;
      } else {
      if (this["ConsentCode"] == 1) {
      $("#consentOption").append($("<tr></tr>").attr("id", this["SolicitCodeID"]).attr("IsRequired", this["IsRequired"])
      .append($("<td style='width:35%'></td>").append($("<label></label>").text(this["Caption"])))
      .append($("<td></td>").append($("<input>").attr("type", "radio").val("2").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 2)))
      .append($("<td></td>").append($("<input>").attr("type", "radio").val("1").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 1)))
      );
      if (count % 2 != 0) { $("#consentOption tr[id=" + this["SolicitCodeID"] + "]").css("background-color", "#efefef"); }
      count = count + 1;
      }
      else if (this["ConsentCode"] == 2) {
      $("#consentOption").append($("<tr></tr>").attr("id", this["SolicitCodeID"]).attr("IsRequired", this["IsRequired"])
      .append($("<td style='width:35%'></td>").append($("<label></label>").text(this["Caption"])))
      .append($("<td></td>").append($("<input>").attr("type", "radio").val("2").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 2)))
      .append($("<td></td>").append($("<input>").attr("type", "radio").val("1").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 1)))
      );
      if (count % 2 != 0) { $("#consentOption tr[id=" + this["SolicitCodeID"] + "]").css("background-color", "#efefef"); }
      count = count + 1;
      }
      else if (this["ConsentCode"] == 0) {
      $("#consentOption").append($("<tr></tr>").attr("id", this["SolicitCodeID"]).attr("IsRequired", this["IsRequired"])
      .append($("<td style='width:35%'></td>").append($("<label></label>").text(this["Caption"])))
      .append($("<td colspan='2'></td>").append($("<input>").attr("type", "checkbox").val("2").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 2)))
      );
      if (count % 2 != 0) { $("#consentOption tr[id=" + this["SolicitCodeID"] + "]").css("background-color", "#efefef"); }
      count = count + 1;
      }
      }
      });

      });
      if (cnstType) {
      $("#myModal").css({ "display": "none", "align": "center" });
      }
      else {
      $("#myModal").css("width", "30%");
      $("#consentTitle").attr("class", "BBListingHeading DonationListingHeading");
      }
      $("#myModal").attr("cnstFilled", "0");
      }

      //this function open overlay Consent dialog on screen
      function openDialog() {
      var rows = $("#consentOption tr[isRequired]").find("td:first");
      for (i = 0; i < rows.length; i++) {
      rows[i].style.width = "60%";
      }
      $(function () {
      $("#myModal").dialog({
      dialogClass: "no-close",
      modal: true,
      autoOpen: false,
      maxHeight: 393,
      maxWidth: 474
      });
      $('#myModal').dialog('open');
      $('#myModal').css({ "position": "fixed", "top": "25%", "background-color": "white", "overflow": "auto", "max-height": "393px", "max-width": "473px", "z-index": "101" });
      $('.ui-widget-overlay').css({ "position": "fixed", "width": "100%", "height": "100%", "background-color": "gray", "opacity": "0.6", "top": "0%", "left": "0%" });
      $("#consentOption").css("width", "100%");
      $("#consentOption th").attr({ "border": "1px solid black", "border-color": "#efefef" })
      });
      }

      /*************************************** CONSENT FUNCTIONS - SECTION END ***************************************/

      /*************************************** COUNTRY/STATE FUNCTIONS - SECTION START ***************************************/

      // bind the List of Country to Donor Country & Tribute Acknowledgee Country Dropdown
      function bindCountryDropdown() {
      countryService = new BLACKBAUD.api.CountryService();
      countryService.getCountries(function (d) {
      $.each(d, function () {
      $("#country").append($("<option></option>").val(this["Abbreviation"]).text(this["Description"]).attr("id", this["Id"]));
      });

      $("#country").find("option[value='USA']").attr("selected", "selected");
      $("#country").change(bindStateDropdown);
      bindStateDropdown();
      });
      }

      function bindStateDropdown() {

      $("#state").empty();
      var countryId = $("#country").find(":selected").attr("id");
      countryService = new BLACKBAUD.api.CountryService();
      countryService.getStates(countryId, function (d) {
      $.each(d, function () {
      $("#state").append($("<option></option>").val(this["Abbreviation"]).text(this["Description"]));
      });
      updateAddressLabels();
      });
      }

      /*************************************** COUNTRY/STATE FUNCTIONS - SECTION END ***************************************/

      // return the donation amount
      function getDonationAmount() {
      if (part.find("#amtOther").prop("checked")) {
      return part.find("#txtAmount").val();
      } else {
      return part.find("[name='radioAmount']:checked").val();
      }
      }

      // call submitDonationToServer(data) for further Donation Procesing
      function sendData() {
      var data;
      setValidationMessage("");
      data = extractDataFromForm();
      submitDonationToServer(data);
      }

      // call when we click on "Donate" button
      function onSubmitClick() {
      if (validateFormClientSide()) {
      if ($("table[id='consentOption'] tr[isRequired]").length > 0) {
      if (cnstType) {
      $("#overlay").css("display", "block");
      openDialog();
      $("#myModal button").css("display", "block");
      $("#myModal button").click(function () {

      if (consentValidation()) {
      $("#myModal").attr("cnstFilled", "1");
      $('#myModal').dialog('close');
      sendData();
      }
      });
      }
      else {
      $("#inline").css("display", "block");
      if (validateFormClientSide() && consentValidation()) {
      sendData();
      }
      }
      }
      else {
      sendData();
      }
      }
      }

      /*************************************** PROCESSING PAYMENT FUNCTIONS - SECTION END ***************************************/

      /*------------------------------------------- JAVASCRIPT FUNCTIONS - SECTION END -------------------------------------------*/

      // this function set-up/bind all required controls of Donation Form on Page Load
      function setupForm() {
      bindDesignationDropdown();
      bindCountryDropdown();
      bindTitleDropdown();
      //bindUserData();
      bindConsentOption();

      part.find(".submit").click(function () {
      onSubmitClick();
      });
      part.find("#txtAmount").change(function () {
      part.find("#amtOther").attr("checked", "checked");
      if (part.find("#recMonthly").prop("checked")) {
      updateEverythingPossible();
      }
      });
      part.find("#isCorporate").click(function () {
      part.find("#organizationNameDiv").toggleClass("invisible");
      });

      part.find("#includeTribue").click(function () {
      part.find("#tribute").toggleClass("invisible");
      });

      part.find("#includeAcknowledgee").click(function () {
      part.find("#acknowledgee").toggleClass("invisible");
      });
      part.find("#number-of-installments").change(function () { updateEverythingPossible(); });
      part.find("#start-date").change(function () { updateEverythingPossible(); });
      part.find("#frequency").change(function () { updateEverythingPossible(); });
      part.find("#day-of-month").change(function () { updateEverythingPossible(); });
      part.find("#month").change(function () { updateEverythingPossible(); });
      part.find("#day-of-week").change(function () { updateEverythingPossible(); });
      part.find("#recMonthly").click(function () { showHideRecurrenceDiv(); });
      part.find("#recOneTime").click(function () { showHideRecurrenceDiv(); });

      function tributeKindChange() {
      var kind = part.find("[name='radioTribute']:checked").val();
      if (kind === "1") {
      part.find("#specificTribute").removeClass("invisible");
      part.find("#generalTribute").addClass("invisible");
      } else {
      part.find("#generalTribute").removeClass("invisible");
      part.find("#specificTribute").addClass("invisible");
      }
      }
      part.find("#kindGeneral").click(tributeKindChange);
      part.find("#kindSpecific").click(tributeKindChange);
      part.find("#includeAttribute1").click(function () {
      part.find("#attribute1").toggleClass("invisible");
      });
      part.find("#includeAttribute2").click(function () {
      part.find("#attribute2").toggleClass("invisible");
      });
      //Make sure this default HTML is configured for use:
      if (designationQueryId === "00000000-0000-0000-0000-000000000000" || merchantAccountId === "00000000-0000-0000-0000-000000000000") {
      setValidationMessage("DesignationQueryId and MerchantAccountId must be configured before this form can be used.")
      }
      }

      /*------------------------------------------- PAGE LOAD METHOD - START -------------------------------------------*/

      function PageLoad() {
      //Wait until the blockUI script is loaded before we start loading the page.
      var t;
      blocked = false;
      part = $(".donationForm");
      partInstanceId = part.parents(".BBDonationApiContainer").attr("data-partid");
      donationService = new BLACKBAUD.api.DonationService(partInstanceId);

      t = BLACKBAUD.api.querystring.getQueryStringValue("t")
      if (t) {
      part.find(".form").hide();
      part.find(".confirmation").show();
      completeBBSPPayment(t);
      } else {
      part.find(".form").show();
      part.find(".confirmation").hide();
      setupForm();
      }
      }
      PageLoad();

      /*------------------------------------------- PAGE LOAD METHOD - END -------------------------------------------*/

      }());
