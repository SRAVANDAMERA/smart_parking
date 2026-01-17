// Global variables
let selectedVehicleType = '';
let selectedVehiclePrice = 0;
let selectedSlot = null;
let bookedSlots = {};
let paymentMethod = '';
let bookingHistory = [];

// Load data from localStorage if available
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkBookingStatuses(); // Check and update booking statuses
    generateSlots();
    updateHistoryTable();
    checkPreviousBooking();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
    // Event listeners
    document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);
    document.getElementById('payNowBtn').addEventListener('click', completeBooking);
    document.querySelector('#paymentModal .close-btn').addEventListener('click', closePaymentModal);
    document.getElementById('confirmationCloseBtn').addEventListener('click', closeConfirmationModal);
    document.getElementById('complaintForm').addEventListener('submit', submitComplaint);
    
    // Calculate price based on duration
    document.getElementById('duration').addEventListener('change', updatePrice);
    
    // Set interval to check booking statuses every minute
    setInterval(checkBookingStatuses, 60000);
});


    // Intersection Observer to trigger animations when sections come into view
    const sections = document.querySelectorAll('.section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Modal animation
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-trigger');
            const modal = document.getElementById(modalId);
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);
        });
    });
    
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 400);
        });
    });
    
    // Vehicle option selection
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    vehicleOptions.forEach(option => {
        option.addEventListener('click', () => {
            vehicleOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Parking slot selection
    const slots = document.querySelectorAll('.slot.available');
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            slots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
        });
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });
