# Rails - Selectize field with modal add form.

### UI flow

```
- User types a word and hit the `Add ...` button. -> Modal opens with an add form.
- User fill the new-category form and submit.     -> The form data is persisted to the database
- If user closes the modal without submitting the form, the form will be cleared and the modal will close.
```

---

### Add dependencies

`Gemfile`

```rb
gem 'selectize-rails'
```

`app/assets/javascripts/application.js`

```js
//= require jquery
//= require jquery_ujs
//= require tether
//= require turbolinks
//= require bootstrap
//= require selectize
//= require_tree .
```

`app/assets/stylesheets/application.scss`

```scss
/*
 *= require selectize
 *= require selectize.default
 *= require_tree .
 *= require_self
 */
```

### View

`app/views/posts/new.html.slim`

```slim
= form_for(post) do |f|
  - if post.errors.any?
    #error_explanation
      h2
        = pluralize(post.errors.count, "error")
        | prohibited this post from being saved:
      ul
        - post.errors.full_messages.each do |message|
          li= message
  .form-group
    = f.label :title
    = f.text_field :title, class: "form-control"
  .form-group
    = f.label :body
    = f.text_area :body, class: "form-control"

  -# Seleclize is applied to this field
  .form-group
    = f.label :category_ids, "Categories"
    = f.select :category_ids, Category.all.pluck(:name, :id), {}, { multiple: true, class: "selectize" }

  .form-group
    = f.submit class: "btn btn-primary"

-# The add-form modal
.modal.fade.new_category_modal [aria-labelledby="categoryModalLabel" role="dialog" tabindex="-1"]
  .modal-dialog.modal-sm [role="document"]
    .modal-content
      .modal-header
        button.close [aria-label="Close" data-dismiss="modal" type="button"]
          span[aria-hidden="true"]  
            | ×
        h4#categoryModalLabel.modal-title
          | Add Category
      .modal-body
        = form_for Category.new do |f|
          .form-group
            = f.label :name
            = f.text_field :name, class: "form-control"
          .form-group
            = f.label :description
            = f.text_area :description, class: "form-control"
          .form-group
            = f.submit class: "btn btn-primary"
```

### JS

`app/assets/javascripts/posts.js`

```js
$(document).on("turbolinks:load", function() {
  // NOTE: When the selectize's `add ...` button is clicked, it will wait until
  // we call the callback function whether or not data is updated.
  // So we will store the ref to the callback function so that we can call it when we need to.
  var selectizeCallback = null

  // Set up the selectize on the target element.
  $(".selectize").selectize({
    // When the `add ...` button is clicked
    create: function(input, callback) {
      // Store the ref to the callback so that we can notify the selectize when we are done.
      selectizeCallback = callback

      openModal()

      // Fill the field with the value provided by the selectize.
      $("#category_name").val(input)
    }
  })

  // Handle the modal being closed.
  $(".new_category_modal").on("hide.bs.modal", function(e) {
    notifySelectize()
    resetForm()
  })

  // Handle the add-category form's submission.
  $("#new_category").on("submit", function(e) {
    e.preventDefault()
    $.ajax({
      method : "POST",
      url    : $(this).attr("action"),  // The form tag's `action` attribute
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
    $("#new_category").trigger("reset")             // Reset the form
    $.rails.enableFormElements($("#new_category"))  // Re-enables disabled form elements
  }

  function openModal(input) {
    $(".new_category_modal").modal()
  }

  function closeModal() {
    $(".new_category_modal").modal('toggle')
  }
})
```

---

## References

- https://gorails.com/episodes/select-or-create-with-selectize-js
- https://github.com/gorails-screencasts/gorails-episode-178
