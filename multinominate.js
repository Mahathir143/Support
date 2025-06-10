let rowCounter = 0;
let selectedHeaderId = '';

$(document).ready(function () {
    let selectedHeaderId = '';

    initializePage();

    // Add row button click event
    $('#btnAddRow').on('click', function () {
        rowCounter++;
        selectedHeaderId = `N-${rowCounter}`;
        addRow(selectedHeaderId);
    });

    // Handle row click
    $('#tBodyMultiNaminate').on('click', 'tr', function () {
        $('#tBodyMultiNaminate tr').removeClass('selected-row');
        $(this).addClass('selected-row');
        selectedHeaderId = $(this).data('id');
    });
});

function initializePage() {
    $(".nav-title").html("Nominate(Manual/Excel Reports)");
}

$(document).on('click', '#btnDownloadTemplate', function () {
    // 1. Define your initial data
    const data = [{ "Container No": "" }];

    // 2. Create a worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Set column widths (wch: width in characters)
    worksheet['!cols'] = [{ wch: 20 }]; // Set width for "Container No" column

    // 4. Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 5. Create a filename with Name+yyMMddHHmmss format
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const fileName = `NominateContainer_${now.getFullYear().toString().slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

    // 6. Trigger download
    XLSX.writeFile(workbook, fileName);
});

$(document).on('click', '#btnUpload', function () {
    var modal = new bootstrap.Modal(document.getElementById('modalFileUpload'));
    modal.show();
});

// Browse Excel button click event (trigger file input)
$(document).on('click', '#btnBrowseFile', function () {
    $('#inputExcelFile').click();
});

$(document).on('change', '#inputExcelFile', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    handleFileUpload(file);
});

$(document).on('click', '#btnReUpload', function () {
    $('.upload-preview').remove(); // Remove current preview
    $('#divDragAndDrop').show();         // Show the original drag & drop UI again
    $('#lblUploadFileModal').text('Upload file'); // Reset modal title
});

$(document).on('click', '#btnClear', function () {
    Swal.fire({
        title: '<span style="color: #d9534f; font-size: 20px;">Are you sure?</span>',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="/gif/failedgif.gif" alt="Success" width="100" height="100" style="margin-bottom: 15px;"/>
            <p style="color: #444; font-size: 16px; margin: 0;">This will delete all records. Do you want to continue?</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Clear',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-xl shadow-lg p-4',
            confirmButton: 'swal2-confirm-custom swal2-confirm-clear',
            cancelButton: 'swal2-cancel-custom'
        },
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear all records
            $("#tBodyMultiNaminate,#tblActualExcelData, #tblNotFoundData, #tblDuplicateInExcelData, #tblAlreadyNominatedData, #tblOnewayData").empty();
            $("#btnReUpload").trigger('click');
            $(".lblTotalRecords").val("");
            $(".lblReadyForNominate").val("");
            $(".lblOneway").val("");
            $(".lblNominated").val("");
            $(".lblDuplicate").val("");
            $(".lblNotFound").val("");
        }
    });
});

$(document).on('click', '#btnExcelNominate', function () {
    uploadNominateExcel();
    $('#modalFileUpload').modal('hide'); // Replace with your modal's actual ID
});

// Drag and drop functionality for file upload
const dropArea = document.getElementById('divDragAndDrop');
const fileInput = document.getElementById('inputExcelFile');

// Prevent default behavior and allow dropping
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = "#D0D8F2"; // Optional: Add color on hover
});

// Revert background color when dragging ends
dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = "#BEC6E21A"; // Revert to original color
});

// Handle the drop event
dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files; // Set the dropped file to the input element
        handleFileUpload(files[0]); // Process the dropped file
    }
    dropArea.style.backgroundColor = "#BEC6E21A"; // Revert background color
});

function handleFileUpload(file) {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
        $('#uploadModalBody').html(`
                <div class="alert alert-danger rounded-3">❌ Invalid file type. Please upload a valid Excel file (.xlsx or .xls).</div>
                <button class="btn btn-secondary mt-3" onclick="location.reload()">Try Again</button>
            `);
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rowCount = json.length - 1; // excluding header
        $('#lblUploadFileModal').text('Excel Details');

        $('#divDragAndDrop').hide(); // Hides the drag & drop section

        $('#modalFileUploadBody').append(`
    <div class="upload-preview row g-4 mt-4">
        <!-- Left Box -->
        <div class="col-md-5 text-center">
            <div class="p-4 bg-light rounded-3">
                <h6 class="mt-3 fw-bold text-success">${file.name} 
                    <span class="text-muted" style="font-size: 0.9rem;">(${Math.ceil(file.size / 1024)}kb)</span>
                </h6>
                <div class="mt-3 alert alert-warning py-2 px-3 rounded-pill">${rowCount} Results found in the file</div>
                <button class="btn btn-outline-success mt-2" id="btnReUpload"><i class="bi bi-upload"></i> Re-Upload</button>
            </div>
        </div>

        <!-- Right Side - Inbound Info -->
        <div class="col-md-7 text-start">
            <p class="common-header">Inbound Vessel info</p>
            <div class="row g-3 mt-2">
                <div class="col-md-12">
                <div class="alert alert-info py-2">
                 <small><i class="bi bi-info-circle"></i> Select a line to filter containers, or leave empty to process all containers</small>
                    <input type="text" id="txtLine" class="form-control ITMSInput filterLineName" placeholder="Filter by Line (Optional)" value="">
                </div>
                </div>
            </div>
            <button class="btn btn-success mt-3 float-end" id="btnExcelNominate">Nominate</button>
        </div>
    </div>
`);
        initializeTableAutocompleteWithAjax('#txtLine', 'Tbl_Line_Master', 'line_name', 'line_code', 'line_id', 'line_is_active', '', null, null, false);

    };

    reader.readAsArrayBuffer(file);
}

function addRow() {
    const id = rowCounter;

    const newRow = `
        <tr data-id="${id}">
            <td class="srNumber">${rowCounter}</td>
            <td><input type="text" class="form-control txtContainerNo" placeholder="Container No"></td>
            <td><input type="text" class="form-control txtContainerSize" id="txtContainerSize_${id}" placeholder="Size"></td>
            <td><input type="text" class="form-control txtType" id="txtType_${id}" placeholder="Type"></td>
            <td><input type="text" class="form-control txtHeight" id="txtHeight_${id}" placeholder="Height"></td>
            <td><input type="text" class="form-control txtUnit" placeholder="Unit"></td>
            <td><input type="text" class="form-control txtLine" id="txtLine_${id}" placeholder="Line"></td>
            <td><input type="text" class="form-control txtAgent" id="txtAgent_${id}" placeholder="Agent"></td>
            <td><input type="text" class="form-control txtVesselName" id="txtVesselName_${id}" placeholder="Vessel Name"></td>
            <td><input type="text" class="form-control txtVoyage" id="txtVoyage_${id}"placeholder="Voyage"></td>
            <td><input type="date" class="form-control txtEtaDate"></td>
            <td><button class="btn btn-danger btnDeleteRow"><i class="fa fa-trash"></i></button></td>
        </tr>
    `;

    $('#tBodyMultiNaminate').append(newRow);

    const $newRow = $('#tBodyMultiNaminate tr:last');

    // Autocomplete initializations
    initializeTableAutocompleteWithAjax($newRow.find(`#txtContainerSize_${id}`), 'Tbl_Container_Type_Master', 'container_type_name', null, 'container_type_name', 'container_type_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtType_${id}`), 'Tbl_Selection_Master', 'selection_field_name', null, 'selection_id', 'selection_is_active', '', `AND selection_field='inbound_entry_type'`, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtHeight_${id}`), 'Tbl_Selection_Master', 'selection_field_name', null, 'selection_id', 'selection_is_active', '', `AND selection_field='inbound_entry_height'`, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtLine_${id}`), 'Tbl_Line_Master', 'line_name', 'line_code', 'line_id', 'line_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtAgent_${id}`), 'Tbl_Agent_Master', 'agent_name', 'agent_code', 'agent_id', 'agent_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtVesselName_${id}`), 'Tbl_Vessel_Master', 'vessel_name', 'vessel_code', 'vessel_id', 'vessel_is_active', '', null, null, false);
    initializeTableAutocompleteWithAjax($newRow.find(`#txtVoyage_${id}`), 'Tbl_Voyage_Master', 'voyage_name', 'voyage_code', 'voyage_id', 'voyage_is_active', '', null, null, false);
    // Delete row handler
    $newRow.find('.btnDeleteRow').on('click', function () {
        $(this).closest('tr').remove();
        updateSRNumbers();
    });

    updateSRNumbers();
    scrollToLastRow();

    rowCounter++;
}

function updateSRNumbers() {
    $('#tBodyMultiNaminate tr').each(function (index) {
        $(this).find('.srNumber').text(index + 1);
        $(this).data('sequence', index + 1);
    });
}

function scrollToLastRow() {
    const $lastRow = $('#tBodyMultiNaminate tr:last-child');
    if ($lastRow.length) {
        $('html, body').animate({ scrollTop: $lastRow.offset().top }, 300);
    }
}

function uploadNominateExcel() {
    const fileInput = document.getElementById('inputExcelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an Excel file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        let containers = [];

        rows.forEach(row => {
            const containerNo = row["Container No"]?.toString().trim();

            if (containerNo) {
                containers.push({
                    inboundEntryContainerNo: containerNo
                });
            }
        });

        // Get inbound values for processing
        processContainers(containers);
    };
}

function processContainers(containers) {
    if (containers.length === 0) {
        alert("No valid data found in Excel.");
        return;
    }

    // Track Excel duplicates
    const seenContainers = new Set();
    const validEntries = [];
    const excelDuplicateEntries = [];
    let totalInExcel = 0;
    let readyToNominate = 0;
    let oneWay = 0;
    let nominated = 0;
    let duplicate = 0;
    let notFound = 0;

    containers.forEach(entry => {
        const key = entry.inboundEntryContainerNo;
        if (seenContainers.has(key)) {
            duplicateInExcelCount++;
            excelDuplicateEntries.push(entry);
        } else {
            seenContainers.add(key);
            validEntries.push(entry);
        }
    });

    // API call to check DB duplicates
    $.ajax({
        url: apiBaseUrl + "CheckInboundExcelDuplicates",
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(entries),
        headers: getAjaxHeaders(),
        success: function (response) {
            const totalExcelRecords = entries.length;
            const dbDuplicates = new Set(response.duplicates.map(x => x.containerNo.toLowerCase()));
            const readyForInbound = totalExcelRecords - (duplicateInExcelCount + dbDuplicates.size);

            // Disable save if duplicates exist
            $("#saveInboundBtn").attr('disabled', (dbDuplicates.size > 0 || duplicateInExcelCount > 0));

            // Update UI counters
            $(".totalExcelRecords").val(totalExcelRecords);
            $(".duplicateInExcel").val(duplicateInExcelCount);
            $(".duplicateInDB").val(dbDuplicates.size);
            $(".readyForInbound").val(readyForInbound);

            // Clear tables
            $('#actualExcelDataTBody, #alreadyInExcel, #alreadyInDbTable').empty();

            // Populate actual Excel data (ALL records)
            entries.forEach((entry, index) => {
                $('#actualExcelDataTBody').append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${entry.inboundEntryContainerNo}</td>
                            <td>${entry.inboundEntryContainerSize}</td>
                        </tr>
                    `);
            });

            // Populate Excel duplicates table
            excelDuplicateEntries.forEach((entry, index) => {
                $('#alreadyInExcel').append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${entry.inboundEntryContainerNo}</td>
                            <td>${entry.inboundEntryContainerSize}</td>
                        </tr>
                    `);
            });

            // Populate DB duplicates table
            response.duplicates.forEach((dup, index) => {
                $('#alreadyInDbTable').append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${dup.containerNo}</td>
                            <td>${dup.containerSizeCode}</td>
                        </tr>
                    `);
            });

        },
        error: function () {
            console.error("Error checking duplicates.");
        }
    });
}
