using DataAccess.Data;
using DataAccess.DTOs;
using ITMSEnumHelper.Enums;
using ITMSEnumHelper.Services;
using ITMSLogManager;
using ITMSLogManager.Service;
using ITMSMastersApi.Dto;
using ITMSSharedCache;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITMSMastersApi.Controllers.Nominate
{
    [ApiController]
    [Route("api/[controller]")]
    public class NominateController : BaseController
    {
        private readonly ItmsdevContext _context;
        private readonly ILogService _logService;

        public NominateController(ItmsdevContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;


        }

        #region CreateNominate
        [HttpPost("CreateNominate")]
        public async Task<IActionResult> CreateNominate([FromForm] NominateDetailDto request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Container Nominate Failed"
                });
            }


          

            // Step 2: Get Inbound Line ID based on the Container Number
            var inboundLineIdFromDb = await _context.TblInboundEntries
                .Where(i => i.InboundEntryContainerNo == request.NominateContainerNo)
                .Select(i => i.InboundEntryLineId)
                .FirstOrDefaultAsync();

            // Step 3: Compare the line IDs
            if (inboundLineIdFromDb != request.NominateLine)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Container line is Mismatched"
                });
            }

            try
            {
                var existingContainer = await _context.TblNominateDetails
                    .FirstOrDefaultAsync(g => g.NominateContainerNo == request.NominateContainerNo);

                if (existingContainer != null)
                {
                    if (existingContainer.NominateIsActive == 1)
                    {
                        return Conflict(new
                        {
                            StatusCode = 409,
                            Message = "Container already nominated"
                        });
                    }
                    else
                    {
                        // Update existing inactive nomination
                        existingContainer.NominateLine = request.NominateLine;
                        existingContainer.NominateRef = request.NominateRef;
                        existingContainer.NominateDate = request.NominateDate;
                        existingContainer.NominateVessel = request.NominateVessel;
                        existingContainer.NominateDestination = request.NominateDestination;
                        existingContainer.NominateVoyage = request.NominateVoyage;
                        existingContainer.NominateEtaDate = request.NominateEtaDate;
                        existingContainer.NominateTerminal = request.NominateTerminal;
                        existingContainer.NominateGateInId = request.NominateGateInId;
                        existingContainer.NominateIsActive = 1; // Reactivate it
                        existingContainer.NominateUpdatedAt = DateTime.Now;
                        existingContainer.NominateUpdatedBy = request.UserId;

                        _context.TblNominateDetails.Update(existingContainer);
                        await _context.SaveChangesAsync();

                        return Ok(new
                        {
                            StatusCode = 200,
                            Message = "Existing container nomination updated and reactivated",
                            Data = existingContainer
                        });
                    }
                }

                // If no such container exists, create a new record
                var newNominate = new TblNominateDetail
                {
                    NominateContainerNo = request.NominateContainerNo,
                    NominateLine = request.NominateLine,
                    NominateRef = request.NominateRef,
                    NominateDate = request.NominateDate,
                    NominateVessel = request.NominateVessel,
                    NominateDestination = request.NominateDestination,
                    NominateVoyage = request.NominateVoyage,
                    NominateEtaDate = request.NominateEtaDate,
                    NominateTerminal = request.NominateTerminal,
                    NominateGateInId = request.NominateGateInId,
                    NominateIsActive = 1,
                    NominateCreatedAt = DateTime.Now,
                    NominateUpdatedAt = DateTime.Now,
                    NominateCreatedBy = request.UserId,
                    NominateUpdatedBy = request.UserId
                };

                _context.TblNominateDetails.Add(newNominate);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Container nominated successfully",
                    //NominateId = newNominate.NominateId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    Message = "An error occurred while nominating the container",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("CreateNominateList")]
        public async Task<IActionResult> CreateNominateList([FromForm] NominateDetailListDto request)
        {
            if(request.NominateDetails == null || request.NominateDetails.Count <= 0)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Container Nominate Failed"
                });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach(var item in request.NominateDetails)
                {
                    // Step 1: Validate Line ID from Inbound Entries
                    var inboundLineIdFromDb = await _context.TblInboundEntries
                        .Where(i => i.InboundEntryContainerNo == item.NominateContainerNo)
                        .Select(i => i.InboundEntryLineId)
                        .FirstOrDefaultAsync();

                    if(inboundLineIdFromDb != item.NominateLine)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new
                        {
                            StatusCode = 400,
                            Message = $"Line mismatch for container: {item.NominateContainerNo}"
                        });
                    }

                    var existingContainer = await _context.TblNominateDetails
                        .FirstOrDefaultAsync(g => g.NominateContainerNo == item.NominateContainerNo);

                    if(existingContainer != null)
                    {
                        if(existingContainer.NominateIsActive == 1)
                        {
                            await transaction.RollbackAsync();
                            return Conflict(new
                            {
                                StatusCode = 409,
                                Message = $"Container already nominated: {item.NominateContainerNo}"
                            });
                        }

                        // Reactivate and update existing inactive record
                        existingContainer.NominateLine = item.NominateLine;
                        existingContainer.NominateRef = item.NominateRef;
                        existingContainer.NominateDate = item.NominateDate;
                        existingContainer.NominateVessel = item.NominateVessel;
                        existingContainer.NominateDestination = item.NominateDestination;
                        existingContainer.NominateVoyage = item.NominateVoyage;
                        existingContainer.NominateEtaDate = item.NominateEtaDate;
                        existingContainer.NominateTerminal = item.NominateTerminal;
                        existingContainer.NominateGateInId = item.NominateGateInId;
                        existingContainer.NominateIsActive = 1;
                        existingContainer.NominateUpdatedAt = DateTime.Now;
                        existingContainer.NominateUpdatedBy = item.UserId;

                        _context.TblNominateDetails.Update(existingContainer);
                    }
                    else
                    {
                        // Insert new nomination
                        var newNominate = new TblNominateDetail
                        {
                            NominateContainerNo = item.NominateContainerNo,
                            NominateLine = item.NominateLine,
                            NominateRef = item.NominateRef,
                            NominateDate = item.NominateDate,
                            NominateVessel = item.NominateVessel,
                            NominateDestination = item.NominateDestination,
                            NominateVoyage = item.NominateVoyage,
                            NominateEtaDate = item.NominateEtaDate,
                            NominateTerminal = item.NominateTerminal,
                            NominateGateInId = item.NominateGateInId,
                            NominateIsActive = 1,
                            NominateCreatedAt = DateTime.Now,
                            NominateUpdatedAt = DateTime.Now,
                            NominateCreatedBy = item.UserId,
                            NominateUpdatedBy = item.UserId
                        };

                        await _context.TblNominateDetails.AddAsync(newNominate);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Containers nominated successfully"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    Message = "An error occurred while nominating containers",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetInboundDetails/{containerNo}")]
        public async Task<IActionResult> GetInboundDetails(string containerNo)
        {
            try
            {
                InboundEntry inboundEntry = new InboundEntry();
                var inbound = await _context.TblInboundEntries.FindAsync(containerNo);

                if (inbound == null)
                {
                    await _logService.InsertLogAsync("Error", "Inbound not found", $"Container No: {containerNo}", "NominateController", "GetInboundDetails", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                    return NotFound(new { Message = "Country not found" });
                }

                await _logService.InsertLogAsync("Info", "Inbound fetched", $"Container No: {containerNo}", "NominateController", "GetInboundDetails", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                await _logService.InsertLogAsync("Error", ex.Message, ex.StackTrace, "NominateController", "GetInboundDetails", GetUserName(), "ITMSMastersApi", GetUserIpAddress());
                return StatusCode(500, new { Message = "An error occurred while fetching the inbound", Error = ex.Message });
            }
        }

        [HttpPost("CheckNominateExcelDuplicates")]
        public async Task<IActionResult> CheckNominateExcelDuplicates([FromBody] List<string> containers)
        {
            try
            {
                if (containers == null || containers.Count == 0)
                    return BadRequest("No data received.");

                // Enums
                int? gateInId = EnumService.GetIdFromValue<Statuses>("GateIn");
                int? pullBackId = EnumService.GetIdFromValue<Statuses>("PullBack");
                int? nominatedId = EnumService.GetIdFromValue<Statuses>("Nominated");

                // Distinct input containers
                var actualContainers = containers.Distinct(StringComparer.OrdinalIgnoreCase).ToList();

                // Results
                var duplicates = containers
                    .GroupBy(c => c, StringComparer.OrdinalIgnoreCase)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                var notFound = new List<string>();
                var onWay = new List<string>();
                var alreadyNominated = new List<string>();

                foreach (var container in actualContainers)
                {
                    var inbound = await _context.TblInboundEntries
                        .Where(x => x.InboundEntryContainerNo == container && (x.InboundEntryStatus == gateInId || x.InboundEntryStatus == pullBackId || x.InboundEntryStatus == nominatedId))
                        .FirstOrDefaultAsync();

                    if (inbound == null)
                    {
                        notFound.Add(container);
                        continue;
                    }
                    if (inbound.InboundEntryStatus == nominatedId)
                    {
                        alreadyNominated.Add(container);
                        continue;
                    }

                    if (inbound.InboundEntryIsLock == 1)
                    {
                        onWay.Add(container);
                        continue;
                    }
                    
                }

                return Ok(new
                {
                    actualCount = actualContainers.Count,
                    actualData = actualContainers,
                    duplicateCount = duplicates.Count,
                    duplicateData = duplicates,
                    notFoundCount = notFound.Count,
                    notFoundData = notFound,
                    oneWayCount = onWay.Count,
                    oneWayData = onWay,
                    alreadyNominatedCount = alreadyNominated.Count,
                    alreadyNominatedData = alreadyNominated
                });
            }
            catch (Exception ex)
            {
                await _logService.InsertLogAsync(
                    "Error",
                    "Duplicate check failed",
                    ex.Message,
                    "InboundEntryController",
                    "CheckNominateExcelDuplicates",
                    GetUserName(),
                    "InboundEntryAPI",
                    GetUserIpAddress()
                );

                return StatusCode(500, "Something went wrong.");
            }
        }

        #endregion





    }
}
