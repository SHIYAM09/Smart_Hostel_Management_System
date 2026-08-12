package com.hostel.authz.service;

import com.hostel.authz.dto.*;
import com.hostel.authz.entity.*;

import java.time.LocalDate;
import java.util.List;

public interface HostelManagementService {

    // Students
    StudentDto createStudent(CreateStudentRequest request);
    StudentDto updateStudent(String id, StudentDto dto);
    void deleteStudent(String id);
    StudentDto getStudentById(String id);
    StudentDto getStudentByUsername(String username);
    List<StudentDto> getAllStudents();
    List<StudentDto> searchStudents(String query);

    // Wardens
    WardenDto createWarden(WardenDto dto);
    WardenDto updateWarden(String id, WardenDto dto);
    void deleteWarden(String id);
    WardenDto getWardenById(String id);
    List<WardenDto> getAllWardens();

    // Admins
    AdminDto createAdmin(AdminDto dto);
    AdminDto getAdminById(Long id);
    List<AdminDto> getAllAdmins();

    // Rooms & Allocations
    RoomDto createRoom(RoomDto dto);
    RoomDto updateRoom(Long id, RoomDto dto);
    void deleteRoom(Long id);
    RoomDto getRoomById(Long id);
    List<RoomDto> getAllRooms();
    RoomAllocation allocateRoom(Long studentId, Long roomId);
    void vacateRoom(Long allocationId);
    List<RoomAllocation> getAllAllocations();

    // Attendance
    AttendanceDto markAttendance(AttendanceDto dto);
    List<AttendanceDto> getAttendanceByDate(LocalDate date);
    List<AttendanceDto> getAttendanceByStudent(Long studentId);
    List<AttendanceDto> getAttendanceByMonth(Long studentId, int year, int month);
    List<AttendanceDto> markBulkAttendance(List<AttendanceDto> dtoList);
    List<AttendanceDto> getAllAttendance();

    // Complaints
    ComplaintDto createComplaint(ComplaintDto dto);
    ComplaintDto updateComplaintStatus(String complaintId, String status);
    ComplaintDto submitComplaintFeedback(String complaintId, Integer rating, String comment);
    ComplaintDto getComplaintById(String complaintId);
    List<ComplaintDto> getComplaintsByStudent(Long studentId);
    List<ComplaintDto> getAllComplaints();

    // Feedback
    Feedback createFeedback(Feedback feedback);
    List<Feedback> getAllFeedbacks();
    Feedback getFeedbackById(Long id);
    List<Feedback> getFeedbacksByStudent(Long studentId);

    // Visitors
    Visitor registerVisitor(Visitor visitor);
    VisitorLog logVisitorEntry(VisitorLog visitorLog);
    VisitorLog checkOutVisitor(String logId);
    List<VisitorLog> getVisitorLogs();
    List<VisitorLog> getVisitorLogsByStudent(String studentId);

    // Leave Requests
    LeaveRequestDto applyLeave(LeaveRequestDto dto);
    LeaveRequestDto updateLeaveStatus(String leaveId, String status, String remarks);
    List<LeaveRequestDto> getLeaveRequestsByStudent(Long studentId);
    List<LeaveRequestDto> getAllLeaveRequests();

    // Mess Management
    MessMenu createOrUpdateMessMenu(MessMenu messMenu);
    MessMenu getMessMenuByDay(String dayOfWeek);
    List<MessMenu> getAllMessMenus();
    MessFeedback submitMessFeedback(MessFeedback feedback);
    List<MessFeedback> getAllMessFeedback();
    FoodWastage recordFoodWastage(FoodWastage wastage);
    List<FoodWastage> getFoodWastageLogs();

    // Resources Management
    ResourceItem createResource(ResourceItem resource);
    ResourceItem updateResource(Long id, ResourceItem resource);
    void deleteResource(Long id);
    List<ResourceItem> getAllResources();

    // Utility Monitoring
    UtilityMonitoring recordUtility(UtilityMonitoring utility);
    List<UtilityMonitoring> getAllUtilityLogs();

    // Notifications
    Notification createNotification(Notification notification);
    List<Notification> getNotificationsForUser(Long userId);
    List<Notification> getAllNotifications();
    void markNotificationAsRead(String id);
    void deleteNotification(String id);
    void deleteAllNotifications();

    // Hostel Blocks Management
    List<HostelBlock> getAllHostelBlocks();
    HostelBlock createHostelBlock(HostelBlock block);
    HostelBlock updateHostelBlock(String id, HostelBlock block);
    void deleteHostelBlock(String id);

    // Dashboards
    DashboardMetricsDto getStudentDashboard(String username);
    DashboardMetricsDto getWardenDashboard(String username);
    DashboardMetricsDto getAdminDashboard(String username);
}
