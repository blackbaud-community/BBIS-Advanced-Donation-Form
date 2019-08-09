// Let's be good developers and not pollute the global namespace
(function ($) {

 // Let's make sure the DOM is ready
$(function () {

  // Create an instance of the DonationService
  var ds = new BLACKBAUD.api.DonationService(
  $('.BBDonationApiContainer').data('partid'));
     
 
   //Create the donation object we'll send
  //In order to simplify our examples, some of this information is hard-coded.
  var donation = {
  MerchantAccountId: '00000000-0000-0000-0000-000000000000',
  BBSPReturnUri: window.location.href,
  BBSPTemplateSitePageId: 000,
  Gift: {
        PaymentMethod: 2,
        Designations: []
      }
  };

  // Create our success handler
  var success = function (returnedDonation) {
  console.log(returnedDonation);
  if (returnedDonation.Donation.Gift.PaymentMethod === 2) {
      window.location.href = window.location.href + "?t=" + d.Donation.Id;
  }
  };   

  // Create our error handler
  var error = function (returnedErrors) {
  console.log('Error!');
  };
  
	//Show and Hide directdebit div on the page
 function showHideDirectDebitDiv() {
   if ($("#paymentDirectDebit").prop("checked")) {
      $("#directDebitInformation").show();
      hideAndVisible_BankingTypeField();
      addCountryHandler();
     }
     else {
       $("#directDebitInformation").hide();
        }
    }

	//Call the function when we have to hide and visible the banking type field
    function hideAndVisible_BankingTypeField() {
        if ($('[id="ddlBankingSystemType"] option').length == 1) {
            $('#tr_BankingSystemType').css('display', 'none');
        } else {
            $('#tr_BankingSystemType').css('display', '');
        }
    }

	//Use to bind the banking types that is configured in CRM
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

	//this function is used to select the banking type on the basis of country dropdown change
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
            hideAndVisible_DirectDebitFields();
        }
    }

	//Hide and Visible direct debit fields on the basis of country dropdown and banking type dropdown change
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

//this function is called when we click on help image of reoting number textbox(and it changes on the basis of banking type dropdown change)
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


    function dDGuarantee() {
        var sFeatures = 'WIDTH=650px,HEIGHT=415px,RESIZABLE=YES,SCROLLBARS=NO,TOOLBAR=NO,LEFT=5,TOP=20,location=No;status=No',
            oPopUp = new PopUpDialogBB('~/Admin/DonationHelp.ascx', '_blank', sFeatures, '&mode=3');
        oPopUp.Show();
    }

	//this is used to set country object with all possible value of the countries(like Abbreviation, Country Name, and Guid)
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

	//for validate the country thatused to select the banking type on the basis of country dropdown change 
    function validateCountry(country, ctryData) {
        if (country.toUpperCase() === ctryData.Id.toUpperCase() || country.toUpperCase() === ctryData.Abbreviation.toUpperCase() || country.toUpperCase() === ctryData.Description.toUpperCase()) {
            return true;
        }
        return false;

    }
 
	 //Bind Direct Debit
	 
	    getCountryMappings();
        bindDirectDebitData();
		
		//Attach Listeners
		$("#recMonthly").click(function () {
        $("#directDebit").css("display", "");
        });
        $("#recOneTime").click(function () {
        $("#directDebit").css("display", "none");
        });
        $("#paymentDirectDebit").click(function () { showHideDirectDebitDiv(); })
        $("#ddlBankingSystemType").change(function () { hideAndVisible_DirectDebitFields(); })
$("#lnk_BankHelp").click(function () { donationBankHelp(); });
        $("#lnk_DDGuarantee").click(function () { dDGuarantee(); });

//Attach event listener on country change
$("#country").change(function () { addCountryHandler(); })
		
     // Attach our event listener to the donate button
   $('.btn-donate').click(function(e) {
      
      // Stop the button from submitting the form
      e.preventDefault(); 
	  
      //Payment Method(2) means direct debit and set all the properties of direct debit
        if (paymentMethod === "2" && $("#paymentDirectDebit").prop("checked")) {
            donation.Gift.DirectDebitInformation = {};
            var selectedCountry = $("#country :selected").val(), bankingType = $("#ddlBankingSystemType :selected").val();
            donation.Gift.DirectDebitInformation.FinancialInstitution = $("#txtFinancialInstitution").val();
            donation.Gift.DirectDebitInformation.BranchName = $("#txtBranchName").val();
            donation.Gift.DirectDebitInformation.AccountHolderName = $("#txtAccountHolder").val();
            donation.Gift.DirectDebitInformation.BankingType = bankingType;


            if (countryData && validateCountry(selectedCountry, countryData.CAD) && bankingType === "USA") {
                donation.Gift.DirectDebitInformation.RoutingNumber = $("#txtRoutingNumber").val();
                donation.Gift.DirectDebitInformation.TransitNumber = $("#txtCanTransitNumber").val();
            }
            else {
                donation.Gift.DirectDebitInformation.RoutingNumber = $("#txtRoutingNumber").val();
            }

            if (countryData && validateCountry(selectedCountry, countryData.NZ) && bankingType === "Aus_NZ") {
                donation.Gift.DirectDebitInformation.AccountNumber = $("#txtAccountNumberNZ").val();
                donation.Gift.DirectDebitInformation.SuffixNo = $("#txtSuffixNZ").val();
            }
            else {
                donation.Gift.DirectDebitInformation.AccountNumber = $("#txtAccountNumber").val();
            }

            if (bankingType === "Europe" || bankingType === "Other" || countryData && (!validateCountry(selectedCountry, countryData.CAD) && bankingType === "USA")) {
                donation.Gift.DirectDebitInformation.AccountType = $("#ddlAccountType :selected").val();
            }
            else {
                donation.Gift.DirectDebitInformation.AccountType = "";
            }

        }

     // Submitting the donation
     ds.createDonation(donation, success, error);
     }); 

  });
 }(jQuery));