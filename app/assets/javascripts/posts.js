$(document).on('turbolinks:load', function() {
  // NOTE: When the selectize's `add ...` button is clicked, it will wait until
  // we call the callback function whether or not data is updated.
  // So we will store the ref to the callback function so that we can call it when we need to.
  var selectizeCallback = null

  // Set up the selectize on the target element.
  $('.selectize').selectize({
    plugins: [ 'remove_button' ],

    // When the `add ...` button is clicked
    create: function(input, callback) {
      // Store the ref to the callback so that we can notify the selectize when we are done.
      selectizeCallback = callback

      openModal()

      // Fill the field with the value provided by the selectize.
      $('#category_name').val(input)
    }
  })

  // Handle the modal being closed.
  $('.new_category_modal').on('hide.bs.modal', function(e) {
    notifySelectize()
    resetForm()
  })

  // Handle the add-category form's submission.
  $('#new_category').on('submit', function(e) {
    e.preventDefault()
    $.ajax({
      method : 'POST',
      url    : $(this).attr('action'),  // The form tag's `action` attribute
      data   : $(this).serialize(),     // The data from the selectize
      success: function(response) {
        notifySelectize({ value: response.id, text: response.name })
        closeModal()
      }
    })
  })

  // ---
  // PRIVATE FUNCTIONS
  // ---

  // Notify the selectize that we are done. Because the form was not submitted, we have no data to pass in.
  function notifySelectize(data) {
    if (selectizeCallback != null) {
      selectizeCallback(data)
      selecitzeCallback = null
    }
  }

  function resetForm() {
    $('#new_category').trigger('reset')             // Reset the form
    $.rails.enableFormElements($('#new_category'))  // Re-enables disabled form elements
  }

  function openModal(input) {
    $('.new_category_modal').modal()
  }

  function closeModal() {
    $('.new_category_modal').modal('toggle')
  }
})
