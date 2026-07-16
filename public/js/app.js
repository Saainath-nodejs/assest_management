// Highlight active sidebar link
$(document).ready(function() {
  var path = window.location.pathname;
  $('.sidebar .nav-link').each(function() {
    if ($(this).attr('href') === path) {
      $(this).addClass('active');
    }
  });

  // Set today's date as default for date inputs
  $('input[type="date"]').each(function() {
    if (!$(this).val()) {
      $(this).val(new Date().toISOString().split('T')[0]);
    }
  });
});
