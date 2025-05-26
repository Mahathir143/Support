const rowsPerPage = 10;
let uActivityId = 0; // Change from const to let

let rowCounter = 0;
const estimatedHrsIncrement = 0;
let fileNo;



$(document).ready(function () {
    const sections = $(".section");
    const prevBtn = $("#prev-page-btn");
    const nextBtn = $("#next-btn");
    const saveBtn = $("#saveBtn");
    const $steps = $(".step");
    const stepperLine = $(".stepper-horizontal::before"); // Reference to the stepper line

    let currentSectionIndex = 0;

    // Function to get CSS root variables
    const getCSSVariable = (varName) =>
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

    const updatePagination = () => {
        // Show only the current section
        sections.hide().eq(currentSectionIndex).css("display", "flex");

        // Update stepper state
        $steps.each(function (index) {
            const stepNumber = $(this).find(".step-number");
            if (index < currentSectionIndex) {
                $(this).removeClass("editing").addClass("checked");
                stepNumber.html("&#10003;"); // Show tick symbol for completed steps
            } else if (index === currentSectionIndex) {
                $(this).removeClass("checked").addClass("editing");
                stepNumber.html("&#10003;"); // Show tick symbol for current step
            } else {
                $(this).removeClass("editing checked");
                stepNumber.html("&#10007;"); // Show 'X' symbol for upcoming steps
            }
        });

        // Change the stepper line color dynamically by adding/removing a class
        if (currentSectionIndex === 0) {
            $(".stepper-horizontal").removeClass("stepper-active stepper-checked").addClass("stepper-default");
        } else if (currentSectionIndex === $steps.length - 1) {
            $(".stepper-horizontal").removeClass("stepper-active stepper-default").addClass("stepper-checked");
        } else {
            $(".stepper-horizontal").removeClass("stepper-default stepper-checked").addClass("stepper-active");
        }

        // Disable Prev button on the first tab
        if (currentSectionIndex === 0) {
            prevBtn.hide();
        } else {
            prevBtn.show();
            prevBtn.prop("disabled", false);
        }

        // Change Next button text to "Clear All" on last section
        nextBtn.text(currentSectionIndex === sections.length - 1 ? "Clear All" : "Next");
    
        // Hide the button if the text is "Clear All"
        if (nextBtn.text() === "Clear All") {
            nextBtn.hide();
        } else {
            nextBtn.show();
        }

        // Hide Save button on the first tab, show otherwise
        saveBtn.toggle(currentSectionIndex !== 0);
    };

    // "Previous" button click
    prevBtn.click(function () {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            updatePagination();
        }
    });

    // "Next" button click
    nextBtn.click(function () {
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            updatePagination();
        } else {
            alert("All steps completed!");
        }
    });

    // Initialize the pagination and stepper
    updatePagination();
});









$(document).ready(function () {
    const $steps = $('.step');
    const $nextBtn = $('.next-btn');
    const $backBtn = $('.back-btn');

    let currentStepIndex = 0;

    // Function to update stepper state
    const updateStepper = () => {
        $steps.each(function (index) {
            if (index < currentStepIndex) {
                $(this).removeClass('editing').addClass('checked');
            } else if (index === currentStepIndex) {
                $(this).removeClass('checked').addClass('editing');
            } else {
                $(this).removeClass('editing checked');
            }
        });

        // Enable/disable buttons based on step index
        $backBtn.prop('disabled', currentStepIndex === 0);
        $nextBtn.text(currentStepIndex === $steps.length - 1 ? 'Finish' : 'Next');
    };

    // Next button click event
    $nextBtn.click(function () {
        if (currentStepIndex < $steps.length - 1) {
            currentStepIndex++;
            updateStepper();
        } else {
            alert('Step process completed!');
        }
    });

    // Back button click event
    $backBtn.click(function () {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateStepper();
        }
    });

    // Initialize stepper
    updateStepper();
});





$(document).ready(function () {

    // Variable to store the data temporarily
    let modalData = [];

    $("#viewContainerDetails").on("click", function () {
        //debugger;

        // Retrieve input values from cardContainer
        const ctrQtyInputs = $(".txtCTRsize");
        const ctrSizeInputs = $(".txtCTRtype");
        const containerTableBody = $("#containerTableBody");

        let isValid = false; // Flag to track if at least one pair is valid
        let firstInvalidInput = null; // To store the first invalid input field

        // Loop through the inputs to validate and check if at least one CTR Qty and CTR Size Type are filled
        ctrQtyInputs.each(function (index) {
            const qty = parseInt($(this).val(), 10);
            const size = $(ctrSizeInputs[index]).val();

            // Remove previous highlights if user starts filling the input
            if ($(this).hasClass("is-invalid")) {
                $(this).removeClass("is-invalid");
            }
            if ($(ctrSizeInputs[index]).closest("tr").hasClass("table-danger")) {
                $(ctrSizeInputs[index]).closest("tr").removeClass("table-danger");
            }

            // Check if CTR Qty is filled but CTR Size Type is not filled
            if (Number.isInteger(qty) && qty > 0 && size.trim() === "") {
                // Highlight the row with the missing size type
                $(this).closest("tr").addClass("table-danger");
                firstInvalidInput = $(ctrSizeInputs[index]); // Store the reference to the first invalid input
            }
            // Check if at least one pair is valid
            if (Number.isInteger(qty) && qty > 0 && size.trim() !== "") {
                isValid = true; // If valid pair is found, set isValid to true
            }
        });

        // If no valid pair found, show an alert and stop the process
        if (!isValid) {
            // Highlight the first empty field or the row that is incomplete
            if (!firstInvalidInput) {
                ctrQtyInputs.each(function () {
                    if (!$(this).val()) {
                        $(this).addClass("is-invalid"); // Highlight the first empty field with danger mark
                        firstInvalidInput = $(this);
                        return false; // Stop once we find the first invalid field
                    }
                });
            }

            if (firstInvalidInput) {
                toastr.error("Please fill in at least one valid CTR Qty and Type.");
            }
            return; // Prevent modal from being opened if validation fails
        }

        // Store the data before clearing the rows
        modalData = [];
        ctrQtyInputs.each(function (index) {
            const qty = parseInt($(this).val(), 10);
            const size = $(ctrSizeInputs[index]).val();
            modalData.push({ qty, size });
        });

        // Clear existing rows in the modal table if validation is passed
        containerTableBody.empty();

        // Loop through the stored data to generate rows
        modalData.forEach(data => {
            for (let i = 0; i < data.qty; i++) {
                containerTableBody.append(`
            <tr>
              
                <td><input type="text" class="form-control container-no" placeholder="Enter Container No"></td>
                <td><input type="text" class="form-control container-size" value="${data.size}" disabled></td>
                <td><input type="text" class="form-control container-size" value="${data.size}" disabled></td>
            </tr>
        `);
            }
        });

        // Show the modal
        $("#modalContainer").modal("show");

        // Add the input event handler to sync container numbers
        $("#txtContainerList").off("input").on("input", function () {
            const containerNumbers = $(this)
                .val()
                .split(/[,\n/]/)
                .map((val) => val.trim()); // Split and trim container numbers

            containerTableBody.find(".container-no").each(function (index) {
                $(this).val(containerNumbers[index] || ""); // Update container numbers dynamically

                // Check if a container number has been filled
                if ($(this).val() !== "") {
                    // Scroll the filled row into view
                    $(this).closest("tr")[0].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            });
        });

        // Focus on the txtContainerList input field after showing the modal
        setTimeout(function () {
            // Focus the input field
            $("#txtContainerList").focus();

            // Simulate typing a space character
            var inputElement = $("#txtContainerList")[0];
            var currentValue = inputElement.value;

            // Update the input field's value with a space
            inputElement.value = currentValue + " ";

            // Trigger the input event manually to notify any listeners
            var inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            inputElement.dispatchEvent(inputEvent);

        }, 1000); // Delay by 1000ms (1 second)




    });


    // Event listener to re-populate data when modal is reopened
    $('#modalContainer').on('show.bs.modal', function () {
        if (modalData.length > 0) {
            const containerTableBody = $("#containerTableBody");
            containerTableBody.empty(); // Clear the table body before repopulating

            modalData.forEach(data => {
                for (let i = 0; i < data.qty; i++) {
                    containerTableBody.append(`
                    <tr>
                        <td><input type="text" class="form-control container-no" placeholder="Enter Container No"></td>
                        <td><input type="text" class="form-control container-size" value="${data.size}" disabled></td>
                    </tr>
                `);
                }
            });
        }
    });



    function populateFields(data) {
        debugger
        //console.log(data, "datafrom")
        // Loop through each key in the response data
        Object.keys(data).forEach(key => {
            debugger
            // Find the ITMSInput div by matching data-id
            const inputDiv = $(`[data-id="${key}"]`);

            if (inputDiv.length > 0) {
                // Handle Text and Date Inputs (e.g. for order numbers, remarks, etc.)
                const inputField = inputDiv.find('input');
                if (inputField.length > 0) {
                    const fieldType = inputField.attr('type');

                    // For text and date input types
                    if (fieldType === 'text' || fieldType === 'date') {
                        inputField.val(data[key]);
                    }
                }

                // Handle Dropdowns (select elements)
                const selectField = inputDiv.find('select');
                if (selectField.length > 0) {
                    const options = data[key]; // Assuming data[key] is an array of options
                    selectField.empty(); // Clear existing options
                    options.forEach(option => {
                        selectField.append(new Option(option.text, option.value)); // Populate options
                    });
                    // If a value exists, set the selected option
                    if (data[key].selectedValue) {
                        selectField.val(data[key].selectedValue);
                    }
                }

                // Handle Checkboxes
                const checkboxField = inputDiv.find('input[type="checkbox"]');
                if (checkboxField.length > 0) {
                    checkboxField.prop('checked', data[key] === 'true' || data[key] === true);
                }
            }
        });
    }



    // Wait for inputComponentDeferred to be resolved
    $.when(window.inputComponentDeferred).done(function () {
        initializeOrderBooking();
    });

    $("#btnSelect").on("click", function () {


        //// Validate Shipment Type and Qty inputs
        //const shipmentType = $('#ddlOrderInfoShipmentType').val();
        //const qty = parseInt($('#txtOrderInfoQty').val(), 10);

        //if (!shipmentType || !Number.isInteger(qty) || qty <= 0) {
        //    alert("Please select a Shipment Type and enter a valid Qty.");
        //    return;
        //}

        // Open the modal
        $("#cardContainer").show();

        //// Generate table rows dynamically only if the table is empty
        //const $tableBody = $("#containerTableBody");
        //if ($tableBody.children().length === 0) {
        //    for (let i = 0; i < qty; i++) {
        //        $tableBody.append(`
        //    <tr>
        //        <td><input id="txtcontianerno" type="text" class="form-control container-no" /></td>
        //        <td><input  id="txtsize" type="text" class="form-control container-size" /></td>
        //    </tr>
        //`);
        //    }
        //}


        //// Fill Container Numbers from Textarea only if text area has input
        //$("#txtContainerList").off("input").on("input", function () {
        //    const containerNumbers = $(this)
        //        .val()
        //        .split(/[,/]/)
        //        .map((val) => val.trim());
        //    $tableBody.find(".container-no").each(function (index) {
        //        $(this).val(containerNumbers[index] || "");
        //    });
        //});
    });

    // Modal close event to retain values (No additional clearing logic needed)
    $("#modalContainer").on("hidden.bs.modal", function () {
        // Optional: You can implement any specific cleanup logic here if required.
    });

    /* addRow();*/
});




// Event listener to remove highlight when user fills in the missing data
$(document).on("input", "#cardContainer input[placeholder^='Qty'], #cardContainer input[placeholder^='Type']", function () {
    const ctrQtyInputs = $("#cardContainer input[placeholder^='Qty']");
    const ctrSizeInputs = $("#cardContainer input[placeholder^='Type']");

    ctrQtyInputs.each(function (index) {
        const qty = parseInt($(this).val(), 10);
        const size = $(ctrSizeInputs[index]).val();

        // If the user fills the input, remove the highlight
        if (qty > 0 && size.trim() !== "") {
            $(this).removeClass("is-invalid");
            $(ctrSizeInputs[index]).closest("tr").removeClass("table-danger");
        }
    });
});

function initializeOrderBooking() {
    initializePage();

    //initializeAutocompleteWithAjax('#ddlFileType', 'Tbl_Operation_Code_Header', 'operation_code_file_type_id');

    initializeTableAutocompleteWithAjax('#ddlFileType', 'Tbl_File_Type_Master', 'file_type_code', null, 'file_type_id', 'file_type_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax('#ddlOrderInfoLoadingPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax('#ddlOrderInfoUnloadingPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', '', null, null, false);

    initializeTableAutocompleteWithAjax('#ddlVoyageInfoVoyageCode', 'Tbl_Voyage_Master', 'voyage_name', 'voyage_code', 'voyage_id', 'voyage_is_active', '', null, null, true);
    initializeTableAutocompleteWithAjax('#ddlVoyageInfoVesselName', 'Tbl_Vessel_Master', 'vessel_name', 'vessel_code', 'vessel_id', 'vessel_is_active', '', null, null, true);
    initializeTableAutocompleteWithAjax('#ddlVoyageInfoLine', 'Tbl_Line_Master', 'line_name', 'line_code', 'line_id', 'line_is_active', '', null, null, true);

    initializeTableAutocompleteWithAjax('#ddlVoyageInfoLodPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax('#ddlVoyageInfoDisPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', '', null, null, false);

    initializeTableAutocompleteWithAjax('#ddlDeliveryAddressCode', 'Tbl_Customer_Delivery_Address_Master', 'customer_delivery_address_name', 'customer_delivery_address_code', 'customer_delivery_address_id', 'customer_delivery_address_is_active', '', null, null, true);
    initializeTableAutocompleteWithAjax('#ddlProductInfoCode', 'Tbl_Product_Master', 'product_description', null, 'product_id', 'product_is_active', '', null, null, false);

    //initializeTableAutocompleteWithAjax('#ddlExtraInfoLinesTerminal', 'Tbl_Terminal_Master', 'terminal_name', 'terminal_id', 'terminal_is_active', '');
    initializeTableAutocompleteWithAjax('#ddlExtraInfoLinesTerminal', 'Tbl_Terminal_Master', 'ttm.terminal_name', 'ttm.terminal_code', 'ttm.terminal_id', 'ttm.terminal_is_active', '', 'AND LOWER(sm.selection_field_name) LIKE \'%empty%\'', 'ttm LEFT JOIN itms.\"Tbl_Selection_Master\" sm ON sm.selection_field = \'terminal_type_code\' AND ttm.terminal_type_id = sm.selection_id', null, true);
    //initializeTableAutocompleteWithAjax('#ddlExtraInfoLinesTerminal', 'Tbl_Terminal_Master', 'sm.selection_field_name as terminal_type_code', 'ttm.terminal_id', 'ttm.terminal_is_active', '', 'AND sm.selection_field_name LIKE \"% EMPTY %\"', 'LEFT JOIN itms."Tbl_Selection_Master" sm ON sm.selection_field = \'terminal_type_code\' AND ttm.terminal_type_id = sm.selection_id');
    initializeTableAutocompleteWithAjax('#ddlExtraInfoShoppingLine', 'Tbl_Line_Master', 'line_name', 'line_code', 'line_id', 'line_is_active', '', null, null, true);

    initializeTableAutocompleteWithAjax('#ddlExtraInfoLinesTerminal', 'Tbl_Terminal_Master', 'terminal_name', null, 'terminal_id', 'terminal_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax('#ddlExtraInfoShoppingLine', 'Tbl_Line_Master', 'line_name', null, 'line_id', 'line_is_active', '', null, null, false);

    initializeAutocompleteWithAjax('#ddlExtraInfoOrderStatus', 'Tbl_Booking', 'booking_order_status');
    $('#saveBtn').click(handleSave);
}

function initializePage() {

    $('#ddlOperationCode').prop('disabled', true);
    $('#txtOrderInfoOrderNo').prop('disabled', true);
    $('#txtFileNo').prop('disabled', true);


    $(".nav-title").html("Order Booking");

    if (isLoggedIn !== 'true') {
        window.location.href = "/Account/Login";
    }
    var message = getCookie('flashMessage');
    if (message) {
        toastr.success(message);
        clearSpecificCookie('flashMessage');
    }
}
// Common AJAX function
function fetchData(datatosend, callback) {
    $.ajax({
        url: apiBaseUrl + "GetAllValueList",
        method: "POST",
        headers: getAjaxHeaders(),
        data: JSON.stringify(datatosend),
        success: function (response) {
            //console.log(response, "fetchData response");
            var data = JSON.parse(response.data); // Parse the response data
            if (callback) callback(data); // Pass data to callback
        },
        error: function () {
            toastr.error("Failed to load data.");
        }
    });
}

// Function to handle the change event and load booking details
$('#ddlDeliveryAddressCode').on('change', function () {
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        loaddeliveryaddressdetailslist(selectedId);
    }
});
$('#ddlProductInfoCode').on('change', function () {
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        loadproductdetailslist(selectedId);
    }
});

$('#ddlVoyageInfoVoyageCode').on('change', function () {
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        loadvoyagedetailslist(selectedId);
    }
});
$('#ddlFileType').on('change', function () {
    debugger;
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        initializeTableAutocompleteWithAjax('#ddlOperationCode', 'Tbl_Operation_Code_Header', 'operation_code_description', 'operation_code_code', 'operation_code_id', 'operation_code_is_active', '', 'AND operation_code_file_type_id = ' + selectedId, null, true);
        $('#ddlOperationCode').prop('disabled', false);

    }
});

$('#ddlOperationCode').on('change', function () {
   
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        loadOperationDetails(selectedId);
        setTimeout(() => {
            checkDynamicFields();
        }, 1000);
        
    }
    
});

$('#ddlOrderInfoShipmentType').on('change', function () {
    //debugger;
    var selectedId = $(this).attr('data-code');
    //console.log(selectedId, "selected Id");
    if (selectedId) {
        showHideSectionsBasedOnShipmentType(selectedId);
    }
});

function showHideSectionsBasedOnShipmentType(Id) {
    $.ajax({
        url: apiBaseUrl + "GetActivityFieldsDetails/" + Id + "/" + gblProjectId,
        method: "GET",
        headers: getAjaxHeaders(),
        success: function (response) {
            //console.log('response', response);
            if (response.statusCode === 1 && Array.isArray(response.data)) {
                response.data.forEach(item => {
                    // Select the div based on the fieldCode
                    var div = $('.DIV_' + item.fieldCode);

                    // Show or hide the div based on isChecked
                    if (item.isChecked === false) {
                        div.hide(); // Hide the div
                    } else {
                        div.show(); // Show the div
                    }
                });
                var data = response.data2;
                //  alert("33");
                // loaddeliveryaddressdetailslist(data.operationCodeActivitiesDeliveryAddressId);
                //console.log(data, "data for others");
                populateTableAutocompleteWithAjax('#ddlDeliveryAddressCode', 'Tbl_Customer_Delivery_Address_Master', 'customer_delivery_address_name', 'customer_delivery_address_code', 'customer_delivery_address_id', 'customer_delivery_address_is_active', data.operationCodeActivitiesDeliveryAddressId.toString());
                loaddeliveryaddressdetailslist(data.operationCodeActivitiesDeliveryAddressId);
                populateTableAutocompleteWithAjax('#ddlProductInfoCode', 'Tbl_Product_Master', 'product_description', 'product_code', 'product_id', 'product_is_active', data.operationCodeActivitiesProductId.toString());
                loadproductdetailslist(data.operationCodeActivitiesProductId);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
}


function loadOperationDetails(Id) {
    $.ajax({
        url: apiBaseUrl + "GetOperationDetails/" + Id,
        method: "GET",
        headers: getAjaxHeaders(),
        success: function (response) {
            //console.log('response', response);
            if (response.statusCode == 1) {
                fillOperationData(response);
               
                fillShipmentDropDown(Id);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);

        }
    });
}


function fillOperationData(operationDetails) {
    //console.log(operationDetails, "operationDetails");
    initializeTableAutocompleteWithAjax('#ddlStartOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', '', null, true);
    initializeTableAutocompleteWithAjax('#ddlOperationPoint', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', '', null, true);
    initializeTableAutocompleteWithAjax('#ddlEndOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', '', null, true);
    initializeTableAutocompleteWithAjax('#ddlCustomerName', 'Tbl_Customer_Master', 'customer_name', 'customer_code', 'customer_id', 'customer_is_active', '', '', null, true);
    initializeAutocompleteWithAjax('#ddlBookingType', 'Tbl_Operation_Code_Header', 'operation_code_booking_type_id');

    if (operationDetails.from) {
        //debugger;
        //console.log(operationDetails.from, "from");
        populateTableAutocompleteWithAjax('#ddlStartOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', operationDetails.from.toString(), null, null, true);
    } else {
        initializeTableAutocompleteWithAjax('#ddlStartOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', null, null, true);
    }
    if (operationDetails.mid) {
        //console.log(operationDetails.mid, "mid");
        populateTableAutocompleteWithAjax('#ddlOperationPoint', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', operationDetails.mid.toString(), null, null, true);
    } else {
        initializeTableAutocompleteWithAjax('#ddlOperationPoint', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', null, null, true);
    }
    if (operationDetails.end) {
        //console.log(operationDetails.end, "end");
        populateTableAutocompleteWithAjax('#ddlEndOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', operationDetails.end.toString(), null, null, true);
    } else {
        initializeTableAutocompleteWithAjax('#ddlEndOperation', 'Tbl_Region_Master', 'region_name', 'region_code', 'region_id', 'region_is_active', '', null, null, true);
    }
    if (operationDetails.customer) {
        populateTableAutocompleteWithAjax('#ddlCustomerName', 'Tbl_Customer_Master', 'customer_name', 'customer_code', 'customer_id', 'customer_is_active', operationDetails.customer.toString(), null, null, true);
    } else {
        initializeTableAutocompleteWithAjax('#ddlCustomerName', 'Tbl_Customer_Master', 'customer_name', 'customer_code', 'customer_id', 'customer_is_active', '', null, null, true);
    }
    if (operationDetails.bookingType) {
        populateAutocompleteWithAjax('#ddlBookingType', 'Tbl_Operation_Code_Header', 'operation_code_booking_type_id', operationDetails.bookingType.toString());
    } else {
        initializeAutocompleteWithAjax('#ddlBookingType', 'Tbl_Operation_Code_Header', 'operation_code_booking_type_id');
    }

    $('#txtFileNo').val(operationDetails.fileNo);

    fileNo = operationDetails.fileNo;
    //console.log(fileNo, "fileNo")
    $('#txtOrderReceived').val(operationDetails.orderRecieved);
   
}

function fillShipmentDropDown(Id) {
    //debugger;
    if (Id) {
        initializeTableAutocompleteWithAjax('#ddlOrderInfoShipmentType', 'Tbl_Activity_Master', 'A.activity_short_description', 'A.activity_code', 'A.activity_id', 'A.activity_is_active', '', ' And B.operation_code_activities_operation_code_id = ' + Id, ' As A Inner Join itms."Tbl_Operation_Code_Activities" As B On A.activity_id = B.operation_code_activities_activity_id', true);
    }
   
}



// Load booking details list with data from the AJAX request
function loaddeliveryaddressdetailslist(id) {
    var datatosend = {
        Page: 1,
        PageSize: 10,
        Tablename: "Tbl_Customer_Delivery_Address_Master",
        TablePrefix: "customer_delivery_address_",
        AddonQuery: `tcdam`,
        DisplayQuery: "tcdam.*",
        Key: "tcdam.",
        FilterConditions: "AND tcdam.customer_delivery_address_id = " + id
    };

    // Use fetchData and pass in a callback to handle the response
    fetchData(datatosend, function (data) {
        if (data && data.length > 0) {
            var item = data[0]; // Assuming only one record

            // Fill each input based on its data-id attribute
            $("[data-id='txtDeliveryAddressContactName']").find('input').val(item.customer_delivery_address_contact_person || '');
            $("[data-id='txtDeliveryAddressTel']").find('input').val(item.customer_delivery_address_telephone || '');
            $("[data-id='txtDeliveryAddressAddress1']").find('input').val(item.customer_delivery_address_address1 || '');
            $("[data-id='txtDeliveryAddressAddress2']").find('input').val(item.customer_delivery_address_address2 || '');
        }
    });
}
function loadproductdetailslist(id) {
    var datatosend = {
        Page: 1,
        PageSize: 10,
        Tablename: "Tbl_Product_Master",
        TablePrefix: "product_",
        AddonQuery: `tpm`,
        DisplayQuery: "tpm.*",
        Key: "tpm.",
        FilterConditions: "AND tpm.product_id = " + id
    };

    // Use fetchData and pass in a callback to handle the response
    fetchData(datatosend, function (data) {
        if (data && data.length > 0) {
            var item = data[0]; // Assuming only one record

            // Fill each input based on its data-id attribute
            $("[data-id='txtProductInfoDescription']").find('input').val(item.product_description || '');
            $("[data-id='txtProductInfoGrade']").find('input').val(item.product_grade || '');

        }
    });
}
function loadvoyagedetailslist(id) {
    var datatosend = {
        Page: 1,
        PageSize: 10,
        Tablename: "Tbl_Voyage_Master",
        TablePrefix: "voyage_",
        AddonQuery: `tvm`,
        DisplayQuery: "tvm.*",
        Key: "tvm.",
        FilterConditions: "AND tvm.voyage_id = " + id
    };

    // Use fetchData and pass in a callback to handle the response
    fetchData(datatosend, function (data) {
        if (data && data.length > 0) {
            var item = data[0]; // Assuming only one record
            //console.log(item, "item in voyage");
            populateTableAutocompleteWithAjax('#ddlVoyageInfoVesselName', 'Tbl_Vessel_Master', 'vessel_name', 'vessel_code', 'vessel_id', 'vessel_is_active', item.voyage_vessel_id.toString(), null, null, true);
            populateTableAutocompleteWithAjax('#ddlVoyageInfoLine', 'Tbl_Line_Master', 'line_name', 'line_code', 'line_id', 'line_is_active', item.voyage_line_id.toString(), null, null, true);

            populateTableAutocompleteWithAjax('#ddlVoyageInfoLodPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', item.voyage_loading_port_id.toString(), null, null, false);
            populateTableAutocompleteWithAjax('#ddlVoyageInfoDisPort', 'Tbl_Port_Master', 'port_name', null, 'port_id', 'port_is_active', item.voyage_discharge_port_id.toString(), null, null, false);
            let voyageEtaDate = item.voyage_eta.split("T")[0]; // Extract the date portion only
            $('#txtVoyageInfoETA').val(voyageEtaDate);
            //// Fill each input based on its data-id attribute
            //$("[data-id='txtProductInfoDescription']").find('input').val(item.product_description || '');
            //$("[data-id='txtProductInfoGrade']").find('input').val(item.product_grade || '');

        }
    });
}

function handleSave() {
    // Validate mandatory fields before proceeding
    if (!validateFieldData()) {
        return; // Stop execution if validation fails
    }
    //debugger;
    const menu = collectOrderBookingData();

    console.log(menu, "datatosendbookity");
    
    $.ajax({
        url: ITMSMastersApi + "Booking/CreateBooking",
        method: "POST",
        data: JSON.stringify(menu),
        contentType: "application/json", // Fix contentType value
        headers: getAjaxHeaders(),
        beforeSend: function () {
            // Show SweetAlert with the loading GIF
            Swal.fire({
                title: 'Creating Your Order...',
                html: `<div id="loadingPopup" style="display: flex; justify-content: center; align-items: center;">
                      <img src="/gif/orderbookingnew.gif" alt="Loading..." style="width: 100px; height: 100px;">
                  </div>`,
                showConfirmButton: false,
                allowOutsideClick: false, // Prevent outside click to dismiss the alert
                didOpen: () => {
                    // Any additional setup if required after SweetAlert is opened
                }
            });
        },
        success: function (response) {
            // After the success response, delay for 2 seconds to display the loader
            setTimeout(function () {
                // Remove the loader and show success message
                Swal.fire({
                    title: "Success!",
                    html: `Booking created with File No: <strong style="color: #007BFF; font-size: 1.2em;">${fileNo}</strong>`,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // Redirect to menu master after the alert is dismissed
                    redirectToOrderbooking();
                    setFlashMessage("Booking Created  Successfully")
                });
            }, 2000); // 2000 ms = 2 seconds
        },
        error: function (xhr) {
            // Remove the SweetAlert loading state if there's an error
            Swal.close(); // This will close the SweetAlert loading popup immediately

            // Handle error response
            const errorMessage =
                xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : xhr.responseText || "Failed to create Order Booking.";

            // Display error message in a toast
            toastr.error(errorMessage);
        },
    });


}


//function validateFieldData() {
//    const fieldData = [
//        { fieldId: 'ddlFileType', errorMessage: 'File Type is required.' },
//        { fieldId: 'ddlOperationCode', errorMessage: 'Operation Code is required.' },
//        { fieldId: 'txtOrderNo', errorMessage: 'Order No is required.' },
//        { fieldId: 'ddlStartOperation', errorMessage: 'Start Operation is required.' },
//        { fieldId: 'ddlOperationPoint', errorMessage: 'Operation Point is required.' },
//        { fieldId: 'ddlEndOperation', errorMessage: 'End Operation is required.' },
//        { fieldId: 'txtFileNo', errorMessage: 'File NO is required.' },
//        { fieldId: 'txtOrderReceived', errorMessage: 'Order Received is required.' },
//        { fieldId: 'ddlCustomerName', errorMessage: 'Customer Name is required.' },
//        { fieldId: 'ddlBookingType', errorMessage: 'Booking Type is required.' },
//        { fieldId: 'txtRemarks', errorMessage: 'Remarks is required.' },
//        /*        { fieldId: 'txtcontianerno', errorMessage: 'Container No is required.' }*/
//    ];

//    return validateFields(fieldData);

//}

//function collectBookingContainerDetails() {
//    debugger
//    const containers = [];



//    // Loop through all input fields with class `container-no` and `container-size`
//    $(".container-no").each(function (index) {
//        debugger
//        const containerNumber = $(this).val();
//        const containerSize = $(".container-size").eq(index).val();

//        if (containerNumber && containerSize) { // Only add non-empty values
//            containers.push({
//                BookingContainerDetailContainerNo: containerNumber,
//                BookingContainerDetailSize: containerSize
//            });
//        }
//    });

//    return containers;
//}


//function collectBookingContainerDetails() {
//    const containers = [];
//    debugger
//    // Iterate over all container rows
//    $(".container-row").each(function () {
//        const containerNumber = $(this).find(".container-no").val();
//        const containerSize = $(this).find(".container-size").val();

//        // Validate and collect details
//        if (containerNumber && containerSize) {
//            containers.push({
//                BookingContainerDetailContainerNo: containerNumber,
//                BookingContainerDetailSize: containerSize
//            });
//        }
//    });
//    console.log(containers);
//    return containers;

//}

function collectBookingContainerDetails() {

    array = activeModalData;
    console.log("arraydata",array)
    // Initialize an empty array to hold the formatted results
    let containerDetails = [];

    // Iterate over each row in the array
    array.forEach(row => {
        // For each container in the current row, create a new object with the desired format
        row.containers.forEach(containerNo => {
            containerDetails.push({
                "BookingContainerDetailContainerNo": containerNo,
                "BookingContainerDetailSize": $(".txtCTRtype").attr("data-code")
            });
        });
    });

    return containerDetails;
}





function collectOrderBookingData(bookingId = null) {
    debugger

    if (bookingId == null) {
        return {
            BookingHeader: {
                BookingFileTypeId: $('#ddlFileType').attr('data-code') || null,
                BookingOperationCodeId: $('#ddlOperationCode').attr('data-code') || null,
                BookingOrderNo: $('#txtOrderNo').val() || null,
                BookingOperationStartPointId: $('#ddlStartOperation').attr('data-code') || null,
                BookingOperationMiddlePointId: $('#ddlOperationPoint').attr('data-code') || null,
                BookingOperationEndPointId: $('#ddlEndOperation').attr('data-code') || null,
                BookingFileNo: $('#txtFileNo').val() || null,
                BookingOrderReceivedAt: $('#txtOrderReceived').val() || null,
                BookingCustomerId: $('#ddlCustomerName').attr('data-code') || null,
                BookingTypeId: $('#ddlBookingType').attr('data-code') || null,
                BookingRemarks: $('#txtRemarks').val() || null,
                BookingIsVoyageEnable: $('#chkVoyageEnable').is(':checked') ? 1 : 0,
                BookingOrderInfoShipmentTypeId: $('#ddlOrderInfoShipmentType').attr('data-code') || null,


                BookingOrderInfoOrderNo: $('#txtOrderInfoOrderNo').val() || null,

                BookingOrderInfoWeight: $('#txtOrderInfoWeight').val() || null,
                BookingOrderInfoQty: $('#txtOrderInfoQty').val() || null,
                BookingOrderInfoVolume: $('#txtOrderInfoVolume').val() || null,
                BookingOrderInfoTruckRequested: $('#txtOrderInfoTruckRequested').val() || null,
                BookingOrderInfoLoadingPortId: $('#ddlOrderInfoLoadingPort').attr('data-code') || null,
                BookingOrderInfoUnloadingPortId: $('#ddlOrderInfoUnloadingPort').attr('data-code') || null,
                BookingOrderInfoLoadingDate: $('#txtOrderInfoLoadingDate').val() || null,
                BookingOrderInfoDeliveryDate: $('#txtOrderInfoDeliveryDate').val() || null,

                BookingVoyageInfoVoyageId: $('#ddlVoyageInfoVoyageCode').attr('data-code') || null,
                BookingVoyageIfoVesselId: $('#ddlVoyageInfoVesselName').attr('data-code') || null,

                BookingVoyageInfoLineId: $('#ddlVoyageInfoLine').attr('data-code') || null,
                BookingVoyageInfoEta: $('#txtVoyageInfoETA').val() || null,
                BookingVoyageInfoLoadingPortId: $('#ddlVoyageInfoLodPort').attr('data-code') || null,
                BookingVoyageInfoDischargePortId: $('#ddlVoyageInfoDisPort').attr('data-code') || null,
                BookingDeliveryAddressId: $('#ddlDeliveryAddressCode').attr('data-code') || null,


                BookingDeliveryAddressAddress1: $('#txtDeliveryAddressAddress1').val() || null,
                BookingDeliveryAddressAddress2: $('#txtDeliveryAddressAddress2').val() || null,

                BookingDeliveryAddressContactName: $('#txtDeliveryAddressContactName').val() || null,

                BookingDeliveryAddressTelephone: $('#txtDeliveryAddressTel').val() || null,
                BookingProductInfoId: $('#ddlProductInfoCode').attr('data-code') || null,//
                BookingProductInfoDescription: $('#txtProductInfoDescription').val() || null,//
                BookingProductInfoGrade: $('#txtProductInfoGrade').val() || null,//
                BookingExtraInfoRemarks: $('#txtExtraInfoRemarks').val() || null,//
                BookingExtraInfoLinesTerminalId: $('#ddlExtraInfoLinesTerminal').attr('data-code') || null,//
                BookingExtraInfoCroNo: $('#txtExtraInfoCroNo').val() || null,//
                BookingExtraInfoExpiryDate: $('#txtExtraInfoExpiry').val() || null,//
                BookingExtraInfoShippingLineId: $('#ddlExtraInfoShippingLine').attr('data-code') || null,//
                BookingExtraInfoOrderStatusId:71 ,//
                BookingIsActive: 1,


                BookingCreatedBy: getUserId(),

                BookingExtraInfoOrderStatusId: 71//

            },

            BookingContainerDetails: collectBookingContainerDetails()







        };
    } else {
        return {
            BookingId: bookingId,
            BookingFileTypeId: $('#ddlFileType').attr('data-code'),
            BookingOperationCodeId: $('#ddlOperationCode').attr('data-code') || null,
            BookingOrderNo: $('#txtOrderNo').val() || 0,
            BookingOperationStartPointId: $('#ddlStartOperation').attr('data-code') || null,
            BookingOperationMiddlePointId: $('#ddlOperationPoint').attr('data-code') || null,
            BookingOperationEndPointId: $('#ddlEndOperation').attr('data-code') || null,
            BookingFileNo: $('#txtFileNo').val(),
            BookingOrderReceivedAt: $('#txtOrderReceived').val(),
            BookingCustomerId: $('#ddlCustomerName').attr('data-code') || null,
            BookingTypeId: $('#ddlBookingType').attr('data-code') || null,
            BookingRemarks: $('#txtRemarks').val('') || null,
            BookingIsVoyageEnable: $('#chkVoyageEnable').is(':checked') ? 1 : 0,  // Convert boolean to int
            BookingOrderInfoShipmentTypeId: $('#ddlOrderInfoShipmentType').attr('data-code') || null,
            BookingIsActive: 1, // Assuming new terminals are active by default
            BookingCreatedBy: getUserId() // Implement a function to get the current user ID
        };
    }
}

function getAjaxHeaders() {
    return {
        "Authorization": "Bearer " + getCookie('jwtToken'),
        "Content-Type": "application/json"
    };
}

function getUserId() {
    var userId = getCookie('userId');
    // Implement the logic to retrieve the current user ID from the session or a global variable
    return userId;
}

function setFlashMessage(message) {
    setCookie('flashMessage', message);
}

function redirectToOrderbooking() {
    window.location.reload();
}

const input1 = document.getElementById('txtOrderNo');
const input2 = document.getElementById('txtOrderInfoOrderNo');

// Add an event listener to the first input field
input1.addEventListener('input', () => {
    input2.value = input1.value; // Reflect the value to input2
});

document.addEventListener('keydown', function (event) {
    // Check if the '+' key is pressed and #cardContainer is visible
    if (event.key === '+' && isContainerDetailsVisible()) {
        addRow(); // Call the addRow function
    }

    // Check if the '-' key is pressed and #cardContainer is visible
    if (event.key === '-' && isContainerDetailsVisible()) {
        removeRow(); // Call the removeRow function
    }
});

//document.getElementById('addRow').addEventListener('click', function () {
//   /* addRow(); */// Call the addRow function when the Add Row button is clicked
//});

// Function to check if #cardContainer is visible
function isContainerDetailsVisible() {
    const cardContainer = document.getElementById('cardContainer');
    return cardContainer && cardContainer.style.display !== 'none';
}

//function addRow() {
//    const tableBody = document.querySelector('#containerTable tbody');
//    const rowCount = tableBody.querySelectorAll('tr').length; // Count the current rows

//    if (rowCount >= 16) {
//        // If there are already 16 rows, show a message and return
//        toastr.error('You can only add a maximum of 16 rows.');
//        return;
//    }

//    const newRow = document.createElement('tr');

//    newRow.innerHTML = `
//        <td>
//            <input type="number" class="form-control txtCTRsize" placeholder="Enter Qty" min="1" max="50">
//        </td>
//        <td>
//            <input type="text" class="form-control txtCTRtype" placeholder="Select">
//        </td>
//       <td>
//    <button type="button" class="btn btn-danger removeRow" title="Remove">
//        <i class="fa fa-trash"></i>
//    </button>
//</td>

//    `;

//    tableBody.appendChild(newRow);

//    // Initialize autocomplete for the specific row's CTR type input field
//    const newCTRTypeInput = newRow.querySelector('.txtCTRtype');
//    initializeTableAutocompleteWithAjax(
//        newCTRTypeInput, // Pass the specific input element
//        'Tbl_Container_Type_Master',
//        'container_type_name',
//        'container_type_code',
//        'container_type_id',
//        'container_type_is_active',
//        '', '', null, true

//    );

//    // Add event listener for the remove button
//    const removeButton = newRow.querySelector('.removeRow');
//    removeButton.addEventListener('click', function () {
//        newRow.remove(); // Removes the entire row
//    });

//    // Add live validation for the 'txtCTRsize' input field
//    const ctrSizeInput = newRow.querySelector('.txtCTRsize');
//    ctrSizeInput.addEventListener('input', function () {
//        let value = parseInt(ctrSizeInput.value, 25);

//        // Ensure the value is within the range 1 to 50
//        if (value < 1) {
//            ctrSizeInput.value = 1; // Set to 1 if less than 1
//        } else if (value > 50) {
//            ctrSizeInput.value = 50; // Set to 50 if greater than 50
//        }
//    });
//}

//function removeRow() {
//    const tableBody = document.querySelector('#containerTable tbody');
//    const rows = tableBody.querySelectorAll('tr');

//    if (rows.length > 0) {
//        rows[rows.length - 1].remove(); // Removes the last row
//    } else {
//        toastr.error('No rows to remove.');
//    }
//}

// JavaScript to change line color dynamically


$(document).ready(function () {








    const sections = $(".section");
    const prevBtn = $("#prev-page-btn");
    const nextBtn = $("#next-btn");
    const saveBtn = $("#save-btn");

    let currentSectionIndex = 0;

    // Function to get CSS root variables
    const getCSSVariable = (varName) =>
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim();


    const updatePagination = () => {
        sections.hide().eq(currentSectionIndex).css("display", "flex");

        // Disable Prev button on first tab
        if (currentSectionIndex === 0) {
            prevBtn.hide()
        } else {
            prevBtn.show()
            prevBtn.prop("disabled", false).css({
                "background-color": "white",
                "color": getCSSVariable("--primary"),
                "border": `solid 1px ${getCSSVariable("--Primary")} `
            });
        }

        // Change Next button text to "Clear All" on last section
        nextBtn.text(currentSectionIndex === sections.length - 1 ? "Clear All" : "Next");

        // Hide Save button on the first tab, show otherwise
        saveBtn.toggle(currentSectionIndex !== 0);
    };

    prevBtn.click(function () {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            updatePagination();
        }
    });

    nextBtn.click(function () {
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            updatePagination();
        }
    });

    // Initialize the pagination
    updatePagination();







    const defaultCTRTypeInput = $('#orderInfoContainer .order-row .txtCTRtype')[0]; // Get the first input
    if (defaultCTRTypeInput) {
        initializeTableAutocompleteWithAjax(
            defaultCTRTypeInput,
            'Tbl_Container_Type_Master',
            'container_type_code',
            null,
            'container_type_id',
            'container_type_is_active',
            '', '', null, false
        );
    }








});






$(document).ready(function () {
    const $steps = $('.step');
    const $nextButtons = $('.next-btn');
    const $backButtons = $('.back-btn');
    const $stepCircles = $('.step-circle');

    // Go to the next step
    $nextButtons.each(function (index) {
        $(this).on('click', function () {
            if ($steps.eq(index).length) {
                $steps.eq(index).removeClass('editing').addClass('checked');
                if ($steps.eq(index + 1).length) {
                    $steps.eq(index + 1).addClass('editing');
                }
            }
        });
    });

    // Go to the previous step
    $backButtons.each(function (index) {
        $(this).on('click', function () {
            if ($steps.eq(index + 1).length) {
                $steps.eq(index + 1).removeClass('editing');
                $steps.eq(index).removeClass('checked').addClass('editing');
            }
        });
    });

    // Click on step circles
    $stepCircles.each(function (index) {
        $(this).on('click', function () {
            $steps.each(function (stepIndex) {
                if (stepIndex === index) {
                    $(this).addClass('editing').removeClass('checked');
                } else if (stepIndex < index) {
                    $(this).addClass('checked').removeClass('editing');
                } else {
                    $(this).removeClass('checked editing');
                }
            });
        });
    });
});
// Store modal data at the global scope of our script
let activeModalData = [];


$(document).ready(function () {
    // Store modal data at the global scope of our script
    activeModalData = [];   

    // Function to add a new row
    $('#select-btn').on('click', function () {
        let newRow = $(`
            <div class="row order-row g-1 align-items-center mt-2">
                <div class="col-sm-12 col-lg-4">
                    <input type="number" class="form-control txtCTRsize" placeholder="QTY" min="1" max="50">
                </div>
                <div class="col-sm-12 col-lg-4">
                    <input class="form-control txtCTRtype" placeholder="CTR Type">
                </div>
                <div class="col-sm-12 col-lg-4 d-flex justify-content-center align-items-center">
                    <!-- Flex container to hold buttons in one row -->
                    <div class="d-flex justify-content-between w-100">
                        <!-- Delete Button -->
                        <div class="btn btn-secondary btn-lg delete-btn">
                            <i class="fa fa-trash"></i>
                        </div> &nbsp; &nbsp;
                        <!-- Select Button -->
                        <div class="btn btn-primary itms-primarybtn view-container-details btn-lg"> Select </div>
                    </div>
                </div>
            </div>
        `);

        $('#orderInfoContainer').append(newRow);

        const newCTRTypeInput = newRow.find('.txtCTRtype')[0];

        if (newCTRTypeInput) {
            initializeTableAutocompleteWithAjax(
                newCTRTypeInput,
                'Tbl_Container_Type_Master',
                'container_type_code',
                null,
                'container_type_id',
                'container_type_is_active',
                '', '', null, false
            );
        }

        if ($('#orderInfoContainer .order-row').length >= 2) {
            $('#orderInfoContainer').css({ 'max-height': '150px', 'overflow-y': 'auto' });
        }
    });

    // Function to delete a row
    //$(document).on('click', '.delete-btn', function () {
    //    $(this).closest('.order-row').remove();

    //    if ($('#orderInfoContainer .order-row').length < 2) {
    //        $('#orderInfoContainer').css('max-height', 'none').css('overflow-y', 'visible');
    //    }
    //});
    $(document).on('click', '.delete-btn', function () {
        const orderRow = $(this).closest('.order-row');
        const rowId = orderRow.index(); // Get the row ID (index of the row in the container)

        // Remove the record from activeModalData
        activeModalData = activeModalData.filter(data => data.rowId !== rowId);

        // Remove the row from the DOM
        orderRow.remove();

        // Adjust the height of the container if there are fewer than 2 rows
        if ($('#orderInfoContainer .order-row').length < 2) {
            $('#orderInfoContainer').css('max-height', 'none').css('overflow-y', 'visible');
        }
    });


    // Store the current row being edited
    let currentEditingRow = null;

    //// Handle view button clicks
    //$(document).on("click", ".view-container-details", function () {
    //    currentEditingRow = $(this).closest('.order-row');
    //    const ctrQty = currentEditingRow.find(".txtCTRsize").val();
    //    const ctrType = currentEditingRow.find(".txtCTRtype").val();

    //    if (!ctrQty || !ctrType) {
    //        toastr.error("Please fill in both CTR Qty and Type for this row.");
    //        return;
    //    }

    //    // Check if we already have data for this row
    //    const existingData = activeModalData.find(data =>
    //        data.rowId === currentEditingRow.index());

    //    if (existingData) {
    //        // Update quantity if it changed
    //        if (existingData.qty !== parseInt(ctrQty, 10)) {
    //            existingData.qty = parseInt(ctrQty, 10);
    //            existingData.containers = existingData.containers.slice(0, existingData.qty);
    //            while (existingData.containers.length < existingData.qty) {
    //                existingData.containers.push("");
    //            }
    //        }
    //        existingData.size = ctrType;
    //    } else {
    //        // Create new data entry
    //        activeModalData.push({
    //            rowId: currentEditingRow.index(),
    //            qty: parseInt(ctrQty, 10),
    //            size: ctrType,
    //            containers: Array(parseInt(ctrQty, 10)).fill("")
    //        });
    //    }

    //    updateModalTable();
    //    $("#modalContainer").modal("show");
    //});
    $(document).on("click", ".view-container-details", function () {
        debugger
        currentEditingRow = $(this).closest('.order-row');
        const ctrQty = currentEditingRow.find(".txtCTRsize").val();
        const ctrType = currentEditingRow.find(".txtCTRtype").val();

        if (!ctrQty || !ctrType) {
            toastr.error("Please fill in both CTR Qty and Type for this row.");
            return;
        }

        // Check if we already have data for this row
        const existingData = activeModalData.find(data => data.rowId === currentEditingRow.index());
        console.log(existingData, "existingData");
        console.log(activeModalData, "activeModalData");

        if (existingData) {
            // Update quantity if it changed
            if (existingData.qty !== parseInt(ctrQty, 10)) {
                existingData.qty = parseInt(ctrQty, 10);
                existingData.containers = existingData.containers.slice(0, existingData.qty);
                while (existingData.containers.length < existingData.qty) {
                    existingData.containers.push("");
                }
            }
            existingData.size = ctrType;
        } else {
            // Create new data entry
            activeModalData.push({
                rowId: currentEditingRow.index(),
                qty: parseInt(ctrQty, 10),
                size: ctrType,
                containers: Array(parseInt(ctrQty, 10)).fill("")
            });
        }

        // Open the modal to show the containers for this row
        updateModalTable();
        $("#modalContainer").modal("show");
    });

    function updateModalTable() {
        const containerTableBody = $("#containerTableBody");
        containerTableBody.empty();

        const currentData = activeModalData.find(data =>
            data.rowId === currentEditingRow.index());

        if (currentData) {
            // Update textarea with current container numbers
            $("#txtContainerList").val(currentData.containers.join("\n"));

            // Create table rows for containers in this row
            currentData.containers.forEach((containerNo, index) => {
                containerTableBody.append(`
                <tr class="container-row">
                    <td><input type="text" class="form-control container-no" 
                        value="${containerNo}" 
                        placeholder="Enter Container No"></td>
                    <td><input type="text" class="form-control container-size" 
                        value="${currentData.size}" disabled></td>
                    <td class="d-flex justify-content-center align-items-center">
                        <button class="btn btn-danger btn-sm delete-container-row">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
            });
        }
    }


    //// Function to update modal table
    //function updateModalTable() {
    //    const containerTableBody = $("#containerTableBody");
    //    containerTableBody.empty();

    //    const currentData = activeModalData.find(data =>
    //        data.rowId === currentEditingRow.index());

    //    if (currentData) {
    //        // Update textarea with current container numbers
    //        $("#txtContainerList").val(currentData.containers.join("\n"));

    //        // Create table rows
    //        currentData.containers.forEach((containerNo, index) => {
    //            debugger
    //            containerTableBody.append(`
    //                    <tr class="container-row">
    //                        <td><input type="text" class="form-control container-no" 
    //                            value="${containerNo}" 
    //                            placeholder="Enter Container No"></td>
    //                        <td><input type="text" class="form-control container-size" 
    //                            value="${currentData.size}" disabled></td>
    //                        <td class="d-flex justify-content-center align-items-center">
    //                            <button class="btn btn-danger btn-sm delete-container-row">
    //                                <i class="fa fa-trash"></i>
    //                            </button>
    //                        </td>
    //                    </tr>
    //                `);

    //        });
    //    }
    //}

    // Handle container number input synchronization
    $(document).on("input", "#txtContainerList", function () {
        const containerNumbers = $(this)
            .val()
            .split(/[,\n/]/)
            .map(val => val.trim())
            .filter(val => val !== "");

        const currentData = activeModalData.find(data =>
            data.rowId === currentEditingRow.index());

        if (currentData) {
            // Update container numbers in the table
            $(".container-no").each(function (index) {
                $(this).val(containerNumbers[index] || "");
                if ($(this).val() !== "") {
                    $(this).closest("tr")[0].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            });

            // Update activeModalData
            currentData.containers = currentData.containers.map((_, index) =>
                containerNumbers[index] || "");
        }
    });
    // Handle row deletion in modal
    $(document).on("click", ".delete-container-row", function () {
        const row = $(this).closest("tr");
        const index = row.index();

        // Find the current data for the row being edited
        const currentData = activeModalData.find(data =>
            data.rowId === currentEditingRow.index());

        if (currentData) {
            // Remove the container number from the array
            currentData.containers.splice(index, 1);
            currentData.qty--;

            // Update the quantity in the main form
            currentEditingRow.find(".txtCTRsize").val(currentData.qty);

            // Update the textarea with the remaining containers
            $("#txtContainerList").val(currentData.containers.join("\n"));
        }

        // Remove the row from the DOM
        row.remove();
    });

    //// Handle row deletion in modal
    //$(document).on("click", ".delete-container-row", function () {
    //    const row = $(this).closest("tr");
    //    const index = row.index();

    //    const currentData = activeModalData.find(data =>
    //        data.rowId === currentEditingRow.index());

    //    if (currentData) {
    //        // Remove the container number
    //        currentData.containers.splice(index, 1);
    //        currentData.qty--;

    //        // Update the quantity in the main form
    //        currentEditingRow.find(".txtCTRsize").val(currentData.qty);

    //        // Update the textarea
    //        $("#txtContainerList").val(currentData.containers.join("\n"));
    //    }

    //    row.remove();
    //});

    // Save button handler
    //$("#containerDetailsSave").on("click", function () {
    //    const currentData = activeModalData.find(data =>
    //        data.rowId === currentEditingRow.index());

    //    if (currentData) {
    //        // Update container numbers from the table inputs
    //        const containerNos = [];
    //        $(".container-no").each(function () {
    //            const value = $(this).val().trim();
    //            containerNos.push(value);
    //        });

    //        currentData.containers = containerNos;
    //        //console.log("Saved container numbers:", containerNos);
    //        //console.log("Updated modal data:", activeModalData);
    //    }
    //});
    $(document).on("click", "#containerDetailsSave", function () {
        const currentData = activeModalData.find(data => data.rowId === currentEditingRow.index());

        if (currentData) {
            // Collect updated container details
            currentData.containers = [];

            $("#containerTableBody").find(".container-row").each(function () {
                const containerNumber = $(this).find(".container-no").val();
                const containerSize = $(this).find(".container-size").val();

                if (containerNumber && containerSize) {
                    currentData.containers.push(containerNumber);
                }
            });

            // Optionally, log or update any other necessary fields for this row
            console.log(activeModalData, "Updated activeModalData");

            // Close the modal after saving
            $("#modalContainer").modal("hide");

            // Optionally: You can also trigger an update or callback function after saving
        }
    });


    // Modal show event handler
    $('#modalContainer').on('show.bs.modal', function () {
        updateModalTable();
    });
});
