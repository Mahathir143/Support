using DataAccess.Data;
using ITMSLogManager.Service;
using ITMSMastersApi.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using PgDynamicCrudLibrary;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace ITMSMastersApi.Controllers.Booking
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : BaseController
    {
        private readonly Repository _repository;
        private readonly ItmsdevContext _context;
        private readonly ILogService _logService;

        public BookingController(Repository repository,ItmsdevContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
            _repository = repository;
        }

        [HttpGet("GetActivityFieldsDetails/{ActivityId}/{ProjectId}")]
        public async Task<IActionResult> GetActivityFieldsDetails(int ActivityId, int ProjectId)
        {
            try
            {
                var result = new List<BookingFieldsResponse>();

                // Fetch the activity header
                var activityHeader = await _context.TblActivityHeaders
                    .FirstOrDefaultAsync(x => x.ActivityHeaderActivityId == ActivityId && x.ActivityHeaderProjectId == ProjectId);

                var result2 = await _context.TblOperationCodeActivities
                    .FirstOrDefaultAsync(x => x.OperationCodeActivitiesActivityId == ActivityId);


                if (activityHeader == null)
                {
                    // Fetch default booking fields if no activity header is found
                    var bookingFields = await _context.TblActivityMasterBookingFields
                        .Where(x => x.ActivityMasterBookingFieldsActivityId == ActivityId)
                        .Join(_context.TblBookingFields,
                            bookingField => bookingField.ActivityMasterBookingFieldsBookingFieldId,
                            field => field.BookingFieldId,
                            (bookingField, field) => new BookingFieldsResponse
                            {
                                FieldCode = field.BookingFieldCode,
                                FieldName = field.BookingFieldName,
                                IsChecked = bookingField.ActivityMasterBookingFieldsDefaultValue == 1
                            })
                        .ToListAsync();

                    if (!bookingFields.Any())
                    {
                        await _logService.InsertLogAsync(
                            "Error", "Activity Header not found",
                            $"Activity Id: {ActivityId} and Project Id: {ProjectId}",
                            "BookingController", "GetActivityFieldsAccess",
                            GetUserName(), "ITMSMastersApi", GetUserIpAddress()
                        );

                        return NotFound(new { Message = "Activity Header not found" });
                    }

                    return Ok(new { StatusCode = 1, Data = bookingFields });
                }

                // Log success after finding the activity header
                await _logService.InsertLogAsync(
                    "Info", "Activity Header fetched successfully",
                    $"Activity Id: {ActivityId} and Project Id: {ProjectId}",
                    "BookingController", "GetActivityFieldsAccess",
                    GetUserName(), "ITMSMastersApi", GetUserIpAddress()
                );

                // Fetch activity header booking fields
                var activityFieldAccesses = await _context.TblActivityHeaderBookingFields
                    .Where(x => x.ActivityHeaderBookingFieldsHeaderId == activityHeader.ActivityHeaderId && x.ActivityHeaderBookingFieldsIsActive == 1)
                    .Join(_context.TblBookingFields,
                        access => access.ActivityHeaderBookingFieldsFieldId,
                        field => field.BookingFieldId,
                        (access, field) => new BookingFieldsResponse
                        {
                            FieldCode = field.BookingFieldCode,
                            FieldName = field.BookingFieldName,
                            IsChecked = access.ActivityHeaderBookingFieldsIsGranted == 1
                        })
                    .ToListAsync();

                result.AddRange(activityFieldAccesses);


                return Ok(new { StatusCode = 1, Data = result,Data2= result2 });
            }
            catch (Exception ex)
            {
                // Log exception details
                await _logService.InsertLogAsync(
                    "Error", ex.Message, ex.StackTrace,
                    "BookingController", "GetActivityFieldsAccess",
                    GetUserName(), "ITMSMastersApi", GetUserIpAddress()
                );

                return StatusCode(500, new
                {
                    Message = "An error occurred while retrieving the activity header details",
                    Error = ex.Message
                });
            }
        }


        //[HttpPost("CreateBooking")]
        //public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
        //            {
        //    try
        //    {
        //        if (request == null || request.BookingHeader == null)
        //            return BadRequest(new { Message = "Invalid booking details provided" });

        //        var booking = request.BookingHeader;

        //        // Check for duplicate booking order numbers
        //        if (_context.TblBookings.Any(x => x.BookingOrderNo == booking.BookingOrderNo))
        //        {
        //            await _logService.InsertLogAsync(
        //                "Warning",
        //                "Booking order number must be unique",
        //                $"BookingOrderNo: {booking.BookingOrderNo}",
        //                "BookingController",
        //                "CreateBooking",
        //                GetUserName(),
        //                "ITMSMastersApi",
        //                GetUserIpAddress()
        //            );
        //            return BadRequest(new { Message = "Booking order number must be unique" });
        //        }

        //        // Set creation timestamp
        //        booking.BookingCreatedAt = DateTime.Now;

        //        // Generate column names dynamically
        //        var properties = typeof(TblBooking).GetProperties()
        //            .Where(p => !string.Equals(p.Name, "BookingId", StringComparison.OrdinalIgnoreCase)); // Exclude primary key

        //        var columnNames = string.Join(", ", properties.Select(p =>
        //        {
        //            var columnAttribute = p.GetCustomAttributes(typeof(ColumnAttribute), false).FirstOrDefault() as ColumnAttribute;
        //            return columnAttribute != null ? columnAttribute.Name : p.Name.ToLower();
        //        }));

        //        var columnValues = properties.Select(p =>
        //        {
        //            var value = p.GetValue(booking);
        //            if (value == null) return "NULL";

        //            if (p.PropertyType == typeof(DateTime) ||
        //                Nullable.GetUnderlyingType(p.PropertyType) == typeof(DateTime))
        //            {
        //                return $"'{((DateTime)value).ToString("yyyy-MM-dd HH:mm:ss")}'";
        //            }

        //            if (p.PropertyType == typeof(string))
        //            {
        //                return $"'{value.ToString().Replace("'", "''")}'"; // Escape single quotes
        //            }

        //            return value.ToString();
        //        });

        //        var valuesClause = string.Join(", ", columnValues);

        //        // Use a transaction to ensure atomicity
        //        await using var connection = _context.Database.GetDbConnection();
        //        await connection.OpenAsync();
        //        await using var transaction = await connection.BeginTransactionAsync();

        //        try
        //        {
        //            // Save main booking details
        //            var returnColumn = "booking_id";
        //            int? returnedId = await _repository.CreateAsync("CREATE", "Tbl_Booking", columnNames, valuesClause, returnColumn);

        //            if (!returnedId.HasValue)
        //            {
        //                await transaction.RollbackAsync();
        //                return StatusCode(500, new { Message = "Failed to save booking details" });
        //            }

        //            // Save `BookingContainerDetails` if provided
        //            if (request.BookingContainerDetails != null && request.BookingContainerDetails.Any())
        //            {
        //                foreach (var containerDetail in request.BookingContainerDetails)
        //                {
        //                    containerDetail.BookingContainerDetailBookingId = returnedId.Value;
        //                    await SaveContainerDetailToDatabaseAsync(containerDetail, transaction); // Pass the transaction
        //                }
        //            }

        //            await transaction.CommitAsync();

        //            await _logService.InsertLogAsync(
        //                "Info",
        //                "Booking created successfully",
        //                $"BookingOrderNo: {booking.BookingOrderNo}",
        //                "BookingController",
        //                "CreateBooking",
        //                GetUserName(),
        //                "ITMSMastersApi",
        //                GetUserIpAddress()
        //            );

        //            return CreatedAtAction(nameof(GetBooking), new { id = returnedId }, booking);
        //        }
        //        catch (Exception ex)
        //        {
        //            await transaction.RollbackAsync(); // Rollback if any error occurs
        //            await _logService.InsertLogAsync(
        //                "Error",
        //                ex.Message,
        //                ex.StackTrace,
        //                "BookingController",
        //                "CreateBooking",
        //                GetUserName(),
        //                "ITMSMastersApi",
        //                GetUserIpAddress()
        //            );

        //            return StatusCode(500, new { Message = "An error occurred while creating the booking", Error = ex.Message });
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        await _logService.InsertLogAsync(
        //            "Error",
        //            ex.Message,
        //            ex.StackTrace,
        //            "BookingController",
        //            "CreateBooking",
        //            GetUserName(),
        //            "ITMSMastersApi",
        //            GetUserIpAddress()
        //        );

        //        return StatusCode(500, new { Message = "An error occurred while creating the booking", Error = ex.Message });
        //    }
        //}

        //[HttpPost("SaveOrUpdateOrderBooking")]
        [HttpPost("CreateBooking")]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
        {
            if (request == null || request.BookingHeader == null)
            {
                return BadRequest("Invalid booking data.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Check if the combination of OperationCode and OrderNo is valid
                bool isDuplicateOrderNo = await _context.TblBookings
                    .AnyAsync(b => b.BookingOperationCodeId == request.BookingHeader.BookingOperationCodeId &&
                                   b.BookingOrderNo == request.BookingHeader.BookingOrderNo &&
                                   b.BookingId != request.BookingHeader.BookingId); // Exclude the current booking

                if (isDuplicateOrderNo)
                {
                    return BadRequest("The same OrderNo cannot exist for the same OperationCode.");
                }

                // Check if booking exists
                var existingBooking = await _context.TblBookings
                    .FirstOrDefaultAsync(b => b.BookingId == request.BookingHeader.BookingId);

                if (existingBooking != null)
                {
                    // Update existing booking
                    _context.Entry(existingBooking).CurrentValues.SetValues(request.BookingHeader);
                }
                else
                {
                    // Add new booking
                    request.BookingHeader.BookingCreatedAt = DateTime.Now;
                    await _context.TblBookings.AddAsync(request.BookingHeader);
                    await _context.SaveChangesAsync(); // Save to generate BookingId

                    // Update BookingId for container details
                    foreach (var container in request.BookingContainerDetails)
                    {
                        container.BookingContainerDetailBookingId = request.BookingHeader.BookingId;
                    }
                }

                // Handle container details
                var existingContainers = _context.TblBookingContainerDetails
                    .Where(c => c.BookingContainerDetailBookingId == request.BookingHeader.BookingId).ToList();

                // Update or add containers
                foreach (var container in request.BookingContainerDetails)
                {
                    var existingContainer = existingContainers
                        .FirstOrDefault(c => c.BookingContainerDetailContainerNo == container.BookingContainerDetailContainerNo);

                    if (existingContainer != null)
                    {
                        _context.Entry(existingContainer).CurrentValues.SetValues(container);
                    }
                    else
                    {
                        await _context.TblBookingContainerDetails.AddAsync(container);
                    }
                }

                // Remove containers that are not in the current request
                var containerNumbers = request.BookingContainerDetails
                    .Select(c => c.BookingContainerDetailContainerNo).ToList();
                var containersToRemove = existingContainers
                    .Where(c => !containerNumbers.Contains(c.BookingContainerDetailContainerNo)).ToList();

                _context.TblBookingContainerDetails.RemoveRange(containersToRemove);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok("Booking saved or updated successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        private async Task SaveContainerDetailToDatabaseAsync(TblBookingContainerDetail containerDetail, IDbTransaction transaction)
        {
            try
            {
                // Extract column names dynamically, excluding those with [Key] attribute
                var properties = typeof(TblBookingContainerDetail).GetProperties()
                    .Where(p => !Attribute.IsDefined(p, typeof(KeyAttribute))); // Exclude properties marked with [Key]

                // Generate column names dynamically
                var columnNames = string.Join(", ", properties.Select(p =>
                {
                    // Check if the [Column] attribute exists, otherwise default to property name
                    var columnAttribute = p.GetCustomAttributes(typeof(ColumnAttribute), false).FirstOrDefault() as ColumnAttribute;
                    return columnAttribute != null ? columnAttribute.Name : p.Name.ToLower(); // Use column name or property name in lowercase
                }));


                // Generate values dynamically
                var columnValues = properties.Select(p =>
                {
                    var value = p.GetValue(containerDetail);
                    if (value == null) return "NULL";

                    if (p.PropertyType == typeof(DateTime) ||
                        Nullable.GetUnderlyingType(p.PropertyType) == typeof(DateTime))
                    {
                        // Format DateTime to ISO 8601 for PostgreSQL compatibility
                        return $"'{((DateTime)value).ToString("yyyy-MM-dd HH:mm:ss")}'";
                    }

                    if (p.PropertyType == typeof(string))
                    {
                        return $"'{value.ToString().Replace("'", "''")}'"; // Escape single quotes for SQL
                    }

                    return value.ToString(); // Handle other types
                });

                // Join values with commas for SQL syntax
                var valuesClause = string.Join(", ", columnValues);
                var returnColumn = "booking_container_detail_id";
                // Call repository method to perform the dynamic operation
                await _repository.CreateAsync(
                    "CREATE",
                    "Tbl_Booking_Container_Details",
                    columnNames,
                    valuesClause,
                   
                    returnColumn // No need for a return column for container details
                                       // Pass the transaction to ensure the same connection and transaction
                );
            }
            catch (Exception ex)
            {
                // Log error details
                await _logService.InsertLogAsync(
                    "Error",
                    ex.Message,
                    ex.StackTrace,
                    "BookingController",
                    "SaveContainerDetailToDatabaseAsync",
                    GetUserName(),
                    "ITMSMastersApi",
                    GetUserIpAddress()
                );

                throw new Exception("An error occurred while saving container details", ex);
            }
        }


        [HttpGet("GetBooking/{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            try
            {
                var booking = await _context.TblBookings
                    .Where(x => x.BookingId == id)
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    await _logService.InsertLogAsync("Error", "Booking not found", $"BookingId: {id}", "BookingController", "GetBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                    return NotFound(new { Message = "Booking not found" });
                }

                var bookingContainerDetails = await _context.TblBookingContainerDetails
                    .Where(x => x.BookingContainerDetailBookingId == booking.BookingId)
                    .ToListAsync();

                var response = new BookingResponse
                {
                    BookingHeader = booking,
                    BookingContainerDetails = bookingContainerDetails
                };

                await _logService.InsertLogAsync("Info", "Booking fetched successfully", $"BookingId: {id}", "BookingController", "GetBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return Ok(response);
            }
            catch (Exception ex)
            {
                await _logService.InsertLogAsync("Error", ex.Message, ex.StackTrace, "BookingController", "GetBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return StatusCode(500, new { Message = "An error occurred while fetching the booking", Error = ex.Message });
            }
        }


        //[HttpGet("CheckOrder")]
        //public IActionResult CheckOrder(string orderNo)
        //{
        //    // Find the order by order number in the TblBookings table
        //    var booking = _context.TblBookings.FirstOrDefault(b => b.BookingOrderNo == orderNo);

        //    if (booking != null)
        //    {
        //        // Return the entire booking data as JSON
        //        return Json(new { exists = true, data = booking });
        //    }
        //    else
        //    {   
        //        return Json(new { exists = false });
        //    }
        //}



        [HttpPost("CreateContainerDetails")]
        public async Task<IActionResult> CreateContainerDetails([FromBody] List<TblBookingContainerDetail> containerDetails)
        {
            if (containerDetails == null || !containerDetails.Any())
            {
                return BadRequest("No container details provided.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                List<int> savedIds = new List<int>();

                foreach (var container in containerDetails)
                {
                    var existingContainer = await _context.TblBookingContainerDetails
                        .FirstOrDefaultAsync(c => c.BookingContainerDetailContainerNo == container.BookingContainerDetailContainerNo);

                    if (existingContainer != null)
                    {
                        // Update existing container details
                        _context.Entry(existingContainer).CurrentValues.SetValues(container);
                    }
                    else
                    {
                        // Add new container details
                        await _context.TblBookingContainerDetails.AddAsync(container);
                        await _context.SaveChangesAsync(); // Save changes here so the ID is populated

                        // Retrieve the saved ID of the newly added container
                        savedIds.Add(container.BookingContainerDetailId); // Assuming the ID is 'BookingContainerDetailId'
                    }
                }

                await transaction.CommitAsync();

                return Ok(new { message = "Container details updated successfully.", savedIds = savedIds });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("BookingStatus")]
        public async Task<IActionResult> BookingStatus(int bookingId, int bookingstatusID)
        {
            try
            {
                var existingBooking = await _context.TblBookings.FindAsync(bookingId);
                if (existingBooking == null)
                {
                    await _logService.InsertLogAsync("Error", "Booking not found", $"ID: {bookingId}", "BookingController", "UpdateBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                    return NotFound(new { Message = "Booking not found" });
                }
                // Update the booking status
                existingBooking.BookingExtraInfoOrderStatusId = bookingstatusID;
                await _context.SaveChangesAsync(); // Save changes to the database
                await _logService.InsertLogAsync("Warning", "Booking status updated", $"BookingID: {bookingId}, NewStatus: {bookingstatusID}", "BookingController", "UpdateBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return Ok(new { Message = "Booking status updated successfully" });
            }
            catch (Exception ex)
            {
                // Log the exception
                await _logService.InsertLogAsync("Error", "Exception occurred", ex.Message, "BookingController", "UpdateBooking", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return StatusCode(500, new { Message = "An error occurred while updating the booking status." });
            }
        }
    }









    public class BookingRequest
    {
        public TblBooking BookingHeader { get; set; }
        public List<TblBookingContainerDetail> BookingContainerDetails { get; set; }
    }

    public class BookingResponse
    {
        public TblBooking BookingHeader { get; set; }
        public List<TblBookingContainerDetail> BookingContainerDetails { get; set; }
    }
}
