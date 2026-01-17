// Global variables
let selectedVehicleType = null;
let selectedSlot = null;
let selectedPaymentMethod = null;
let bookingHistory = JSON.parse(localStorage.getItem('bookingHistory')) || [];
const slotCounts = {
    'two-wheeler': 45,
    'four-wheeler': 40,
    'heavy-vehicle': 15
};

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    // Set today's date as minimum date for booking
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    
    // Initialize booking history
    updateHistoryTable();
    
    // Set up event listeners
    document.getElementById('proceedToPayment').addEventListener('click', showPaymentModal);
    document.getElementById('payNowBtn').addEventListener('click', processPayment);
    
    // Get all close buttons for modals
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Set up complaint form submission
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComplaint();
        });
    }
    
    // Update available slots display
    updateAvailabilityDisplay();
    
    // Add duration change event listener
    const durationInput = document.getElementById('duration');
    if (durationInput) {
        durationInput.addEventListener('change', updateExitTime);
    }
    
    // Add entry time change event listener
    const entryTimeInput = document.getElementById('entry-time');
    if (entryTimeInput) {
        entryTimeInput.addEventListener('change', updateExitTime);
    }
    
    // Initialize the slot grid
    initializeSlotGrid();
});

// Initialize the parking slot grid
function initializeSlotGrid() {
    const slotGrid = document.getElementById('slotGrid');
    if (!slotGrid) return;
    
    slotGrid.innerHTML = '';
    
    // Initially hide the slot grid until a vehicle type is selected
    slotGrid.style.display = 'none';
}

// Select vehicle type
function selectVehicleType(type) {
    selectedVehicleType = type;
    
    // Highlight the selected vehicle type
    const options = document.querySelectorAll('.vehicle-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.vehicle-option[onclick*="${type}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Generate slots based on the selected vehicle type
    generateSlots(type);
}

// Generate parking slots based on vehicle type
function generateSlots(vehicleType) {
    const slotGrid = document.getElementById('slotGrid');
    if (!slotGrid) return;
    
    slotGrid.innerHTML = '';
    slotGrid.style.display = 'grid';
    
    // Set the number of slots based on vehicle type
    const totalSlots = slotCounts[vehicleType];
    
    // Get booked slots from local storage
    const bookedSlots = getBookedSlots(vehicleType);
    
    // Create slot elements
    for (let i = 1; i <= totalSlots; i++) {
        const slotElement = document.createElement('div');
        slotElement.className = 'parking-slot';
        slotElement.dataset.slot = i;
        
        // Check if the slot is booked
        if (bookedSlots.includes(i)) {
            slotElement.classList.add('booked');
            slotElement.innerHTML = `<span>${i}</span><span class="status">Booked</span>`;
        } else {
            slotElement.innerHTML = `<span>${i}</span><span class="status">Available</span>`;
            slotElement.addEventListener('click', function() {
                selectSlot(i);
            });
        }
        
        slotGrid.appendChild(slotElement);
    }
}

// Get booked slots for a specific vehicle type
function getBookedSlots(vehicleType) {
    // Get bookings from local storage that match current date
    const today = document.getElementById('date').value;
    const bookings = bookingHistory.filter(booking => 
        booking.vehicleType === vehicleType && 
        booking.date === today &&
        booking.location === 'Kukatpally'
    );
    
    // Return array of booked slot numbers
    return bookings.map(booking => parseInt(booking.slotNumber));
}

// Select a parking slot
function selectSlot(slotNumber) {
    selectedSlot = slotNumber;
    
    // Highlight the selected slot
    const slots = document.querySelectorAll('.parking-slot');
    slots.forEach(slot => {
        slot.classList.remove('selected');
    });
    
    const selectedSlotElement = document.querySelector(`.parking-slot[data-slot="${slotNumber}"]`);
    if (selectedSlotElement) {
        selectedSlotElement.classList.add('selected');
    }
}

// Show payment modal
function showPaymentModal() {
    // Validate form fields
    if (!validateBookingForm()) {
        return;
    }
    
    // Get form values
    const name = document.getElementById('name').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const date = document.getElementById('date').value;
    const entryTime = document.getElementById('entry-time').value;
    const duration = document.getElementById('duration').value;
    
    // Calculate amount
    const vehicleOption = document.querySelector(`.vehicle-option[onclick*="${selectedVehicleType}"]`);
    const ratePerHour = parseInt(vehicleOption.dataset.price);
    const amount = ratePerHour * duration;
    
    // Update summary in the payment modal
    document.getElementById('summaryVehicleType').textContent = selectedVehicleType.replace('-', ' ');
    document.getElementById('summarySlotNumber').textContent = selectedSlot;
    document.getElementById('summaryDate').textContent = formatDate(date);
    document.getElementById('summaryEntryTime').textContent = formatTime(entryTime);
    document.getElementById('summaryDuration').textContent = `${duration} hour(s)`;
    document.getElementById('summaryAmount').textContent = `₹${amount}`;
    
    // Show the payment modal
    document.getElementById('paymentModal').style.display = 'flex';
}

// Validate the booking form
function validateBookingForm() {
    // Check if all required fields are filled
    const name = document.getElementById('name').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const date = document.getElementById('date').value;
    const entryTime = document.getElementById('entry-time').value;
    const duration = document.getElementById('duration').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    if (!name || !vehicleNumber || !date || !entryTime || !duration || !email || !phone) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Check if vehicle type is selected
    if (!selectedVehicleType) {
        alert('Please select a vehicle type.');
        return false;
    }
    
    // Check if slot is selected
    if (!selectedSlot) {
        alert('Please select a parking slot.');
        return false;
    }
    
    // Validate vehicle number format (TS01AB1234)
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!vehicleRegex.test(vehicleNumber)) {
        alert('Please enter a valid vehicle number (e.g., TS01AB1234).');
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number.');
        return false;
    }
    
    return true;
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Highlight the selected payment method
    const methods = document.querySelectorAll('.payment-method');
    methods.forEach(m => {
        m.classList.remove('selected');
    });
    
    const selectedMethod = document.querySelector(`.payment-method[onclick*="${method}"]`);
    if (selectedMethod) {
        selectedMethod.classList.add('selected');
    }
    
    // Show card details section if credit card or visa is selected
    const cardDetailsSection = document.getElementById('cardDetails');
    if (method === 'creditcard' || method === 'visa') {
        cardDetailsSection.style.display = 'block';
    } else {
        cardDetailsSection.style.display = 'none';
    }
}

// Process payment and complete booking
function processPayment() {
    // Validate payment method selection
    if (!selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    // Validate card details if credit card or visa is selected
    if ((selectedPaymentMethod === 'creditcard' || selectedPaymentMethod === 'visa') && !validateCardDetails()) {
        return;
    }
    
    // Generate booking ID
    const bookingId = generateBookingId();
    
    // Get form values
    const name = document.getElementById('name').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const date = document.getElementById('date').value;
    const entryTime = document.getElementById('entry-time').value;
    const duration = parseInt(document.getElementById('duration').value);
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Calculate exit time
    const exitTime = calculateExitTime(entryTime, duration);
    
    // Calculate amount
    const vehicleOption = document.querySelector(`.vehicle-option[onclick*="${selectedVehicleType}"]`);
    const ratePerHour = parseInt(vehicleOption.dataset.price);
    const amount = ratePerHour * duration;
    
    // Create booking object
    const booking = {
        bookingId: bookingId,
        name: name,
        vehicleNumber: vehicleNumber,
        vehicleType: selectedVehicleType,
        location: 'Kukatpally',
        date: date,
        entryTime: entryTime,
        exitTime: exitTime,
        duration: duration,
        slotNumber: selectedSlot,
        amount: amount,
        status: 'Confirmed',
        paymentMethod: selectedPaymentMethod,
        email: email,
        phone: phone,
        timestamp: new Date().getTime()
    };
    
    // Add booking to history
    bookingHistory.push(booking);
    localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
    
    // Update availability display
    updateAvailabilityDisplay();
    
    // Hide payment modal
    document.getElementById('paymentModal').style.display = 'none';
    
    // Show confirmation modal
    showConfirmationModal(booking);
    
    // Clear form and selections
    resetBookingForm();
}

// Validate card details
function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value;
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
        alert('Please fill in all card details.');
        return false;
    }
    
    // Validate card number (16 digits)
    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
        alert('Please enter a valid 16-digit card number.');
        return false;
    }
    
    // Validate expiry date (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    if (!expiryRegex.test(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY).');
        return false;
    }
    
    // Validate CVV (3 digits)
    const cvvRegex = /^[0-9]{3}$/;
    if (!cvvRegex.test(cvv)) {
        alert('Please enter a valid 3-digit CVV.');
        return false;
    }
    
    return true;
}

// Show booking confirmation modal
function showConfirmationModal(booking) {
    // Set confirmation details
    document.getElementById('confirmName').textContent = booking.name;
    document.getElementById('confirmVehicleNumber').textContent = booking.vehicleNumber;
    document.getElementById('confirmVehicleType').textContent = booking.vehicleType.replace('-', ' ');
    document.getElementById('confirmLocation').textContent = booking.location;
    document.getElementById('confirmDate').textContent = formatDate(booking.date);
    document.getElementById('confirmEntryTime').textContent = formatTime(booking.entryTime);
    document.getElementById('confirmExitTime').textContent = formatTime(booking.exitTime);
    document.getElementById('confirmDuration').textContent = `${booking.duration} hour(s)`;
    document.getElementById('confirmSlotNumber').textContent = booking.slotNumber;
    document.getElementById('confirmAmount').textContent = `₹${booking.amount}`;
    
    // Generate QR code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Create QR code with booking details
    const qrData = `Booking ID: ${booking.bookingId}\nName: ${booking.name}\nVehicle: ${booking.vehicleNumber}\nLocation: ${booking.location}\nDate: ${formatDate(booking.date)}\nSlot: ${booking.slotNumber}`;
    
    new QRCode(qrContainer, {
        text: qrData,
        width: 128,
        height: 128
    });
    
    // Show confirmation modal
    document.getElementById('confirmationModal').style.display = 'flex';
}

// Reset booking form and selections
function resetBookingForm() {
    document.getElementById('bookingForm').reset();
    
    // Reset vehicle selection
    selectedVehicleType = null;
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    vehicleOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset slot selection
    selectedSlot = null;
    const slotGrid = document.getElementById('slotGrid');
    if (slotGrid) {
        slotGrid.innerHTML = '';
        slotGrid.style.display = 'none';
    }
    
    // Set today's date
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Generate a unique booking ID
function generateBookingId() {
    const prefix = 'KKP'; // Prefix for Kukatpally
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Calculate exit time based on entry time and duration
function calculateExitTime(entryTime, duration) {
    const [hours, minutes] = entryTime.split(':').map(Number);
    const entryDate = new Date();
    entryDate.setHours(hours, minutes, 0, 0);
    
    const exitDate = new Date(entryDate.getTime() + duration * 60 * 60 * 1000);
    const exitHours = exitDate.getHours().toString().padStart(2, '0');
    const exitMinutes = exitDate.getMinutes().toString().padStart(2, '0');
    
    return `${exitHours}:${exitMinutes}`;
}

// Update exit time when duration or entry time changes
function updateExitTime() {
    const entryTime = document.getElementById('entry-time').value;
    const duration = parseInt(document.getElementById('duration').value) || 1;
    
    if (entryTime) {
        const exitTime = calculateExitTime(entryTime, duration);
        document.getElementById('exit-time').value = exitTime;
    }
}

// Format date for display (YYYY-MM-DD to DD/MM/YYYY)
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Format time for display (24-hour to 12-hour format)
function formatTime(timeString) {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

// Update booking history table
function updateHistoryTable() {
    const historyTableBody = document.getElementById('historyTableBody');
    const emptyHistory = document.getElementById('emptyHistory');
    
    if (!historyTableBody || !emptyHistory) return;
    
    // Filter bookings for Kukatpally location
    const locationBookings = bookingHistory.filter(booking => booking.location === 'Kukatpally');
    
    if (locationBookings.length === 0) {
        historyTableBody.innerHTML = '';
        emptyHistory.style.display = 'flex';
        return;
    }
    
    // Sort bookings by timestamp (newest first)
    locationBookings.sort((a, b) => b.timestamp - a.timestamp);
    
    // Populate table
    historyTableBody.innerHTML = '';
    emptyHistory.style.display = 'none';
    
    locationBookings.forEach(booking => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${booking.bookingId}</td>
            <td>${booking.name}</td>
            <td>${booking.vehicleNumber}</td>
            <td>${booking.vehicleType.replace('-', ' ')}</td>
            <td>${booking.location}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${formatTime(booking.entryTime)}</td>
            <td>${formatTime(booking.exitTime)}</td>
            <td>${booking.duration} hour(s)</td>
            <td>${booking.slotNumber}</td>
            <td>₹${booking.amount}</td>
            <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
        
        historyTableBody.appendChild(row);
    });
}

// View booking history (scroll to history section)
function viewBookingHistory() {
    // Close confirmation modal
    document.getElementById('confirmationModal').style.display = 'none';
    
    // Scroll to history section
    document.getElementById('history').scrollIntoView({ behavior: 'smooth' });
    
    // Update history table
    updateHistoryTable();
}

// Submit complaint
function submitComplaint() {
    const name = document.getElementById('complaintName').value;
    const email = document.getElementById('complaintEmail').value;
    const bookingId = document.getElementById('complaintBookingId').value;
    const complaintType = document.getElementById('complaintType').value;
    const message = document.getElementById('complaintMessage').value;
    
    // Validate complaint form
    if (!name || !email || !complaintType || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Create complaint object
    const complaint = {
        name: name,
        email: email,
        bookingId: bookingId,
        complaintType: complaintType,
        message: message,
        location: 'Kukatpally',
        status: 'Submitted',
        timestamp: new Date().getTime()
    };
    
    // Store complaint in local storage
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    complaints.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    
    // Reset form
    document.getElementById('complaintForm').reset();
    
    // Show success message
    alert('Your complaint has been submitted successfully. We will get back to you soon.');
}

// Update availability display
function updateAvailabilityDisplay() {
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    // Filter bookings for today and Kukatpally location
    const todayBookings = bookingHistory.filter(booking => 
        booking.date === today && booking.location === 'Kukatpally'
    );
    
    // Count bookings by vehicle type
    const twoWheelerBookings = todayBookings.filter(booking => booking.vehicleType === 'two-wheeler').length;
    const fourWheelerBookings = todayBookings.filter(booking => booking.vehicleType === 'four-wheeler').length;
    const heavyVehicleBookings = todayBookings.filter(booking => booking.vehicleType === 'heavy-vehicle').length;
    
    // Calculate available slots
    const twoWheelerAvailable = slotCounts['two-wheeler'] - twoWheelerBookings;
    const fourWheelerAvailable = slotCounts['four-wheeler'] - fourWheelerBookings;
    const heavyVehicleAvailable = slotCounts['heavy-vehicle'] - heavyVehicleBookings;
    
    // Update the display
    document.getElementById('two-wheeler-available').textContent = twoWheelerAvailable;
    document.getElementById('four-wheeler-available').textContent = fourWheelerAvailable;
    document.getElementById('heavy-vehicle-available').textContent = heavyVehicleAvailable;
}

// Handle window clicks to close modals when clicking outside
window.addEventListener('click', function(event) {
    const paymentModal = document.getElementById('paymentModal');
    const confirmationModal = document.getElementById('confirmationModal');
    
    if (event.target === paymentModal) {
        paymentModal.style.display = 'none';
    }
    
    if (event.target === confirmationModal) {
        confirmationModal.style.display = 'none';
    }
});