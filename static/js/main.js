// global vars
var done_icon = '<img src="../static/images/done.png" height="90px" />';
var error_icon = '<img src="../static/images/error.png" height="90px" />';
var loading_icon = '<i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>';
var spin_icon = '<i class="fa fa-spinner fa-spin fa-1x fa-fw mr-2"></i>';
var refresh_icon = '<i class="fa fa-refresh fa-spin fa-fw mr-2"></i>';
var loading_icon_page =
  '<div style="height:200px;"><div class="h-center h-100 v-center"><i class="fa fa-spinner fa-spin fa-5x"></i></div></div>';


// Form validation
const source_inputs = $('#source_training_key, #source_resource_name');
const destination_inputs = $('#destination_training_key, #destination_resource_name');

source_inputs.on("change", function(){
  if($(this).val().length > 0) {
    // enable button
    $("#btn_get_projects").prop('disabled', false);
    $("#btn_get_projects").removeClass("btn-outline-secondary pointer-disabled").addClass("btn-outline-primary");
  } else {
    // disable button
    $("#btn_get_projects").prop('disabled', true);
    $("#btn_get_projects").removeClass("btn-outline-primary").addClass("btn-outline-secondary pointer-disabled");
  }
});

destination_inputs.on("change", function(){
  if($(this).val().length > 0) {
    // enable button
    $("#btn_import_projects").prop('disabled', false);
    $("#btn_import_projects").removeClass("btn-outline-secondary pointer-disabled").addClass("btn-outline-success");
  } else {
    // disable button
    $("#btn_import_projects").prop('disabled', true);
    $("#btn_import_projects").removeClass("btn-outline-success").addClass("btn-outline-secondary pointer-disabled");
  }
});


// var toValidate = $('#source_training_key, #source_resource_name'), valid = false;
// toValidate.keyup(function () {
//   if ($(this).val().length > 0) {
//       $(this).data('valid', true);
//   } else {
//       $(this).data('valid', false);
//   }
//   toValidate.each(function () {
//       if ($(this).data('valid') == true) {valid = true;} 
//       else {valid = false;}
//   });
//   if (valid === true) {
//     // enable button
//     $("#btn_get_projects").prop('disabled', false);
//     $("#btn_get_projects").removeClass("btn-outline-secondary pointer-disabled").addClass("btn-outline-primary");
//   } else {
//     // disable button
//     $("#btn_get_projects").prop('disabled', true);
//     $("#btn_get_projects").removeClass("btn-outline-primary").addClass("btn-outline-secondary pointer-disabled");
//   }
// });


// Get Projects
$(function () {
  $('#btn_get_projects').bind('click', function () {
    // JSON form
    var form_data = JSON.stringify({
      source_resource_name: $('#source_resource_name').val(),
      source_training_key: $('#source_training_key').val()
    });
    $.ajax({
      url: $SCRIPT_ROOT + '/getProjects',
      type: 'POST',
      contentType: 'application/json;charset=UTF-8',
      processData: false,
      data: form_data,
      dataType: 'json',
      beforeSend: function () {
        // disable submit button
        document.getElementById('btn_get_projects').disabled = true;
        // show spinner loader
        $("#project_list").html(loading_icon_page)
      }
    }).done(function (response) {
      // render project list
      $('#project_list').html(response.data);
      // re-enable button 
      document.getElementById('btn_get_projects').disabled = false;
    });
  });
});

// Import Projects
$(function () {
  $('#btn_import_projects').bind('click', function () {
    var selected_projects = [];
      $.each($("input[name='project_checkbox']:checked"), function(){
        selected_projects.push($(this).val());
      });
      console.log("Selected Project Ids are: " + selected_projects.join(", "));
    // async send
    var form_data = JSON.stringify({
      selected_projects: selected_projects,
      source_resource_name: $('#source_resource_name').val(),
      source_training_key: $('#source_training_key').val(),
      destination_resource_name: $('#destination_resource_name').val(),
      destination_training_key: $('#destination_training_key').val()
    });
    $.ajax({
      url: $SCRIPT_ROOT + '/importProjects',
      type: 'POST',
      contentType: 'application/json;charset=UTF-8',
      processData: false,
      data: form_data,
      dataType: 'json',
      beforeSend: function () {
        // disable submit button
        document.getElementById('btn_import_projects').disabled = true;
        // set to spinner loader
        $("#modal_icon").html(loading_icon);
        // set message
        $('#modal_message').html('Preparing for transfer...<br /><code>Do NOT refresh or close this page</code>');
        // show modal
        $('#modal').modal('show');
      }
    }).done(function (response) {
      if (response.status == 'ok') {
        // success
        $('#modal_icon').html(done_icon);
        $('#modal_message').html('<span style="color: green;">Transfer Successful</span><p>See your transferred projects in Custom Vision site</p>');
      }
      else {
        // fail
        $('#modal_icon').html(error_icon);
        document.getElementById('modal_message').style.color = 'red';
        $('#modal_message').text(response.msg);
      }
      // enable close button
      $('#btn_modal_close').show();
      // re-enable submit button 
      document.getElementById('btn_import_projects').disabled = false;
    });
  });
});


// Pop Over
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

var popover = new bootstrap.Popover($('.popover'), {
  trigger: 'focus'
})