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
		        'theme': 'light',  // optional
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
            installmentAmt,
            SrtDt,
            merchantAccountId,
            donationData,
            ServerDate,
            ClientSitesID,
            checkoutGenericError = "There was an error while performing the operation. The page will be refreshed.";

        /*------------------------------------------- GLOBAL VARIABLE DECLARATION - SECTION END -------------------------------------------*/

            this.transactionID = null;

            //Checkout Payment pop-up is loaded in this form
            if ($('form[data-formtype="bbCheckout"]').length <= 0) {
                var form = '<form method=\'get\' id=\"paymentForm\" data-formtype=\'bbCheckout\' data-disable-submit=\'false\' novalidate><\/form>';
                $('body').append(form);
            }

            $("#paymentForm").submit(function paymentComplete(e) {
                // prevent form from refreshing and show the transaction token
                e.preventDefault();
            });

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

            function validateCountry(country, ctryData) {
                if (country.toUpperCase() === ctryData.Id.toUpperCase() || country.toUpperCase() === ctryData.Abbreviation.toUpperCase() || country.toUpperCase() === ctryData.Description.toUpperCase()) {
                    return true;
                }
                return false;
            }

            function validateStartDate(startDate) {
                if (startDate) {
                    var pattern = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
                    return pattern.test(startDate);
                } else {
                    return false;
                }
            }

            function ValidateDonationRequest(data) {
                return new Promise(function (resolve, reject) {
                    onSuccess = function (result) {
                        resolve();
                    };
                    onFail = function (error) {
                        setValidationMessage(convertErrorsToHtml(error));
                    };
                    donationService.validateDonationRequest(data, onSuccess, onFail)
                });
            }

            // this function validate all required fields of donation page
            function validateFormClientSide() {

                $(".validation").html("");
                var errs = "";
                //Amount
                if (getDonationAmount() <= 0) {
                    errs += "Gift amount is not valid.<br/>";
                }
                //Last Name
                if (!part.find("#lastName").val()) {
                    errs += "Last name is required.<br/>";
                }
                //Email Address
                if (!validateEmail(part.find("#emailAddress").val())) {
                    errs += "Email is not valid.<br/>";
                }
                //Street Address
                if (!part.find("#streetAddress").val()) {
                    errs += addressLinesCaption + " is required.<br/>";
                }
                //City
                if (!part.find("#city").val()) {
                    errs += cityCaption + " is required.<br/>";
                }
                //Postal Code
                if (!part.find("#postalCode").val()) {
                    errs += postCodeCaption + " is required.<br/>";
                }
                //Phone
                if (!validatePhone(part.find("#phone").val())) {
                    errs += "Phone is not valid.<br/>";
                }
                // Organization name
                if (part.find("#isCorporate").prop("checked") && !part.find("#organizationName").val()) {
                    errs += "Company name is required if this donation is on behalf of a company";
                }
                // No Of Installation
                if (part.find("#recMonthly").prop("checked") && part.find("#number-of-installments").val() < 2) {
                    errs += "Number Of installments should be greater than 1 in case of recurring gift.";
                }
                //Payment Method
                if (part.find("#recMonthly").prop("checked")) {
                    if (!part.find("#paymentCreditCard").prop("checked") && !part.find("#paymentDirectDebit").prop("checked")) {
                        errs += "Select Payment Method"
                    }
                }
                if (part.find("#recOneTime").prop("checked")) {
                    if (!part.find("#paymentCreditCard").prop("checked") && !part.find("#paymentBillMeLater").prop("checked")) {
                        errs += "Select Payment Method"
                    }
                }
				
				// check client side validation of google recaptcha
				if ($("#paymentBillMeLater").prop("checked") && CheckoutModel.SiteKey!= null){    
					responseCaptcha = grecaptcha.getResponse();
					if(responseCaptcha==""){
					  errs += "CAPTCHA validation is required."
					}
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
                            errs += $($("#consentOption tr[isRequired]")[i - 1]).find("label")[0].innerHTML + " is required.<br/>"
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
                        case 107:
                            return "Max length for " + error.Field + " exceeded.";
                        default:
                            return "Error code " + error.ErrorCode + ".";
                    }
                }
            }

            function convertErrorsToHtml(errors) {
                var i, message = "Unknown error.<br/>";
                if (errors) {
                    message = "";
                    for (i = 0; i < errors.length; i++) {
                        message = message + convertErrorToString(errors[i]) + "<br/>";
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
                // Donor information
                result.Donor = {
                    Title: part.find("#title").val(),
                    FirstName: part.find("#firstName").val(),
                    MiddleName: part.find("#middleName").val(),
                    LastName: part.find("#lastName").val(),
                    EmailAddress: part.find("#emailAddress").val(),
                    Phone: part.find("#phone").val(),
                    Address: {
                        Country: part.find("#country").val(),
                        State: part.find("#state").val(),
                        City: part.find("#city").val(),
                        StreetAddress: part.find("#streetAddress").val(),
                        PostalCode: part.find("#postalCode").val()
                    },
                    OrganizationName: organizationName
                };
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
                        DayOfWeek: part.find("#day-of-week").val(),
                        ProcessNow: isProcessNow()
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
                // Fetching Direct Debit related information
                if (paymentMethod === "2" && part.find("#paymentDirectDebit").prop("checked")) {
                    result.Gift.DirectDebitInformation = {};
                    var selectedCountry = part.find("#country :selected").val(), bankingType = part.find("#ddlBankingSystemType :selected").val();
                    result.Gift.DirectDebitInformation.FinancialInstitution = part.find("#txtFinancialInstitution").val();
                    result.Gift.DirectDebitInformation.BranchName = part.find("#txtBranchName").val();
                    result.Gift.DirectDebitInformation.AccountHolderName = part.find("#txtAccountHolder").val();
                    result.Gift.DirectDebitInformation.BankingType = bankingType;
                    if (countryData && validateCountry(selectedCountry, countryData.CAD) && bankingType === "USA") {
                        result.Gift.DirectDebitInformation.RoutingNumber = part.find("#txtRoutingNumber").val();
                        result.Gift.DirectDebitInformation.TransitNumber = part.find("#txtCanTransitNumber").val();
                    }
                    else {
                        result.Gift.DirectDebitInformation.RoutingNumber = part.find("#txtRoutingNumber").val();
                    }
                    if (countryData && validateCountry(selectedCountry, countryData.NZ) && bankingType === "Aus_NZ") {
                        result.Gift.DirectDebitInformation.AccountNumber = part.find("#txtAccountNumberNZ").val();
                        result.Gift.DirectDebitInformation.SuffixNo = part.find("#txtSuffixNZ").val();
                    }
                    else {
                        result.Gift.DirectDebitInformation.AccountNumber = part.find("#txtAccountNumber").val();
                    }
                    if (bankingType === "Europe" || bankingType === "Other" || countryData && (!validateCountry(selectedCountry, countryData.CAD) && bankingType === "USA")) {
                        result.Gift.DirectDebitInformation.AccountType = part.find("#ddlAccountType :selected").val();
                    }
                    else {
                        result.Gift.DirectDebitInformation.AccountType = "";
                    }
                }
                result.Origin = {
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    AppealId: part.find("#appealId").val(),
                    PartId: partInstanceId,
                    ClientSitesID: ClientSitesID
                };
                
                result.MerchantAccountId = CheckoutModel.MerchantAccountId;
                result.PartId = partInstanceId;
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
                    if (d.Donation.Gift.PaymentMethod === 2) {
                        window.location.href = window.location.href + "?t=" + d.Donation.Id;
                    }
                };
                onFail = function (d) {
                    setValidationMessage(convertErrorsToHtml(d));
                };
                if (data && data.Donor && data.Donor.Address) {
                    data.Donor.Address.State = part.find("#state :selected").attr("iso");
                }
				
				// sending the response token to validate on server side
				data.ResponseToken = responseCaptcha;
                donationService.createDonation(data, onSuccess, onFail);

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
                    // only bind the Primary Address of Linked user
                    if (d.Addresses && d.Addresses.length > 0) {
                        var ads = d.Addresses.find(function (x) {
                            return x.IsPrimary === true;
                        });
                        if (ads) {
                            part.find("#country").val(ads["Country"]);
                            bindStateDropdown(undefined, ads["State"]);
                            part.find("#city").val(ads["City"]);
                            part.find("#streetAddress").val(ads["StreetAddress"]);
                            part.find("#postalCode").val(ads["PostalCode"]);
                        }
                    }
                    // only bind the Primary Email Address of Linked user
                    if (d.EmailAddresses && d.EmailAddresses.length > 0) {
                        var email = d.EmailAddresses.find(function (x) {
                            return x.IsPrimary === true;
                        });

                        if (email) {
                            part.find("#emailAddress").val(email["EmailAddress"]);
                        }

                    }
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

            // change the Tribute Acknowledge Address related Label of Page, when change the Tribute Acknowledge Country from Country dropdown
            function updateAcknowledgeeAddressLabels() {
                var countryId = $("#acknowledgeeCountry").find(":selected").attr("id");
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
                    $("#streetAddressLabelAcknowledgee").text(addressLinesCaption + ":");
                    $("#cityLabelAcknowledgee").text(cityCaption + ":");
                    $("#stateLabelAcknowledgee").text(stateCaption + ":");
                    $("#postalCodeLabelAcknowledgee").text(postCodeCaption + ":");
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
                part.find("#directDebitInformation").hide();
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
                    } else if (frequency == 4) {//Annually
                        part.find("#divMonth").show();
                        part.find("#divDayOfMonth").show();
                        part.find("#divDayOfWeek").hide();
                        if (frequency == 4) {
                            part.find("#annual-options").css("display", "inline");
                        }
                        else {
                            part.find("#annual-options").hide();
                        }
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
                            if (dayOfStartDate != dayOfWeek && !isNaN(parseInt(dayOfWeek, 10))) {
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

            //to check for recurring gift that is to be processed today or not (this is check for call stored card payment api)
            function isProcessNow() {
                var recStartDate = part.find("#start-date").val(),
                    frequency = part.find("#frequency").val(),
                    dayOfMonth = part.find('#day-of-month').val(),
                    dayOfWeek = part.find("#day-of-week").val(),
                    month = part.find('#month').val(),
                    startDateIsTodayDate = false,
                    recurrrentStartDate = new Date(recStartDate),
                    isProcessedNow = false,
                    serverDate = new Date(ServerDate);
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
                                    .append($("<td  style='width:35%'></td>").append($("<label></label>").text(this["Caption"])))
                                    .append($("<td colspan='2'></td>").append($("<input>").attr("type", "checkbox").val("2").attr("name", "radio" + this["Caption"]).prop("checked", this["ConsentPreferenceCode"] === 2)))
                                );
                                if (count % 2 != 0) { $("#consentOption tr[id=" + this["SolicitCodeID"] + "]").css("background-color", "#efefef"); }
                                count = count + 1;
                            }
                        }
                    });
                    var requiredRows = $("#consentOption tr[IsRequired]");
                    for (i = 0; i < requiredRows.length; i++) { if (requiredRows[i].getAttribute("IsRequired") == "true") { $("#consentOption tr[id=" + requiredRows[i].getAttribute("id") + "]").find("td:first").append("<span style='color:red;'>*</span>"); } }
                });
                if (cnstType) {
                    $("#myModal").css({ "display": "none", "align": "center" });
                }
                else {
                    $("#myModal").css("width", "600px");
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
                        $("#country").append($("<option></option>").val(this["Description"]).text(this["Description"]).attr("id", this["Id"]).attr("iso", this["ISO"]));
                        $("#acknowledgeeCountry").append($("<option></option>").val(this["Description"]).text(this["Description"]).attr("id", this["Id"]).attr("iso", this["ISO"]));
                    });
                    $("#country").find("option[value='United States']").attr("selected", "selected");
                    $("#country").change(function () { bindStateDropdown(undefined, undefined) });
                    bindStateDropdown(true, undefined);

                    // if you are going to add Tribute Acknowledgee Section then add below line of code
                    $("#acknowledgeeCountry").find("option[value='United States']").attr("selected", "selected");
                    $("#acknowledgeeCountry").change(function () { bindAcknowledgeeStateDropdown(undefined, undefined) });
                    bindAcknowledgeeStateDropdown(true, undefined);
                });
            }

            function bindStateDropdown(val, data) {
                $("#state").empty();
                var countryId = $("#country").find(":selected").attr("id");
                countryService = new BLACKBAUD.api.CountryService();
                countryService.getStates(countryId, function (d) {
                    $.each(d, function () {
                        switch (countryId.toUpperCase()) {
                            case 'D81CEF85-7569-4B2E-8F2E-F7CF998A3342':
                                $("#state").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            case 'D9EE54CD-2183-490C-A3AD-11152B271335':
                                $("#state").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            case 'F189F24C-2538-46A1-8458-1E3F3967B843':
                                $("#state").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            default:
                                $("#state").append($("<option></option>").val(this["Description"]).text(this["Description"]).attr("iso", this["ISO"]));
                                break;
                        }
                        $("#acknowledgeeState").append($("<option></option>").val(this["Id"]).text(this["Description"]));
                        if (data) {
                            part.find("#state").val(data);
                        }
                    });
                    updateAddressLabels();
                    if (val) {
                        bindUserData();
                    }
                });
            }

            // Bind the State after changing the Tribute Acknowledgee Country value
            function bindAcknowledgeeStateDropdown(val, data) {
                $("#acknowledgeeState").empty();
                var countryId = $("#acknowledgeeCountry").find(":selected").attr("id");
                countryService = new BLACKBAUD.api.CountryService();
                countryService.getStates(countryId, function (d) {
                    $.each(d, function () {
                        switch (countryId.toUpperCase()) {
                            case 'D81CEF85-7569-4B2E-8F2E-F7CF998A3342':
                                $("#acknowledgeeState").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            case 'D9EE54CD-2183-490C-A3AD-11152B271335':
                                $("#acknowledgeeState").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            case 'F189F24C-2538-46A1-8458-1E3F3967B843':
                                $("#acknowledgeeState").append($("<option></option>").val(this["Abbreviation"]).text(this["Abbreviation"]).attr("iso", this["ISO"]));
                                break;
                            default:
                                $("#acknowledgeeState").append($("<option></option>").val(this["Description"]).text(this["Description"]).attr("iso", this["ISO"]));
                                break;
                        }
                    });
                    updateAcknowledgeeAddressLabels();
                });
            }

            function getCountryMappings() {
                //this is use for direct debit validations
                countryData = {};
                countryService.getCountries(function (d) {
                    $.each(d, function () {
                        var tmpData = {};
                        tmpData.Id = this["Id"];
                        tmpData.Abbreviation = this["Abbreviation"];
                        tmpData.Description = this["Description"];
                        switch (this["Id"].toUpperCase()) {
                            case 'D81CEF85-7569-4B2E-8F2E-F7CF998A3342':
                                countryData.USA = tmpData;
                                break;
                            case 'A2ECC209-3D20-4DDA-BC4C-7585C8E2E701':
                                countryData.UK = tmpData;
                                break;
                            case 'D9EE54CD-2183-490C-A3AD-11152B271335':
                                countryData.CAD = tmpData;
                                break;
                            case 'F189F24C-2538-46A1-8458-1E3F3967B843':
                                countryData.AUS = tmpData;
                                break;
                            case 'DA42443E-AB81-40EE-A239-91ED699C0801':
                                countryData.NZ = tmpData;
                                break;
                        }
                    });
                });
            }

            /*************************************** COUNTRY/STATE FUNCTIONS - SECTION END ***************************************/

            /*************************************** DIRECT DEBIT FUNCTIONS - SECTION START ***************************************/

            function showHideDirectDebitDiv() {
                if (part.find("#paymentDirectDebit").prop("checked")) {
                    part.find("#directDebitInformation").show();
                    hideAndVisible_BankingTypeField();
                    addCountryHandler();
                }
                else {
                    part.find("#directDebitInformation").hide();
                }
            }

            function hideAndVisible_BankingTypeField() {
                if ($('[id="ddlBankingSystemType"] option').length == 1) {
                    $('#tr_BankingSystemType').css('display', 'none');
                } else {
                    $('#tr_BankingSystemType').css('display', '');
                }
            }

            function bindDirectDebitData() {
                donationService.getBankingTypeData(function (d) {
                    $.each(d, function () {
                        $("#ddlBankingSystemType").append($("<option></option>").val(this["Abbreviation"]).text(this["Description"]));
                    });
                });
                donationService.getAccountTypeData(function (d) {
                    $.each(d, function () {
                        $("#ddlAccountType").append($("<option></option>").val(this["Id"]).text(this["Description"]));
                    });
                });
                donationService.getOriginIdAndTime(function (d) {
                    $("#lbl_CurrentDate").text(d["Time"]);
                    $("#lbl_OrigNumber").text(d["OriginId"]);
                });
            }

            // handling the functionality, when chnage the Country from Country Dropdown
            function addCountryHandler() {
                var bankingSystemType = $('[id="ddlBankingSystemType"]'), addrCtl = $("[id='country'] :selected"), selectBankingOption, exists = false, bankingOptions;
                if (bankingSystemType && bankingSystemType.length > 0) {
                    bankingOptions = $('[id="ddlBankingSystemType"] option');
                    if (bankingOptions.length > 0) {
                        if (!(bankingOptions.length === 1)) {
                            if (countryData && (validateCountry(addrCtl.val(), countryData.NZ) || validateCountry(addrCtl.val(), countryData.AUS))) {
                                selectBankingOption = "Aus_NZ";
                            }
                            else if (countryData && validateCountry(addrCtl.val(), countryData.UK)) {
                                selectBankingOption = "UK";
                            }
                            else if (countryData && validateCountry(addrCtl.val(), countryData.CAD) || validateCountry(addrCtl.val(), countryData.USA)) {
                                selectBankingOption = "USA";
                            }
                            exists = 0 !== bankingSystemType.find('option[value="' + selectBankingOption + '"]').length;
                            if (exists && exists === true) {
                                bankingSystemType.val(selectBankingOption);
                            } else {
                                bankingSystemType.val("Please Select");
                            }
                        }
                    }
                    //bind event so when ever ddl change we can reset the field
                    hideAndVisible_DirectDebitFields();
                }
            }

            function hideAndVisible_DirectDebitFields() {
                var bankingType = "Please Select", htmlElement = "", routingNumberTextBoxLabel = "", selectedCountry = "", routingNumberTextBox = "", transitNumberBox = "",
                    routingNumber = $('[id="txtRoutingNumber"]'),
                    transitNumber = $('[id="txtCanTransitNumber"]'),
                    routingNumberLabel = $('[id="lblRoutNumLBL"]'),
                    addressCTL = $("[id='country'] :selected"),
                    bankingSystemLabel = $('[id="lblBankingSystemType"]'),
                    bankingSystemType = $('[id="ddlBankingSystemType"] :selected'),
                    accountType = $('[id="tr_AccountType"],[id*="DC_AccountType"]'),
                    accountNo = $('[id="spn_AccountNo"]'),
                    accountNoNZ = $('[id="spn_AccountNoNZ"]'),
                    financialInstitution = $('[id="lblFinancialLBL"]'),
                    accountNoLabel = $('[id="lblAccountNumber"]'),
                    routingNumberHelpSymbol = $('[id="lnk_BankHelp"]'),
                    requiredFieldAccountType = $('[id="RequiredFieldAccountType"]'),
                    ukFields = $('[id="tr_DDInstructions"], [id="tr_OrigNumber"], [id="tr_CurrentDate"], [id="tr_DDBankInstructions"], [id="tr_DDPDFInstructions"], [id="tr_DDPDFInstructions2"],[id="DC_DDInstructions"],[id="DC_OrigNumber"],[id="DC_CurrentDate"],[id="DC_DDBankInstructions"],[id="DC_DDPDFInstructions"],[id="DC_DDPDFInstructions2"]');
                if (!routingNumber || routingNumber.length <= 0) {
                    return;
                }
                if (bankingSystemType && bankingSystemType.length > 0) {
                    bankingType = bankingSystemType.attr("Value");
                }
                if (routingNumber && routingNumber.length > 0) {
                    routingNumberTextBox = routingNumber;
                }
                if (addressCTL && addressCTL.length > 0) {
                    selectedCountry = addressCTL.val();
                }
                if (routingNumberLabel && routingNumberLabel.length > 0) {
                    routingNumberTextBoxLabel = routingNumberLabel;
                }
                if (transitNumber && transitNumber.length > 0) {
                    transitNumberBox = transitNumber;
                    $('[id="tr_CanadaTransitNum"]').css("display", "none");
                }
                accountNo.css("display", "");
                accountNoNZ.css("display", "");
                accountNoLabel.html("Account Number:");
                routingNumberHelpSymbol.css("display", "");
                if (ukFields && ukFields.length > 0) {
                    ukFields.css('display', 'none');
                }
                if (countryData && validateCountry(selectedCountry, countryData.CAD) && transitNumberBox && transitNumberBox.length > 0 && bankingType === "USA") {
                    routingNumberTextBoxLabel.html("Institution ID:");
                    routingNumberTextBox.attr("maxlength", "4");
                    routingNumberTextBox.val('');
                    accountType.css("display", "none");
                    accountNoNZ.css("display", "none");
                    $('[id="tr_CanadaTransitNum"]').css("display", "");
                } else {
                    if (bankingType !== "Please Select") {
                        if (bankingType === "USA") {
                            routingNumberTextBoxLabel.html("Routing Number:");
                            routingNumberTextBox.attr("maxlength", "9");
                            routingNumberTextBox.val('');
                            accountType.css("display", "");
                            accountNoNZ.css("display", "none");
                        }
                        else if (bankingType === "UK") {
                            routingNumberTextBoxLabel.html("Sort Code:");
                            routingNumberTextBox.attr("maxlength", "6");
                            routingNumberTextBox.val('');
                            accountType.css("display", "none");
                            accountNoNZ.css("display", "none");
                            if (ukFields) {
                                ukFields.css('display', '');
                            }
                        }
                        else if (bankingType === "Europe") {
                            routingNumberTextBoxLabel.html("BIC:");
                            routingNumberTextBox.attr("maxlength", "11");
                            routingNumberTextBox.val('');
                            accountType.css("display", "");
                            accountNoNZ.css("display", "none");
                            routingNumberHelpSymbol.css("display", "none");
                        }
                        else if (bankingType === "Aus_NZ") {
                            routingNumberTextBoxLabel.html("BSB Number:");
                            routingNumberTextBox.attr("maxlength", "6");
                            routingNumberTextBox.val('');
                            accountType.css("display", "none");
                            accountNoNZ.css("display", "none");
                            if (countryData && validateCountry(selectedCountry, countryData.NZ)) {
                                accountNo.css("display", "none");
                                accountNoNZ.css("display", "");
                                routingNumberTextBoxLabel.html("Bank/Branch No.:");
                                accountNoLabel.html("Account No./Suffix:");
                                routingNumberTextBox.attr("maxlength", "7");
                                routingNumberTextBox.val('');
                            }
                        }
                        else if (bankingType === "Other") {
                            routingNumberTextBoxLabel.html("Bank Code:");
                            routingNumberTextBox.attr("maxlength", "25");
                            routingNumberTextBox.val('');
                            accountType.css("display", "");
                            accountNoNZ.css("display", "none");
                            routingNumberHelpSymbol.css("display", "none");
                        }
                        else {
                            routingNumberTextBoxLabel.html("Routing Number:");
                            routingNumberTextBox.attr("maxlength", "9");
                            routingNumberTextBox.val('');
                            accountType.css("display", "");
                            accountNoNZ.css("display", "none");
                        }
                    }
                    else {
                        routingNumberTextBoxLabel.html("Routing Number:");
                        routingNumberTextBox.attr("maxlength", "9");
                        accountType.css("display", "");
                        accountNoNZ.css("display", "none");
                    }
                }
            }

            function donationBankHelp() {
                var sFeatures = 'WIDTH=392px,HEIGHT=400px,RESIZABLE=YES,SCROLLBARS=NO,TOOLBAR=NO,LEFT=5,TOP=20,location=No;status=No', oPopUp,
                    bankingType = $('[id="ddlBankingSystemType"] :selected'), addressCTL = $("[id='country'] :selected"), selectedValue = "", selectedCountry = "", qParam = "";
                if (bankingType && bankingType.length > 0) {
                    selectedValue = bankingType.attr("Value");;
                }
                if (addressCTL && addressCTL.length > 0) {
                    selectedCountry = addressCTL.val();
                }
                if (countryData && validateCountry(selectedCountry, countryData.AUS) && selectedValue === 'Aus_NZ') {
                    qParam = 'AUS';
                } else if (countryData && validateCountry(selectedCountry, countryData.NZ) && selectedValue === 'Aus_NZ') {
                    qParam = 'NZ';
                } else if (countryData && validateCountry(selectedCountry, countryData.CAD) && selectedValue === 'USA' && $('[id="tr_CanadaTransitNum"]') && $('[id="tr_CanadaTransitNum"]').length > 0) {
                    qParam = 'CAD';
                } else {
                    switch (selectedValue) {
                        case 'USA':
                            qParam = "USA";
                            break;
                        case "Aus_NZ":
                            qParam = "AUS";
                            break;
                        case "UK":
                            qParam = "UK";
                            break;
                        default:
                            qParam = "USA";
                            break;
                    }
                }
                oPopUp = new PopUpDialogBB('~/Admin/DonationHelp.ascx', '_blank', sFeatures, '&mode=2&displayfor=' + qParam);
                oPopUp.Show();
            }

            /*************************************** DIRECT DEBIT FUNCTIONS - SECTION END ***************************************/

            // gift aid declaration
            function dDGuarantee() {
                var sFeatures = 'WIDTH=650px,HEIGHT=415px,RESIZABLE=YES,SCROLLBARS=NO,TOOLBAR=NO,LEFT=5,TOP=20,location=No;status=No',
                    oPopUp = new PopUpDialogBB('~/Admin/DonationHelp.ascx', '_blank', sFeatures, '&mode=3');
                oPopUp.Show();
            }

            // return the donation amount
            function getDonationAmount() {
                if (part.find("#amtOther").prop("checked")) {
                    return part.find("#txtAmount").val();
                } else {
                    return part.find("[name='radioAmount']:checked").val();
                }
            }

            // return which payment method is selected on the page
            function GetPaymentType() {
                paymentMethod = part.find("[name='paymentMethod']:checked").val();
                return paymentMethod;
            }

            /*************************************** PROCESSING PAYMENT FUNCTIONS - SECTION START ***************************************/

            // calls the payment api to open the checkout pop up with all the parameters
            this.makePayment = function () {
                var donor = data.Donor,
                    selectedcountry = part.find("#country :selected").attr("iso"),
                    selectedstate = part.find("#state :selected").attr("iso");
                if (selectedcountry && selectedcountry.toLowerCase() == "gb") {
                    selectedcountry = "UK";
                }
                bbcheckout.Configuration.Data.Amount = data.Gift.Designations[0].Amount;
                bbcheckout.Configuration.Data.BillingAddressCity = donor.Address.City;
                bbcheckout.Configuration.Data.BillingAddressCountry = selectedcountry;
                bbcheckout.Configuration.Data.BillingAddressLine = donor.Address.StreetAddress;
                bbcheckout.Configuration.Data.BillingAddressPostCode = donor.Address.PostalCode;
                bbcheckout.Configuration.Data.BillingAddressState = selectedstate;
                bbcheckout.Configuration.Data.BillingAddressEmail = donor.EmailAddress;
                bbcheckout.Configuration.Data.BillingAddressFirstName = donor.FirstName + " " + (donor.MiddleName ? donor.MiddleName : "");
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
                } else if (data.Gift && data.Gift.Recurrence) {      //Set CardToken value only in case of recurring gifts.
                    bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                }
                //Set Donor Info so that it will be passed to finish the transaction at the end.
                data.DonationSource = bbcheckout.Configuration.DonationSource.ADF;
                data.Type = bbcheckout.Configuration.TranType.Donation;
                bbcheckout.DonorInfo = data;
                bbcheckout.openCheckout();
            }

            // call ProcessCCPayment(), submitDonationToServer(data) for further Donation Procesing
            function sendData() {
                if (CheckoutModel && CheckoutModel.MACheckoutSupported && GetPaymentType() == 0) {
                    ProcessCCPayment();
                }
                else {
                    var data;
                    setValidationMessage("");
                    setConsentValidationMessage("");
                    data = extractDataFromForm();
                    submitDonationToServer(data);
                }
            }

            // use this method for credit card payment through popup
            function ProcessCCPayment() {
                data = extractDataFromForm();
                onValidationSuccess = function (result) {
                    makePayment();
                    return false;
                };
                onValidationFailed = function (error) {
                    setValidationMessage(convertErrorsToHtml(error));
                };
                //check Client validation
                donationService.validateDonationRequest(data, onValidationSuccess, onValidationFailed);
            }

            // call when we click on "Donate" button
            function onSubmitClick() {
                if (validateFormClientSide()) {
                    if ($("table[id='consentOption'] tr[isRequired]").length > 0) {
                        if (cnstType) {
                            $("#overlay").css("display", "block");
                            openDialog();
                            $("#myModal button").css("display", "block");
                            $("#myModal button").unbind("click");
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

            // Initialize all properties which required for Checkout pop-up by creating new object BBCheckoutProcessor()
            function InitializeBBCheckout() {
                bbcheckout = new BBCheckoutProcessor(checkoutFunctions(), CheckoutModel.APIControllerName, CheckoutModel.TokenId, '[class*="donationForm"]');
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
                bbcheckout.Configuration.HandleBrowserClosing = (CheckoutModel.HandleBrowserClosing === true ? "True" : "False");
                bbcheckout.Configuration.APITokenID = CheckoutModel.TokenId;
                // You can add your own message to display on screen, after checkout pop-up close
                bbcheckout.Configuration.TempConfirmationHtml = "Thank you for your contribution, please wait while we process your transaction.";
                bbcheckout.intializeCheckout();
            }

            function checkoutFunctions() {
                // If you want to override the functionality of any below mentioned events, then you can write your required code in respective Checkout Events Block
                checkoutEvents = {
                    checkoutComplete: function (e) {
                        // Invoke after Payment will successfully Completed
                        bbcheckout.postCheckoutFinish();
                    },
                    checkoutError: function (data) {
                        //Place any code if you want to do anything on error.
                    },
                    checkoutExpired: function () {
                        // If your Checkout modal dialog will expire, due to inactivity on page. Then write code in this block.
                    },
                    checkoutReady: function () {
                        // If your Checkout modal dialog will Ready for Loading, after Donate button click. Then write code in this block.
                    },
                    browserClose: function () {
                        // If you Close the Browser. Then write code in this block.
                    },
                    checkoutCancel: function () {
                        // If your Cancel the Checkout modal dialog. Then write code in this block.
                    },
                    checkoutLoaded: function () {
                        // If your Checkout modal dialog will Load on page. Then write code in this block.
                    }
                }
                return checkoutEvents;
            }

            /*------------------------------------------- JAVASCRIPT FUNCTIONS - SECTION END -------------------------------------------*/

            // this function set-up/bind all required controls of Donation Form on Page Load
            function setupForm() {
                bindDesignationDropdown();
                bindCountryDropdown();
                bindTitleDropdown();
                //bindUserData();
                bindConsentOption();
                getCountryMappings();
                bindDirectDebitData();
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
                    part.find("#acknowledgeeCountry").change(function () { addCountryHandler(); })
                });
                part.find("#number-of-installments").change(function () { updateEverythingPossible(); });
                part.find("#start-date").change(function () { updateEverythingPossible(); });
                part.find("#frequency").change(function () { updateEverythingPossible(); });
                part.find("#day-of-month").change(function () { updateEverythingPossible(); });
                part.find("#month").change(function () { updateEverythingPossible(); });
                part.find("#day-of-week").change(function () { updateEverythingPossible(); });
                part.find("#recMonthly").click(function () {
                    showHideRecurrenceDiv();
                    part.find("#billMeLater").css("display", "none");
                    part.find("#directDebit").css("display", "");
                });
                part.find("#recOneTime").click(function () {
                    showHideRecurrenceDiv();
                    part.find("#billMeLater").css("display", "");
                    part.find("#directDebit").css("display", "none");
                });
                part.find("#paymentDirectDebit").click(function () { showHideDirectDebitDiv(); })
                part.find("#ddlBankingSystemType").change(function () { hideAndVisible_DirectDebitFields(); })
                part.find("#country").change(function () { addCountryHandler(); })
                part.find("#paymentCreditCard").click(function () { part.find("#directDebitInformation").hide(); });
                part.find("#lnk_BankHelp").click(function () { donationBankHelp(); });
                part.find("#lnk_DDGuarantee").click(function () { dDGuarantee(); });
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
                blocked = false,
                    part = $(".donationForm"),
                    partInstanceId = part.parents(".BBDonationApiContainer").attr("data-partid"),
                    ClientSitesID = part.parents(".BBDonationApiContainer").attr("ClientSitesID"),
                    CheckoutModel = JSON.parse(checkoutData),
                    serverMonth = part.parents(".BBDonationApiContainer").attr("serverMonth") - 1,
                    serverDay = part.parents(".BBDonationApiContainer").attr("serverDay"),
                    serverYear = part.parents(".BBDonationApiContainer").attr("serverYear");
                ServerDate = new Date(serverYear, serverMonth, serverDay);
                // Create an instance of the DonationService
                donationService = new BLACKBAUD.api.DonationService(partInstanceId);

                // Initialize the all checkout related property
                InitializeBBCheckout();

                t = BLACKBAUD.api.querystring.getQueryStringValue("t")
                if (t) {
                    part.find(".form").hide();
                    part.find(".confirmation").show();
                } else {
                    part.find(".form").show();
                    part.find(".confirmation").hide();
                    setupForm();
                }
            }
            PageLoad();

            /*------------------------------------------- PAGE LOAD METHOD - END -------------------------------------------*/

        }());
